import axios from 'axios';

export const backendApi = axios.create({
  baseURL: process.env.BACKEND_URL ?? "http://localhost:8000",
  timeout: 10000,
});
