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
    
    await sendRequest({
      method: 'POST',
      url: 'https://dreamazebook-backend.onrender.com/api/v1/auth/register',
      body: userData})

    set({ user: userData, isLoggedIn: true })
  },
  login: (userData) => set({ user: userData, isLoggedIn: true }),
  logout: () => set({ user: null, isLoggedIn: false }),
}))

export default useUserStore