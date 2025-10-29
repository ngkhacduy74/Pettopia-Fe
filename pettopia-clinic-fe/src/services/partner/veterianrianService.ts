import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1/partner/vet';

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