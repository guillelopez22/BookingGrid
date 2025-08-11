import { Router, Request, Response } from 'express';
import { MachineService } from '../services/machineService';
import { LockRequest, BookingRequest, ReleaseRequest, ApiResponse } from '../types';

const router = Router();

// GET /api/machines - List all machines with their status
router.get('/', async (req: Request, res: Response) => {
  try {
    const classId = req.query.class_id as string | undefined;
    const machines = await MachineService.getAllMachines(classId);
    
    const response: ApiResponse = {
      success: true,
      data: machines
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching machines:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch machines'
    };
    res.status(500).json(response);
  }
});

// POST /api/machines/:id/lock - Lock a machine for 2 minutes
router.post('/:id/lock', async (req: Request, res: Response) => {
  try {
    const machineId = parseInt(req.params.id);
    const { user_id, class_id } = req.body;

    if (!user_id) {
      const response: ApiResponse = {
        success: false,
        error: 'user_id is required'
      };
      return res.status(400).json(response);
    }

    const lockRequest: LockRequest = {
      machine_id: machineId,
      user_id,
      class_id
    };

    const result = await MachineService.lockMachine(lockRequest);
    
    if (result.success) {
      const response: ApiResponse = {
        success: true,
        data: { lock_token: result.lock_token }
      };
      res.json(response);
    } else {
      const response: ApiResponse = {
        success: false,
        error: result.error
      };
      res.status(409).json(response);
    }
  } catch (error) {
    console.error('Error locking machine:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Failed to lock machine'
    };
    res.status(500).json(response);
  }
});

// POST /api/machines/:id/book - Confirm booking of a locked machine
router.post('/:id/book', async (req: Request, res: Response) => {
  try {
    const machineId = parseInt(req.params.id);
    const { user_id, lock_token, class_id } = req.body;

    if (!user_id || !lock_token) {
      const response: ApiResponse = {
        success: false,
        error: 'user_id and lock_token are required'
      };
      return res.status(400).json(response);
    }

    const bookingRequest: BookingRequest = {
      machine_id: machineId,
      user_id,
      lock_token,
      class_id
    };

    const result = await MachineService.bookMachine(bookingRequest);
    
    if (result.success) {
      const response: ApiResponse = {
        success: true,
        data: { message: 'Machine booked successfully' }
      };
      res.json(response);
    } else {
      const response: ApiResponse = {
        success: false,
        error: result.error
      };
      res.status(409).json(response);
    }
  } catch (error) {
    console.error('Error booking machine:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Failed to book machine'
    };
    res.status(500).json(response);
  }
});

// POST /api/machines/:id/release - Release a locked machine
router.post('/:id/release', async (req: Request, res: Response) => {
  try {
    const machineId = parseInt(req.params.id);
    const { lock_token } = req.body;

    if (!lock_token) {
      const response: ApiResponse = {
        success: false,
        error: 'lock_token is required'
      };
      return res.status(400).json(response);
    }

    const releaseRequest: ReleaseRequest = {
      machine_id: machineId,
      lock_token
    };

    const result = await MachineService.releaseLock(releaseRequest);
    
    if (result.success) {
      const response: ApiResponse = {
        success: true,
        data: { message: 'Lock released successfully' }
      };
      res.json(response);
    } else {
      const response: ApiResponse = {
        success: false,
        error: result.error
      };
      res.status(404).json(response);
    }
  } catch (error) {
    console.error('Error releasing lock:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Failed to release lock'
    };
    res.status(500).json(response);
  }
});

export default router;