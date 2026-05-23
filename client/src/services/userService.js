import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

function getAuthHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

export async function getMe(token) {
  const res = await axios.get(`${API_BASE_URL}/api/v1/users/me`, { headers: getAuthHeaders(token) });
  return res.data;
}

export async function updateMe(token, payload) {
  const res = await axios.put(`${API_BASE_URL}/api/v1/users/me`, payload, { headers: getAuthHeaders(token) });
  return res.data;
}

export async function changePassword(token, payload) {
  const res = await axios.put(`${API_BASE_URL}/api/v1/users/me/password`, payload, { headers: getAuthHeaders(token) });
  return res.data;
}

export async function setPassword(token, payload) {
  return await changePassword(token, {
      current_password: "oauth_bypass",
      new_password: payload.new_password
  });
}

// ==========================================
// CÁC HÀM THỐNG KÊ VÀ LỊCH SỬ (ĐÃ MỞ KHÓA API THẬT)
// ==========================================

export async function getMyScanStats(token) {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/v1/users/me/history`, { headers: getAuthHeaders(token) });
    const history = res.data || [];
    
    return {
      total_scans: history.length,
      completed: history.filter(item => item.status === "Completed" || item.status === "High Consensus" || item.status === "Partial Success").length,
      needs_review: history.filter(item => item.status === "Conflict Detected" || item.status === "Failed").length,
      last_scan_at: history.length > 0 ? history[0].created_at : null
    };
  } catch (error) {
    console.error("Lỗi lấy lịch sử quét:", error);
    return null;
  }
}

export async function getMyTransactions(token, limit = 5) {
  try {
    // 🌟 ĐỔI "/payment/transactions" THÀNH "/users/me/transactions"
    const res = await axios.get(
      `${API_BASE_URL}/api/v1/users/me/transactions?limit=${limit}`,
      { headers: getAuthHeaders(token) }
    );
    return res.data;
  } catch (error) {
    console.error("Lỗi lấy danh sách giao dịch:", error);
    return []; 
  }
}

export async function logoutSession(token) {
  try {
    // Báo cho Backend biết user đã đăng xuất để hủy phiên (nếu cần)
    await axios.post(`${API_BASE_URL}/api/v1/auth/logout`, {}, { headers: getAuthHeaders(token) });
    return true;
  } catch (error) {
    console.error("Lỗi đăng xuất:", error);
    return true; // Vẫn trả về true để Frontend xóa LocalStorage và điều hướng về trang Login
  }
}