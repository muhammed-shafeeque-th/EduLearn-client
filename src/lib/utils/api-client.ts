import { config } from '../config';
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = config.apiUrl;
const API_TIMEOUT = 30000; // 30 seconds

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
});
