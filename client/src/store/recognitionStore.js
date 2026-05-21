import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useRecognitionStore = create(
  persist(
    (set) => ({
      currentScanSession: null,

      // Lưu kết quả quét mới (Có thể là 1 kết quả hoặc mảng nhiều kết quả)
      setScanSession: (previewUrl, resultData) => set({
        currentScanSession: {
          previewUrl: previewUrl,
          result: resultData, // Data từ AI trả về
          timestamp: new Date().toISOString()
        }
      }),

      // Xóa phiên làm việc khi người dùng bấm Xóa ảnh
      clearScanSession: () => set({ currentScanSession: null }),
    }),
    {
      name: 'recognition-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);