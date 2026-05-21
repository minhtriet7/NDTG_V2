import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";
import { Loader2, Search, X, FileText, Download } from "lucide-react";
import toast from "react-hot-toast";

export default function History() {
  const { token } = useAuthStore();
  const { lang } = useAppStore();
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);

  const t = {
    EN: {
      title: "Scan History",
      subtitle: "Review your past banknote analysis records.",
      total: "Total Scans",
      search: "Search country or denomination...",
      date: "Date",
      image: "Image",
      country: "Country",
      denom: "Denomination",
      status: "Status",
      action: "Action",
      view: "View JSON",
      empty: "No records found.",
      modalTitle: "Analysis Detail",
      btnClose: "Close",
    },
    VI: {
      title: "Lịch sử phân tích",
      subtitle: "Xem lại các bản ghi phân tích tiền giấy trước đây của bạn.",
      total: "Tổng số lần quét",
      search: "Tìm kiếm quốc gia hoặc mệnh giá...",
      date: "Ngày",
      image: "Hình ảnh",
      country: "Quốc gia",
      denom: "Mệnh giá",
      status: "Trạng thái",
      action: "Thao tác",
      view: "Xem JSON",
      empty: "Không có bản ghi nào.",
      modalTitle: "Chi Tiết Phân Tích",
      btnClose: "Đóng",
    },
  }[lang || "EN"];

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/v1/users/me/history",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setRecords(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch history.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRecords = records.filter((r) => {
    const term = searchTerm.toLowerCase();
    const c = r.final_result?.quoc_gia?.toLowerCase() || "";
    const d = r.final_result?.menh_gia?.toLowerCase() || "";
    return c.includes(term) || d.includes(term);
  });

  const handleDownload = (record) => {
    const blob = new Blob([JSON.stringify(record, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `record_${record._id || record.id}.json`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans pb-20 relative">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">{t.title}</h1>
            <p className="text-slate-500 text-sm mt-1">{t.subtitle}</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <span className="text-sm text-slate-500 font-medium">
              {t.total}
            </span>
            <span className="text-lg font-black text-teal-600">
              {records.length}
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 flex items-center">
          <Search className="w-5 h-5 text-slate-400 ml-2" />
          <input
            type="text"
            placeholder={t.search}
            className="w-full bg-transparent border-none outline-none px-3 py-2 text-sm text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">{t.date}</th>
                  <th className="px-6 py-4">{t.image}</th>
                  <th className="px-6 py-4">{t.country}</th>
                  <th className="px-6 py-4">{t.denom}</th>
                  <th className="px-6 py-4">{t.status}</th>
                  <th className="px-6 py-4 text-right">{t.action}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-slate-400"
                    >
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-600" />
                      Loading records...
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-slate-400"
                    >
                      {t.empty}
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center text-xs text-slate-400">
                          {r.uploaded_image_url &&
                          r.uploaded_image_url !==
                            "temp_url_will_be_uploaded_to_cloudinary_later" ? (
                            <img
                              src={r.uploaded_image_url}
                              alt="scan"
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            "[Img]"
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-[#0F172A]">
                        {r.final_result?.quoc_gia || "N/A"}
                      </td>
                      <td className="px-6 py-4 font-bold text-teal-600">
                        {r.final_result?.menh_gia || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            r.status === "success"
                              ? "bg-teal-100 text-teal-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedRecord(r)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold transition"
                        >
                          {t.view}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* JSON Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-[#0F172A] flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" /> {t.modalTitle}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(selectedRecord)}
                  className="p-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-700 transition"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-2 bg-slate-200 hover:bg-red-100 hover:text-red-600 rounded-lg text-slate-700 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-auto bg-[#0F172A] text-teal-300 font-mono text-xs">
              <pre>{JSON.stringify(selectedRecord, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
