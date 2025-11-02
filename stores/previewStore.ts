import { create } from 'zustand'

type PreviewUserData = any

interface PreviewState {
  userData: PreviewUserData | null
  bookId: string | null
  setUserData: (data: PreviewUserData | null) => void
  setBookId: (id: string | null) => void
  clear: () => void
}

const usePreviewStore = create<PreviewState>((set) => ({
  userData: null,
  bookId: null,
  setUserData: (data) => set({ userData: data }),
  setBookId: (id) => set({ bookId: id }),
  clear: () => set({ userData: null, bookId: null }),
}))

export default usePreviewStore


