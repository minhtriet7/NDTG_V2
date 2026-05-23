import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";
import {
  Search,
  X,
  FileText,
  Download,
  RotateCcw,
  Eye,
  Copy,
  Filter,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Cpu,
  BotMessageSquare,
  SearchCheck,
  GitMerge,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

// ==========================================
// DATA HELPER FUNCTIONS (An toàn với mọi schema)
// ==========================================
const safeStr = (val) =>
  val === null || val === undefined || val === "" ? "N/A" : String(val);

const getRecImage = (r) => {
  const url = r.uploaded_image_url || r.image_url || r.data?.image_url;
  return url === "temp_url_will_be_uploaded_to_cloudinary_later" ? null : url;
};
const getRecDenom = (r) =>
  safeStr(r.final_result?.menh_gia || r.data?.denomination);
const getRecCountry = (r) =>
  safeStr(r.final_result?.quoc_gia || r.data?.country);
const getRecCurrency = (r) =>
  safeStr(r.final_result?.loai_tien || r.data?.currency);
const getRecMaterial = (r) =>
  safeStr(r.final_result?.chat_lieu || r.data?.material);
const getRecStatus = (r) => safeStr(r.status || "completed").toLowerCase();
const getRecConsensus = (r) =>
  Number(
    r.final_result?.so_luong_dong_thuan || r.consensus?.matched_agents || 0,
  );

// ==========================================
// COMPONENT MAIN
// ==========================================
export default function History() {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { lang, theme } = useAppStore(); // THÊM THEME
  const isDark = theme === "dark"; // BIẾN XÁC ĐỊNH DARK MODE

  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [consensusFilter, setConsensusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // --- Từ điển Song ngữ ---
  const t = {
    EN: {
      title: "Scan History",
      subtitle:
        "Review your previous banknote scans, consensus results, and exported JSON files.",
      btnWorkspace: "Go to Workspace",
      btnExport: "Export CSV",
      statTotal: "Total Scans",
      statCompleted: "Completed",
      statReview: "Needs Review",
      statTokens: "Tokens Used",
      searchPlaceholder: "Search country, denomination, currency...",
      filterStatus: "Status",
      filterCountry: "Country",
      filterConsensus: "Consensus",
      filterDate: "Date",
      filterAll: "All",
      resetFilters: "Reset Filters",
      thDate: "Date / Time",
      thImage: "Image",
      thResult: "Result",
      thCountry: "Country",
      thConsensus: "Consensus",
      thStatus: "Status",
      thCost: "Token Cost",
      thAction: "Actions",
      emptyTitle: "No scan history yet",
      emptySub: "Run your first banknote scan to see results here.",
      errTitle: "Unable to load scan history",
      btnRetry: "Try again",
      modalTitle: "Analysis Detail",
      jsonPreview: "JSON Preview",
      btnCopy: "Copy JSON",
      btnDownload: "Download",
      ag1: "ML/DL Analysis",
      ag2: "LLM/API Analysis",
      ag3: "Visual Search",
      insightTitle: "Insights",
      insightCountry: "Most Scanned Country",
      insightDenom: "Most Scanned Denom",
    },
    VI: {
      title: "Lịch sử phân tích",
      subtitle:
        "Xem lại các bản quét tiền giấy, kết quả đồng thuận và dữ liệu JSON.",
      btnWorkspace: "Vào Quét ảnh",
      btnExport: "Xuất CSV",
      statTotal: "Tổng số lần quét",
      statCompleted: "Hoàn tất",
      statReview: "Cần xem xét",
      statTokens: "Token đã dùng",
      searchPlaceholder: "Tìm quốc gia, mệnh giá, mã tiền...",
      filterStatus: "Trạng thái",
      filterCountry: "Quốc gia",
      filterConsensus: "Đồng thuận",
      filterDate: "Thời gian",
      filterAll: "Tất cả",
      resetFilters: "Xóa bộ lọc",
      thDate: "Ngày / Giờ",
      thImage: "Hình ảnh",
      thResult: "Kết quả",
      thCountry: "Quốc gia",
      thConsensus: "Đồng thuận",
      thStatus: "Trạng thái",
      thCost: "Chi phí",
      thAction: "Thao tác",
      emptyTitle: "Chưa có lịch sử quét",
      emptySub: "Hãy thực hiện quét tờ tiền đầu tiên để xem dữ liệu tại đây.",
      errTitle: "Không thể tải dữ liệu lịch sử",
      btnRetry: "Thử lại",
      modalTitle: "Chi Tiết Phân Tích",
      jsonPreview: "Dữ liệu JSON",
      btnCopy: "Sao chép JSON",
      btnDownload: "Tải xuống",
      ag1: "Phân tích ML/DL",
      ag2: "Phân tích LLM/API",
      ag3: "Tìm kiếm Hình ảnh",
      insightTitle: "Thống kê nhanh",
      insightCountry: "Quốc gia quét nhiều nhất",
      insightDenom: "Mệnh giá phổ biến nhất",
    },
  }[lang || "EN"];

  // --- FETCH DATA ---
  const fetchHistory = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const res = await axios.get(
        "http://localhost:8000/api/v1/users/me/history",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      // Sort newest first
      const sorted = (res.data || []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );
      setRecords(sorted);
    } catch (err) {
      console.error(err);
      setError(true);
      toast.error(t.errTitle);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line
  }, []);

  // --- FILTER & SEARCH LOGIC ---
  const filteredRecords = useMemo(() => {
    const now = new Date();
    return records.filter((r) => {
      const term = searchTerm.toLowerCase();
      const country = getRecCountry(r).toLowerCase();
      const denom = getRecDenom(r).toLowerCase();
      const currency = getRecCurrency(r).toLowerCase();
      const status = getRecStatus(r);
      const consensus = getRecConsensus(r);
      const date = new Date(r.created_at);

      // Search
      const matchSearch =
        country.includes(term) ||
        denom.includes(term) ||
        currency.includes(term);

      // Status
      const isSuccess = status === "success" || status === "completed";
      const isFailed = status === "failed" || status === "error";
      const isReview = !isSuccess && !isFailed; // pending, conflict, review

      let matchStatus = true;
      if (statusFilter === "completed") matchStatus = isSuccess;
      if (statusFilter === "review") matchStatus = isReview;
      if (statusFilter === "failed") matchStatus = isFailed;

      // Country
      let matchCountry = true;
      if (countryFilter !== "all")
        matchCountry = country.includes(countryFilter);

      // Consensus
      let matchConsensus = true;
      if (consensusFilter === "3") matchConsensus = consensus >= 3;
      if (consensusFilter === "2") matchConsensus = consensus === 2;
      if (consensusFilter === "conflict") matchConsensus = consensus < 2;

      // Date
      let matchDate = true;
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (dateFilter === "today") matchDate = diffDays <= 1;
      if (dateFilter === "7d") matchDate = diffDays <= 7;
      if (dateFilter === "30d") matchDate = diffDays <= 30;

      return (
        matchSearch &&
        matchStatus &&
        matchCountry &&
        matchConsensus &&
        matchDate
      );
    });
  }, [
    records,
    searchTerm,
    statusFilter,
    countryFilter,
    consensusFilter,
    dateFilter,
  ]);

  // --- STATS CALCULATION ---
  const stats = useMemo(() => {
    let completed = 0;
    let review = 0;

    records.forEach((r) => {
      const s = getRecStatus(r);
      if (s === "success" || s === "completed") completed++;
      else if (s !== "failed" && s !== "error") review++;
    });

    // Tính most scanned country & denom
    const countryMap = {};
    const denomMap = {};
    records.forEach((r) => {
      const c = getRecCountry(r);
      const d = getRecDenom(r);
      if (c !== "N/A") countryMap[c] = (countryMap[c] || 0) + 1;
      if (d !== "N/A") denomMap[d] = (denomMap[d] || 0) + 1;
    });

    const mostCountry =
      Object.entries(countryMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
    const mostDenom =
      Object.entries(denomMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    return { total: records.length, completed, review, mostCountry, mostDenom };
  }, [records]);

  // --- ACTIONS ---
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;

    const headers = [
      "Date",
      "Time",
      "Denomination",
      "Currency",
      "Country",
      "Status",
      "Consensus",
      "Token Cost",
    ];
    const rows = filteredRecords.map((r) => {
      const d = new Date(r.created_at);
      return [
        d.toLocaleDateString(),
        d.toLocaleTimeString(),
        getRecDenom(r),
        getRecCurrency(r),
        getRecCountry(r),
        getRecStatus(r),
        `${getRecConsensus(r)}/3`,
        "1",
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `banknote_history_${new Date().getTime()}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Exported successfully!");
  };

  const handleCopy = (data) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast.success("JSON copied to clipboard!");
  };

  const handleDownloadJSON = (data, id) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scan_${id || new Date().getTime()}.json`;
    link.click();
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCountryFilter("all");
    setConsensusFilter("all");
    setDateFilter("all");
  };

  // ==========================================
  // RENDER HELPERS CẬP NHẬT THEO THEME
  // ==========================================
  const renderStatusBadge = (status, isDark) => {
    const s = status.toLowerCase();
    if (s === "success" || s === "completed") {
      return (
        <span
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex w-fit items-center gap-1 border ${isDark ? "bg-teal-900/30 text-teal-400 border-teal-800" : "bg-teal-50 text-teal-700 border-teal-200"}`}
        >
          <CheckCircle2 size={12} /> Completed
        </span>
      );
    }
    if (s === "failed" || s === "error") {
      return (
        <span
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${isDark ? "bg-rose-900/30 text-rose-400 border-rose-800" : "bg-rose-50 text-rose-700 border-rose-200"}`}
        >
          Failed
        </span>
      );
    }
    return (
      <span
        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex w-fit items-center gap-1 border ${isDark ? "bg-amber-900/30 text-amber-400 border-amber-800" : "bg-amber-50 text-amber-700 border-amber-200"}`}
      >
        <AlertTriangle size={12} /> Needs Review
      </span>
    );
  };

  const renderConsensusBadge = (match, isDark) => {
    if (match >= 3)
      return (
        <span
          className={`px-2 py-1 rounded-md text-xs font-bold ${isDark ? "bg-teal-900/40 text-teal-400" : "bg-teal-50 text-teal-700"}`}
        >
          3/3 Matched
        </span>
      );
    if (match === 2)
      return (
        <span
          className={`px-2 py-1 rounded-md text-xs font-bold ${isDark ? "bg-emerald-900/40 text-emerald-400" : "bg-emerald-50 text-emerald-700"}`}
        >
          2/3 Matched
        </span>
      );
    if (match > 0)
      return (
        <span
          className={`px-2 py-1 rounded-md text-xs font-bold ${isDark ? "bg-amber-900/40 text-amber-400" : "bg-amber-50 text-amber-700"}`}
        >
          Conflict
        </span>
      );
    return (
      <span
        className={`px-2 py-1 rounded-md text-xs font-bold ${isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"}`}
      >
        N/A
      </span>
    );
  };

  return (
    // ĐỔI NỀN TỔNG QUÁT THEO THEME
    <div
      className={`min-h-screen p-4 md:p-8 font-sans pb-24 transition-colors duration-300 ${isDark ? "bg-slate-950 text-slate-200" : "bg-[#F8FAFC] text-[#0F172A]"}`}
    >
      <div className="max-w-7xl mx-auto space-y-6 animate-[fadeInUp_0.4s_ease-out]">
        {/* 1. PAGE HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
          <div>
            <h1
              className={`text-3xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}
            >
              {t.title}
            </h1>
            <p
              className={`mt-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              {t.subtitle}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/recognize")}
              className={`px-5 py-2.5 rounded-xl font-bold transition-colors shadow-sm border ${isDark ? "bg-slate-900 hover:bg-slate-800 border-slate-700 text-white" : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"}`}
            >
              {t.btnWorkspace}
            </button>
            <button
              onClick={handleExportCSV}
              disabled={filteredRecords.length === 0}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? "bg-teal-600 hover:bg-teal-500 text-white" : "bg-[#0F172A] hover:bg-slate-800 text-white"}`}
            >
              <FileSpreadsheet size={18} />
              {t.btnExport}
            </button>
          </div>
        </div>

        {/* 2. TOP STAT CARDS THEME */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: t.statTotal,
              value: stats.total,
              color: isDark ? "text-white" : "text-[#0F172A]",
            },
            {
              label: t.statCompleted,
              value: stats.completed,
              color: isDark ? "text-teal-400" : "text-teal-600",
            },
            {
              label: t.statReview,
              value: stats.review,
              color: isDark ? "text-amber-400" : "text-amber-600",
            },
            {
              label: t.statTokens,
              value: stats.total,
              color: isDark ? "text-indigo-400" : "text-indigo-600",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`p-5 rounded-2xl border shadow-sm ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
            >
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {stat.label}
              </p>
              <p className={`text-2xl font-black mt-1 ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* 3. SEARCH & FILTER BAR THEME */}
        <div
          className={`p-4 rounded-2xl border shadow-sm flex flex-col xl:flex-row gap-4 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all ${isDark ? "bg-slate-950 border-slate-800 text-white placeholder-slate-500" : "bg-slate-50 border-slate-200 text-slate-900"}`}
            />
          </div>

          <div className="flex flex-wrap md:flex-nowrap items-center gap-3">
            <div
              className={`flex items-center gap-2 text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              <Filter size={16} /> Filters:
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`border text-sm rounded-lg px-3 py-2 outline-none ${isDark ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-900"}`}
            >
              <option value="all">
                {t.filterStatus}: {t.filterAll}
              </option>
              <option value="completed">Completed</option>
              <option value="review">Needs Review</option>
              <option value="failed">Failed</option>
            </select>

            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className={`border text-sm rounded-lg px-3 py-2 outline-none ${isDark ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-900"}`}
            >
              <option value="all">
                {t.filterCountry}: {t.filterAll}
              </option>
              <option value="vietnam">Vietnam</option>
              <option value="malaysia">Malaysia</option>
              <option value="thailand">Thailand</option>
              <option value="singapore">Singapore</option>
            </select>

            <select
              value={consensusFilter}
              onChange={(e) => setConsensusFilter(e.target.value)}
              className={`border text-sm rounded-lg px-3 py-2 outline-none ${isDark ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-900"}`}
            >
              <option value="all">
                {t.filterConsensus}: {t.filterAll}
              </option>
              <option value="3">3/3 Matched</option>
              <option value="2">2/3 Matched</option>
              <option value="conflict">Conflict</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className={`border text-sm rounded-lg px-3 py-2 outline-none ${isDark ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-900"}`}
            >
              <option value="all">
                {t.filterDate}: {t.filterAll}
              </option>
              <option value="today">Today</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>

            <button
              onClick={resetFilters}
              className={`p-2 border rounded-lg transition-colors ${isDark ? "text-slate-400 bg-slate-950 border-slate-800 hover:bg-rose-900/30 hover:text-rose-400" : "text-slate-400 bg-slate-50 border-slate-200 hover:bg-rose-50 hover:text-rose-600"}`}
              title={t.resetFilters}
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        {/* 4. MAIN HISTORY TABLE THEME */}
        <div
          className={`rounded-3xl shadow-sm border overflow-hidden ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead
                className={`uppercase text-[11px] font-bold tracking-wider border-b ${isDark ? "bg-slate-950/80 text-slate-400 border-slate-800" : "bg-slate-50/80 text-slate-500 border-slate-200"}`}
              >
                <tr>
                  <th className="px-6 py-4">{t.thDate}</th>
                  <th className="px-6 py-4">{t.thImage}</th>
                  <th className="px-6 py-4">{t.thResult}</th>
                  <th className="px-6 py-4">{t.thCountry}</th>
                  <th className="px-6 py-4">{t.thConsensus}</th>
                  <th className="px-6 py-4">{t.thStatus}</th>
                  <th className="px-6 py-4">{t.thCost}</th>
                  <th className="px-6 py-4 text-right">{t.thAction}</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y text-sm ${isDark ? "divide-slate-800/50" : "divide-slate-100"}`}
              >
                {/* Error State */}
                {error && !isLoading && (
                  <tr>
                    <td colSpan="8" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <AlertTriangle className="w-10 h-10 text-rose-500 mb-3" />
                        <h3
                          className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}
                        >
                          {t.errTitle}
                        </h3>
                        <button
                          onClick={fetchHistory}
                          className={`mt-4 px-4 py-2 rounded-lg text-sm font-semibold ${isDark ? "bg-white text-slate-900" : "bg-slate-900 text-white"}`}
                        >
                          {t.btnRetry}
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Loading State */}
                {isLoading &&
                  Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4">
                          <div
                            className={`h-4 w-20 rounded animate-pulse ${isDark ? "bg-slate-800" : "bg-slate-100"}`}
                          ></div>
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className={`h-10 w-16 rounded-lg animate-pulse ${isDark ? "bg-slate-800" : "bg-slate-100"}`}
                          ></div>
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className={`h-5 w-16 rounded animate-pulse ${isDark ? "bg-slate-800" : "bg-slate-100"}`}
                          ></div>
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className={`h-4 w-24 rounded animate-pulse ${isDark ? "bg-slate-800" : "bg-slate-100"}`}
                          ></div>
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className={`h-5 w-20 rounded animate-pulse ${isDark ? "bg-slate-800" : "bg-slate-100"}`}
                          ></div>
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className={`h-5 w-20 rounded animate-pulse ${isDark ? "bg-slate-800" : "bg-slate-100"}`}
                          ></div>
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className={`h-4 w-12 rounded animate-pulse ${isDark ? "bg-slate-800" : "bg-slate-100"}`}
                          ></div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div
                            className={`h-8 w-8 rounded ml-auto animate-pulse ${isDark ? "bg-slate-800" : "bg-slate-100"}`}
                          ></div>
                        </td>
                      </tr>
                    ))}

                {/* Empty State */}
                {!isLoading && !error && filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-6 py-24 text-center">
                      <div className="flex flex-col items-center max-w-sm mx-auto">
                        <div
                          className={`w-16 h-16 border rounded-2xl flex items-center justify-center mb-4 ${isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}
                        >
                          <Search
                            className={`w-8 h-8 ${isDark ? "text-slate-500" : "text-slate-300"}`}
                          />
                        </div>
                        <h3
                          className={`text-lg font-bold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}
                        >
                          {t.emptyTitle}
                        </h3>
                        <p className="text-sm text-slate-500 mb-6">
                          {t.emptySub}
                        </p>
                        {records.length === 0 ? (
                          <button
                            onClick={() => navigate("/recognize")}
                            className="px-5 py-2.5 bg-teal-600 text-white rounded-xl font-bold shadow-sm hover:bg-teal-700 transition"
                          >
                            {t.btnWorkspace}
                          </button>
                        ) : (
                          <button
                            onClick={resetFilters}
                            className={`px-5 py-2.5 rounded-xl font-bold shadow-sm transition ${isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-200" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}
                          >
                            {t.resetFilters}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}

                {/* Data Rows */}
                {!isLoading &&
                  !error &&
                  filteredRecords.map((r, i) => {
                    const d = new Date(r.created_at);
                    const image = getRecImage(r);
                    const denom = getRecDenom(r);
                    const currency = getRecCurrency(r);

                    return (
                      <tr
                        key={i}
                        className={`transition-colors group ${isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-50/50"}`}
                      >
                        <td className="px-6 py-4">
                          <p
                            className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-900"}`}
                          >
                            {d.toLocaleDateString()}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                            <Clock size={10} /> {d.toLocaleTimeString()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className={`w-16 h-10 border rounded-lg overflow-hidden flex items-center justify-center shadow-sm ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
                          >
                            {image ? (
                              <img
                                src={image}
                                alt="scan"
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <span
                                className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-300"}`}
                              >
                                No Img
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p
                            className={`font-black text-base ${isDark ? "text-white" : "text-slate-900"}`}
                          >
                            {denom}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">
                            {currency}
                          </p>
                        </td>
                        <td
                          className={`px-6 py-4 font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}
                        >
                          {getRecCountry(r)}
                        </td>
                        <td className="px-6 py-4">
                          {renderConsensusBadge(getRecConsensus(r), isDark)}
                        </td>
                        <td className="px-6 py-4">
                          {renderStatusBadge(getRecStatus(r), isDark)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded ${isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"}`}
                          >
                            1 Token
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedRecord(r)}
                            className={`p-2 border rounded-lg shadow-sm transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 ${isDark ? "text-slate-400 hover:text-teal-400 bg-slate-800 border-slate-700 hover:border-teal-500" : "text-slate-400 hover:text-teal-600 bg-white border-slate-200 hover:border-teal-200"}`}
                            title="View Detail"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 9. INSIGHTS SECTION THEME */}
        {records.length > 0 && (
          <div
            className={`mt-8 pt-8 border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}
          >
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
              {t.insightTitle}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
              <div
                className={`p-4 rounded-2xl border shadow-sm flex justify-between items-center ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
              >
                <span
                  className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}
                >
                  {t.insightCountry}
                </span>
                <span
                  className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}
                >
                  {stats.mostCountry}
                </span>
              </div>
              <div
                className={`p-4 rounded-2xl border shadow-sm flex justify-between items-center ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
              >
                <span
                  className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}
                >
                  {t.insightDenom}
                </span>
                <span
                  className={`font-bold ${isDark ? "text-teal-400" : "text-teal-600"}`}
                >
                  {stats.mostDenom}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* 5. DETAIL MODAL (SIDE DRAWER STYLE) THEME */}
      {/* ========================================== */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div
            className={`w-full max-w-4xl h-[100dvh] shadow-2xl flex flex-col animate-[slideInRight_0.3s_ease-out] ${isDark ? "bg-slate-950" : "bg-white"}`}
          >
            {/* Modal Header */}
            <div
              className={`px-6 py-5 border-b flex justify-between items-center shrink-0 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
            >
              <div>
                <h3
                  className={`font-extrabold text-xl flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}
                >
                  <FileText className="w-5 h-5 text-teal-500" /> {t.modalTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  ID: {selectedRecord._id || selectedRecord.id || "N/A"}
                </p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className={`p-2 rounded-xl transition-colors ${isDark ? "bg-slate-800 text-slate-400 hover:bg-rose-900/50 hover:text-rose-400" : "bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-600"}`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div
              className={`flex-1 overflow-y-auto p-6 md:p-8 space-y-8 ${isDark ? "bg-slate-950" : "bg-slate-50"}`}
            >
              {/* Top Row: Image & Final Result */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Image Card */}
                <div
                  className={`rounded-2xl border p-4 shadow-sm flex items-center justify-center min-h-[250px] ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
                >
                  {getRecImage(selectedRecord) ? (
                    <img
                      src={getRecImage(selectedRecord)}
                      alt="Scanned Note"
                      className="object-contain max-h-[250px] rounded-lg"
                    />
                  ) : (
                    <div className="text-slate-500 font-medium">
                      No Image Provided
                    </div>
                  )}
                </div>

                {/* Final Result Card */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-sm text-white">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Final Decision
                    </span>
                    {renderConsensusBadge(
                      getRecConsensus(selectedRecord),
                      isDark,
                    )}
                  </div>
                  <h2 className="text-4xl font-black text-white mb-6">
                    {getRecDenom(selectedRecord)}
                  </h2>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                    <div>
                      <p className="text-slate-500 text-xs uppercase mb-1">
                        Country
                      </p>
                      <p className="font-semibold">
                        {getRecCountry(selectedRecord)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs uppercase mb-1">
                        Currency
                      </p>
                      <p className="font-semibold">
                        {getRecCurrency(selectedRecord)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs uppercase mb-1">
                        Material
                      </p>
                      <p className="font-semibold">
                        {getRecMaterial(selectedRecord)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs uppercase mb-1">
                        Status
                      </p>
                      <p className="font-semibold capitalize">
                        {getRecStatus(selectedRecord)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agent Outputs Grid */}
              <div>
                <h3
                  className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}
                >
                  <GitMerge className="w-5 h-5 text-slate-400" /> Agent Outputs
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* ML/DL */}
                  <AgentMiniCard
                    isDark={isDark}
                    title={t.ag1}
                    icon={<Cpu size={16} />}
                    data={selectedRecord.agents?.ml_dl}
                    finalDenom={getRecDenom(selectedRecord)}
                  />
                  {/* LLM */}
                  <AgentMiniCard
                    isDark={isDark}
                    title={t.ag2}
                    icon={<BotMessageSquare size={16} />}
                    data={selectedRecord.agents?.llm_api}
                    finalDenom={getRecDenom(selectedRecord)}
                  />
                  {/* Visual Search */}
                  <AgentMiniCard
                    isDark={isDark}
                    title={t.ag3}
                    icon={<SearchCheck size={16} />}
                    data={selectedRecord.agents?.visual_search}
                    finalDenom={getRecDenom(selectedRecord)}
                  />
                </div>
              </div>

              {/* JSON Preview Block */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className={`text-lg font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}
                  >
                    <FileJson className="w-5 h-5 text-slate-400" />{" "}
                    {t.jsonPreview}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(selectedRecord)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-bold ${isDark ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                    >
                      <Copy size={14} /> {t.btnCopy}
                    </button>
                    <button
                      onClick={() =>
                        handleDownloadJSON(selectedRecord, selectedRecord.id)
                      }
                      className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-bold ${isDark ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                    >
                      <Download size={14} /> {t.btnDownload}
                    </button>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-2xl overflow-hidden border shadow-inner ${isDark ? "bg-slate-900 border-slate-800" : "bg-[#1E293B] border-slate-800"}`}
                >
                  <pre className="text-xs text-teal-300 font-mono leading-relaxed max-h-[300px] overflow-auto whitespace-pre-wrap scrollbar-thin scrollbar-thumb-slate-700">
                    {JSON.stringify(selectedRecord, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KEYFRAMES TẠO ANIMATION MƯỢT TRỰC TIẾP TRONG FILE */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `,
        }}
      />
    </div>
  );
}

// ==========================================
// COMPONENT CON: AGENT CARD (Dùng trong Modal)
// ==========================================
function AgentMiniCard({ title, icon, data, finalDenom, isDark }) {
  if (!data)
    return (
      <div
        className={`p-4 rounded-2xl border border-dashed flex flex-col items-center justify-center text-center min-h-[140px] ${isDark ? "bg-slate-900 border-slate-700 text-slate-500" : "bg-white border-slate-200 text-slate-400"}`}
      >
        {icon}
        <p className="text-sm font-bold mt-2">{title}</p>
        <p className="text-xs mt-1">No data</p>
      </div>
    );

  const denom = safeStr(data.menh_gia || data.denomination || data.result);
  const country = safeStr(data.quoc_gia || data.country);
  const isMatch = denom === finalDenom && finalDenom !== "N/A";

  return (
    <div
      className={`p-4 rounded-2xl border shadow-sm flex flex-col ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
    >
      <div
        className={`flex items-center justify-between mb-3 border-b pb-2 ${isDark ? "border-slate-800" : "border-slate-50"}`}
      >
        <p className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
          {icon} {title}
        </p>
        {isMatch ? (
          <CheckCircle2 size={14} className="text-teal-500" />
        ) : (
          <AlertTriangle size={14} className="text-amber-500" />
        )}
      </div>
      <div className="space-y-2 mt-auto">
        <div className="flex justify-between">
          <span className="text-xs text-slate-400">Denom:</span>
          <span
            className={`text-sm font-bold ${isMatch ? (isDark ? "text-white" : "text-slate-900") : isDark ? "text-amber-400" : "text-amber-600"}`}
          >
            {denom}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-slate-400">Country:</span>
          <span
            className={`text-sm font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}
          >
            {country}
          </span>
        </div>
      </div>
    </div>
  );
}
