import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios'; // 👈 Bổ sung axios để gọi API

export const useAuthStore = create(
  persist(
    (set, get) => ({
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

      // Cập nhật token balance (dùng khi vừa mua xong chưa kịp F5)
      updateTokenBalance: (newBalance) => set((state) => ({
          user: { ...state.user, token_balance: newBalance }
      })),

      // 🌟 HÀM MỚI: Đồng bộ thông tin User từ Database
      syncProfile: async () => {
        const { token } = get();
        if (!token) return; // Nếu chưa đăng nhập thì không gọi

        try {
          // Gọi API /me đã có sẵn trong user_router.py của bạn
          const res = await axios.get('http://localhost:8000/api/v1/users/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // Đè dữ liệu mới nhất (chứa token_balance thực tế từ DB) vào state
          set({ 
            user: res.data,
            isAuthenticated: true 
          });
        } catch (error) {
          console.error("Lỗi đồng bộ Profile:", error);
          
          // (Tùy chọn) Nếu token hết hạn hoặc lỗi xác thực (401), tự động đăng xuất
          if (error.response && error.response.status === 401) {
            get().logout();
          }
        }
      }
    }),
    {
      name: 'auth-storage', // Tên key lưu trong trình duyệt
      storage: createJSONStorage(() => localStorage), // Ép chuẩn định dạng lưu trữ
    }
  )
);