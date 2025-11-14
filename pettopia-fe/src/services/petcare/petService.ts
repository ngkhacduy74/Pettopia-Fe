import axios from 'axios';

// ================ AUTH HELPER ================
function getAuthToken(): string | null {
    return localStorage.getItem('authToken');
}

function authHeaders() {
    const token = getAuthToken();
     if (!token) return {};
    return { headers: { token } };
}

// ================ PET APIs ================
const PET_API_URL = '/api/v1/pet';

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
    const url = `/api/v1/pet/${encodeURIComponent(petId)}`;
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
    const url = `/api/v1/pet/${encodeURIComponent(petId)}`;
    const response = await axios.patch(url, payload, authHeaders());
    return response.data;
}

export async function deletePet(petId: string) {
    const url = `/api/v1/pet/${encodeURIComponent(petId)}`;
    const response = await axios.delete(url, authHeaders());
    return response.data;
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
    const url = `/api/v1/healthcare/appointments`;
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
    const url = `/api/v1/healthcare/appointments/${encodeURIComponent(appointmentId)}`;
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
        const url = `/api/v1/healthcare/services/${encodeURIComponent(serviceId)}`;
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
    const url = `/api/v1/healthcare/clinics/${encodeURIComponent(clinicId)}`;
    const response = await axios.get(url, authHeaders());
    return response.data?.data || response.data;
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