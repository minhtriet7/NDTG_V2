import { create } from 'zustand';
import { getRates, getBanknotes } from '../services/currencyService'; // Import service bạn vừa viết

export const useCurrencyStore = create((set) => ({
  ratesData: null,
  banknotes: [],
  isLoadingRates: false,
  isLoadingBanknotes: false,
  error: null,

  // Action gọi API lấy tỷ giá
  fetchRates: async () => {
    set({ isLoadingRates: true, error: null });
    try {
      const data = await getRates();
      set({ ratesData: data, isLoadingRates: false });
    } catch (err) {
      set({ error: "Lỗi khi lấy tỷ giá", isLoadingRates: false });
    }
  },

  // Action gọi API lấy danh sách tiền
  fetchBanknotes: async (params) => {
    set({ isLoadingBanknotes: true, error: null });
    try {
      const data = await getBanknotes(params);
      set({ banknotes: data, isLoadingBanknotes: false });
    } catch (err) {
      set({ error: "Lỗi khi lấy danh sách tiền", isLoadingBanknotes: false });
    }
  }
}));