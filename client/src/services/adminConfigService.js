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

function normalizeApiError(error, fallbackMessage = "Admin config API error.") {
  return (
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage
  );
}

async function configGet(path, params = {}) {
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

async function configPost(path, payload = {}) {
  try {
    const res = await axios.post(`${API_BASE_URL}${path}`, payload, {
      headers: getAuthHeaders(),
    });

    return res.data;
  } catch (error) {
    throw new Error(normalizeApiError(error));
  }
}

async function configPut(path, payload = {}) {
  try {
    const res = await axios.put(`${API_BASE_URL}${path}`, payload, {
      headers: getAuthHeaders(),
    });

    return res.data;
  } catch (error) {
    throw new Error(normalizeApiError(error));
  }
}

/* =========================================================
   AGENTS CONFIG
========================================================= */

export const getAgentsConfig = async () => {
  return configGet("/config/agents");
};

export const updateAgentsConfig = async (payload) => {
  return configPut("/config/agents", payload);
};

export const resetAgentsConfig = async () => {
  return configPost("/config/agents/reset");
};

/* =========================================================
   AGGREGATOR CONFIG
========================================================= */

export const getAggregatorConfig = async () => {
  return configGet("/config/aggregator");
};

export const updateAggregatorConfig = async (payload) => {
  return configPut("/config/aggregator", payload);
};

export const testAggregator = async (payload) => {
  return configPost("/config/aggregator/test", payload);
};

export const resetAggregatorConfig = async () => {
  return configPost("/config/aggregator/reset");
};

/* =========================================================
   AI MODEL CONFIG
========================================================= */

export const getAiModelConfig = async () => {
  return configGet("/config/ai-model");
};

export const updateAiModelConfig = async (payload) => {
  return configPut("/config/ai-model", payload);
};

export const reloadMlModel = async () => {
  return configPost("/config/ai-model/reload");
};

export const testMlModel = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await axios.post(
      `${API_BASE_URL}/config/ai-model/test`,
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
    throw new Error(normalizeApiError(error, "Không thể test mô hình AI."));
  }
};

/* =========================================================
   LLM CONFIG
========================================================= */

export const getLlmConfig = async () => {
  return configGet("/config/llm");
};

export const updateLlmConfig = async (payload) => {
  return configPut("/config/llm", payload);
};

export const testLlmConfig = async (payload) => {
  return configPost("/config/llm/test", payload);
};

/* =========================================================
   GOOGLE LENS CONFIG
========================================================= */

export const getLensConfig = async () => {
  return configGet("/config/google-lens");
};

export const updateLensConfig = async (payload) => {
  return configPut("/config/google-lens", payload);
};

export const testLensAgent = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await axios.post(
      `${API_BASE_URL}/config/google-lens/test`,
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
    throw new Error(normalizeApiError(error, "Không thể test Google Lens."));
  }
};

export const reloadLensProxies = async () => {
  return configPost("/config/google-lens/reload-proxies");
};

/* =========================================================
   SYSTEM SETTINGS
========================================================= */

export const getSystemSettings = async () => {
  return configGet("/settings");
};

export const updateSystemSettings = async (payload) => {
  return configPut("/settings", payload);
};

export const getAdminSettings = async () => {
  return getSystemSettings();
};

export const updateAdminSettings = async (payload) => {
  return updateSystemSettings(payload);
};

export const resetAdminSettings = async (section = "all") => {
  return configPost("/settings/reset", { section });
};