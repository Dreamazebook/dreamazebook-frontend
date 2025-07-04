import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 30000, // 30 秒超时
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // 服务器返回错误状态码
      console.error('API错误:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url
      });
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('网络错误:', {
        message: '请求超时或网络连接失败',
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        timeout: error.config?.timeout,
        code: error.code
      });
    } else {
      // 请求配置出错
      console.error('请求错误:', {
        message: error.message,
        url: error.config?.url
      });
    }
    
    if (error.code === 'ECONNABORTED') {
      console.error('请求超时，请检查网络连接');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 