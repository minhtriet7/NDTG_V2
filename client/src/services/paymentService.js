import API from './api';

// Hàm nội bộ chứa dữ liệu gói dự phòng
const getMockPackages = () => [
  { 
    id: 'pkg_1', 
    name: 'Starter Pack', 
    tokens_included: 50, 
    price_usd: 5, 
    price_vnd: 50000, 
    features: ['Phân tích ảnh cắt vùng ML/DL', 'Xác minh Đặc vụ LLM', 'Lưu trữ lịch sử quét tiêu chuẩn'] 
  },
  { 
    id: 'pkg_2', 
    name: 'Professional Pack', 
    tokens_included: 200, 
    price_usd: 15, 
    price_vnd: 150000, 
    features: ['Toàn bộ tính năng gói Starter', 'Kích hoạt Đặc vụ Google Lens OSINT', 'Thuật toán tổng hợp đồng thuận đa tác tử', 'Trích xuất định dạng JSON cấu trúc'] 
  },
  { 
    id: 'pkg_3', 
    name: 'Enterprise Pack', 
    tokens_included: 1000, 
    price_usd: 50, 
    price_vnd: 500000, 
    features: ['Toàn bộ tính năng gói Pro', 'Xử lý tải lên hàng loạt', 'Hạn mức băng thông API riêng', 'Hỗ trợ kỹ thuật ưu tiên 24/7'] 
  }
];

/**
 * API Lấy danh sách các gói Token từ Database công khai
 */
export const getTokenPackages = async () => {
  try {
    const res = await API.get('/payment/token-packages');
    // Kiểm tra nếu mảng trả về rỗng thì ép sử dụng dữ liệu Mock để hiển thị giao diện
    if (res.data && res.data.length > 0) {
      return res.data;
    }
    console.warn("⚠️ Database trống. Hệ thống tự động kích hoạt Mock Packages.");
    return getMockPackages();
  } catch (error) {
    console.warn("⚠️ Không thể kết nối API, sử dụng Fallback Mock Data.");
    return getMockPackages();
  }
};

/**
 * API Tạo hóa đơn mua gói Token gửi lên Backend
 */
export const createCheckoutSession = async (payload) => {
  try {
    const res = await API.post('/payment/buy', payload); 
    return res.data; 
  } catch (error) {
    console.error("Lỗi kết nối cổng thanh toán thật:", error);
    
    // 🌟 QUAN TRỌNG: Không Fake dữ liệu nữa, ném thẳng lỗi ra để Pricing.jsx hiển thị Toast báo lỗi!
    throw error;
  }
};