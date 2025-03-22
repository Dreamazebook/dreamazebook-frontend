import { API_USER_LOGIN, API_USER_REGISTER } from '@/constants/api'
import { sendRequest } from '@/utils/hubspot'
import { create } from 'zustand'

interface UserState {
  // Modal state
  isLoginModalOpen: boolean
  openLoginModal: () => void
  closeLoginModal: () => void
  toggleLoginModal: () => void
  
  // User state
  user: UserType | null
  isLoggedIn: boolean
  login: (userData: UserType) => void
  register: (userData: UserType) => void
  logout: () => void
}

type UserType = {
  id?: string
  name?: string
  email: string
  password?: string
  password_confirmation?: string
}

const useUserStore = create<UserState>((set) => ({
  // Modal state - initially closed
  isLoginModalOpen: false,
  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),
  toggleLoginModal: () => set((state) => ({ isLoginModalOpen: !state.isLoginModalOpen })),
  
  // User state - initially not logged in
  user: null,
  isLoggedIn: false,
  register: async (userData) => {
    
    const {code, success, message} = await sendRequest({
      method: 'POST',
      url: API_USER_REGISTER,
      body: userData})
    if (success) {
      set({ isLoggedIn: true })
    }
  },
  login: async (userData) => {
    const {code, success, message} = await sendRequest({
      url: API_USER_LOGIN,
      method: 'POST',
      body: userData
    });

    if (success) {
      set({isLoggedIn: true})
    }

  },
  logout: () => set({ user: null, isLoggedIn: false }),
}))

export default useUserStore