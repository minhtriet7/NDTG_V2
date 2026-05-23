import React, { useState, useEffect } from "react";
import { Save, Loader2, AlertCircle, GitMerge } from "lucide-react";
import toast from "react-hot-toast";
import { useAppStore } from "../../store/appStore";
import { useAuthStore } from "../../store/authStore";
import { getAggregatorConfig, updateAggregatorConfig } from "../../services/adminConfigService";

export default function AggregatorConfig() {
  const { theme, lang } = useAppStore();
  const { token } = useAuthStore();
  const isDark = theme === "dark";

  const [config, setConfig] = useState({
    strategy: "majority_vote",
    min_consensus_ratio: 0.66,
    ml_weight: 1.0,
    llm_weight: 1.0,
    lens_weight: 1.0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const t = {
    EN: {
      title: "Aggregator Configuration",
      desc: "Set voting logic and agent weights for consensus.",
      strategy: "Voting Strategy",
      ratio: "Minimum Consensus Ratio (0-1)",
      mlWeight: "ML/DL Weight",
      llmWeight: "LLM/API Weight",
      lensWeight: "Visual Search Weight",
      save: "Save Changes",
      saving: "Saving...",
      success: "Configuration updated successfully.",
    },
    VI: {
      title: "Cấu hình Tổng hợp (Aggregator)",
      desc: "Thiết lập logic biểu quyết và trọng số cho sự đồng thuận.",
      strategy: "Chiến lược biểu quyết",
      ratio: "Tỷ lệ đồng thuận tối thiểu (0-1)",
      mlWeight: "Trọng số ML/DL",
      llmWeight: "Trọng số LLM/API",
      lensWeight: "Trọng số Visual Search",
      save: "Lưu thay đổi",
      saving: "Đang lưu...",
      success: "Cập nhật cấu hình thành công.",
    },
  }[lang || "EN"];

  useEffect(() => {
    fetchConfig();
    // eslint-disable-next-line
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const data = await getAggregatorConfig(token);
      if (data) setConfig(data);
    } catch (err) {
      toast.error("Failed to load aggregator config");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAggregatorConfig(token, config);
      toast.success(t.success);
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const cardBg = isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";
  const textMain = isDark ? "text-white" : "text-slate-900";
  const inputCls = `w-full h-11 px-4 rounded-xl border outline-none transition-colors ${
    isDark ? "bg-slate-800 border-slate-700 text-white focus:border-teal-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500"
  }`;

  if (loading) return <div className="p-8 text-center text-slate-500"><Loader2 className="animate-spin mx-auto mb-2"/> Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      <div>
        <h1 className={`text-2xl font-bold ${textMain} flex items-center gap-2`}><GitMerge className="text-teal-600" /> {t.title}</h1>
        <p className="mt-1 text-slate-500">{t.desc}</p>
      </div>

      <div className={`p-6 md:p-8 rounded-3xl border shadow-sm ${cardBg}`}>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${textMain}`}>{t.strategy}</label>
              <select name="strategy" value={config.strategy} onChange={handleChange} className={inputCls}>
                <option value="majority_vote">Majority Vote</option>
                <option value="unanimous">Unanimous</option>
                <option value="weighted">Weighted Vote</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-semibold mb-2 ${textMain}`}>{t.ratio}</label>
              <input type="number" step="0.01" min="0" max="1" name="min_consensus_ratio" value={config.min_consensus_ratio} onChange={handleChange} className={inputCls} required />
            </div>
            
            {config.strategy === "weighted" && (
              <>
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${textMain}`}>{t.mlWeight}</label>
                  <input type="number" step="0.1" name="ml_weight" value={config.ml_weight} onChange={handleChange} className={inputCls} required />
                </div>
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${textMain}`}>{t.llmWeight}</label>
                  <input type="number" step="0.1" name="llm_weight" value={config.llm_weight} onChange={handleChange} className={inputCls} required />
                </div>
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${textMain}`}>{t.lensWeight}</label>
                  <input type="number" step="0.1" name="lens_weight" value={config.lens_weight} onChange={handleChange} className={inputCls} required />
                </div>
              </>
            )}
          </div>
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 disabled:opacity-70 shadow-sm">
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} {saving ? t.saving : t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}