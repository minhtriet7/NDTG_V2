import React, { useState, useEffect } from "react";
import { Save, Loader2, Settings as SettingsIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useAppStore } from "../../store/appStore";
import { useAuthStore } from "../../store/authStore";
import { getSystemSettings, updateSystemSettings } from "../../services/adminConfigService";

export default function Settings() {
  const { theme, lang } = useAppStore();
  const { token } = useAuthStore();
  const isDark = theme === "dark";

  const [config, setConfig] = useState({ app_name: "BanknoteAI", support_email: "support@banknoteai.com", max_upload_size_mb: 5, maintenance_mode: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const t = {
    EN: { title: "System Settings", appName: "Application Name", email: "Support Email", maxSize: "Max Upload Size (MB)", maint: "Maintenance Mode", save: "Save" },
    VI: { title: "Cài đặt Hệ thống", appName: "Tên ứng dụng", email: "Email hỗ trợ", maxSize: "Kích thước tải lên tối đa (MB)", maint: "Chế độ bảo trì", save: "Lưu thay đổi" },
  }[lang || "EN"];

  useEffect(() => {
    getSystemSettings(token).then(data => { if(data) setConfig(data); setLoading(false); }).catch(() => setLoading(false));
  }, [token]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await updateSystemSettings(token, config); toast.success("Updated"); } catch { toast.error("Error"); } finally { setSaving(false); }
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
      <h1 className={`text-2xl font-bold ${textMain} flex items-center gap-2`}><SettingsIcon className="text-teal-600"/> {t.title}</h1>
      <div className={`p-6 md:p-8 rounded-3xl border shadow-sm ${cardBg}`}>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className={`block text-sm font-semibold mb-2 ${textMain}`}>{t.appName}</label><input type="text" name="app_name" value={config.app_name} onChange={handleChange} className={inputCls} required /></div>
            <div><label className={`block text-sm font-semibold mb-2 ${textMain}`}>{t.email}</label><input type="email" name="support_email" value={config.support_email} onChange={handleChange} className={inputCls} required /></div>
            <div><label className={`block text-sm font-semibold mb-2 ${textMain}`}>{t.maxSize}</label><input type="number" name="max_upload_size_mb" value={config.max_upload_size_mb} onChange={handleChange} className={inputCls} required /></div>
            
            <div className="flex items-center mt-8">
              <label className={`relative flex items-center cursor-pointer gap-3 text-sm font-semibold ${textMain}`}>
                <input type="checkbox" name="maintenance_mode" checked={config.maintenance_mode} onChange={handleChange} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                <span className="text-rose-600 font-bold">{t.maint}</span>
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