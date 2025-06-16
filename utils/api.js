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
    baseURL: BASE_URL,
    withCredentials: true,
    timeout: 10000, // 恢复默认超时时间
    // 移除默认的 Content-Type，让浏览器自动设置正确的 boundary
});

const HARDCODED_TOKEN = "17|QIKUiFCeplMwM80DdQtFO0m3O47euKn2v2MMKhuw61520823"

// 请求拦截器
const addAuthHeader = (config) => {
    // 检查是否在客户端环境
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token') || HARDCODED_TOKEN;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } else {
        // 服务器端环境，使用硬编码token
        config.headers.Authorization = `Bearer ${HARDCODED_TOKEN}`;
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
        // 服务器返回错误状态码
        console.error('API错误:', error.response.data);
        if (error.response.status === 401) {
            // 处理未授权错误
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
    } else if (error.request) {
        // 请求已发送但没有收到响应
        console.error('网络错误:', error.request);
    } else {
        // 请求配置出错
        console.error('请求错误:', error.message);
    }
    return Promise.reject(error);
};

api.interceptors.response.use(handleResponse, handleError);
uploadApi.interceptors.response.use(handleResponse, handleError);

export { uploadApi };
export default api;