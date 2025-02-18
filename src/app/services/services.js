import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const DEVICE_ID = process.env.NEXT_PUBLIC_DEVICE_ID;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
    'X-Device-Id': DEVICE_ID,
  },
});

export default api;
