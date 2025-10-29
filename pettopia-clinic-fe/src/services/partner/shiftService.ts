import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1/partner/clinic/shift';

export interface ClinicShift {
  _id?: string;
  shift: string; // e.g. "Morning", "Afternoon", "Evening"
  max_slot: number;
  start_time: string; // HH:mm
  end_time: string;   // HH:mm
  is_active: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages?: number;
  };
}

export async function getClinicShifts(page: number = 1, limit: number = 10): Promise<PaginatedResponse<ClinicShift>> {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token found');

  const response = await axios.get(`${API_URL}?page=${page}&limit=${limit}`, {
    headers: {
      'Content-Type': 'application/json',
      token,
    },
  });

  return response.data as PaginatedResponse<ClinicShift>;
}

// The backend accepts PUT to create or update by shift (upsert-like)
export async function upsertClinicShift(payload: ClinicShift): Promise<ClinicShift> {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token found');

  const response = await axios.put(`${API_URL}/`, payload, {
    headers: {
      'Content-Type': 'application/json',
      token,
    },
  });

  return response.data as ClinicShift;
}


