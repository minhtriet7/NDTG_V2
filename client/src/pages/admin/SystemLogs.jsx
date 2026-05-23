import React, { useState, useEffect } from "react";
import { useAppStore } from "../../store/appStore";
import { getSystemLogs } from "../../services/adminService";
import { FileText, Terminal, Trash2, Filter } from "lucide-react";
import toast from "react-hot-toast";

export default function SystemLogs() {
  const { lang, theme } = useAppStore();
  const isDark = theme === "dark";
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    getSystemLogs().then(data => setLogs(data));
  }, []);

  const renderBadge = (level) => {
    switch(level) {
      case "ERROR": return <span className="text-rose-500 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded">ERR</span>;
      case "WARN": return <span className="text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">WRN</span>;
      default: return <span className="text-teal-500 font-bold bg-teal-500/10 px-1.5 py-0.5 rounded">INF</span>;
    }
  };

  const filteredLogs = logs.filter(l => filter === "ALL" || l.level === filter);

  return (
    <div className="w-full max-w-[1440px] mx-auto space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <FileText className="text-slate-500" size={32}/> System Logs
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Live monitoring of system events, errors, and warnings.</p>
        </div>
        <div className="flex gap-2">
          <select value={filter} onChange={e=>setFilter(e.target.value)} className={`border text-sm font-bold rounded-xl px-4 py-2.5 outline-none ${isDark ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-700"}`}>
            <option value="ALL">All Levels</option>
            <option value="ERROR">Errors Only</option>
            <option value="WARN">Warnings Only</option>
          </select>
          <button className="px-4 py-2.5 bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white rounded-xl text-sm font-bold transition flex items-center gap-2">
            <Trash2 size={16}/> Clear
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-[#0F172A] shadow-2xl overflow-hidden font-mono flex flex-col h-[70vh]">
        <div className="flex items-center px-4 py-3 bg-[#1E293B] border-b border-slate-800 gap-2 shrink-0">
          <Terminal size={16} className="text-slate-400"/>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">BanknoteAI Core Server Logs</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 text-xs md:text-sm">
          {filteredLogs.map(log => (
            <div key={log.id} className="flex gap-3 hover:bg-white/5 p-1 rounded transition-colors">
              <span className="text-slate-500 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
              <span className="shrink-0">{renderBadge(log.level)}</span>
              <span className="text-indigo-400 font-bold shrink-0">[{log.module}]</span>
              <span className="text-slate-300 break-words">{log.message}</span>
            </div>
          ))}
          {filteredLogs.length === 0 && <p className="text-slate-500 text-center py-10">No logs matching current filter.</p>}
        </div>
      </div>
    </div>
  );
}