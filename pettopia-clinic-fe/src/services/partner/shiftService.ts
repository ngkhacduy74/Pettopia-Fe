import axios from 'axios';

// Lấy base URL từ biến môi trường
const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/partner/clinic/shift`;

export interface ClinicShift {
  _id?: string;
  shift: string;
  max_slot: number;
  start_time: string;
  end_time: string;
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

  const response = await axios.get(API_URL, {
    params: { page, limit },
    headers: {
      'Content-Type': 'application/json',
      token,
    },
  });

  return response.data as PaginatedResponse<ClinicShift>;
}

// Thêm mới / Cập nhật ca làm việc
export async function upsertClinicShift(payload: ClinicShift): Promise<ClinicShift> {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token found');

  let response;
  if (payload._id) {
    response = await axios.put(`${API_URL}/${payload._id}`, payload, {
      headers: {
        'Content-Type': 'application/json',
        token,
      },
    });
  } else {
    response = await axios.post(API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        token,
      },
    });
  }
  return response.data as ClinicShift;
}