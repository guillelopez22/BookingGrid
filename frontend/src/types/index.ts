export interface Machine {
  id: number;
  row_number: number;
  column_number: number;
  name: string;
  status: 'available' | 'locked' | 'booked';
  locked_by?: string | null;
  booked_by?: string | null;
  lock_token?: string | null;
  expires_at?: string | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface LockResponse {
  lock_token: string;
}