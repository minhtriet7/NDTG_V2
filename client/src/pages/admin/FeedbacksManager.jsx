import React, { useState, useEffect, useMemo } from "react";
import { useAppStore } from "../../store/appStore";
import { getAdminFeedbacks, updateFeedbackStatus, deleteFeedback } from "../../services/adminService";
import { Search, Edit, Trash2, MessageSquare, CheckCircle2, AlertTriangle, Clock, X } from "lucide-react";
import toast from "react-hot-toast";

export default function FeedbacksManager() {
  const { lang, theme } = useAppStore();
  const isDark = theme === "dark";

  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFb, setSelectedFb] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const t = {
    EN: {
      title: "User Feedbacks", subtitle: "Review and resolve issues or suggestions reported by users.",
      thTime: "Time", thType: "Type", thMsg: "Message Preview", thStatus: "Status", thAction: "Actions",
      noData: "No feedback found.",
      modalTitle: "Review Feedback", btnSave: "Update Status", btnCancel: "Close"
    },
    VI: {
      title: "Phản hồi Người dùng", subtitle: "Kiểm tra và xử lý các vấn đề hoặc góp ý từ khách hàng.",
      thTime: "Thời gian", thType: "Phân loại", thMsg: "Nội dung", thStatus: "Trạng thái", thAction: "Thao tác",
      noData: "Chưa có phản hồi nào.",
      modalTitle: "Xử lý Phản hồi", btnSave: "Cập nhật", btnCancel: "Đóng"
    }
  }[lang || "EN"];

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getAdminFeedbacks();
      setFeedbacks(data || []);
    } catch (error) { toast.error("Failed to load"); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const filteredData = useMemo(() => {
    return feedbacks.filter(f => (f.message || "").toLowerCase().includes(searchTerm.toLowerCase()));
  }, [feedbacks, searchTerm]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateFeedbackStatus(selectedFb.id || selectedFb._id, newStatus);
      toast.success("Status updated");
      setModalOpen(false);
      loadData();
    } catch (error) { toast.error("Failed to update"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this feedback?")) return;
    try {
      await deleteFeedback(id);
      toast.success("Deleted");
      loadData();
    } catch (error) { toast.error("Failed to delete"); }
  };

  const openModal = (fb) => {
    setSelectedFb(fb);
    setNewStatus(fb.status);
    setModalOpen(true);
  };

  const renderStatus = (status) => {
    if (status === "resolved") return <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${isDark ? "bg-teal-900/30 text-teal-400" : "bg-teal-50 text-teal-700"}`}>Resolved</span>;
    if (status === "reviewed") return <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${isDark ? "bg-blue-900/30 text-blue-400" : "bg-blue-50 text-blue-700"}`}>Reviewed</span>;
    return <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${isDark ? "bg-amber-900/30 text-amber-400" : "bg-amber-50 text-amber-700"}`}>Pending</span>;
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{t.title}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{t.subtitle}</p>
      </div>

      <div className={`p-4 rounded-2xl border shadow-sm flex gap-4 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" placeholder="Search message..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
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
                <th className="px-5 py-4">{t.thType}</th>
                <th className="px-5 py-4">{t.thMsg}</th>
                <th className="px-5 py-4">{t.thStatus}</th>
                <th className="px-5 py-4 text-right">{t.thAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {isLoading ? (
                <tr><td colSpan="5" className="text-center py-10"><span className="animate-pulse text-slate-400">Loading...</span></td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-16 text-slate-500 font-medium">{t.noData}</td></tr>
              ) : filteredData.map((f) => (
                <tr key={f.id || f._id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors`}>
                  <td className="px-5 py-3 text-xs text-slate-500">{new Date(f.created_at).toLocaleString()}</td>
                  <td className="px-5 py-3"><span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{f.type || "General"}</span></td>
                  <td className="px-5 py-3 text-sm font-medium truncate max-w-xs">{f.message}</td>
                  <td className="px-5 py-3">{renderStatus(f.status)}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openModal(f)} className={`p-2 rounded-lg border transition ${isDark ? "border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-teal-400" : "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-teal-600"}`}><Edit size={14}/></button>
                      <button onClick={() => handleDelete(f.id || f._id)} className={`p-2 rounded-lg border transition ${isDark ? "border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-rose-400" : "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-rose-600"}`}><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <form onSubmit={handleUpdate} className={`w-full max-w-md rounded-3xl shadow-2xl p-6 border animate-[slideInUp_0.2s_ease-out] ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            <h3 className={`text-xl font-black mb-6 flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}><MessageSquare size={20} className="text-teal-500"/> {t.modalTitle}</h3>
            
            <div className={`p-4 rounded-xl border mb-6 ${isDark ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-100 text-slate-700"} max-h-40 overflow-y-auto text-sm leading-relaxed`}>
              "{selectedFb?.message}"
            </div>

            <label className="block mb-8">
              <span className="text-xs font-bold text-slate-500 uppercase mb-2 block">Set Status</span>
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed (Working on it)</option>
                <option value="resolved">Resolved (Closed)</option>
              </select>
            </label>

            <div className="flex gap-3">
              <button type="button" onClick={() => setModalOpen(false)} className={`flex-1 py-2.5 rounded-xl font-bold text-sm border transition ${isDark ? "border-slate-700 hover:bg-slate-800 text-slate-300" : "border-slate-200 hover:bg-slate-50 text-slate-700"}`}>{t.btnCancel}</button>
              <button type="submit" className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-sm shadow-md transition">{t.btnSave}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}