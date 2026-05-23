import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";

import { useCurrencyStore } from "../../store/currencyStore";
import { useRecognitionStore } from "../../store/recognitionStore";
import { useLanguageStore } from "../../store/languageStore"; // 🌟 Thêm Store ngôn ngữ

import {
  Copy,
  Download,
  History,
  RotateCcw,
  FileJson,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  MessageSquare,
} from "lucide-react"; // 🌟 Thêm Icon MessageSquare cho nút Feedback

// ==========================================
// CÁC HÀM TIỆN ÍCH (UTILITIES)
// ==========================================
const normalizeText = (value) => {
  if (value === null || value === undefined || value === "") return "N/A";
  return String(value);
};

const stripMarkdownSymbols = (text) => {
  if (!text) return "";
  return String(text)
    .replace(/[🤖🧠👁️⚖️✅🔬🔄📦🧾]/g, "")
    .replace(/`/g, "")
    .trim();
};

const getAgentDenomination = (agent) =>
  normalizeText(agent?.menh_gia || agent?.denomination || agent?.result);
const getAgentCountry = (agent) =>
  normalizeText(agent?.quoc_gia || agent?.country);
const getAgentReasoning = (agent) =>
  normalizeText(agent?.quan_diem || agent?.reasoning || agent?.error);
const getAgentMethod = (agent, fallback) =>
  normalizeText(agent?.phuong_phap || agent?.method || fallback);

const getConsensusStatusLabel = (consensus, lang) => {
  const status = consensus?.status;
  const matched = Number(consensus?.matched_agents || 0);

  if (String(status).toLowerCase().includes("re-analysis"))
    return lang === "VI" ? "Cần phân tích lại" : "Need re-analysis";
  if (matched >= 3) return lang === "VI" ? "Đồng thuận cao" : "High consensus";
  if (matched === 2)
    return lang === "VI" ? "Đạt đồng thuận" : "Consensus reached";
  if (status) return status;
  return lang === "VI" ? "Đạt đồng thuận" : "Consensus reached";
};

const getConsensusBadgeClass = (consensus) => {
  const label = (consensus?.status || "").toLowerCase();
  const matched = Number(consensus?.matched_agents || 0);

  if (
    matched >= 2 ||
    label.includes("high") ||
    label.includes("reach") ||
    label.includes("completed")
  )
    return "bg-teal-50 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-500/30";
  if (
    label.includes("review") ||
    label.includes("analysis") ||
    label.includes("conflict")
  )
    return "bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30";
  return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
};

// ==========================================
// CÁC COMPONENT CON
// ==========================================
function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-50 dark:border-slate-700/50 pb-2">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="font-bold text-slate-900 dark:text-slate-100 text-right">
        {normalizeText(value)}
      </span>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 transition-colors">
      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
        {label}
      </p>
      <p className="mt-2 text-lg font-black text-slate-900 dark:text-slate-100">
        {normalizeText(value)}
      </p>
    </div>
  );
}

function DecisionItem({ label, value, status, t }) {
  const statusClass =
    status === "matched"
      ? "bg-teal-50 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-100 dark:border-teal-500/30"
      : status === "different"
        ? "bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-500/30"
        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 transition-colors">
      <div>
        <p className="text-sm font-bold text-slate-900 dark:text-slate-200">
          {label}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {normalizeText(value)}
        </p>
      </div>
      <span
        className={`w-fit px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${statusClass}`}
      >
        {status === "matched"
          ? t.matched
          : status === "different"
            ? t.different
            : t.final}
      </span>
    </div>
  );
}

function AgentCard({ agentKey, title, method, data, finalDenomination, t }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!data) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 transition-colors">
        <span className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider rounded mb-3">
          {agentKey}
        </span>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
          {t.noAgentData}
        </p>
      </div>
    );
  }

  const agentDenomination = getAgentDenomination(data);
  const isMatched =
    agentDenomination !== "N/A" &&
    finalDenomination !== "N/A" &&
    agentDenomination === finalDenomination;
  const reasoningText = stripMarkdownSymbols(getAgentReasoning(data));

  return (
    <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6 hover:shadow-md transition-all">
      <div className="flex justify-between items-start gap-4 mb-4">
        <div>
          <span className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider rounded mb-2">
            {agentKey}
          </span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {getAgentMethod(data, method)}
          </p>
        </div>
        <span
          className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded whitespace-nowrap border ${isMatched ? "bg-teal-50 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-100 dark:border-teal-500/30" : "bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-500/30"}`}
        >
          {isMatched ? t.matched : t.different}
        </span>
      </div>

      <div className="space-y-3 mb-6 text-sm">
        <InfoRow label={t.lblDenomination} value={agentDenomination} />
        <InfoRow label={t.lblCountry} value={getAgentCountry(data)} />
        <InfoRow
          label={t.lblMaterial}
          value={data?.chat_lieu || data?.material}
        />
      </div>

      <div className="mt-auto">
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
          {t.lblReasoning}
        </p>
        <div
          className={`text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 ${!isExpanded ? "line-clamp-5" : ""}`}
        >
          <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
            <ReactMarkdown>{reasoningText}</ReactMarkdown>
          </div>
        </div>
        {reasoningText.length > 180 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 text-sm font-semibold transition-colors"
          >
            {isExpanded ? t.showLess : t.readFull}
          </button>
        )}
      </div>
    </div>
  );
}

