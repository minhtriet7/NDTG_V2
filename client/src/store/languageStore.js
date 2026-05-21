import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useLanguageStore = create(
  persist(
    (set) => ({
      lang: 'EN', // Ngôn ngữ mặc định là Tiếng Anh
      
      // Đặt ngôn ngữ cụ thể
      setLanguage: (newLang) => set({ lang: newLang }),
      
      // Nút gạt chuyển đổi nhanh (EN <-> VI)
      toggleLanguage: () => set((state) => ({ 
        lang: state.lang === 'EN' ? 'VI' : 'EN' 
      }))
    }),
    {
      name: 'app-language', // Tên lưu trong bộ nhớ máy
      storage: createJSONStorage(() => localStorage),
    }
  )
);