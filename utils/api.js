import axios from 'axios';

const api= axios.create({
    baseURL: 'http://localhost:8000/api',
    withCredentials: true,
    timeout: 10000, // 请求超时时间设置为 10 秒
    headers: {
        'Content-Type': 'application/json',
    },
});

const HARDCODED_TOKEN = "16|bbITU6kTZWSWvzXKtmNFMwgMqYDyLEMPCfAqs0iyb82331d5"

// 请求拦截器
api.interceptors.request.use(
    (config) => {
        // 从 localStorage 获取 token
        const token = localStorage.getItem('token') || HARDCODED_TOKEN;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(config.headers); 
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        // 处理错误响应
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    // 未授权，处理登出逻辑
                    break;
                case 404:
                    console.error('The requested resource does not exist');
                    break;
                case 500:
                    console.error('Server error occurred');
                    break;
                default:
                    console.error('An error occurred:', error.response.data);
            }
        }
        return Promise.reject(error);
    }
);

export default api;