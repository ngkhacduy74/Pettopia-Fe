import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1/auth';

export const loginUser = async (loginData: {
  username: string;
  password: string;
}) => {
  try {
    const response = await axios.post(`${API_URL}/login`, loginData);
    return response.data;
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
};

export const createUser = async (userData: {
  fullname: string;
  username: string;
  email_address: string;
  phone_number: string;
  gender: string;
  dob: string;
  password: string;
  address: {
    city: string;
    district: string;
    ward: string;
    street: string;
  };
}) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};
