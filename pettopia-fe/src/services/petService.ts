import axios from 'axios';

// Use relative path to work with Next.js rewrite proxy
const PET_API_URL = '/api/v1/pet/create';

export interface CreatePetPayload {
    name: string;
    species: string;
    breed?: string;
    gender?: string;
    color?: string;
    weight?: number;
    dateOfBirth?: string; // ISO string
    avatar_url?: string;
    owner?: unknown; // backend may infer from auth; keep flexible
}

export async function createPet(payload: CreatePetPayload) {
    try {
        // withCredentials is not needed when proxying same-origin; remove to avoid cookie/SameSite issues
        const response = await axios.post(PET_API_URL, payload);
        return response.data;
    } catch (error) {
        // Log rich diagnostics for easier debugging in the browser
        // eslint-disable-next-line no-console
        if ((axios as any).isAxiosError?.(error)) {
            const err = error as any;
            try {
                // eslint-disable-next-line no-console
                console.error('createPet axios error (toJSON)', err.toJSON?.());
            } catch {}
            // eslint-disable-next-line no-console
            console.error('createPet axios error (fields)', {
                message: err.message,
                code: err.code,
                status: err.response?.status,
                statusText: err.response?.statusText,
                url: err.config?.url,
                method: err.config?.method,
                data: err.response?.data,
            });
        } else {
            // eslint-disable-next-line no-console
            console.error('createPet non-axios error', error);
        }
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
    owner?: any;
}

export async function getPetById(petId: string): Promise<PetDetailResponse> {
    const url = `/api/v1/pet/${encodeURIComponent(petId)}`;
    const res = await axios.get(url);
    return res.data;
}


