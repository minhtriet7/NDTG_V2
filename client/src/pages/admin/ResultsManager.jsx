import React, { useState, useEffect, useMemo } from "react";
import { useAppStore } from "../../store/appStore";
import { getAdminResults, deleteResult } from "../../services/adminService";
import { Search, Filter, RotateCcw, Eye, Trash2, X, Terminal, Image as ImageIcon, Cpu, BotMessageSquare, SearchCheck, GitMerge } from "lucide-react";
import toast from "react-hot-toast";

export default function ResultsManager() {
  const { lang, theme } = useAppStore();
  const isDark = theme === "dark";

  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedScan, setSelectedScan] = useState(null);

  const t = {
    EN: {
      title: "Recognition Results", subtitle: "Monitor all banknote scans processed by the multi-agent system.",
      searchPlaceholder: "Search scan ID or Country...",
      thTime: "Time", thImg: "Image", thResult: "Final Result", thCountry: "Country", thConsensus: "Consensus", thAction: "Actions",
      noData: "No scan records found.", errLoad: "Failed to load results.",
      drwTitle: "Scan Details", btnClose: "Close", msgDel: "Record deleted."
    },
    VI: {
      title: "Nhật ký Nhận diện", subtitle: "Giám sát tất cả các lượt quét tiền đã được AI xử lý.",
      searchPlaceholder: "Tìm ID quét hoặc Quốc gia...",
      thTime: "Thời gian", thImg: "Hình ảnh", thResult: "Kết quả chốt", thCountry: "Quốc gia", thConsensus: "Đồng thuận", thAction: "Thao tác",
      noData: "Chưa có lượt quét nào.", errLoad: "Lỗi tải dữ liệu.",
      drwTitle: "Chi tiết Nhận diện", btnClose: "Đóng", msgDel: "Đã xóa lịch sử quét."
    }
  }[lang || "EN"];

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getAdminResults();
      setResults(data || []);
    } catch (error) { toast.error(t.errLoad); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const filteredData = useMemo(() => {
    return results.filter(r => {
      const term = searchTerm.toLowerCase();
      const country = (r.final_result?.quoc_gia || r.data?.country || "").toLowerCase();
      const idStr = (r.id || r._id || "").toLowerCase();
      return country.includes(term) || idStr.includes(term);
    });
  }, [results, searchTerm]);

  const openDrawer = (scan) => {
    setSelectedScan(scan);
    setDrawerOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(lang === "VI" ? "Xác nhận xóa bản ghi này?" : "Delete this record?")) return;
    try {
      await deleteResult(id);
      toast.success(t.msgDel);
      loadData();
    } catch (error) { toast.error("Delete failed"); }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{t.title}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{t.subtitle}</p>
      </div>

      <div className={`p-4 rounded-2xl border shadow-sm flex flex-col sm:flex-row gap-4 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" placeholder={t.searchPlaceholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all ${isDark ? "bg-slate-950 border-slate-800 text-white placeholder-slate-500" : "bg-slate-50 border-slate-200 text-slate-900"}`}
          />
        </div>
      </div>

      <div className={`rounded-3xl border shadow-sm overflow-hidden ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className={`uppercase text-[10px] font-bold tracking-wider border-b ${isDark ? "bg-slate-950/50 text-slate-500 border-slate-800" : "bg-slate-50 text-slate-500 border-slate-100"}`}>
              <tr>
                <th className="px-5 py-4">{t.thTime}</th>
                <th className="px-5 py-4 w-16">{t.thImg}</th>
                <th className="px-5 py-4">{t.thResult}</th>
                <th className="px-5 py-4">{t.thCountry}</th>
                <th className="px-5 py-4">{t.thConsensus}</th>
                <th className="px-5 py-4 text-right">{t.thAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {isLoading ? (
                <tr><td colSpan="6" className="text-center py-10"><span className="animate-pulse text-slate-400">Loading...</span></td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-16 text-slate-500 font-medium">{t.noData}</td></tr>
              ) : filteredData.map((r) => {
                const imgUrl = r.uploaded_image_url || r.image_url || r.data?.image_url;
                const match = r.consensus?.matched_agents || r.final_result?.so_luong_dong_thuan || 0;
                return (
                  <tr key={r.id || r._id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors`}>
                    <td className="px-5 py-3 text-xs text-slate-500">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <div className={`w-12 h-8 rounded border flex items-center justify-center overflow-hidden ${isDark ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}>
                        {imgUrl && imgUrl !== "temp_url_will_be_uploaded_to_cloudinary_later" ? <img src={imgUrl} className="w-full h-full object-cover"/> : <ImageIcon className="w-3 h-3 text-slate-400"/>}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-black text-teal-600 dark:text-teal-400">{r.final_result?.menh_gia || r.data?.denomination || "N/A"}</td>
                    <td className="px-5 py-3 font-medium text-slate-600 dark:text-slate-300">{r.final_result?.quoc_gia || r.data?.country || "N/A"}</td>
                    <td className="px-5 py-3 font-mono text-xs font-bold text-slate-500">{match}/3</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openDrawer(r)} className={`p-2 rounded-lg border transition ${isDark ? "border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-teal-400" : "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-teal-600"}`}><Eye size={14}/></button>
                        <button onClick={() => handleDelete(r.id || r._id)} className={`p-2 rounded-lg border transition ${isDark ? "border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-rose-400" : "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-rose-600"}`}><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRAWER XEM CHI TIẾT */}
      {drawerOpen && selectedScan && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setDrawerOpen(false)} />
          <div className={`relative w-full max-w-2xl h-full flex flex-col shadow-2xl animate-[slideInRight_0.3s_ease-out] ${isDark ? "bg-slate-950 border-l border-slate-800" : "bg-white"}`}>
            <div className={`px-6 py-5 border-b flex justify-between items-center ${isDark ? "border-slate-800" : "border-slate-200"}`}>
              <h3 className={`font-black text-xl flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}><Terminal className="w-5 h-5 text-teal-500"/> {t.drwTitle}</h3>
              <button onClick={() => setDrawerOpen(false)} className={`p-2 rounded-xl transition ${isDark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Ảnh */}
              <div className={`w-full h-48 rounded-2xl flex items-center justify-center border overflow-hidden shadow-inner ${isDark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                {(selectedScan.uploaded_image_url || selectedScan.image_url) && selectedScan.uploaded_image_url !== "temp_url_will_be_uploaded_to_cloudinary_later" 
                  ? <img src={selectedScan.uploaded_image_url || selectedScan.image_url} alt="scan" className="max-h-full object-contain" />
                  : <span className="text-slate-400 font-medium">No Image</span>}
              </div>

              {/* Data thô */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Raw JSON Data</h4>
                <div className={`p-4 rounded-xl border overflow-x-auto ${isDark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                  <pre className="text-xs text-teal-600 dark:text-teal-400 font-mono">
                    {JSON.stringify(selectedScan.final_result || selectedScan.data, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}