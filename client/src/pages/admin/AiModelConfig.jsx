import React, { useState, useEffect } from "react";
import { Save, Loader2, BrainCircuit } from "lucide-react";
import toast from "react-hot-toast";
import { useAppStore } from "../../store/appStore";
import { useAuthStore } from "../../store/authStore";
import { getAiModelConfig, updateAiModelConfig } from "../../services/adminConfigService";

export default function AiModelConfig() {
  const { theme, lang } = useAppStore();
  const { token } = useAuthStore();
  const isDark = theme === "dark";

  const [config, setConfig] = useState({
    model_version: "yolov8m",
    confidence_threshold: 0.75,
    endpoint_url: "http://localhost:8001/predict",
    use_gpu: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const t = {
    EN: { title: "AI Model Configuration", version: "Model Version", conf: "Confidence Threshold (0-1)", endpoint: "Model Endpoint URL", gpu: "Enable GPU Acceleration", save: "Save Changes" },
    VI: { title: "Cấu hình Mô hình AI", version: "Phiên bản Model", conf: "Ngưỡng độ tin cậy (0-1)", endpoint: "URL API Mô hình", gpu: "Bật tăng tốc GPU", save: "Lưu thay đổi" },
  }[lang || "EN"];

  useEffect(() => {
    getAiModelConfig(token).then(data => { if(data) setConfig(data); setLoading(false); }).catch(() => setLoading(false));
  }, [token]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAiModelConfig(token, config);
      toast.success("Updated");
    } catch {
      toast.error("Error");
    } finally { setSaving(false); }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({ ...prev, [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value }));
  };

  const cardBg = isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";
  const textMain = isDark ? "text-white" : "text-slate-900";
  const inputCls = `w-full h-11 px-4 rounded-xl border outline-none transition-colors ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`;

  if (loading) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className={`text-2xl font-bold ${textMain} flex items-center gap-2`}><BrainCircuit className="text-teal-600"/> {t.title}</h1>
      <div className={`p-6 md:p-8 rounded-3xl border shadow-sm ${cardBg}`}>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className={`block text-sm font-semibold mb-2 ${textMain}`}>{t.version}</label><input type="text" name="model_version" value={config.model_version} onChange={handleChange} className={inputCls} required /></div>
            <div><label className={`block text-sm font-semibold mb-2 ${textMain}`}>{t.conf}</label><input type="number" step="0.01" name="confidence_threshold" value={config.confidence_threshold} onChange={handleChange} className={inputCls} required /></div>
            <div className="md:col-span-2"><label className={`block text-sm font-semibold mb-2 ${textMain}`}>{t.endpoint}</label><input type="url" name="endpoint_url" value={config.endpoint_url} onChange={handleChange} className={inputCls} required /></div>
            <div className="flex items-center">
              <label className={`relative flex items-center cursor-pointer gap-3 text-sm font-semibold ${textMain}`}>
                <input type="checkbox" name="use_gpu" checked={config.use_gpu} onChange={handleChange} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                {t.gpu}
              </label>
            </div>
          </div>
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 disabled:opacity-70">{t.save}</button>
          </div>
        </form>
      </div>
    </div>
  );
}