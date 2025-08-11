export interface Machine {
  id: number;
  row_number: number;
  column_number: number;
  name: string;
  status: 'available' | 'locked' | 'booked';
  locked_by?: string;
  booked_by?: string;
  lock_token?: string;
  expires_at?: Date;
}

export interface LockRequest {
  machine_id: number;
  user_id: string;
  class_id?: string;
}

export interface BookingRequest {
  machine_id: number;
  user_id: string;
  lock_token: string;
  class_id?: string;
}

export interface ReleaseRequest {
  machine_id: number;
  lock_token: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}