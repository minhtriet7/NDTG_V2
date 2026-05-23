import api from './api';

// 1. API lấy tỷ giá chuyển đổi
export const getRates = async () => {
  try {
    // Bây giờ gọi API sẽ thành công 200 OK (Không còn 404 nữa)
    const res = await api.get('/currency/rates');
    return res.data;
  } catch (error) {
    console.warn("⚠️ API Tỷ giá lỗi, đang dùng dữ liệu dự phòng (Fallback).");
    return {
      base: 'USD',
      source: 'Indicative Regional Rates (Fallback)',
      rates: { 
        USD: 1, VND: 25450, THB: 36.8, SGD: 1.35, MYR: 4.75, 
        IDR: 16100, PHP: 57.2, KHR: 4100, LAK: 21000 
      }
    };
  }
};

// 2. API lấy danh sách tiền giấy hiển thị lên thư viện Directory
export const getBanknotes = async (params) => {
  try {
    const res = await api.get('/banknotes', { params });
    return res.data;
  } catch (error) {
    return [
      { id: '1', country: 'Vietnam', currency_code: 'VND', denomination: '500,000', material: 'Polymer', series_year: '2003', image_front_url: null, supported_agents: { ml_dl: true, llm_api: true, visual_search: true }, status: 'Verified' },
      { id: '2', country: 'Thailand', currency_code: 'THB', denomination: '1,000', material: 'Paper', series_year: '2018', image_front_url: null, supported_agents: { ml_dl: true, llm_api: true, visual_search: true }, status: 'Verified' },
      { id: '3', country: 'Singapore', currency_code: 'SGD', denomination: '100', material: 'Polymer', series_year: '1999', image_front_url: null, supported_agents: { ml_dl: true, llm_api: true, visual_search: false }, status: 'Verified' },
      { id: '4', country: 'Malaysia', currency_code: 'MYR', denomination: '100', material: 'Paper', series_year: '2012', image_front_url: null, supported_agents: { ml_dl: true, llm_api: true, visual_search: true }, status: 'Reviewing' },
      { id: '5', country: 'Indonesia', currency_code: 'IDR', denomination: '100,000', material: 'Paper', series_year: '2016', image_front_url: null, supported_agents: { ml_dl: true, llm_api: true, visual_search: true }, status: 'Verified' }
    ];
  }
};