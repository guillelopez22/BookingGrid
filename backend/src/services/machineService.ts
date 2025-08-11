import pool from '../db/pool';
import { Machine, LockRequest, BookingRequest, ReleaseRequest } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class MachineService {
  private static LOCK_DURATION_MINUTES = 2;

  static async getAllMachines(classId?: string): Promise<Machine[]> {
    const client = await pool.connect();
    try {
      // Clean expired locks first
      await client.query('DELETE FROM locks WHERE expires_at < NOW()');

      const query = `
        SELECT 
          m.id,
          m.row_number,
          m.column_number,
          m.name,
          CASE 
            WHEN b.id IS NOT NULL THEN 'booked'
            WHEN l.id IS NOT NULL AND l.expires_at > NOW() THEN 'locked'
            ELSE 'available'
          END as status,
          b.user_id as booked_by,
          l.user_id as locked_by,
          l.lock_token,
          l.expires_at
        FROM machines m
        LEFT JOIN bookings b ON m.id = b.machine_id 
          AND ($1::varchar IS NULL OR b.class_id = $1)
        LEFT JOIN locks l ON m.id = l.machine_id 
          AND ($1::varchar IS NULL OR l.class_id = $1)
          AND l.expires_at > NOW()
        ORDER BY m.row_number, m.column_number
      `;

      const result = await client.query(query, [classId || null]);
      return result.rows;
    } finally {
      client.release();
    }
  }

  static async lockMachine(request: LockRequest): Promise<{ success: boolean; lock_token?: string; error?: string }> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if machine is available
      const checkQuery = `
        SELECT 
          CASE 
            WHEN EXISTS (
              SELECT 1 FROM bookings 
              WHERE machine_id = $1 
              AND ($2::varchar IS NULL OR class_id = $2)
            ) THEN 'booked'
            WHEN EXISTS (
              SELECT 1 FROM locks 
              WHERE machine_id = $1 
              AND ($2::varchar IS NULL OR class_id = $2)
              AND expires_at > NOW()
            ) THEN 'locked'
            ELSE 'available'
          END as status
      `;

      const statusResult = await client.query(checkQuery, [request.machine_id, request.class_id || null]);
      const status = statusResult.rows[0].status;

      if (status !== 'available') {
        await client.query('ROLLBACK');
        return { success: false, error: `Machine is already ${status}` };
      }

      // Create lock
      const lockToken = uuidv4();
      const expiresAt = new Date(Date.now() + this.LOCK_DURATION_MINUTES * 60 * 1000);

      await client.query(
        `INSERT INTO locks (machine_id, user_id, lock_token, expires_at, class_id) 
         VALUES ($1, $2, $3, $4, $5)`,
        [request.machine_id, request.user_id, lockToken, expiresAt, request.class_id || null]
      );

      await client.query('COMMIT');
      return { success: true, lock_token: lockToken };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Lock machine error:', error);
      return { success: false, error: 'Failed to lock machine' };
    } finally {
      client.release();
    }
  }

  static async bookMachine(request: BookingRequest): Promise<{ success: boolean; error?: string }> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Verify lock ownership
      const lockCheck = await client.query(
        `SELECT * FROM locks 
         WHERE machine_id = $1 
         AND lock_token = $2 
         AND user_id = $3
         AND expires_at > NOW()
         AND ($4::varchar IS NULL OR class_id = $4)`,
        [request.machine_id, request.lock_token, request.user_id, request.class_id || null]
      );

      if (lockCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return { success: false, error: 'Invalid or expired lock token' };
      }

      // Create booking
      await client.query(
        `INSERT INTO bookings (machine_id, user_id, class_id) 
         VALUES ($1, $2, $3)`,
        [request.machine_id, request.user_id, request.class_id || null]
      );

      // Remove lock
      await client.query(
        `DELETE FROM locks WHERE lock_token = $1`,
        [request.lock_token]
      );

      await client.query('COMMIT');
      return { success: true };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Book machine error:', error);
      return { success: false, error: 'Failed to book machine' };
    } finally {
      client.release();
    }
  }

  static async releaseLock(request: ReleaseRequest): Promise<{ success: boolean; error?: string }> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `DELETE FROM locks 
         WHERE machine_id = $1 AND lock_token = $2
         RETURNING *`,
        [request.machine_id, request.lock_token]
      );

      if (result.rowCount === 0) {
        return { success: false, error: 'Lock not found or already expired' };
      }

      return { success: true };
    } catch (error) {
      console.error('Release lock error:', error);
      return { success: false, error: 'Failed to release lock' };
    } finally {
      client.release();
    }
  }
}