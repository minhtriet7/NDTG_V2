import axios from "axios";

const ROOT_API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000";

const API_BASE_URL = `${ROOT_API_URL}/api/v1/admin`;

function safeParseJSON(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export const getAdminToken = () => {
  const authStorage = safeParseJSON(localStorage.getItem("auth-storage"));
  const tokenFromStore = authStorage?.state?.token;

  return (
    tokenFromStore ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    ""
  );
};

export const getAuthHeaders = () => {
  const token = getAdminToken();

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

function normalizeApiError(error, fallbackMessage = "Admin API error.") {
  return (
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage
  );
}

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

async function adminGet(path, params = {}) {
  try {
    const res = await axios.get(`${API_BASE_URL}${path}`, {
      headers: getAuthHeaders(),
      params,
    });

    return res.data;
  } catch (error) {
    throw new Error(normalizeApiError(error));
  }
}

async function adminPost(path, payload = {}) {
  try {
    const res = await axios.post(`${API_BASE_URL}${path}`, payload, {
      headers: getAuthHeaders(),
    });

    return res.data;
  } catch (error) {
    throw new Error(normalizeApiError(error));
  }
}

async function adminPut(path, payload = {}) {
  try {
    const res = await axios.put(`${API_BASE_URL}${path}`, payload, {
      headers: getAuthHeaders(),
    });

    return res.data;
  } catch (error) {
    throw new Error(normalizeApiError(error));
  }
}

async function adminPatch(path, payload = {}) {
  try {
    const res = await axios.patch(`${API_BASE_URL}${path}`, payload, {
      headers: getAuthHeaders(),
    });

    return res.data;
  } catch (error) {
    throw new Error(normalizeApiError(error));
  }
}

async function adminDelete(path) {
  try {
    const res = await axios.delete(`${API_BASE_URL}${path}`, {
      headers: getAuthHeaders(),
    });

    return res.data;
  } catch (error) {
    throw new Error(normalizeApiError(error));
  }
}

/* =========================================================
   DASHBOARD - backend hiện đã có trong admin_router.py
========================================================= */

export const getDashboardSummary = async () => {
  return adminGet("/dashboard/summary");
};

export const getSystemHealth = async () => {
  return adminGet("/system/health");
};

export const getAgentPerformance = async () => {
  return adminGet("/agents/performance");
};

export const getRecentScans = async (limit = 10) => {
  return adminGet("/recognition/recent", { limit });
};

export const getPendingFeedback = async (limit = 5) => {
  try {
    const data = await adminGet("/feedbacks/pending", { limit });
    return normalizeList(data);
  } catch {
    return [];
  }
};

export const getAdminPaymentOverview = async () => {
  const summary = await getDashboardSummary();
  return summary?.payments || summary?.payment_overview || {};
};

export const getAdminUserBreakdown = async () => {
  const summary = await getDashboardSummary();
  return summary?.users_breakdown || {};
};

export const getAdminBanknoteOverview = async () => {
  const summary = await getDashboardSummary();
  return summary?.banknotes_breakdown || {};
};

/* =========================================================
   USERS
========================================================= */

export const getUsers = async (page = 1, limit = 50, params = {}) => {
  return adminGet("/users", {
    page,
    limit,
    ...params,
  });
};

export const getAdminUsers = async (params = {}) => {
  return adminGet("/users", params);
};

export const getAdminUserDetail = async (userId) => {
  return adminGet(`/users/${userId}`);
};

export const updateAdminUser = async (userId, payload) => {
  return adminPut(`/users/${userId}`, payload);
};

export const updateUserStatus = async (userId, statusOrIsActive) => {
  const payload =
    typeof statusOrIsActive === "boolean"
      ? { is_active: statusOrIsActive }
      : { status: statusOrIsActive };

  return adminPut(`/users/${userId}/status`, payload);
};

export const updateUserRole = async (userId, role) => {
  return adminPut(`/users/${userId}/role`, { role });
};

export const updateUserTokens = async (userId, tokenBalance) => {
  return adminPut(`/users/${userId}`, {
    token_balance: tokenBalance,
  });
};

export const deleteUser = async (userId) => {
  return adminDelete(`/users/${userId}`);
};

/* =========================================================
   BANKNOTES
   Chú ý: cần backend route /api/v1/admin/banknotes.
========================================================= */

export const getAdminBanknotes = async (params = {}) => {
  return adminGet("/banknotes", params);
};

export const getBanknotes = async (params = {}) => {
  return getAdminBanknotes(params);
};

export const createBanknote = async (payload) => {
  return adminPost("/banknotes", payload);
};

export const updateBanknote = async (banknoteId, payload) => {
  return adminPut(`/banknotes/${banknoteId}`, payload);
};

export const deleteBanknote = async (banknoteId) => {
  return adminDelete(`/banknotes/${banknoteId}`);
};

export const uploadBanknoteImage = async (banknoteId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await axios.post(
      `${API_BASE_URL}/banknotes/${banknoteId}/upload-image`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${getAdminToken()}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.data;
  } catch (error) {
    throw new Error(normalizeApiError(error, "Không thể tải ảnh tiền giấy."));
  }
};

/* =========================================================
   CURRENCY RATES
   Chú ý: cần backend route /api/v1/admin/currency-rates.
========================================================= */

export const getAdminCurrencyRates = async (params = {}) => {
  return adminGet("/currency-rates", params);
};

export const getCurrencyRates = async (params = {}) => {
  return getAdminCurrencyRates(params);
};

export const createCurrencyRate = async (payload) => {
  return adminPost("/currency-rates", payload);
};

export const updateCurrencyRate = async (rateId, payload) => {
  return adminPut(`/currency-rates/${rateId}`, payload);
};

export const deleteCurrencyRate = async (rateId) => {
  return adminDelete(`/currency-rates/${rateId}`);
};

export const syncCurrencyRates = async () => {
  return adminPost("/currency-rates/sync");
};

/* =========================================================
   TOKEN PACKAGES
   Chú ý: cần backend route /api/v1/admin/token-packages.
========================================================= */

export const getAdminTokenPackages = async (params = {}) => {
  return adminGet("/token-packages", params);
};

export const getTokenPackagesAdmin = async (params = {}) => {
  return getAdminTokenPackages(params);
};

export const createTokenPackage = async (payload) => {
  return adminPost("/token-packages", payload);
};

export const updateTokenPackage = async (packageId, payload) => {
  return adminPut(`/token-packages/${packageId}`, payload);
};

export const toggleTokenPackage = async (packageId) => {
  return adminPut(`/token-packages/${packageId}/toggle`);
};

export const deleteTokenPackage = async (packageId) => {
  return adminDelete(`/token-packages/${packageId}`);
};

/* =========================================================
   TRANSACTIONS
   Chú ý: cần backend route /api/v1/admin/transactions.
========================================================= */

export const getAdminTransactions = async (params = {}) => {
  return adminGet("/transactions", params);
};

export const getAdminTransactionDetail = async (transactionId) => {
  return adminGet(`/transactions/${transactionId}`);
};

export const markTransactionPaid = async (transactionId) => {
  return adminPut(`/transactions/${transactionId}/mark-paid`);
};

export const cancelTransaction = async (transactionId) => {
  return adminPut(`/transactions/${transactionId}/cancel`);
};

export const exportTransactions = async (params = {}) => {
  return adminGet("/transactions/export", params);
};
export const updateTransactionStatus = async (transactionId, status) => {
  return adminPut(`/transactions/${transactionId}/status`, { status });
};
/* =========================================================
   FEEDBACKS
   Chú ý: backend bạn hiện mới có /feedbacks/pending.
   Các route quản trị feedback dưới đây cần bổ sung nếu chưa có.
========================================================= */

export const getAdminFeedbacks = async (params = {}) => {
  return adminGet("/feedbacks", params);
};

export const getAdminFeedbackDetail = async (feedbackId) => {
  return adminGet(`/feedbacks/${feedbackId}`);
};

export const updateFeedbackStatus = async (feedbackId, status) => {
  return adminPut(`/feedbacks/${feedbackId}/status`, { status });
};

export const replyFeedback = async (feedbackId, message) => {
  return adminPost(`/feedbacks/${feedbackId}/reply`, { message });
};

export const deleteFeedback = async (feedbackId) => {
  return adminDelete(`/feedbacks/${feedbackId}`);
};

/* =========================================================
   RECOGNITION RESULTS
   Chú ý: backend bạn hiện mới có /recognition/recent.
========================================================= */

export const getAdminResults = async (params = {}) => {
  return adminGet("/results", params);
};

export const getAdminResultDetail = async (resultId) => {
  return adminGet(`/results/${resultId}`);
};

export const rerunRecognition = async (resultId) => {
  return adminPost(`/results/${resultId}/rerun`);
};

export const markResultReviewed = async (resultId) => {
  return adminPut(`/results/${resultId}/review`);
};

export const deleteResult = async (resultId) => {
  return adminDelete(`/results/${resultId}`);
};

/* =========================================================
   AGENTS
========================================================= */

export const getAgentsStatus = async () => {
  return adminGet("/agents/status");
};

export const testAgent = async (agentKey) => {
  return adminPost(`/agents/${agentKey}/test`);
};

/* =========================================================
   SYSTEM LOGS
   Chú ý: cần backend route /api/v1/admin/logs.
========================================================= */

export const getSystemLogs = async (params = {}) => {
  return adminGet("/logs", params);
};

export const getSystemLogDetail = async (logId) => {
  return adminGet(`/logs/${logId}`);
};

export const clearSystemLogs = async () => {
  return adminDelete("/logs/clear");
};

export const exportSystemLogs = async (params = {}) => {
  return adminGet("/logs/export", params);
};

/* =========================================================
   SAFE FALLBACKS
========================================================= */

export const safeGetDashboardSummary = async () => {
  try {
    return await getDashboardSummary();
  } catch {
    return null;
  }
};

export const safeGetSystemHealth = async () => {
  try {
    return await getSystemHealth();
  } catch {
    return null;
  }
};

export const safeGetAgentPerformance = async () => {
  try {
    return await getAgentPerformance();
  } catch {
    return null;
  }
};

export const safeGetRecentScans = async (limit = 10) => {
  try {
    const data = await getRecentScans(limit);
    return normalizeList(data);
  } catch {
    return [];
  }
};

export const safeGetPendingFeedback = async (limit = 5) => {
  try {
    const data = await getPendingFeedback(limit);
    return normalizeList(data);
  } catch {
    return [];
  }
};