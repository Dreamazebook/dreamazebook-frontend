import { API_USER_LOGIN, API_USER_REGISTER, API_USER_CURRENT, API_USER_SEND_PASSWORD_RESET_EMAIL, API_ADDRESS_LIST, API_ADMIN_LOGIN, API_ORDER_LIST, API_ORDER_DETAIL, API_COUNTRY_LIST, API_CART_LIST } from '@/constants/api'
import api from '@/utils/api'
import { ApiResponse, UserResponse } from '@/types/api'
import { create } from 'zustand'
import { Address } from '@/types/address'
import { OrderDetail, OrderDetailResponse } from '@/app/[locale]/(website)/checkout/components/types'

interface UserState {
  // Modal state
  isLoginModalOpen: boolean
  openLoginModal: () => void
  closeLoginModal: () => void
  toggleLoginModal: () => void
  // Post-login redirect state
  postLoginRedirect: string | null
  setPostLoginRedirect: (url: string | null) => void
  
  // User state
  user: UserType | null
  addresses: Address[]
  fetchAddresses: (options?: any) => void

  orderList: OrderDetail[]
  fetchOrderList: (options?:any) => void
  fetchOrderDetail: (orderId:string) => Promise<ApiResponse<OrderDetailResponse>>

  countryList: []
  fetchCountryList: () => void

  isLoggedIn: boolean
  login: (userData: LoginData) => Promise<ApiResponse<UserResponse> | null>
  loginAdmin: (userData: LoginData) => Promise<ApiResponse<UserResponse> | null>
  register: (userData: RegisterData) => Promise<ApiResponse<UserResponse> | null>
  logout: () => void
  fetchCurrentUser: () => void
  sendResetPasswordLink: (email: string) => Promise<boolean>

  // Kickstarter welcome modal
  showKickstarterWelcome: boolean
  ksSummary: KickstarterUserSummary | null
  checkKickstarterStatus: () => Promise<void>
  closeKickstarterWelcome: () => void
}

type UserType = {
  id: string
  name?: string
  email: string
  user_type?: string
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

type KickstarterUserSummary = {
  has_package: boolean
  package_id?: number
  configured_items?: number
  total_items?: number
  need_attention?: boolean
}

const useUserStore = create<UserState>((set,get) => ({
  // Modal state - initially closed
  isLoginModalOpen: false,
  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),
  toggleLoginModal: () => set((state) => ({ isLoginModalOpen: !state.isLoginModalOpen })),
  // Post-login redirect state
  postLoginRedirect: null,
  setPostLoginRedirect: (url) => set({ postLoginRedirect: url }),
  
  // User state - initially not logged in
  user: null,

  orderList: [],
  fetchOrderList: async (options?: any) => {
    const refresh = options?.refresh;
    if (!refresh && get().orderList.length > 0) return;
    try {
      const response = await api.get<ApiResponse<OrderDetail[]>>(API_ORDER_LIST);
      if (response.success && response.data) {
        set({ orderList: response.data });
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
    }
  },
  fetchOrderDetail : async (orderId:string) => {
    return await api.get<ApiResponse<OrderDetailResponse>>(`${API_ORDER_DETAIL}/${orderId}`);
    
  },

  addresses: [],
  fetchAddresses: async (options?: any) => {
    const refresh = options?.refresh;
    if (!refresh && get().addresses.length > 0) return;
    try {
      const response = await api.get<ApiResponse<Address[]>>(API_ADDRESS_LIST);
      if (response.success && response.data) {
        set({ addresses: response.data });
      }
    } catch (error) {
      console.error('Fetch addresses error:', error);
    }
  },


  countryList: [],
  fetchCountryList: async () => {
    if (get().countryList.length == 0) {
      const {data} = await api.get<ApiResponse>(API_COUNTRY_LIST);
      set({'countryList': data});
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
  // Kickstarter welcome modal state
  showKickstarterWelcome: false,
  ksSummary: null,
  closeKickstarterWelcome: () => set({ showKickstarterWelcome: false }),
  checkKickstarterStatus: async () => {
    try {
      // 复用购物车接口，查找是否有套餐型条目
      const { data, success } = await api.get<ApiResponse<any>>(API_CART_LIST);
      console.log('[KS] cart/list success:', success, 'data keys:', Object.keys(data || {}));
      if (!success || !data) return;

      const items = (data as any).cart_items || [];
      console.log('[KS] cart_items length:', items.length, items);
      const packages = items.filter((it: any) => it?.item_type === 'package');
      console.log('[KS] found packages:', packages?.length);

      if (packages && packages.length > 0) {
        const evaluate = (p: any) => {
          const configured = p.configured_items ?? p.package?.configured_items;
          const total = p.package?.book_count ?? p.total_items;
          const status = p.package_status || p.package?.status;
          const needByCount = (typeof configured === 'number' && typeof total === 'number') ? configured < total : undefined;
          const need = typeof needByCount === 'boolean' ? needByCount : (status ? status !== 'configured' : true);
          return { configured, total, status, need };
        };

        // 优先选择任意“未完成”的套餐
        const pendingPkg = packages.find((p: any) => evaluate(p).need);
        const target = pendingPkg || packages[0];
        const { configured, total, need, status } = evaluate(target);
        const packageId = target.package_id || target.package?.id || target.packageId;

        const summary: KickstarterUserSummary = {
          has_package: true,
          package_id: packageId,
          configured_items: configured,
          total_items: total,
          need_attention: !!pendingPkg, // 只有存在未完成的才弹
        };
        console.log('[KS] summary(multi):', summary, 'status:', status);
        set({ ksSummary: summary, showKickstarterWelcome: !!pendingPkg });
      } else {
        set({ ksSummary: { has_package: false }, showKickstarterWelcome: false });
      }
    } catch (error) {
      // 静默失败，不影响正常流程
      console.error('Check Kickstarter status error:', error);
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
  loginAdmin: async (userData): Promise<ApiResponse<UserResponse> | null> => {
    try {
      const response = await api.post<ApiResponse<UserResponse>>(API_ADMIN_LOGIN, userData);
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