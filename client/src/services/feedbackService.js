import api from "./api";

function normalizeApiError(error, fallbackMessage = "Có lỗi xảy ra.") {
  return (
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage
  );
}

export const submitFeedback = async (payload) => {
  try {
    const res = await api.post("/feedback/", payload);
    return res.data;
  } catch (error) {
    throw new Error(normalizeApiError(error, "Không thể gửi phản hồi."));
  }
};

export const getFeedbackHistory = async () => {
  try {
    const res = await api.get("/feedback/");
    return Array.isArray(res.data) ? res.data : res.data?.items || res.data?.data || [];
  } catch (error) {
    throw new Error(normalizeApiError(error, "Không thể tải lịch sử phản hồi."));
  }
};