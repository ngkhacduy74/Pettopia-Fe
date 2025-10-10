import axios from 'axios';

const PET_API_URL = 'http://localhost:3000/api/v1/pet/create';

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
        const response = await axios.post(PET_API_URL, payload);
        return response.data;
    } catch (error) {
        // Re-throw to let UI handle
        throw error;
    }
}


