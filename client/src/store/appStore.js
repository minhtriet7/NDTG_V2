import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set) => ({
      theme: 'light',
      lang: 'EN',
      toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        // Ép class 'dark' trực tiếp vào thẻ HTML gốc
        if (newTheme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        return { theme: newTheme };
      }),
      toggleLang: () => set((state) => ({ lang: state.lang === 'EN' ? 'VI' : 'EN' })),
      // Khởi tạo theme khi load trang
      initTheme: () => set((state) => {
        if (state.theme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        return state;
      }),

      // 🌟 ĐƯA CÁC BIẾN QUẢN LÝ PHIÊN QUÉT VÀO ĐÚNG BÊN TRONG OBJECT NÀY
      currentScanSession: null, 
      setScanSession: (data) => set({ currentScanSession: data }),
      clearScanSession: () => set({ currentScanSession: null })
    }),
    { 
      name: 'app-settings', // Lưu vào LocalStorage
      // 🌟 CẤU HÌNH PARTIALIZE: Chỉ lưu theme và lang, không lưu rác phiên quét vào ổ cứng
      partialize: (state) => ({ theme: state.theme, lang: state.lang }),
    } 
  )
);