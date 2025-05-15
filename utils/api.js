import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api= axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    timeout: 10000, // 请求超时时间设置为 10 秒
    headers: {
        'Content-Type': 'application/json',
    },
});

// 创建一个专门用于文件上传的axios实例
const uploadApi = axios.create({
    baseURL: 'http://localhost:8000/api',
    withCredentials: true,
    timeout: 10000, // 恢复默认超时时间
    // 移除默认的 Content-Type，让浏览器自动设置正确的 boundary
});

const HARDCODED_TOKEN = "16|bbITU6kTZWSWvzXKtmNFMwgMqYDyLEMPCfAqs0iyb82331d5"

// 请求拦截器
const addAuthHeader = (config) => {
    const token = localStorage.getItem('token') || HARDCODED_TOKEN;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
};

api.interceptors.request.use(addAuthHeader);
uploadApi.interceptors.request.use(addAuthHeader);

// 响应拦截器
const handleResponse = (response) => {
    return response.data;
};

const handleError = (error) => {
    if (error.response) {
        switch (error.response.status) {
            case 401:
                // 未授权，处理登出逻辑
                break;
            case 404:
                console.error('The requested resource does not exist');
                break;
            case 422:
                console.error('Validation error:', error.response.data);
                break;
            case 500:
                console.error('Server error occurred');
                break;
            default:
                console.error('An error occurred:', error.response.data);
        }
    }
    return Promise.reject(error);
};

api.interceptors.response.use(handleResponse, handleError);
uploadApi.interceptors.response.use(handleResponse, handleError);

export { uploadApi };
export default api;