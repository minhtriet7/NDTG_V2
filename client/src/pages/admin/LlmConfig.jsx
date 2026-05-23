import React, { useState, useEffect } from "react";
import { useAppStore } from "../../store/appStore";
import {
  getLlmConfig,
  updateLlmConfig,
  testLlmConfig,
} from "../../services/adminConfigService";
import { BotMessageSquare, Save, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";

export default function LlmConfig() {
  const { lang, theme } = useAppStore();
  const isDark = theme === "dark";
  const [config, setConfig] = useState({ provider: "gemini", model_name: "", temperature: 0, max_tokens: 0, system_prompt: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getLlmConfig().then(data => setConfig(data));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateLlmConfig(config);
      toast.success(lang === "VI" ? "Đã lưu cấu hình LLM" : "LLM Configuration saved");
    } catch (err) { toast.error("Failed to save"); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <BotMessageSquare className="text-violet-500" size={32}/> 
          {lang === "VI" ? "Cấu hình Ngôn ngữ (LLM)" : "LLM Agent Configuration"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Fine-tune semantic analysis parameters and system prompts.</p>
      </div>

      <form onSubmit={handleSave} className={`p-6 md:p-8 rounded-3xl border shadow-sm space-y-6 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="block">
            <span className="text-xs font-bold text-slate-500 uppercase mb-2 block">AI Provider</span>
            <select value={config.provider} onChange={e=>setConfig({...config, provider: e.target.value})} className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold focus:outline-none focus:border-violet-500 ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}>
              <option value="gemini">Google Gemini API</option>
              <option value="openai">OpenAI (ChatGPT)</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-bold text-slate-500 uppercase mb-2 block">Model Name</span>
            <input type="text" value={config.model_name} onChange={e=>setConfig({...config, model_name: e.target.value})} className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-violet-500 ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}/>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <label className="block">
            <span className="text-xs font-bold text-slate-500 uppercase mb-2 flex justify-between">
              Temperature (Creativity) <span className="text-violet-500">{config.temperature}</span>
            </span>
            <input type="range" min="0" max="1" step="0.1" value={config.temperature} onChange={e=>setConfig({...config, temperature: parseFloat(e.target.value)})} className="w-full accent-violet-500"/>
            <p className="text-[10px] text-slate-400 mt-1">Lower value = More deterministic. Higher = More creative.</p>
          </label>
          <label className="block">
            <span className="text-xs font-bold text-slate-500 uppercase mb-2 block">Max Output Tokens</span>
            <input type="number" value={config.max_tokens} onChange={e=>setConfig({...config, max_tokens: parseInt(e.target.value)})} className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono focus:outline-none focus:border-violet-500 ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}/>
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-bold text-slate-500 uppercase mb-2 block">System Prompt (Crucial)</span>
          <textarea rows="8" value={config.system_prompt} onChange={e=>setConfig({...config, system_prompt: e.target.value})} className={`w-full px-4 py-3 rounded-xl border text-sm font-mono leading-relaxed focus:outline-none focus:border-violet-500 resize-y ${isDark ? "bg-[#0F172A] border-slate-800 text-violet-300" : "bg-slate-50 border-slate-200 text-violet-700"}`}/>
        </label>

        <div className="flex gap-4 pt-4">
          <button type="button" className={`px-6 py-3 rounded-xl font-bold text-sm border flex items-center gap-2 transition ${isDark ? "border-slate-700 hover:bg-slate-800 text-slate-300" : "border-slate-200 hover:bg-slate-50 text-slate-700"}`}>
            <RotateCcw size={16}/> Reset Defaults
          </button>
          <button type="submit" disabled={isSaving} className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-sm shadow-md transition disabled:opacity-50 flex items-center gap-2">
            <Save size={16}/> {isSaving ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </form>
    </div>
  );
}