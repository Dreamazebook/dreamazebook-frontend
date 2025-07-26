import { API_USER_LOGIN, API_USER_REGISTER, API_USER_CURRENT, API_USER_SEND_PASSWORD_RESET_EMAIL, API_ADDRESS_LIST } from '@/constants/api'
import api from '@/utils/api'
import { ApiResponse, UserResponse } from '@/types/api'
import { create } from 'zustand'
import { Address } from '@/types/address'
import { get } from 'http'

interface UserState {
  // Modal state
  isLoginModalOpen: boolean
  openLoginModal: () => void
  closeLoginModal: () => void
  toggleLoginModal: () => void
  
  // User state
  user: UserType | null
  addresses: Address[]
  fetchAddresses: () => void
  isLoggedIn: boolean
  login: (userData: LoginData) => Promise<ApiResponse<UserResponse> | null>
  register: (userData: RegisterData) => Promise<ApiResponse<UserResponse> | null>
  logout: () => void
  fetchCurrentUser: () => void
  sendResetPasswordLink: (email: string) => Promise<boolean>
}

type UserType = {
  id: string
  name?: string
  email: string
}

type LoginData = {
  email: string
  password: string
}

type RegisterData = {
  name?: string
  email: string
  password: string
  password_confirmation: string
}

const useUserStore = create<UserState>((set,get) => ({
  // Modal state - initially closed
  isLoginModalOpen: false,
  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),
  toggleLoginModal: () => set((state) => ({ isLoginModalOpen: !state.isLoginModalOpen })),
  
  // User state - initially not logged in
  user: null,
  addresses: [],
  fetchAddresses: async () => {
    if (get().addresses.length > 0) return;
    try {
      const response = await api.get<ApiResponse<Address[]>>(API_ADDRESS_LIST);
      if (response.success && response.data) {
        set({ addresses: response.data });
      }
    } catch (error) {
      console.error('Fetch addresses error:', error);
    }
  },
  isLoggedIn: false,
  sendResetPasswordLink: async (email: string): Promise<boolean> => {
    try {
      const response = await api.post<ApiResponse<any>>(API_USER_SEND_PASSWORD_RESET_EMAIL, { email });
      return response.success;
    } catch (error) {
      console.error('Send reset password link error:', error);
      return false;
    }
  },
  register: async (userData): Promise<ApiResponse<UserResponse> | null> => {
    try {
      const response = await api.post<ApiResponse<UserResponse>>(API_USER_REGISTER, userData);
      if (response.success && response.data?.token) {
        localStorage.setItem('token', response.data.token);
        set({ isLoggedIn: true, user: response.data?.user || null });
      }
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      return null;
    }
  },
  login: async (userData): Promise<ApiResponse<UserResponse> | null> => {
    try {
      const response = await api.post<ApiResponse<UserResponse>>(API_USER_LOGIN, userData);
      if (response.success && response.data?.token) {
        localStorage.setItem('token', response.data.token);
        set({ isLoggedIn: true, user: response.data.user });
      }
      return response;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isLoggedIn: false });
  },
  fetchCurrentUser: async () => {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    
    if (!token) {
      return;
    }
    
    try {
      const response = await api.get<ApiResponse>(API_USER_CURRENT);
      if (response.success && response.data) {
        set({ user: response.data, isLoggedIn: true });
      }
      return response;
    } catch (error) {
      console.error('Fetch current user error:', error);
      // 如果获取用户信息失败（例如token过期），清除登录状态
      localStorage.removeItem('token');
      set({ user: null, isLoggedIn: false });
    }
  },
}))

export default useUserStore