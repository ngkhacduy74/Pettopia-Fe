import axios from 'axios';

const API_URL = 'http://localhost:9999/users';

export const getUsers = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const createUser = async (userData: {
  fullname: string;
  username: string;
  email: string;
  phone: string;
  address: string;
  gender: string;
  age: number;
  password: string;
}) => {
  try {
    const response = await axios.post(API_URL, userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};