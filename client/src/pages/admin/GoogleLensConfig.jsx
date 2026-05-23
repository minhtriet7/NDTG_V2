import React, { useState, useEffect } from "react";
import { Save, Loader2, ScanSearch, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useAppStore } from "../../store/appStore";
import { useAuthStore } from "../../store/authStore";
import { getLensConfig, updateLensConfig } from "../../services/adminConfigService";

export default function GoogleLensConfig() {
  const { theme, lang } = useAppStore();
  const { token } = useAuthStore();
  const isDark = theme === "dark";

  const [config, setConfig] = useState({ api_key: "", proxy_url: "", language_code: "vi", max_results: 5 });
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const t = {
    EN: { title: "Google Lens Config", key: "API Key", proxy: "Proxy URL", langCode: "Language Code", max: "Max Results", save: "Save" },
    VI: { title: "Cấu hình Google Lens", key: "Khóa API (API Key)", proxy: "URL Proxy", langCode: "Mã ngôn ngữ", max: "Số kết quả tối đa", save: "Lưu thay đổi" },
  }[lang || "EN"];

  useEffect(() => {
    getLensConfig(token).then(data => { if(data) setConfig(data); setLoading(false); }).catch(() => setLoading(false));
  }, [token]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await updateLensConfig(token, config); toast.success("Updated"); } catch { toast.error("Error"); } finally { setSaving(false); }
  };

  const handleChange = (e) => setConfig({ ...config, [e.target.name]: e.target.value });

  const cardBg = isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";
  const textMain = isDark ? "text-white" : "text-slate-900";
  const inputCls = `w-full h-11 px-4 rounded-xl border outline-none transition-colors ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"}`;

  if (loading) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className={`text-2xl font-bold ${textMain} flex items-center gap-2`}><ScanSearch className="text-teal-600"/> {t.title}</h1>
      <div className={`p-6 md:p-8 rounded-3xl border shadow-sm ${cardBg}`}>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className={`block text-sm font-semibold mb-2 ${textMain}`}>{t.key}</label>
              <div className="relative">
                <input type={showKey ? "text" : "password"} name="api_key" value={config.api_key} onChange={handleChange} className={`${inputCls} pr-12`} />
                <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showKey ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>
            <div className="md:col-span-2"><label className={`block text-sm font-semibold mb-2 ${textMain}`}>{t.proxy}</label><input type="text" name="proxy_url" value={config.proxy_url} onChange={handleChange} className={inputCls} /></div>
            <div><label className={`block text-sm font-semibold mb-2 ${textMain}`}>{t.langCode}</label><input type="text" name="language_code" value={config.language_code} onChange={handleChange} className={inputCls} /></div>
            <div><label className={`block text-sm font-semibold mb-2 ${textMain}`}>{t.max}</label><input type="number" name="max_results" value={config.max_results} onChange={handleChange} className={inputCls} /></div>
          </div>
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 disabled:opacity-70">{t.save}</button>
          </div>
        </form>
      </div>
    </div>
  );
}