// ==========================================
// COMPONENT CHÍNH: RESULT PAGE
// ==========================================
export default function Result() {
  const navigate = useNavigate();
  const location = useLocation();

  const { currentScanSession } = useRecognitionStore();
  const { ratesData, fetchRates } = useCurrencyStore();
  const { lang } = useLanguageStore(); // 🌟 Lấy ngôn ngữ từ Store

  const [showRawLog, setShowRawLog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // 🌟 TỪ ĐIỂN ĐA NGÔN NGỮ
  const dict = {
    EN: {
      title: "Analysis Report",
      subtitle:
        "Review the final decision, agent outputs, and structured JSON result.",
      viewHistory: "View History",
      scanAnother: "Scan Another",
      feedback: "Feedback",
      uploadTitle: "Uploaded Banknote",
      finalDecision: "Final Decision",
      lblCountry: "Country",
      lblMaterial: "Material",
      lblCurrency: "Currency",
      lblConsensus: "Consensus",
      lblReasoning: "Reasoning",
      agents: "agents",
      referee: "Referee Conclusion",
      lblDenomination: "Denomination",
      lblOrigin: "Origin",
      exchangeTitle: "Instant Currency Exchange",
      exchangeDesc: "Live conversion rates for the analyzed banknote value.",
      fullConverter: "Full Converter",
      aggDecision: "Aggregator Decision",
      aggDesc:
        "The aggregator compares all agent outputs and selects the majority result.",
      agentCompare: "Agent Comparison",
      fullLogTitle: "Full Reasoning Log",
      fullLogDesc:
        "Detailed reasoning is collapsed to keep the report readable.",
      hideLog: "Hide Log",
      viewLog: "View Full Log",
      jsonTitle: "Structured JSON Output",
      copy: "Copy",
      download: "Download",
      continueTitle: "Continue scanning",
      continueDesc:
        "Start another scan or review saved results in your history.",
      btnScanAnother: "Scan Another Banknote",
      btnViewHistory: "View Scan History",
      noResult: "No result data available",
      noResultDesc: "Please run a new banknote scan from the workspace.",
      backWorkspace: "Go back to Workspace",
      matched: "Matched",
      different: "Different",
      final: "Final",
      noAgentData: "No agent data available.",
      showLess: "Show less",
      readFull: "Read full reasoning",
    },
    VI: {
      title: "Báo Cáo Phân Tích",
      subtitle:
        "Xem lại quyết định cuối cùng, kết quả từ các đặc vụ và dữ liệu JSON.",
      viewHistory: "Xem Lịch Sử",
      scanAnother: "Quét Ảnh Khác",
      feedback: "Góp ý / Báo lỗi",
      uploadTitle: "Ảnh Đã Tải Lên",
      finalDecision: "Quyết Định Cuối Cùng",
      lblCountry: "Quốc Gia",
      lblMaterial: "Chất Liệu",
      lblCurrency: "Tiền Tệ",
      lblConsensus: "Đồng Thuận",
      lblReasoning: "Lập Luận",
      agents: "đặc vụ",
      referee: "Kết Luận Trọng Tài",
      lblDenomination: "Mệnh Giá",
      lblOrigin: "Nguồn Gốc",
      exchangeTitle: "Quy Đổi Tỷ Giá Nhanh",
      exchangeDesc: "Tỷ giá chuyển đổi trực tiếp dựa trên mệnh giá vừa quét.",
      fullConverter: "Chuyển Đổi Chi Tiết",
      aggDecision: "Quyết Định Tổng Hợp",
      aggDesc:
        "Hệ thống tổng hợp đối chiếu kết quả từ các đặc vụ và chọn ra kết quả đa số.",
      agentCompare: "So Sánh Các Đặc Vụ",
      fullLogTitle: "Nhật Ký Tranh Biện",
      fullLogDesc: "Lý luận chi tiết được thu gọn để báo cáo dễ đọc hơn.",
      hideLog: "Ẩn Nhật Ký",
      viewLog: "Xem Toàn Bộ Nhật Ký",
      jsonTitle: "Dữ Liệu JSON Cấu Trúc",
      copy: "Sao chép",
      download: "Tải xuống",
      continueTitle: "Tiếp Tục",
      continueDesc:
        "Bắt đầu quét một ảnh khác hoặc xem lại kết quả trong lịch sử.",
      btnScanAnother: "Quét Tờ Tiền Khác",
      btnViewHistory: "Xem Lịch Sử Quét",
      noResult: "Không có dữ liệu kết quả",
      noResultDesc:
        "Vui lòng thực hiện quét một tờ tiền mới từ không gian làm việc.",
      backWorkspace: "Trở lại Không Gian Làm Việc",
      matched: "Trùng Khớp",
      different: "Khác Biệt",
      final: "Chốt Kết Quả",
      noAgentData: "Không có dữ liệu từ đặc vụ này.",
      showLess: "Thu gọn",
      readFull: "Xem toàn bộ lập luận",
    },
  };
  const t = dict[lang || "EN"];

  useEffect(() => {
    if (!ratesData) fetchRates();
  }, [ratesData, fetchRates]);

  const sessionFromRoute = location.state?.scanSession;
  const session = sessionFromRoute || currentScanSession;
  const rawResult = session?.result;

  const resultsArray = useMemo(() => {
    if (!rawResult) return [];
    return Array.isArray(rawResult) ? rawResult : [rawResult];
  }, [rawResult]);

  const currentItem = resultsArray[activeTab] || {};
  const finalData = currentItem.data || {};
  const agents = currentItem.agents || {};
  const consensus = currentItem.consensus || {};

  const finalDenomination = normalizeText(finalData.denomination);
  const finalCountry = normalizeText(finalData.country);
  const finalCurrency = normalizeText(finalData.currency);
  const finalMaterial = normalizeText(finalData.material);
  const finalOrigin = normalizeText(finalData.origin);

  const previewImage =
    currentItem.image_url ||
    currentItem.thumbnail_url ||
    currentItem.data?.image_url ||
    session?.previewUrl;
  const matchedAgents = Number(consensus?.matched_agents || 0);
  const consensusText =
    consensus?.referee_view ||
    consensus?.quan_diem_trong_tai ||
    (matchedAgents
      ? `Majority vote selected ${finalDenomination} with ${matchedAgents}/3 agents matched.`
      : "No conclusion provided.");
  const safeDebateLog = stripMarkdownSymbols(
    consensus?.debate_log || "No debate log available.",
  );

  // THUẬT TOÁN TỶ GIÁ
  const exchangeResults = useMemo(() => {
    const baseRates = ratesData?.rates || {
      USD: 1,
      VND: 25450,
      THB: 36.8,
      SGD: 1.35,
      MYR: 4.75,
      IDR: 16100,
      PHP: 57.2,
      KHR: 4100,
      LAK: 21000,
    };
    const amountNumber =
      parseInt(finalDenomination.replace(/[^0-9]/g, ""), 10) || 0;

    if (amountNumber <= 0) return null;

    if (finalCurrency === "VND") {
      const amountInUSD = amountNumber / baseRates.VND;
      return [
        { code: "USD", name: "US Dollar", value: amountInUSD },
        { code: "THB", name: "Thai Baht", value: amountInUSD * baseRates.THB },
        {
          code: "SGD",
          name: "Singapore Dollar",
          value: amountInUSD * baseRates.SGD,
        },
        {
          code: "MYR",
          name: "Malaysian Ringgit",
          value: amountInUSD * baseRates.MYR,
        },
        {
          code: "IDR",
          name: "Indonesian Rupiah",
          value: amountInUSD * baseRates.IDR,
        },
      ];
    } else if (baseRates[finalCurrency]) {
      const amountInUSD = amountNumber / baseRates[finalCurrency];
      const valueInVND = amountInUSD * baseRates.VND;
      return [{ code: "VND", name: "Việt Nam Đồng", value: valueInVND }];
    }
    return null;
  }, [finalDenomination, finalCurrency, ratesData]);

  const handleCopyJSON = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(currentItem, null, 2));
      toast.success(lang === "VI" ? "Đã chép JSON" : "JSON copied.");
    } catch (error) {
      toast.error(lang === "VI" ? "Lỗi khi sao chép" : "Unable to copy JSON.");
    }
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(currentItem, null, 2)], {
      type: "application/json",
    });
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = `banknote_result_${activeTab + 1}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  };

  if (!rawResult) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 gap-5 p-6 transition-colors">
        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-slate-400 dark:text-slate-500" />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-black text-slate-900 dark:text-slate-100">
            {t.noResult}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md">
            {t.noResultDesc}
          </p>
        </div>
        <button
          onClick={() => navigate("/recognize")}
          className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition"
        >
          {t.backWorkspace}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 p-4 md:p-8 font-sans transition-colors">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t.title}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              {t.subtitle}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {/* 🌟 NÚT FEEDBACK Ở ĐÂY */}
            <button
              onClick={() =>
                navigate("/feedback", { state: { resultId: currentItem.id } })
              }
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 transition-colors"
            >
              <MessageSquare className="w-4 h-4" /> {t.feedback}
            </button>

            <button
              onClick={() => navigate("/history")}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 transition-colors"
            >
              <History className="w-4 h-4" /> {t.viewHistory}
            </button>
            <button
              onClick={() => navigate("/recognize")}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-teal-600 text-white font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-teal-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> {t.scanAnother}
            </button>
          </div>
        </div>

        {/* TABS */}
        {resultsArray.length > 1 && (
          <div className="flex gap-2 mb-8 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-px">
            {resultsArray.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === idx ? "border-teal-600 text-teal-700 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-900/30 rounded-t-lg" : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-t-lg"}`}
              >
                Banknote Object {idx + 1}
              </button>
            ))}
          </div>
        )}

        {/* HERO CARD */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-8 transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-5 h-full">
            <div className="md:col-span-2 bg-slate-100 dark:bg-slate-900/50 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
              {previewImage ? (
                <img
                  src={previewImage}
                  className="w-full max-h-80 object-contain rounded-xl drop-shadow-sm"
                  alt="Banknote preview"
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center text-slate-400 dark:text-slate-500 font-medium bg-white/60 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                  No image preview
                </div>
              )}
              <span className="mt-6 text-xs font-bold uppercase tracking-wider bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-1.5 rounded-full text-slate-500 dark:text-slate-300">
                {t.uploadTitle}
              </span>
            </div>

            <div className="md:col-span-3 p-8 md:p-10 flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {t.finalDecision}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getConsensusBadgeClass(consensus)}`}
                >
                  {getConsensusStatusLabel(consensus, lang)}
                </span>
              </div>
              <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                {finalDenomination}
              </h2>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    {t.lblCountry}
                  </p>
                  <p className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                    {finalCountry}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    {t.lblMaterial}
                  </p>
                  <p className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                    {finalMaterial}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    {t.lblCurrency}
                  </p>
                  <p className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                    {finalCurrency}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    {t.lblConsensus}
                  </p>
                  <p className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                    {matchedAgents || "N/A"}/3 {t.agents}
                  </p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                  {t.referee}
                </p>
                <div className="prose prose-slate dark:prose-invert max-w-none leading-relaxed text-slate-700 dark:text-slate-300 text-sm">
                  <ReactMarkdown>
                    {stripMarkdownSymbols(consensusText)}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <SummaryCard label={t.lblDenomination} value={finalDenomination} />
          <SummaryCard label={t.lblCountry} value={finalCountry} />
          <SummaryCard label={t.lblMaterial} value={finalMaterial} />
          <SummaryCard label={t.lblOrigin} value={finalOrigin} />
        </div>

        {/* CURRENCY EXCHANGE */}
        {exchangeResults && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 mb-10 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {t.exchangeTitle}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {t.exchangeDesc}
                </p>
              </div>
              <button
                onClick={() => navigate("/exchange")}
                className="text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 px-3 py-1.5 rounded-lg border border-teal-100 dark:border-teal-500/20 uppercase tracking-wider hover:bg-teal-100 dark:hover:bg-teal-500/20 transition-colors"
              >
                {t.fullConverter}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {exchangeResults.map((res) => (
                <div
                  key={res.code}
                  className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl flex justify-between items-center"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      {res.name}
                    </span>
                    <span className="font-mono text-xs text-slate-400 dark:text-slate-500">
                      {res.code}
                    </span>
                  </div>
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    {res.code === "VND"
                      ? new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(res.value)
                      : new Intl.NumberFormat("en-US", {
                          maximumFractionDigits: 2,
                        }).format(res.value) +
                        " " +
                        res.code}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AGGREGATOR DECISION */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 mb-10 transition-colors">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {t.aggDecision}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {t.aggDesc}
              </p>
            </div>
            <span
              className={`w-fit px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${getConsensusBadgeClass(consensus)}`}
            >
              {consensus?.method || "majority_vote"}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DecisionItem
              label="Agent 1: ML/DL"
              value={getAgentDenomination(agents.ml_dl)}
              status={
                getAgentDenomination(agents.ml_dl) === finalDenomination
                  ? "matched"
                  : "different"
              }
              t={t}
            />
            <DecisionItem
              label="Agent 2: LLM/API"
              value={getAgentDenomination(agents.llm_api)}
              status={
                getAgentDenomination(agents.llm_api) === finalDenomination
                  ? "matched"
                  : "different"
              }
              t={t}
            />
            <DecisionItem
              label="Agent 3: Visual Search"
              value={getAgentDenomination(agents.visual_search)}
              status={
                getAgentDenomination(agents.visual_search) === finalDenomination
                  ? "matched"
                  : "different"
              }
              t={t}
            />
            <DecisionItem
              label={t.final}
              value={finalDenomination}
              status="final"
              t={t}
            />
          </div>
        </div>

        {/* AGENT COMPARISON */}
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6">
          {t.agentCompare}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <AgentCard
            agentKey="Agent 1"
            title={lang === "VI" ? "Phân tích ML/DL" : "ML/DL Analysis"}
            method="Machine Learning / Deep Learning"
            data={agents.ml_dl}
            finalDenomination={finalDenomination}
            t={t}
          />
          <AgentCard
            agentKey="Agent 2"
            title={lang === "VI" ? "Phân tích LLM/API" : "LLM/API Analysis"}
            method="Language Model / API Reasoning"
            data={agents.llm_api}
            finalDenomination={finalDenomination}
            t={t}
          />
          <AgentCard
            agentKey="Agent 3"
            title={lang === "VI" ? "Tìm kiếm Ảnh" : "Visual Search"}
            method="Google Lens / Visual Search"
            data={agents.visual_search}
            finalDenomination={finalDenomination}
            t={t}
          />
        </div>

        {/* DEBATE LOG */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm mb-10 transition-colors">
          <div className="flex justify-between items-center gap-4">
            <div>
              <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">
                {t.fullLogTitle}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {t.fullLogDesc}
              </p>
            </div>
            <button
              onClick={() => setShowRawLog(!showRawLog)}
              className="inline-flex items-center gap-2 text-teal-700 dark:text-teal-400 font-bold text-sm bg-teal-50 dark:bg-teal-500/10 px-4 py-2 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-500/20 transition-colors"
            >
              {showRawLog ? (
                <>
                  {t.hideLog}
                  <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  {t.viewLog}
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
          {showRawLog && (
            <div className="mt-6 p-6 bg-slate-900 dark:bg-slate-950 text-slate-300 dark:text-slate-400 rounded-2xl overflow-auto max-h-[420px] text-sm prose prose-invert max-w-none leading-loose border border-slate-800 dark:border-slate-800/50">
              <ReactMarkdown>{safeDebateLog}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* JSON OUTPUT */}
        <div className="bg-slate-900 dark:bg-slate-950 p-6 md:p-8 rounded-3xl border border-slate-800 dark:border-slate-900 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-800 dark:border-slate-800/50 pb-4">
            <div className="flex items-center gap-3">
              <FileJson className="w-5 h-5 text-teal-400" />
              <h3 className="text-white font-bold text-lg">{t.jsonTitle}</h3>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCopyJSON}
                className="inline-flex items-center gap-2 text-slate-300 hover:text-white font-semibold text-sm transition-colors bg-slate-800 dark:bg-slate-900 px-4 py-2 rounded-xl"
              >
                <Copy className="w-4 h-4" /> {t.copy}
              </button>
              <button
                onClick={handleDownloadJSON}
                className="inline-flex items-center gap-2 text-slate-300 hover:text-white font-semibold text-sm transition-colors bg-slate-800 dark:bg-slate-900 px-4 py-2 rounded-xl"
              >
                <Download className="w-4 h-4" /> {t.download}
              </button>
            </div>
          </div>
          <pre className="text-xs text-teal-300 dark:text-teal-400 overflow-auto whitespace-pre-wrap font-mono leading-relaxed max-h-[360px]">
            {JSON.stringify(currentItem, null, 2)}
          </pre>
        </div>

        {/* NAV BUTTONS */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {t.continueTitle}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t.continueDesc}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/recognize")}
              className="px-5 py-3 bg-slate-900 dark:bg-teal-600 text-white font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-teal-700 transition-colors"
            >
              {t.btnScanAnother}
            </button>
            <button
              onClick={() => navigate("/history")}
              className="px-5 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {t.btnViewHistory}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
