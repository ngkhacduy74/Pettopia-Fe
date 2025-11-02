import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1/partner/vet';

// Định nghĩa interface cho dữ liệu trả về
export interface VeterinarianForm {
  _id: string;
  id: string;
  user_id: string;
  specialty: string;
  subSpecialties: string[];
  exp: number;
  bio: string;
  social_link: {
    facebook: string;
    linkedin: string;
  };
  certifications: {
    name: string;
    link?: string;
  }[];
  clinic_id: string[];
  license_number: string;
  license_image_url: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface VeterinarianFormResponse {
  message: string;
  data: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    items: VeterinarianForm[];
  };
}

export async function submitVeterinarianData(data: {
  specialty: string;
  subSpecialties: string[];
  exp: number;
  social_link: { facebook: string; linkedin: string };
  bio: string;
  certifications: { name: string; link?: string }[];
  license_number: string;
  license_image_url: string;
}) {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await axios.post(`${API_URL}/register`, data, {
      headers: {
        'Content-Type': 'application/json',
        'token': token,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to submit veterinarian data');
  }
}

// Hàm mới: Lấy danh sách hồ sơ bác sĩ thú y
export async function getVeterinarianForms(page: number = 1, limit: number = 10): Promise<VeterinarianFormResponse> {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await axios.get<VeterinarianFormResponse>(`${API_URL}/form`, {
      params: { page, limit },
      headers: {
        'Content-Type': 'application/json',
        'token': token,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('No veterinarian forms found');
    }
    throw new Error('Failed to fetch veterinarian forms');
  }
}


export async function updateVeterinarianFormStatus(
  formId: string,
  status: 'approved' | 'rejected' | 'pending',
  note?: string
) {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token found');

  try {
    const response = await axios.patch(
      `${API_URL}/status/form/${formId}`,
      { status, note },
      {
        headers: {
          'Content-Type': 'application/json',
          token,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update status');
  }
}