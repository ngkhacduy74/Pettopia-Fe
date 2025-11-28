import axios from 'axios';

// ================ AUTH HELPER ================
function getAuthToken(): string | null {
    return localStorage.getItem('authToken');
}

function authHeaders() {
    const token = getAuthToken();
    // return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      if (!token) return {};
    return { headers: { token } };
}

// ================ PET APIs ================
const PET_API_URL = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/pet`; // ĐÃ SỬA: DÙNG .env

export interface CreatePetPayload {
    name: string;
    species: string;
    breed?: string;
    gender?: string;
    color?: string;
    weight?: number;
    dateOfBirth?: string;
    avatar_url?: string;
    owner?: string | Record<string, unknown>;
}

export async function createPet(payload: CreatePetPayload) {
    const response = await axios.post(PET_API_URL + '/create', payload, authHeaders());
    return response.data;
}

export interface PetDetailResponse {
    id: string;
    name: string;
    species: string;
    gender?: string;
    breed?: string;
    color?: string;
    weight?: number;
    dateOfBirth?: string;
    avatar_url?: string;
    owner?: any;
    createdAt?: string;
    updatedAt?: string;
}

export async function getPetById(petId: string): Promise<PetDetailResponse> {
    const url = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/pet/${encodeURIComponent(petId)}`; // ĐÃ SỬA
    const res = await axios.get(url, authHeaders());
    return res.data?.data || res.data;
}

export interface UpdatePetPayload {
    name?: string;
    species?: string;
    breed?: string;
    gender?: string;
    color?: string;
    weight?: number;
    dateOfBirth?: string;
    avatar_url?: string;
}

export async function updatePet(petId: string, payload: UpdatePetPayload) {
    const url = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/pet/${encodeURIComponent(petId)}`; // ĐÃ SỬA
    const response = await axios.patch(url, payload, authHeaders());
    return response.data;
}

export async function deletePet(petId: string) {
    const url = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/pet/${encodeURIComponent(petId)}`; // ĐÃ SỬA
    const response = await axios.delete(url, authHeaders());
    return response.data;
}

export async function getPetsByOwner(userId: string): Promise<PetDetailResponse[]> {
  try {
    const url = `${PET_API_URL}/owner/${userId}`;
    const response = await axios.get(url, authHeaders());
    const petsData = response.data?.data || response.data || [];
    return Array.isArray(petsData) ? petsData : [];
  } catch (error) {
    logAxiosError('getPetsByOwner', error);
    throw error;
  }
}

// ================ HEALTHCARE - APPOINTMENTS ================
export interface Appointment {
    _id: string;
    user_id: string;
    pet_ids: string[];
    clinic_id: string;
    service_ids: string[];
    date: string;
    shift: 'Morning' | 'Afternoon' | 'Evening';
    status: 'Pending_Confirmation' | 'Confirmed' | 'Cancelled' | 'Completed';
    id: string;
    createdAt: string;
    updatedAt: string;
}

