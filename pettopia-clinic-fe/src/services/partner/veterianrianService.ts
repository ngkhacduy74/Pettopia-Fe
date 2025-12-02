/**
 * Xóa thành viên (veterinarian) khỏi phòng khám
 * DELETE `${PARTNER_API_URL}/clinic/members/:memberId`
 */
export const deleteClinicVet = async (memberId: string) => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token found');

  try {
    const response = await axios.delete(`${PARTNER_API_URL}/clinic/members/${memberId}`, {
      headers: { token },
    });
    return response.data;
  } catch (error: any) {
    console.error(`Lỗi khi xóa thành viên phòng khám (vet ${memberId}):`, error?.response?.data || error?.message || error);
    throw error;
  }
};
import axios from 'axios';

// Lấy base URL từ .env
const API_URL = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/partner/vet`;
const PARTNER_API_URL = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/partner`;

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

// --- Clinic members (vets) ---
export interface VetMember {
  member_id: string;
  role: string;
  joined_at: string | null;
  specialty?: string;
  exp?: number;
  fullname?: string;
  email?: string;
  phone?: string;
  is_active?: boolean;
}

export interface ClinicMembersData {
  clinic_id: string;
  clinic_name: string;
  members: VetMember[];
  total_members: number;
}

export interface ClinicMembersResponse {
  status: string;
  message: string;
  data: ClinicMembersData;
}

/**
 * Lấy danh sách thành viên (veterinarians) của phòng khám
 * GET `${PARTNER_API_URL}/clinic/members/vets`
 */
export const getClinicVets = async () => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token found');

  try {
    const response = await axios.get(`${PARTNER_API_URL}/clinic/members/vets`, {
      headers: { token },
    });
    return response.data as ClinicMembersResponse;
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách thành viên phòng khám (vets):', error?.response?.data || error?.message || error);
    throw error;
  }
};

// --- Vet detail ---
export interface VetCertification {
  name: string;
  link?: string;
}

export interface VetSocialLink {
  facebook?: string;
  linkedin?: string;
}

export interface VetDetail {
  id: string;
  is_active: boolean;
  specialty?: string;
  subSpecialties: string[];
  exp?: number;
  bio?: string;
  license_number?: string;
  license_image_url?: string;
  social_link?: VetSocialLink;
  certifications?: VetCertification[];
  clinic_id?: string[];
  clinic_roles?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface VetDetailResponse {
  status: string;
  message: string;
  data: VetDetail;
}

/**
 * Lấy thông tin chi tiết bác sĩ (vet)
 * GET `${API_URL}/{vetId}`
 */
export const getVetDetail = async (vetId: string) => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token found');

  try {
    const response = await axios.get(`${API_URL}/${vetId}`, {
      headers: { token },
    });
    return response.data as VetDetailResponse;
  } catch (error: any) {
    console.error(`Lỗi khi lấy chi tiết bác sĩ (vet ${vetId}):`, error?.response?.data || error?.message || error);
    throw error;
  }
};