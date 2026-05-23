import React, { useState, useEffect } from "react";
import { useAppStore } from "../../store/appStore";
import { useNavigate } from "react-router-dom";
import { getAgentsStatus } from "../../services/adminService";
import { Cpu, BotMessageSquare, SearchCheck, GitMerge, Settings, CheckCircle2, AlertTriangle, Power } from "lucide-react";
import toast from "react-hot-toast";

export default function AgentsManager() {
  const { lang, theme } = useAppStore();
  const navigate = useNavigate();
  const isDark = theme === "dark";
  const [agents, setAgents] = useState([]);

  const t = {
    EN: { title: "AI Agents Manager", subtitle: "Monitor and configure independent recognition agents.", btnConfig: "Configure" },
    VI: { title: "Quản lý Đặc vụ AI", subtitle: "Giám sát và cấu hình các tác nhân nhận diện độc lập.", btnConfig: "Cấu hình" }
  }[lang || "EN"];

  useEffect(() => {
    getAgentsStatus().then(data => setAgents(data));
  }, []);

  const agentCards = [
    { id: "ml_dl", title: "ML/DL Object Detection", icon: <Cpu size={24}/>, color: "text-blue-500", bg: "bg-blue-500", path: "/admin/agents/ai-model" },
    { id: "llm", title: "LLM Semantic Analysis", icon: <BotMessageSquare size={24}/>, color: "text-violet-500", bg: "bg-violet-500", path: "/admin/agents/llm" },
    { id: "lens", title: "Visual Search (Lens)", icon: <SearchCheck size={24}/>, color: "text-amber-500", bg: "bg-amber-500", path: "/admin/agents/google-lens" },
    { id: "aggregator", title: "Consensus Aggregator", icon: <GitMerge size={24}/>, color: "text-teal-500", bg: "bg-teal-500", path: "/admin/agents/aggregator" },
  ];

  return (
    <div className="w-full max-w-[1440px] mx-auto space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{t.title}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {agentCards.map((agent) => {
          const stat = agents.find(a => a.id === agent.id) || { status: "online", accuracy: 99 };
          const isOnline = stat.status === "online";
          return (
            <div key={agent.id} className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between h-[240px] ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-2xl ${isDark ? `bg-slate-950 border border-slate-800 ${agent.color}` : `bg-slate-50 border border-slate-100 ${agent.color}`}`}>
                  {agent.icon}
                </div>
                <button className={`p-2 rounded-full transition-colors ${isOnline ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" : "text-slate-400 bg-slate-100 dark:bg-slate-800"}`} title="Toggle Power">
                  <Power size={18} />
                </button>
              </div>
              
              <div>
                <h3 className={`font-black text-lg mt-4 ${isDark ? "text-white" : "text-slate-900"}`}>{agent.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  {isOnline ? <CheckCircle2 size={14} className="text-emerald-500"/> : <AlertTriangle size={14} className="text-amber-500"/>}
                  <span className={`text-xs font-bold uppercase tracking-wider ${isOnline ? "text-emerald-500" : "text-amber-500"}`}>{isOnline ? "Active" : "Warning"}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-500 font-medium">Confidence: <b className={isDark ? "text-slate-300" : "text-slate-700"}>{stat.accuracy}%</b></span>
                <button onClick={() => navigate(agent.path)} className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 hover:underline">
                  <Settings size={14}/> {t.btnConfig}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}