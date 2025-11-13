import axios from 'axios';

function getAuthToken(): string | null {
    return localStorage.getItem('authToken');
}
function authHeaders() {
    const token = getAuthToken();
    if (!token) return {};
    return { headers: { token } };
}

const PET_API_URL = '/api/v1/pet/create';

export interface CreatePetPayload {
    name: string;
    species: string;
    breed?: string;
    gender?: string;
    color?: string;
    weight?: number;
    dateOfBirth?: string; 
    avatar_url?: string;
    owner?: string | Record<string, unknown>; // changed from unknown
}

export async function createPet(payload: CreatePetPayload) {
    try {
        const response = await axios.post(PET_API_URL, payload);
        return response.data;
    } catch (error) {
        logAxiosError('createPet', error);
        throw error;
    }
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
}

export async function getPetById(petId: string): Promise<PetDetailResponse> {
    const url = `/api/v1/pet/${encodeURIComponent(petId)}`;
    const res = await axios.get(url);
    return res.data;
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
    try {
        const url = `/api/v1/pet/${encodeURIComponent(petId)}`;
        const response = await axios.patch(url, payload);
        return response.data;
    } catch (error) {
        logAxiosError('updatePet', error);
        throw error;
    }
}

export async function deletePet(petId: string) {
    try {
        const url = `/api/v1/pet/${encodeURIComponent(petId)}`;
        const response = await axios.delete(url);
        return response.data;
    } catch (error) {
        logAxiosError('deletePet', error);
        throw error;
    }
}

// Healthcare Appointments
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
    try {
        const { page = 1, limit = 10 } = params || {};
        const url = `/api/v1/healthcare/appointments`;
        const response = await axios.get(url, { params: { page, limit }, ...authHeaders() });
        return response.data;
    } catch (error) {
        logAxiosError('getAppointments', error);
        throw error;
    }
}

// Helper: axios error checking / logging
function isAxiosError(err: unknown): err is import('axios').AxiosError {
    return (axios as any).isAxiosError?.(err) === true;
}

function logAxiosError(context: string, error: unknown) {
    if (isAxiosError(error)) {
        const err = error as import('axios').AxiosError;
        try {
            console.error(`${context} axios error (toJSON)`, (err as any).toJSON?.());
        } catch {}
        console.error(`${context} axios error (fields)`, {
            message: err.message,
            code: (err as any).code,
            status: err.response?.status,
            statusText: err.response?.statusText,
            url: err.config?.url,
            method: err.config?.method,
            data: err.response?.data,
        });
    } else {
        console.error(`${context} non-axios error`, error);
    }
}