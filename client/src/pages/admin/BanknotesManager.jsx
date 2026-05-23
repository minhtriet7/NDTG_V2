import React, { useState, useEffect, useMemo } from "react";
import { useAppStore } from "../../store/appStore";
import { getAdminBanknotes, createBanknote, updateBanknote, deleteBanknote } from "../../services/adminService";
import { Search, Plus, Edit, Trash2, X, Image as ImageIcon, CheckCircle, Database } from "lucide-react";
import toast from "react-hot-toast";

export default function BanknotesManager() {
  const { lang, theme } = useAppStore();
  const isDark = theme === "dark";

  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Drawer & Form State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formMode, setFormMode] = useState("create"); // 'create' | 'edit'
  const [formData, setFormData] = useState({ denomination: "", currency: "", country: "", material: "", front_image_url: "", description: "" });
  const [selectedId, setSelectedId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = {
    EN: {
      title: "Banknotes Inventory", subtitle: "Manage the core dataset used for AI visual matching and verification.",
      searchPlaceholder: "Search country, denom, currency...", btnAdd: "Add Banknote",
      thImg: "Image", thDenom: "Denom/Currency", thCountry: "Country", thMaterial: "Material", thAction: "Actions",
      noData: "No banknotes found.", errLoad: "Failed to load data.",
      drwCreate: "Add New Banknote", drwEdit: "Edit Banknote", btnSave: "Save Record", btnCancel: "Cancel",
      lblDenom: "Denomination", lblCurrency: "Currency Code (e.g. VND)", lblCountry: "Country", lblMaterial: "Material", lblImg: "Front Image URL", lblDesc: "Description",
      msgAdd: "Created successfully.", msgUpdate: "Updated successfully.", msgDel: "Deleted successfully."
    },
    VI: {
      title: "Kho Dữ liệu Tiền", subtitle: "Quản lý dữ liệu lõi dùng để đối chiếu và nhận diện AI.",
      searchPlaceholder: "Tìm quốc gia, mệnh giá, mã tiền...", btnAdd: "Thêm Tiền Giấy",
      thImg: "Hình ảnh", thDenom: "Mệnh giá", thCountry: "Quốc gia", thMaterial: "Chất liệu", thAction: "Thao tác",
      noData: "Không tìm thấy dữ liệu.", errLoad: "Lỗi tải dữ liệu.",
      drwCreate: "Thêm Tiền Giấy Mới", drwEdit: "Cập nhật Thông tin", btnSave: "Lưu dữ liệu", btnCancel: "Hủy",
      lblDenom: "Mệnh giá (Số)", lblCurrency: "Mã tiền tệ (VD: VND)", lblCountry: "Quốc gia", lblMaterial: "Chất liệu", lblImg: "Link ảnh mặt trước", lblDesc: "Mô tả chi tiết",
      msgAdd: "Tạo mới thành công.", msgUpdate: "Cập nhật thành công.", msgDel: "Xóa thành công."
    }
  }[lang || "EN"];

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getAdminBanknotes();
      setNotes(data || []);
    } catch (error) { toast.error(t.errLoad); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      const term = searchTerm.toLowerCase();
      return (n.country || "").toLowerCase().includes(term) || 
             (n.denomination || "").toString().includes(term) || 
             (n.currency || "").toLowerCase().includes(term);
    });
  }, [notes, searchTerm]);

  const openDrawer = (mode, note = null) => {
    setFormMode(mode);
    if (mode === "edit" && note) {
      setSelectedId(note.id || note._id);
      setFormData({
        denomination: note.denomination || "", currency: note.currency || "",
        country: note.country || "", material: note.material || "",
        front_image_url: note.front_image_url || "", description: note.description || ""
      });
    } else {
      setSelectedId(null);
      setFormData({ denomination: "", currency: "", country: "", material: "", front_image_url: "", description: "" });
    }
    setDrawerOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (formMode === "create") {
        await createBanknote(formData);
        toast.success(t.msgAdd);
      } else {
        await updateBanknote(selectedId, formData);
        toast.success(t.msgUpdate);
      }
      setDrawerOpen(false);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banknote?")) return;
    try {
      await deleteBanknote(id);
      toast.success(t.msgDel);
      loadData();
    } catch (error) { toast.error("Delete failed"); }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{t.title}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{t.subtitle}</p>
        </div>
        <button onClick={() => openDrawer("create")} className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-bold shadow-md flex items-center gap-2 transition w-fit">
          <Plus size={16} /> {t.btnAdd}
        </button>
      </div>

      {/* Search Bar */}
      <div className={`p-4 rounded-2xl border shadow-sm ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" placeholder={t.searchPlaceholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all ${isDark ? "bg-slate-950 border-slate-800 text-white placeholder-slate-500" : "bg-slate-50 border-slate-200 text-slate-900"}`}
          />
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-3xl border shadow-sm overflow-hidden ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className={`uppercase text-[10px] font-bold tracking-wider border-b ${isDark ? "bg-slate-950/50 text-slate-500 border-slate-800" : "bg-slate-50 text-slate-500 border-slate-100"}`}>
              <tr>
                <th className="px-5 py-4 w-20">{t.thImg}</th>
                <th className="px-5 py-4">{t.thDenom}</th>
                <th className="px-5 py-4">{t.thCountry}</th>
                <th className="px-5 py-4">{t.thMaterial}</th>
                <th className="px-5 py-4 text-right">{t.thAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {isLoading ? (
                <tr><td colSpan="5" className="text-center py-10"><span className="animate-pulse text-slate-400">Loading...</span></td></tr>
              ) : filteredNotes.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-16 text-slate-500 font-medium">{t.noData}</td></tr>
              ) : filteredNotes.map((n) => (
                <tr key={n.id || n._id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors`}>
                  <td className="px-5 py-3">
                    <div className={`w-16 h-10 rounded border flex items-center justify-center overflow-hidden ${isDark ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}>
                      {n.front_image_url ? <img src={n.front_image_url} alt="" className="w-full h-full object-cover"/> : <ImageIcon className="w-4 h-4 text-slate-400"/>}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <p className={`font-black ${isDark ? "text-white" : "text-slate-900"}`}>{n.denomination}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">{n.currency}</p>
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-600 dark:text-slate-300">{n.country}</td>
                  <td className="px-5 py-3 text-xs text-slate-500 uppercase">{n.material || "Paper"}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openDrawer("edit", n)} className={`p-2 rounded-lg border transition ${isDark ? "border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-teal-400" : "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-teal-600"}`}><Edit size={14}/></button>
                      <button onClick={() => handleDelete(n.id || n._id)} className={`p-2 rounded-lg border transition ${isDark ? "border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-rose-400" : "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-rose-600"}`}><Trash2 size={14}/></button>
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
                <Database className="w-5 h-5 text-teal-500"/> {formMode === "create" ? t.drwCreate : t.drwEdit}
              </h3>
              <button onClick={() => setDrawerOpen(false)} className={`p-2 rounded-xl transition ${isDark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}><X size={20}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form id="noteForm" onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t.lblDenom}</span>
                    <input required type="number" value={formData.denomination} onChange={e=>setFormData({...formData, denomination: e.target.value})} className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-teal-500 ${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`} />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t.lblCurrency}</span>
                    <input required type="text" value={formData.currency} onChange={e=>setFormData({...formData, currency: e.target.value})} className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-teal-500 uppercase ${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`} />
                  </label>
                </div>
                
                <label className="block">
                  <span className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t.lblCountry}</span>
                  <input required type="text" value={formData.country} onChange={e=>setFormData({...formData, country: e.target.value})} className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-teal-500 ${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`} />
                </label>

                <label className="block">
                  <span className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t.lblMaterial}</span>
                  <input type="text" placeholder="e.g. Polymer, Paper" value={formData.material} onChange={e=>setFormData({...formData, material: e.target.value})} className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-teal-500 ${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`} />
                </label>

                <label className="block">
                  <span className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t.lblImg}</span>
                  <input type="url" value={formData.front_image_url} onChange={e=>setFormData({...formData, front_image_url: e.target.value})} className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-teal-500 ${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`} />
                  {formData.front_image_url && <img src={formData.front_image_url} alt="preview" className="mt-3 w-full h-32 object-contain rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"/>}
                </label>

                <label className="block">
                  <span className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t.lblDesc}</span>
                  <textarea rows="4" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-teal-500 resize-none ${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`} />
                </label>
              </form>
            </div>

            <div className={`p-6 border-t flex gap-3 ${isDark ? "border-slate-800 bg-slate-950" : "border-slate-200 bg-white"}`}>
              <button onClick={() => setDrawerOpen(false)} disabled={isSubmitting} className={`flex-1 py-3 rounded-xl font-bold text-sm border transition ${isDark ? "border-slate-800 hover:bg-slate-800 text-slate-300" : "border-slate-200 hover:bg-slate-50 text-slate-700"}`}>{t.btnCancel}</button>
              <button form="noteForm" type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-sm shadow-md transition disabled:opacity-50 flex justify-center items-center gap-2">
                {isSubmitting ? "..." : <><CheckCircle size={16}/> {t.btnSave}</>}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}