import React, { useState, useEffect } from "react";
import { Save, Loader2, AlertCircle, Cpu } from "lucide-react";
import toast from "react-hot-toast";
import { useAppStore } from "../../store/appStore";
import { useAuthStore } from "../../store/authStore";
import { getAgentsConfig, updateAgentsConfig } from "../../services/adminConfigService";

export default function AgentsConfig() {
  const { theme, lang } = useAppStore();
  const { token } = useAuthStore();
  const isDark = theme === "dark";

  const [config, setConfig] = useState({
    timeout_seconds: 30,
    max_retries: 3,
    concurrent_limit: 5,
    fallback_enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const t = {
    EN: {
      title: "Agent Configuration",
      desc: "Manage global timeout, retry, and concurrency limits for all agents.",
      timeout: "Timeout (seconds)",
      retries: "Max Retries",
      concurrency: "Concurrent Limit",
      fallback: "Enable Fallback",
      save: "Save Changes",
      saving: "Saving...",
      success: "Configuration updated successfully.",
      fetchError: "Failed to load agent configuration.",
    },
    VI: {
      title: "Cấu hình Tác nhân",
      desc: "Quản lý thời gian chờ, số lần thử lại và giới hạn đồng thời cho các tác nhân.",
      timeout: "Thời gian chờ (giây)",
      retries: "Số lần thử lại tối đa",
      concurrency: "Giới hạn đồng thời",
      fallback: "Bật cơ chế dự phòng (Fallback)",
      save: "Lưu thay đổi",
      saving: "Đang lưu...",
      success: "Cập nhật cấu hình thành công.",
      fetchError: "Không thể tải cấu hình tác nhân.",
    },
  }[lang || "EN"];

  useEffect(() => {
    fetchConfig();
    // eslint-disable-next-line
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getAgentsConfig(token);
      if (data) setConfig(data);
    } catch (err) {
      setError(true);
      toast.error(t.fetchError);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAgentsConfig(token, config);
      toast.success(t.success);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : Number(value),
    }));
  };

  const cardBg = isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";
  const textMain = isDark ? "text-white" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const inputCls = `w-full h-11 px-4 rounded-xl border outline-none transition-colors ${
    isDark ? "bg-slate-800 border-slate-700 text-white focus:border-teal-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:bg-white"
  }`;

  if (loading) return <ConfigSkeleton isDark={isDark} />;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      <div>
        <h1 className={`text-2xl font-bold ${textMain} flex items-center gap-2`}>
          <Cpu className="text-teal-600" size={24} /> {t.title}
        </h1>
        <p className={`mt-1 ${textMuted}`}>{t.desc}</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-2">
          <AlertCircle size={18} /> {t.fetchError}
        </div>
      )}

      <div className={`p-6 md:p-8 rounded-3xl border shadow-sm ${cardBg}`}>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${textMain}`}>{t.timeout}</label>
              <input type="number" min="1" name="timeout_seconds" value={config.timeout_seconds} onChange={handleChange} className={inputCls} required />
            </div>
            <div>
              <label className={`block text-sm font-semibold mb-2 ${textMain}`}>{t.retries}</label>
              <input type="number" min="0" name="max_retries" value={config.max_retries} onChange={handleChange} className={inputCls} required />
            </div>
            <div>
              <label className={`block text-sm font-semibold mb-2 ${textMain}`}>{t.concurrency}</label>
              <input type="number" min="1" name="concurrent_limit" value={config.concurrent_limit} onChange={handleChange} className={inputCls} required />
            </div>
            <div className="flex items-center mt-8">
              <label className={`relative flex items-center cursor-pointer gap-3 text-sm font-semibold ${textMain}`}>
                <input type="checkbox" name="fallback_enabled" checked={config.fallback_enabled} onChange={handleChange} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                {t.fallback}
              </label>
            </div>
          </div>
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 disabled:opacity-70 transition-colors shadow-sm">
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? t.saving : t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfigSkeleton({ isDark }) {
  return (
    <div className={`max-w-4xl mx-auto p-8 rounded-3xl border animate-pulse ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
      <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-800 rounded mb-8"></div>
      <div className="grid grid-cols-2 gap-6">
        <div className="h-11 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        <div className="h-11 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        <div className="h-11 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
      </div>
    </div>
  );
}