export interface AppointmentsResponse {
    status: string;
    message: string;
    data: Appointment[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface GetAppointmentsParams {
    page?: number;
    limit?: number;
}

export async function getAppointments(params?: GetAppointmentsParams): Promise<AppointmentsResponse> {
    const { page = 1, limit = 10 } = params || {};
    const url = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/healthcare/appointments`; // ĐÃ SỬA
    const response = await axios.get(url, {
        params: { page, limit },
        ...authHeaders(),
    });
    return response.data;
}

export interface AppointmentDetailResponse {
    status: string;
    message: string;
    data: {
        _id: string;
        user_id: string;
        customer: string;
        pet_ids: string[];
        clinic_id: string;
        service_ids: string[];
        date: string;
        shift: 'Morning' | 'Afternoon' | 'Evening';
        status: 'Pending_Confirmation' | 'Confirmed' | 'Cancelled' | 'Completed';
        created_by: string;
        id: string;
        createdAt: string;
        updatedAt: string;
    };
}

export async function getAppointmentDetail(appointmentId: string): Promise<AppointmentDetailResponse['data']> {
    const token = getAuthToken();
    const url = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/healthcare/appointments/${encodeURIComponent(appointmentId)}`; // ĐÃ SỬA
    const response = await axios.get(url, {
        headers: {
            ...(token && { 'token': token }),
        },
    });
    return response.data?.data || response.data;
}

// ================ MỚI: SERVICE DETAIL ================
export interface ServiceDetail {
    id: string;
    name: string;
    description?: string;
    price?: number;
    duration?: number; // phút
    clinic_id?: string;
    category?: string;
    createdAt?: string;
    updatedAt?: string;
}

export async function getServiceDetail(serviceId: string): Promise<ServiceDetail> {
    try {
        const url = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/healthcare/services/${encodeURIComponent(serviceId)}`; // ĐÃ SỬA
        const response = await axios.get(url, authHeaders());
        // Một số API trả về { data: {...} }, nên lấy linh hoạt
        return response.data?.data || response.data;
    } catch (error) {
        logAxiosError('getServiceDetail', error);
        throw error;
    }
}

// (Tương lai) Nếu cần lấy chi tiết phòng khám
export interface ClinicDetail {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    open_hours?: string;
    avatar_url?: string;
}

export async function getClinicDetail(clinicId: string): Promise<ClinicDetail> {
    const url = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/healthcare/clinics/${encodeURIComponent(clinicId)}`; // ĐÃ SỬA
    const response = await axios.get(url, authHeaders());
    return response.data?.data || response.data;
}

// ================ CLINIC APIs ================
export interface Clinic {
  _id: string;
  id: string;
  clinic_name: string;
  address: {
    city: string;
    district: string;
    ward: string;
    detail: string;
  };
  phone: { phone_number: string; verified: boolean };
  email: { email_address: string; verified: boolean };
  license_number: string;
  is_active: boolean;
}

export interface ClinicsResponse {
  status: string;
  data: {
    items: Clinic[];
  };
}

export async function getClinics(page = 1, limit = 100): Promise<Clinic[]> {
  try {
    const url = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/partner/clinic?page=${page}&limit=${limit}`;
    const response = await axios.get(url, authHeaders());
    return response.data?.data?.items || response.data?.data || [];
  } catch (error) {
    logAxiosError('getClinics', error);
    throw error;
  }
}

// ================ SERVICE APIs ================
export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
  is_active?: boolean;
}

export interface ServicesResponse {
  status: string;
  data: {
    items: Service[];
  };
}

export async function getServicesByClinic(clinicId: string): Promise<Service[]> {
  try {
    const url = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/partner/service/${encodeURIComponent(clinicId)}`;
    const response = await axios.get(url, authHeaders());
    const services = response.data?.data?.items || response.data?.data || [];
    return services.filter((s: any) => s.is_active).map((s: any) => ({
      id: s.id,
      name: s.name,
      price: s.price,
      duration: s.duration,
      description: s.description,
    }));
  } catch (error) {
    logAxiosError('getServicesByClinic', error);
    throw error;
  }
}

// ================ SHIFT APIs ================
export interface Shift {
  id: string;
  shift: string;
  start_time: string;
  end_time: string;
  max_slot: number;
  is_active: boolean;
}

export async function getShiftsByClinic(clinicId: string): Promise<Shift[]> {
  try {
    const url = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/partner/clinic/shift/${encodeURIComponent(clinicId)}`;
    const response = await axios.get(url, authHeaders());
    const shifts = response.data?.data || [];
    return shifts.filter((s: any) => s.is_active).map((s: any) => ({
      id: s.id,
      shift: s.shift,
      start_time: s.start_time,
      end_time: s.end_time,
      max_slot: s.max_slot,
      is_active: s.is_active,
    }));
  } catch (error) {
    logAxiosError('getShiftsByClinic', error);
    throw error;
  }
}

// ================ APPOINTMENT BOOKING ================
export interface BookingPayload {
  clinic_id: string;
  pet_ids: string[];
  service_ids: string[];
  date: string;
  shift_id: string;
}

export async function bookAppointment(payload: BookingPayload) {
  try {
    const url = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/healthcare/appointment`;
    const response = await axios.post(url, payload, authHeaders());
    return response.data;
  } catch (error) {
    logAxiosError('bookAppointment', error);
    throw error;
  }
}

// ================ ERROR LOGGING ================
function isAxiosError(err: unknown): err is import('axios').AxiosError {
    return (axios as any).isAxiosError?.(err) === true;
}

function logAxiosError(context: string, error: unknown) {
    if (isAxiosError(error)) {
        const err = error as import('axios').AxiosError;
        console.error(`[${context}] Axios Error:`, {
            message: err.message,
            status: err.response?.status,
            statusText: err.response?.statusText,
            url: err.config?.url,
            method: err.config?.method,
            data: err.response?.data,
        });
    } else {
        console.error(`[${context}] Unknown Error:`, error);
    }
}

// Hàm gọi API AI
export async function callAIChat(userId: string, messages: { role: 'user'; content: string }[]) {
    const maxRetries = 3; // Số lần thử lại tối đa
    let attempt = 0;

    
    const AI_API_BASE = process.env.NEXT_PUBLIC_AI_API_URL || process.env.NEXT_PUBLIC_PETTOPIA_API_URL;

    while (attempt < maxRetries) {
        try {
            const response = await axios.post(`${AI_API_BASE?.replace(/\/$/, '')}/ai/gemini/chat`, {
                userId,
                messages: messages.map(m => ({ role: 'user', content: m.content })) 
            });
            return response.data;
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 429) {
                attempt++;
                const retryAfter = error.response.headers['retry-after'] || 1; 
                console.warn(`Rate limit exceeded. Retrying after ${retryAfter} seconds...`);
                await new Promise(resolve => setTimeout(resolve, retryAfter * 1000)); 
            } else {
                console.error('Error calling AI API:', error);
                throw error;
            }
        }
    }

    throw new Error('Max retries reached for calling AI API');
}