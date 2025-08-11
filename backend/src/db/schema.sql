-- Database schema for fitness booking system
CREATE DATABASE IF NOT EXISTS fitness_booking;

-- Machines table (5x5 grid = 25 machines)
CREATE TABLE IF NOT EXISTS machines (
    id SERIAL PRIMARY KEY,
    row_number INT NOT NULL CHECK (row_number >= 1 AND row_number <= 5),
    column_number INT NOT NULL CHECK (column_number >= 1 AND column_number <= 5),
    name VARCHAR(10) GENERATED ALWAYS AS ('M' || row_number || '-' || column_number) STORED,
    UNIQUE(row_number, column_number)
);

-- Bookings table (confirmed bookings)
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    machine_id INT NOT NULL REFERENCES machines(id),
    user_id VARCHAR(255) NOT NULL,
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    class_id VARCHAR(255), -- Could be used for different class sessions
    UNIQUE(machine_id, class_id)
);

-- Locks table (temporary reservations)
CREATE TABLE IF NOT EXISTS locks (
    id SERIAL PRIMARY KEY,
    machine_id INT NOT NULL REFERENCES machines(id),
    user_id VARCHAR(255) NOT NULL,
    lock_token UUID NOT NULL UNIQUE,
    locked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    class_id VARCHAR(255),
    UNIQUE(machine_id, class_id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_locks_expires_at ON locks(expires_at);
CREATE INDEX IF NOT EXISTS idx_bookings_class_id ON bookings(class_id);
CREATE INDEX IF NOT EXISTS idx_locks_class_id ON locks(class_id);