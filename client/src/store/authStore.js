import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      // Hàm đăng nhập
      login: (userData, token) => set({ 
          user: userData, 
          token: token, 
          isAuthenticated: true 
      }),

      // Hàm đăng xuất
      logout: () => set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
      }),

      // Cập nhật token balance
      updateTokenBalance: (newBalance) => set((state) => ({
          user: { ...state.user, token_balance: newBalance }
      }))
    }),
    {
      name: 'auth-storage', // Tên key lưu trong trình duyệt
      storage: createJSONStorage(() => localStorage), // Ép chuẩn định dạng lưu trữ
    }
  )
);