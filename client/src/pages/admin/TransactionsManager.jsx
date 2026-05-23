import React, { useState, useEffect, useMemo } from "react";
import { useAppStore } from "../../store/appStore";
import {
  getAdminTransactions,
  updateTransactionStatus,
  markTransactionPaid,
  cancelTransaction,
  exportTransactions,
} from "../../services/adminService";
import { Search, Filter, RotateCcw, Edit, CheckCircle2, XCircle, AlertTriangle, ArrowRightLeft, Clock } from "lucide-react";
import toast from "react-hot-toast";

export default function TransactionsManager() {
  const { lang, theme } = useAppStore();
  const isDark = theme === "dark";

  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [editModal, setEditModal] = useState({ open: false, tx: null, newStatus: "" });
  const [isProcessing, setIsProcessing] = useState(false);

  const t = {
    EN: {
      title: "Transaction History", subtitle: "Monitor user payments and token recharge logs.",
      searchPlaceholder: "Search transaction code or user ID...", filterStatus: "Status", filterAll: "All",
      thDate: "Time", thCode: "Tx Code", thUser: "User ID", thAmount: "Amount/Tokens", thGateway: "Gateway", thStatus: "Status", thAction: "Actions",
      noData: "No transactions found.", errLoad: "Failed to load transactions.",
      modalEditTitle: "Update Transaction Status", btnSave: "Save Status", btnCancel: "Cancel",
      msgUpdate: "Transaction status updated."
    },
    VI: {
      title: "Lịch sử Giao dịch", subtitle: "Theo dõi dòng tiền và nhật ký nạp token của người dùng.",
      searchPlaceholder: "Tìm mã giao dịch hoặc ID...", filterStatus: "Trạng thái", filterAll: "Tất cả",
      thDate: "Thời gian", thCode: "Mã GD", thUser: "User ID", thAmount: "Số tiền / Token", thGateway: "Cổng thanh toán", thStatus: "Trạng thái", thAction: "Thao tác",
      noData: "Chưa có giao dịch nào.", errLoad: "Lỗi tải dữ liệu giao dịch.",
      modalEditTitle: "Cập nhật Trạng thái", btnSave: "Lưu thay đổi", btnCancel: "Hủy",
      msgUpdate: "Đã cập nhật trạng thái hóa đơn."
    }
  }[lang || "EN"];

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getAdminTransactions();
      setTransactions(data || []);
    } catch (error) { toast.error(t.errLoad); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const filteredData = useMemo(() => {
    return transactions.filter(tx => {
      const term = searchTerm.toLowerCase();
      const matchSearch = (tx.transaction_code || "").toLowerCase().includes(term) || (tx.user_id || "").toLowerCase().includes(term);
      const matchStatus = statusFilter === "all" || tx.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [transactions, searchTerm, statusFilter]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await updateTransactionStatus(editModal.tx.id || editModal.tx._id, editModal.newStatus);
      toast.success(t.msgUpdate);
      setEditModal({ open: false, tx: null, newStatus: "" });
      loadData();
    } catch (error) { toast.error("Failed to update status"); } 
    finally { setIsProcessing(false); }
  };

  const renderStatus = (status) => {
    if (status === "success") return <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${isDark ? "bg-teal-900/30 text-teal-400" : "bg-teal-50 text-teal-700"}`}><CheckCircle2 size={12} className="inline mr-1 mb-0.5"/>Success</span>;
    if (status === "failed") return <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${isDark ? "bg-rose-900/30 text-rose-400" : "bg-rose-50 text-rose-700"}`}><XCircle size={12} className="inline mr-1 mb-0.5"/>Failed</span>;
    return <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${isDark ? "bg-amber-900/30 text-amber-400" : "bg-amber-50 text-amber-700"}`}><Clock size={12} className="inline mr-1 mb-0.5"/>Pending</span>;
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
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500"><Filter size={16} /></div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`border text-sm rounded-xl px-3 py-2 outline-none ${isDark ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200"}`}>
            <option value="all">{t.filterStatus}: {t.filterAll}</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <button onClick={() => { setSearchTerm(""); setStatusFilter("all"); }} className={`p-2 border rounded-xl transition-colors ${isDark ? "text-slate-400 bg-slate-950 border-slate-800 hover:text-rose-400" : "text-slate-400 bg-slate-50 border-slate-200 hover:text-rose-600"}`}><RotateCcw size={16} /></button>
        </div>
      </div>

      <div className={`rounded-3xl border shadow-sm overflow-hidden ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className={`uppercase text-[10px] font-bold tracking-wider border-b ${isDark ? "bg-slate-950/50 text-slate-500 border-slate-800" : "bg-slate-50 text-slate-500 border-slate-100"}`}>
              <tr>
                <th className="px-5 py-4">{t.thDate}</th>
                <th className="px-5 py-4">{t.thCode}</th>
                <th className="px-5 py-4">{t.thUser}</th>
                <th className="px-5 py-4">{t.thAmount}</th>
                <th className="px-5 py-4">{t.thGateway}</th>
                <th className="px-5 py-4">{t.thStatus}</th>
                <th className="px-5 py-4 text-right">{t.thAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {isLoading ? (
                <tr><td colSpan="7" className="text-center py-10"><span className="animate-pulse text-slate-400">Loading...</span></td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-16 text-slate-500 font-medium">{t.noData}</td></tr>
              ) : filteredData.map((tx) => (
                <tr key={tx.id || tx._id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors`}>
                  <td className="px-5 py-3 text-xs text-slate-500">{new Date(tx.created_at).toLocaleString()}</td>
                  <td className="px-5 py-3 font-mono text-xs font-bold text-slate-600 dark:text-slate-400">{tx.transaction_code || "N/A"}</td>
                  <td className="px-5 py-3 text-xs font-mono text-slate-500 truncate max-w-[120px]">{tx.user_id}</td>
                  <td className="px-5 py-3">
                    <p className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{new Intl.NumberFormat('vi-VN').format(tx.amount || 0)} đ</p>
                    <p className="text-[10px] font-bold text-amber-500">+{tx.tokens_added || 0} TOKENS</p>
                  </td>
                  <td className="px-5 py-3 text-xs font-bold uppercase text-slate-500">{tx.payment_gateway || "System"}</td>
                  <td className="px-5 py-3">{renderStatus(tx.status)}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => setEditModal({ open: true, tx, newStatus: tx.status })} className={`p-2 rounded-lg border transition ${isDark ? "border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-teal-400" : "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-teal-600"}`}><Edit size={14}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <form onSubmit={handleUpdateStatus} className={`w-full max-w-sm rounded-3xl shadow-2xl p-6 border animate-[slideInUp_0.2s_ease-out] ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            <h3 className={`text-xl font-black mb-6 flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}><ArrowRightLeft size={20} className="text-teal-500"/> {t.modalEditTitle}</h3>
            
            <div className={`p-4 rounded-xl border mb-6 ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-100"}`}>
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Transaction ID</p>
              <p className={`font-mono text-sm truncate ${isDark ? "text-slate-300" : "text-slate-700"}`}>{editModal.tx?.id || editModal.tx?._id}</p>
            </div>

            <label className="block mb-8">
              <span className="text-xs font-bold text-slate-500 uppercase mb-2 block">Set Payment Status</span>
              <select value={editModal.newStatus} onChange={(e) => setEditModal(m => ({ ...m, newStatus: e.target.value }))} className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
                <option value="pending">Pending</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
              </select>
            </label>

            <div className="flex gap-3">
              <button type="button" onClick={() => setEditModal({ open: false, tx: null, newStatus: "" })} disabled={isProcessing} className={`flex-1 py-2.5 rounded-xl font-bold text-sm border transition ${isDark ? "border-slate-700 hover:bg-slate-800 text-slate-300" : "border-slate-200 hover:bg-slate-50 text-slate-700"}`}>{t.btnCancel}</button>
              <button type="submit" disabled={isProcessing} className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-sm shadow-md transition disabled:opacity-50">{isProcessing ? "..." : t.btnSave}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}