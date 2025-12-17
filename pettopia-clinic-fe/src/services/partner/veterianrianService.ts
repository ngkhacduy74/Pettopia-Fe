import axios from 'axios';

// Lấy base URL từ .env
const API_URL = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/partner/vet`;
const PARTNER_API_URL = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/partner`;
const HEALTHCARE_API_URL = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/healthcare`;

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

// --- Vet Schedule/Appointments ---
export interface VetAppointment {
  _id: string;
  id: string;
  booking_group_id: string;
  user_id: string;
  pet_ids: string[];
  clinic_id: string;
  service_ids: string[];
  date: string;
  shift: 'Morning' | 'Afternoon' | 'Evening';
  status: 'Pending' | 'Confirmed' | 'Checked_In' | 'In_Progress' | 'Completed' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
  vet_id: string;
  cancel_reason?: string;
}

export interface VetAppointmentsResponse {
  status: string;
  message: string;
  data: VetAppointment[];
}

/**
 * Lấy danh sách lịch hẹn được phân công cho bác sĩ thú y
 * GET `${HEALTHCARE_API_URL}/appointments/vet/me?status={status}`
 */
export const getVetAppointments = async (status?: string): Promise<VetAppointmentsResponse> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token found');

  try {
    const url = status 
      ? `${HEALTHCARE_API_URL}/appointments/vet/me?status=${status}`
      : `${HEALTHCARE_API_URL}/appointments/vet/me`;
    
    const response = await axios.get<VetAppointmentsResponse>(url, {
      headers: { token },
    });
    return response.data;
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách lịch hẹn được phân công:', error?.response?.data || error?.message || error);
    throw error;
  }
};

/**
 * Lấy danh sách lịch hẹn được phân công cho bác sĩ thú y với phân trang
 * GET `${HEALTHCARE_API_URL}/appointments/vet/me?status={status}&page={page}&limit={limit}`
 */
export const getVetAppointmentsWithPagination = async (
  status?: string,
  page: number = 1,
  limit: number = 10
): Promise<VetAppointmentsResponse> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token found');

  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await axios.get<VetAppointmentsResponse>(
      `${HEALTHCARE_API_URL}/appointments/vet/me?${params.toString()}`,
      {
        headers: { token },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách lịch hẹn được phân công:', error?.response?.data || error?.message || error);
    throw error;
  }
};

// --- Medical Records ---
export interface Medication {
  medication_name: string;
  dosage: string;
  instructions?: string;
}

export interface MedicalRecordPayload {
  pet_id: string;
  symptoms: string;
  diagnosis: string;
  notes?: string;
  medications?: Medication[];
}

export interface MedicalRecordResponse {
  status: string;
  message: string;
  data?: any;
}

/**
 * Cập nhật hồ sơ bệnh án cho lịch hẹn
 * POST `${HEALTHCARE_API_URL}/appointments/{appointmentId}/medical-records`
 */
export const updateMedicalRecord = async (
  appointmentId: string,
  payload: MedicalRecordPayload
): Promise<MedicalRecordResponse> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token found');

  try {
    const response = await axios.post(
      `${HEALTHCARE_API_URL}/appointments/${appointmentId}/medical-records`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          token,
        },
      }
    );
    return response.data as MedicalRecordResponse;
  } catch (error: any) {
    console.error(
      `Lỗi khi cập nhật hồ sơ bệnh án cho lịch hẹn (${appointmentId}):`,
      error?.response?.data || error?.message || error
    );
    throw error;
  }
};

// --- Pet detail for vets (includes medical records) ---

const PET_API_V1_URL = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/pet`;

export interface PetOwnerAddress {
  city?: string;
  district?: string;
  ward?: string;
}

export interface PetOwner {
  user_id: string;
  fullname: string;
  phone?: string;
  email?: string;
  address?: PetOwnerAddress;
}

