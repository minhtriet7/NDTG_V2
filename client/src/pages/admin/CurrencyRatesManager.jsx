import React, { useState, useEffect, useMemo } from "react";
import { useAppStore } from "../../store/appStore";
import { getAdminCurrencyRates, syncCurrencyRates, updateCurrencyRate } from "../../services/adminService";
import { Search, RefreshCw, Edit, Landmark, X } from "lucide-react";
import toast from "react-hot-toast";

export default function CurrencyRatesManager() {
  const { lang, theme } = useAppStore();
  const isDark = theme === "dark";

  const [rates, setRates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRate, setSelectedRate] = useState(null);
  const [newRate, setNewRate] = useState(0);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getAdminCurrencyRates();
      setRates(data || []);
    } catch (error) { toast.error("Failed to load rates"); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncCurrencyRates();
      toast.success("Rates synchronized with external API");
      loadData();
    } catch (error) { toast.error("Sync failed"); } 
    finally { setIsSyncing(false); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateCurrencyRate(selectedRate.id || selectedRate._id, { rate: Number(newRate) });
      toast.success("Rate updated");
      setModalOpen(false);
      loadData();
    } catch (error) { toast.error("Update failed"); }
  };

  const filteredData = useMemo(() => {
    return rates.filter(r => (r.currency || "").toLowerCase().includes(searchTerm.toLowerCase()));
  }, [rates, searchTerm]);

  return (
    <div className="w-full max-w-[1440px] mx-auto space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Exchange Rates</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Manage fiat currency conversion rates against base (VND).</p>
        </div>
        <button onClick={handleSync} disabled={isSyncing} className="px-4 py-2.5 bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white rounded-xl text-sm font-bold shadow-md flex items-center gap-2 transition w-fit disabled:opacity-50">
          <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} /> Sync Auto
        </button>
      </div>

      <div className={`p-4 rounded-2xl border shadow-sm ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input type="text" placeholder="Search currency code (e.g. USD)..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all ${isDark ? "bg-slate-950 border-slate-800 text-white placeholder-slate-500" : "bg-slate-50 border-slate-200"}`}/>
        </div>
      </div>

      <div className={`rounded-3xl border shadow-sm overflow-hidden ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className={`uppercase text-[10px] font-bold tracking-wider border-b ${isDark ? "bg-slate-950/50 text-slate-500 border-slate-800" : "bg-slate-50 text-slate-500 border-slate-100"}`}>
            <tr>
              <th className="px-5 py-4">Currency</th>
              <th className="px-5 py-4">Rate (against VND)</th>
              <th className="px-5 py-4">Last Updated</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {isLoading ? <tr><td colSpan="4" className="text-center py-10">Loading...</td></tr> : 
             filteredData.map((r) => (
              <tr key={r.id || r._id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors`}>
                <td className="px-5 py-3 font-bold text-slate-900 dark:text-white uppercase"><Landmark size={14} className="inline mr-2 text-teal-500"/>{r.currency}</td>
                <td className="px-5 py-3 font-mono text-teal-600 dark:text-teal-400">{r.rate}</td>
                <td className="px-5 py-3 text-xs text-slate-500">{new Date(r.updated_at || r.created_at).toLocaleString()}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => { setSelectedRate(r); setNewRate(r.rate); setModalOpen(true); }} className={`p-2 rounded-lg border transition ${isDark ? "border-slate-700 text-slate-400 hover:bg-slate-800" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}><Edit size={14}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <form onSubmit={handleUpdate} className={`w-full max-w-sm rounded-3xl shadow-2xl p-6 border animate-[slideInUp_0.2s_ease-out] ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            <h3 className={`text-xl font-black mb-6 flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}><Landmark size={20} className="text-teal-500"/> Update Rate: {selectedRate?.currency}</h3>
            <label className="block mb-6">
              <span className="text-xs font-bold text-slate-500 uppercase mb-2 block">New Exchange Rate</span>
              <input type="number" step="0.000001" min="0" required value={newRate} onChange={(e) => setNewRate(e.target.value)} className={`w-full px-4 py-3 rounded-xl border font-mono font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/50 ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}/>
            </label>
            <div className="flex gap-3">
              <button type="button" onClick={() => setModalOpen(false)} className={`flex-1 py-2.5 rounded-xl font-bold text-sm border transition ${isDark ? "border-slate-700 hover:bg-slate-800 text-slate-300" : "border-slate-200 hover:bg-slate-50 text-slate-700"}`}>Cancel</button>
              <button type="submit" className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-sm shadow-md transition">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}