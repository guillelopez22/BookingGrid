export interface Machine {
  id: number;
  row_number: number;
  column_number: number;
  name: string;
  status: 'available' | 'locked' | 'booked';
  locked_by?: string;
  booked_by?: string;
  lock_token?: string;
  expires_at?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface LockResponse {
  lock_token: string;
}