export interface VetSideMedicalRecordDetail {
  _id: string;
  appointment_id: string;
  pet_id: string;
  symptoms: string;
  diagnosis: string;
  notes?: string;
  id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface VetSideMedicationDetail {
  _id: string;
  medical_record_id: string;
  medication_name: string;
  dosage: string;
  instructions?: string;
  id: string;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

export interface VetPetMedicalRecord {
  medicalRecord: VetSideMedicalRecordDetail;
  medications: VetSideMedicationDetail[];
}

export interface VetPetDetail {
  id: string;
  name: string;
  species: string;
  gender: string;
  breed: string;
  color: string;
  weight: number;
  dateOfBirth: string;
  owner: PetOwner;
  avatar_url?: string;
  medical_records?: VetPetMedicalRecord[];
}

/**
 * Lấy chi tiết thú cưng (pet) cho bác sĩ, bao gồm medical_records
 * GET `${PET_API_V1_URL}/{petId}`
 */
export const getVetPetDetail = async (petId: string): Promise<VetPetDetail> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token found');

  try {
    const url = `${PET_API_V1_URL}/${encodeURIComponent(petId)}`;
    const response = await axios.get(url, {
      headers: { token },
    });

    // API có thể trả về { data: {...} } hoặc trực tiếp object
    return (response.data?.data || response.data) as VetPetDetail;
  } catch (error: any) {
    console.error(
      `Lỗi khi lấy chi tiết thú cưng (pet ${petId}):`,
      error?.response?.data || error?.message || error
    );
    throw error;
  }
};

// --- Vet Appointment Detail ---
export interface VetAppointmentUserInfo {
  fullname: string;
  phone_number: string;
  email?: string;
}

export interface VetAppointmentClinicInfo {
  _id?: string;
  id: string;
  clinic_name: string;
  email: {
    email_address: string;
    verified?: boolean;
  };
  phone: {
    phone_number: string;
    verified?: boolean;
  };
  license_number: string;
  address: {
    city: string;
    district: string;
    ward: string;
    detail: string;
  };
  representative?: {
    name?: string;
    email?: {
      email_address?: string;
    };
    phone?: {
      phone_number?: string;
    };
    identify_number?: string;
    responsible_licenses?: string[];
    license_issued_date?: string;
  };
  is_active?: boolean;
  member_ids?: string[];
  createdAt?: string;
  updatedAt?: string;
  user_account_id?: string;
  __v?: number;
  [key: string]: any;
}

export interface VetAppointmentServiceInfo {
  _id?: string;
  id: string;
  clinic_id?: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  is_active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  [key: string]: any;
}

export interface VetAppointmentPetInfo {
  id: string;
  name: string;
  species: string;
  gender?: string;
  breed?: string;
  color?: string;
  weight?: number;
  dateOfBirth?: string;
  avatar_url?: string;
  owner?: PetOwner;
  medical_records?: string[]; // Array of medical record IDs
  [key: string]: any;
}

export interface VetAppointmentDetail {
  id: string;
  date: string;
  shift: 'Morning' | 'Afternoon' | 'Evening' | string;
  status: 'Pending_Confirmation' | 'Confirmed' | 'Checked_In' | 'In_Progress' | 'Completed' | 'Cancelled' | string;
  vet_id?: string;
  user_info?: VetAppointmentUserInfo;
  clinic_info?: VetAppointmentClinicInfo;
  service_infos?: VetAppointmentServiceInfo[];
  pet_infos?: VetAppointmentPetInfo[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface VetAppointmentDetailResponse {
  status: string;
  message: string;
  data: VetAppointmentDetail;
}

/**
 * Lấy chi tiết lịch hẹn cho bác sĩ thú y
 * GET `/api/v1/healthcare/appointments/{appointmentId}`
 */
export const getVetAppointmentDetail = async (
  appointmentId: string
): Promise<VetAppointmentDetailResponse> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token found');

  try {
    const url = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/healthcare/appointments/${encodeURIComponent(appointmentId)}`;
    const response = await axios.get<VetAppointmentDetailResponse>(url, {
      headers: { token },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      `Lỗi khi lấy chi tiết lịch hẹn (appointment ${appointmentId}):`,
      error?.response?.data || error?.message || error
    );
    throw error;
  }
};