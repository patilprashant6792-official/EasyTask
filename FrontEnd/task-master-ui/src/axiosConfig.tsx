import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';

import config from './config.json';


const axiosInstance = axios.create({
    baseURL: config.API_BASE_URL, // Replace with your API base URL
});

axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
            console.log('Authorization header set:', config.headers['Authorization']);  // Debugging log
        } else {
            console.warn('No token found in localStorage');  // Debugging log
        }
        return config;
    },
    (error: AxiosError) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: AxiosError) => {
        if (error.response && error.response.status === 401) {
            console.warn('Unauthorized, token might be expired or invalid');
             localStorage.removeItem('access_token');
             window.location.href = '/'; // Optionally redirect to login
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
