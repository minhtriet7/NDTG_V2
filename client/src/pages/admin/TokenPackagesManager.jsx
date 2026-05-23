import React, { useState, useEffect, useMemo } from "react";
import { useAppStore } from "../../store/appStore";
import { getAdminTokenPackages, createTokenPackage, updateTokenPackage, deleteTokenPackage } from "../../services/adminService";
import { Search, Plus, Edit, Trash2, X, Package, CheckCircle2, XCircle, AlertTriangle, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function TokenPackagesManager() {
  const { lang, theme } = useAppStore();
  const isDark = theme === "dark";

  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [formData, setFormData] = useState({ name: "", tokens: 0, price_vnd: 0, price_usd: 0, description: "", is_active: true });
  const [selectedId, setSelectedId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = {
    EN: {
      title: "Token Packages", subtitle: "Configure token bundles and pricing for users.",
      searchPlaceholder: "Search package name...", btnAdd: "New Package",
      thName: "Package Name", thTokens: "Tokens", thPrice: "Price (VND/USD)", thStatus: "Status", thAction: "Actions",
      noData: "No packages found.", errLoad: "Failed to load packages.",
      drwCreate: "Create Package", drwEdit: "Edit Package", btnSave: "Save Package", btnCancel: "Cancel",
      lblName: "Package Name", lblTokens: "Token Amount", lblPriceVND: "Price (VND)", lblPriceUSD: "Price (USD)", lblDesc: "Description", lblStatus: "Active Status",
      msgAdd: "Package created.", msgUpdate: "Package updated.", msgDel: "Package deleted."
    },
    VI: {
      title: "Gói Nạp Token", subtitle: "Cấu hình các gói năng lượng và giá bán cho người dùng.",
      searchPlaceholder: "Tìm tên gói...", btnAdd: "Tạo gói mới",
      thName: "Tên gói", thTokens: "Số Token", thPrice: "Giá (VND/USD)", thStatus: "Trạng thái", thAction: "Thao tác",
      noData: "Chưa có gói nạp nào.", errLoad: "Không thể tải dữ liệu.",
      drwCreate: "Tạo Gói Nạp Mới", drwEdit: "Cập nhật Gói Nạp", btnSave: "Lưu cấu hình", btnCancel: "Hủy",
      lblName: "Tên hiển thị", lblTokens: "Số Token nhận được", lblPriceVND: "Giá bán (VNĐ)", lblPriceUSD: "Giá tham chiếu (USD)", lblDesc: "Mô tả gói", lblStatus: "Cho phép bán",
      msgAdd: "Tạo mới thành công.", msgUpdate: "Cập nhật thành công.", msgDel: "Đã xóa gói nạp."
    }
  }[lang || "EN"];

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getAdminTokenPackages();
      setPackages(data || []);
    } catch (error) { toast.error(t.errLoad); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const filteredPackages = useMemo(() => {
    return packages.filter(p => (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()));
  }, [packages, searchTerm]);

  const openDrawer = (mode, pkg = null) => {
    setFormMode(mode);
    if (mode === "edit" && pkg) {
      setSelectedId(pkg.id || pkg._id);
      setFormData({
        name: pkg.name || "", tokens: pkg.tokens || 0,
        price_vnd: pkg.price_vnd || 0, price_usd: pkg.price_usd || 0,
        description: pkg.description || "", is_active: pkg.is_active !== false
      });
    } else {
      setSelectedId(null);
      setFormData({ name: "", tokens: 0, price_vnd: 0, price_usd: 0, description: "", is_active: true });
    }
    setDrawerOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (formMode === "create") {
        await createTokenPackage({ ...formData, tokens: Number(formData.tokens), price_vnd: Number(formData.price_vnd), price_usd: Number(formData.price_usd) });
        toast.success(t.msgAdd);
      } else {
        await updateTokenPackage(selectedId, { ...formData, tokens: Number(formData.tokens), price_vnd: Number(formData.price_vnd), price_usd: Number(formData.price_usd) });
        toast.success(t.msgUpdate);
      }
      setDrawerOpen(false);
      loadData();
    } catch (error) { toast.error("Operation failed"); } 
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(lang === "VI" ? "Xác nhận xóa gói nạp này?" : "Delete this package?")) return;
    try {
      await deleteTokenPackage(id);
      toast.success(t.msgDel);
      loadData();
    } catch (error) { toast.error("Delete failed"); }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{t.title}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{t.subtitle}</p>
        </div>
        <button onClick={() => openDrawer("create")} className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-bold shadow-md flex items-center gap-2 transition w-fit">
          <Plus size={16} /> {t.btnAdd}
        </button>
      </div>

      <div className={`p-4 rounded-2xl border shadow-sm ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
        <div className="relative">
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
                <th className="px-5 py-4">{t.thName}</th>
                <th className="px-5 py-4">{t.thTokens}</th>
                <th className="px-5 py-4">{t.thPrice}</th>
                <th className="px-5 py-4">{t.thStatus}</th>
                <th className="px-5 py-4 text-right">{t.thAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {isLoading ? (
                <tr><td colSpan="5" className="text-center py-10"><span className="animate-pulse text-slate-400">Loading...</span></td></tr>
              ) : filteredPackages.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-16 text-slate-500 font-medium">{t.noData}</td></tr>
              ) : filteredPackages.map((p) => (
                <tr key={p.id || p._id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${isDark ? "bg-slate-800 text-teal-400" : "bg-teal-50 text-teal-600"}`}><Package size={18}/></div>
                      <div>
                        <p className={`font-black ${isDark ? "text-slate-100" : "text-slate-900"}`}>{p.name}</p>
                        <p className="text-xs text-slate-500 max-w-[200px] truncate">{p.description || "No description"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-black text-amber-500 text-lg">+{p.tokens}</td>
                  <td className="px-5 py-3">
                    <p className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{new Intl.NumberFormat('vi-VN').format(p.price_vnd)} đ</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">~ ${p.price_usd}</p>
                  </td>
                  <td className="px-5 py-3">
                    {p.is_active !== false ? <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${isDark ? "bg-teal-900/30 text-teal-400" : "bg-teal-50 text-teal-700"}`}><CheckCircle2 size={12} className="inline mr-1 mb-0.5"/>Active</span>
                                           : <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"}`}><XCircle size={12} className="inline mr-1 mb-0.5"/>Hidden</span>}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openDrawer("edit", p)} className={`p-2 rounded-lg border transition ${isDark ? "border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-teal-400" : "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-teal-600"}`}><Edit size={14}/></button>
                      <button onClick={() => handleDelete(p.id || p._id)} className={`p-2 rounded-lg border transition ${isDark ? "border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-rose-400" : "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-rose-600"}`}><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SIDE DRAWER FORM */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setDrawerOpen(false)} />
          <div className={`relative w-full max-w-md h-full flex flex-col shadow-2xl animate-[slideInRight_0.3s_ease-out] ${isDark ? "bg-slate-950 border-l border-slate-800" : "bg-white"}`}>
            <div className={`px-6 py-5 border-b flex justify-between items-center ${isDark ? "border-slate-800" : "border-slate-200"}`}>
              <h3 className={`font-black text-xl flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                <Package className="w-5 h-5 text-teal-500"/> {formMode === "create" ? t.drwCreate : t.drwEdit}
              </h3>
              <button onClick={() => setDrawerOpen(false)} className={`p-2 rounded-xl transition ${isDark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}><X size={20}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form id="pkgForm" onSubmit={handleSubmit} className="space-y-5">
                <label className="block">
                  <span className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t.lblName}</span>
                  <input required type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-teal-500 ${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`} placeholder="e.g. Basic Pack" />
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t.lblTokens}</span>
                  <input required type="number" min="1" value={formData.tokens} onChange={e=>setFormData({...formData, tokens: e.target.value})} className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-teal-500 ${isDark ? "bg-slate-900 border-slate-800 text-amber-500 font-bold" : "bg-slate-50 border-slate-200 font-bold"}`} />
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t.lblPriceVND}</span>
                    <input required type="number" min="0" value={formData.price_vnd} onChange={e=>setFormData({...formData, price_vnd: e.target.value})} className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-teal-500 ${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`} />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t.lblPriceUSD}</span>
                    <input required type="number" step="0.01" min="0" value={formData.price_usd} onChange={e=>setFormData({...formData, price_usd: e.target.value})} className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-teal-500 ${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`} />
                  </label>
                </div>
                <label className="block">
                  <span className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t.lblDesc}</span>
                  <textarea rows="3" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-teal-500 resize-none ${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`} />
                </label>
                <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:border-teal-500 transition-colors">
                  <input type="checkbox" checked={formData.is_active} onChange={e=>setFormData({...formData, is_active: e.target.checked})} className="w-5 h-5 text-teal-600 rounded bg-slate-100 border-slate-300 focus:ring-teal-500" />
                  <div>
                    <p className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>{t.lblStatus}</p>
                    <p className="text-xs text-slate-500">Allow users to purchase this package.</p>
                  </div>
                </label>
              </form>
            </div>
            <div className={`p-6 border-t flex gap-3 ${isDark ? "border-slate-800 bg-slate-950" : "border-slate-200 bg-white"}`}>
              <button onClick={() => setDrawerOpen(false)} disabled={isSubmitting} className={`flex-1 py-3 rounded-xl font-bold text-sm border transition ${isDark ? "border-slate-800 hover:bg-slate-800 text-slate-300" : "border-slate-200 hover:bg-slate-50 text-slate-700"}`}>{t.btnCancel}</button>
              <button form="pkgForm" type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-sm shadow-md transition disabled:opacity-50 flex justify-center items-center gap-2">
                {isSubmitting ? "..." : <><Save size={16}/> {t.btnSave}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}