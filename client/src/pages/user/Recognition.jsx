import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

import { useAuthStore } from "../../store/authStore";
import { useLanguageStore } from "../../store/languageStore";
import { useRecognitionStore } from "../../store/recognitionStore";

import {
  Upload,
  X,
  ChevronRight,
  Loader2,
  Coins,
  Image as ImageIcon,
  Cpu,
  BotMessageSquare,
  SearchCheck,
  GitMerge,
  FileJson,
  FileImage,
  Lightbulb,
  AlertCircle,
  ShieldCheck,
  Wallet,
} from "lucide-react";

export default function Recognition() {
  const { user, token } = useAuthStore();
  const { lang } = useLanguageStore();
  const { currentScanSession, setScanSession, clearScanSession } =
    useRecognitionStore();

  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileMeta, setSelectedFileMeta] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    currentScanSession?.previewUrl || null,
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const hasEnoughTokens = Number(user?.token_balance || 0) > 0;
  const hasExistingSession = Boolean(
    currentScanSession?.result && !selectedFile,
  );

  const t = {
    EN: {
      title: "Banknote Recognition Workspace",
      subtitle:
        "Upload a Southeast Asian banknote image and compare results from multiple analysis agents.",
      tokenBal: "Token Balance",
      cost: "Cost: 1 Token per scan",
      uploadTitle: "Upload banknote image",
      uploadDesc: "Click or drag a clear banknote image here",
      uploadHint: "Supports JPG, PNG, WEBP up to 5MB",
      flowTitle: "Multi-Agent Flow",
      stepInput: "Input Image",
      stepInputDesc: "Preprocessing and cropping",
      parallelLabel: "Parallel Analysis",
      agent1Title: "ML/DL Analysis",
      agent1Desc: "Detects visual features and predicted denomination.",
      agent2Title: "LLM/API Analysis",
      agent2Desc: "Reads visible text and checks contextual information.",
      agent3Title: "Visual Search",
      agent3Desc: "Compares visual evidence with external references.",
      stepAgg: "Aggregator",
      stepAggDesc: "Majority voting and consensus",
      stepJson: "Structured Result",
      stepJsonDesc: "Final JSON output",
      btnAnalyze: "Start analysis",
      btnAnalyzing: "Analyzing...",
      btnViewOld: "View previous result",
      btnBuyToken: "Buy tokens",
      errNoToken: "Not enough tokens",
      errorSize: "File exceeds the 5MB limit.",
      errorSelect: "Please select an image first.",
      errorAPI: "Analysis failed. Please try again later.",
      tipsTitle: "Image Tips",
      tip1: "Use a clear, well-lit image",
      tip2: "Avoid glare or heavy blur",
      tip3: "Keep the full banknote inside the frame",
      tip4: "For unclear notes, review the final result manually",
      workflowTitle: "Cross-checking workflow",
      workflowDesc:
        "The system compares multiple outputs before generating a final result.",
      supportedRegion: "Southeast Asia",
      outputType: "Agent results + JSON",
      fileSelected: "Selected file",
      clear: "Clear",
      replace: "Replace image",
    },
    VI: {
      title: "Không gian Nhận diện Tiền",
      subtitle:
        "Tải ảnh tờ tiền Đông Nam Á lên để hệ thống so sánh kết quả từ nhiều tác nhân phân tích.",
      tokenBal: "Số dư Token",
      cost: "Chi phí: 1 Token / lần quét",
      uploadTitle: "Tải ảnh tờ tiền",
      uploadDesc: "Nhấp hoặc kéo thả ảnh tờ tiền rõ nét vào đây",
      uploadHint: "Hỗ trợ JPG, PNG, WEBP tối đa 5MB",
      flowTitle: "Luồng phân tích đa tác nhân",
      stepInput: "Ảnh đầu vào",
      stepInputDesc: "Tiền xử lý và cắt ảnh",
      parallelLabel: "Phân tích song song",
      agent1Title: "Phân tích ML/DL",
      agent1Desc: "Trích xuất đặc trưng ảnh và dự đoán mệnh giá.",
      agent2Title: "Phân tích LLM/API",
      agent2Desc: "Đọc chữ hiển thị và kiểm tra thông tin ngữ cảnh.",
      agent3Title: "Tìm kiếm thị giác",
      agent3Desc: "Đối chiếu hình ảnh với nguồn tham chiếu bên ngoài.",
      stepAgg: "Bộ tổng hợp",
      stepAggDesc: "Biểu quyết đa số và chốt kết quả",
      stepJson: "Dữ liệu JSON",
      stepJsonDesc: "Xuất dữ liệu cấu trúc",
      btnAnalyze: "Bắt đầu phân tích",
      btnAnalyzing: "Đang xử lý...",
      btnViewOld: "Xem lại kết quả cũ",
      btnBuyToken: "Mua Token",
      errNoToken: "Không đủ Token",
      errorSize: "Dung lượng tệp vượt quá giới hạn 5MB.",
      errorSelect: "Vui lòng chọn hình ảnh trước.",
      errorAPI: "Phân tích thất bại. Vui lòng thử lại sau.",
      tipsTitle: "Mẹo chụp ảnh",
      tip1: "Sử dụng ảnh rõ nét, đủ sáng",
      tip2: "Tránh chói sáng hoặc bị mờ",
      tip3: "Giữ trọn vẹn tờ tiền trong khung hình",
      tip4: "Với ảnh khó nhận diện, hãy kiểm tra lại kết quả cuối",
      workflowTitle: "Quy trình đối chiếu chéo",
      workflowDesc:
        "Hệ thống so sánh nhiều kết quả trước khi đưa ra kết luận cuối cùng.",
      supportedRegion: "Đông Nam Á",
      outputType: "Kết quả tác nhân + JSON",
      fileSelected: "Tệp đã chọn",
      clear: "Xóa",
      replace: "Đổi ảnh",
    },
  }[lang || "EN"];

  const formatFileSize = (size) => {
    if (!size) return "0 KB";
    const kb = size / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  };

  const processFile = (file) => {
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, and WEBP images are supported.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t.errorSize);
      return;
    }

    const newPreview = URL.createObjectURL(file);
    setSelectedFile(file);
    setSelectedFileMeta({
      name: file.name,
      size: file.size,
      type: file.type,
    });
    setPreviewUrl(newPreview);
    clearScanSession();
  };

  const handleFileSelect = (e) => {
    processFile(e.target.files?.[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setSelectedFileMeta(null);
    setPreviewUrl(null);
    clearScanSession();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyze = async () => {
    if (hasExistingSession) {
      navigate("/result", {
        state: {
          scanSession: currentScanSession,
        },
      });
      return;
    }

    if (!selectedFile) {
      toast.error(t.errorSelect);
      return;
    }

    if (!hasEnoughTokens) {
      toast.error(t.errNoToken);
      return;
    }

    setIsAnalyzing(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/recognition/scan",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("SCAN API RESPONSE:", res.data);

      const session = {
        previewUrl,
        fileName: selectedFileMeta?.name || selectedFile?.name,
        result: res.data,
      };

      setScanSession(session);

      if (user) {
        useAuthStore.setState({
          user: {
            ...user,
            token_balance: Math.max(0, Number(user.token_balance || 0) - 1),
          },
        });
      }

      toast.success("Analysis complete.");

      navigate("/result", {
        state: {
          scanSession: session,
        },
      });
    } catch (error) {
      console.error("SCAN API ERROR:", error);
      const errorMsg = error.response?.data?.detail || t.errorAPI;
      toast.error(errorMsg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const canAnalyze =
    !isAnalyzing && ((selectedFile && hasEnoughTokens) || hasExistingSession);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-2">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {t.title}
            </h1>
            <p className="text-slate-500 mt-2 leading-relaxed">{t.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-3">
            <div
              className={`flex items-center gap-3 px-5 py-3 bg-white border rounded-2xl shadow-sm ${
                !hasEnoughTokens
                  ? "border-amber-200 bg-amber-50/60"
                  : "border-slate-200"
              }`}
            >
              <div className="bg-teal-100/70 p-2 rounded-xl">
                <Coins className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {t.tokenBal}
                </p>
                <p
                  className={`text-xl font-black leading-none ${
                    !hasEnoughTokens ? "text-amber-600" : "text-slate-900"
                  }`}
                >
                  {user?.token_balance || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {!hasEnoughTokens && !hasExistingSession && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900">{t.errNoToken}</p>
                <p className="text-sm text-amber-700">
                  You need at least 1 token to run a banknote scan.
                </p>
              </div>
            </div>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition"
            >
              <Wallet className="w-4 h-4" />
              {t.btnBuyToken}
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
          <div className="xl:col-span-7 space-y-6">
            <div className="bg-white p-2 rounded-[2rem] shadow-sm border border-slate-200">
              <div className="p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                  <h2 className="text-xl font-bold text-slate-900">
                    {t.uploadTitle}
                  </h2>
                  <span className="w-fit text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    JPG, PNG, WEBP
                  </span>
                </div>

                {!previewUrl ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-[1.5rem] p-8 md:p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[400px] ${
                      isDragging
                        ? "border-teal-500 bg-teal-50 scale-[1.01]"
                        : "border-slate-200 bg-slate-50 hover:border-teal-300 hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-center mb-5">
                      <Upload
                        className={`w-7 h-7 ${
                          isDragging ? "text-teal-600" : "text-slate-400"
                        }`}
                      />
                    </div>
                    <p className="text-lg font-bold text-slate-700 mb-1">
                      {t.uploadDesc}
                    </p>
                    <p className="text-sm text-slate-400 font-medium">
                      {t.uploadHint}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative rounded-[1.5rem] overflow-hidden border border-slate-200 bg-slate-100 min-h-[400px] flex justify-center items-center shadow-inner">
                      <img
                        src={previewUrl}
                        alt="Banknote preview"
                        className={`object-contain max-h-[500px] w-full transition-opacity duration-500 ${
                          isAnalyzing
                            ? "opacity-30 grayscale-[50%]"
                            : "opacity-100"
                        }`}
                      />

                      {isAnalyzing && (
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                          <div className="absolute inset-0 bg-teal-900/5 mix-blend-overlay" />
                          <div className="absolute w-full h-1 bg-teal-500 shadow-[0_0_20px_rgba(20,184,166,1)] animate-[scan_2s_ease-in-out_infinite]" />
                        </div>
                      )}

                      {!isAnalyzing && (
                        <button
                          onClick={handleClear}
                          className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur text-slate-600 hover:text-rose-600 hover:bg-white rounded-xl shadow-sm border border-slate-100 transition-all active:scale-95"
                          title={t.clear}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    {selectedFileMeta && (
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {t.fileSelected}
                          </p>
                          <p className="text-sm font-bold text-slate-800 mt-1">
                            {selectedFileMeta.name}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {formatFileSize(selectedFileMeta.size)}
                          </p>
                        </div>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isAnalyzing}
                          className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                          {t.replace}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />

                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    {t.cost}
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {!hasEnoughTokens && !hasExistingSession && (
                      <Link
                        to="/pricing"
                        className="text-sm font-bold text-amber-600 hover:text-amber-700 underline px-2 whitespace-nowrap"
                      >
                        {t.btnBuyToken}
                      </Link>
                    )}

                    <button
                      onClick={handleAnalyze}
                      disabled={!canAnalyze}
                      className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                        !canAnalyze
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-slate-900 hover:bg-slate-800 text-white shadow-md active:scale-[0.98]"
                      }`}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {t.btnAnalyzing}
                        </>
                      ) : hasExistingSession ? (
                        <>
                          {t.btnViewOld}
                          <ChevronRight className="w-5 h-5" />
                        </>
                      ) : !hasEnoughTokens ? (
                        <>{t.errNoToken}</>
                      ) : (
                        <>
                          {t.btnAnalyze}
                          <ChevronRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
              <h3 className="text-lg font-black text-slate-900 mb-6">
                {t.flowTitle}
              </h3>

              <div className="flex flex-col items-center">
                <div
                  className={`w-full max-w-[230px] p-3 rounded-xl border flex items-center gap-3 transition-colors z-10 bg-white ${
                    isAnalyzing
                      ? "border-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.2)]"
                      : "border-slate-200 shadow-sm"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      isAnalyzing
                        ? "bg-teal-50 text-teal-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <FileImage size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      {t.stepInput}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {t.stepInputDesc}
                    </p>
                  </div>
                </div>

                <div
                  className={`w-px h-6 ${
                    isAnalyzing ? "bg-teal-400" : "bg-slate-200"
                  }`}
                />

                <div
                  className={`w-full border-2 border-dashed rounded-2xl p-4 relative transition-colors ${
                    isAnalyzing
                      ? "border-teal-300 bg-teal-50/30"
                      : "border-slate-200 bg-slate-50/50"
                  }`}
                >
                  <span
                    className={`absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 bg-white text-[10px] font-bold uppercase tracking-wider rounded-full border whitespace-nowrap ${
                      isAnalyzing
                        ? "text-teal-600 border-teal-200"
                        : "text-slate-400 border-slate-200"
                    }`}
                  >
                    {t.parallelLabel}
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                    <AgentFlowNode
                      active={isAnalyzing}
                      color="blue"
                      icon={<Cpu size={18} />}
                      title={t.agent1Title}
                      desc={t.agent1Desc}
                    />
                    <AgentFlowNode
                      active={isAnalyzing}
                      color="violet"
                      icon={<BotMessageSquare size={18} />}
                      title={t.agent2Title}
                      desc={t.agent2Desc}
                    />
                    <AgentFlowNode
                      active={isAnalyzing}
                      color="amber"
                      icon={<SearchCheck size={18} />}
                      title={t.agent3Title}
                      desc={t.agent3Desc}
                    />
                  </div>
                </div>

                <div
                  className={`w-px h-6 ${
                    isAnalyzing ? "bg-teal-400" : "bg-slate-200"
                  }`}
                />

                <div
                  className={`w-full max-w-[240px] p-3 rounded-xl border flex items-center gap-3 transition-colors z-10 bg-white ${
                    isAnalyzing
                      ? "border-teal-500 shadow-sm"
                      : "border-slate-200 shadow-sm"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      isAnalyzing
                        ? "bg-teal-50 text-teal-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <GitMerge size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      {t.stepAgg}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {t.stepAggDesc}
                    </p>
                  </div>
                </div>

                <div
                  className={`w-px h-6 ${
                    isAnalyzing ? "bg-teal-400" : "bg-slate-200"
                  }`}
                />

                <div className="w-full max-w-[230px] p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 bg-slate-900">
                  <div className="p-2 rounded-lg bg-slate-800 text-teal-400">
                    <FileJson size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">
                      {t.stepJson}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {t.stepJsonDesc}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-100 p-6 rounded-[1.5rem] border border-slate-200 text-sm">
              <div className="flex items-center gap-2 font-bold text-slate-800 mb-2">
                <AlertCircle size={16} className="text-slate-500" />
                {t.workflowTitle}
              </div>
              <p className="text-slate-600 leading-relaxed">{t.workflowDesc}</p>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <MiniInfo label="Region" value={t.supportedRegion} />
                <MiniInfo label="Output" value={t.outputType} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h4 className="font-bold text-slate-900">{t.tipsTitle}</h4>
              </div>
              <ul className="space-y-3 text-sm text-slate-600">
                {[t.tip1, t.tip2, t.tip3, t.tip4].map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes scan {
              0% { top: 0%; opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { top: 100%; opacity: 0; }
            }
          `,
        }}
      />
    </div>
  );
}

function AgentFlowNode({ active, color, icon, title, desc }) {
  const colorClasses = {
    blue: active
      ? "border-blue-300 shadow-sm shadow-blue-100 text-blue-500"
      : "border-slate-200 text-slate-400",
    violet: active
      ? "border-violet-300 shadow-sm shadow-violet-100 text-violet-500"
      : "border-slate-200 text-slate-400",
    amber: active
      ? "border-amber-300 shadow-sm shadow-amber-100 text-amber-500"
      : "border-slate-200 text-slate-400",
  };

  return (
    <div
      className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all bg-white ${colorClasses[color]}`}
    >
      <div className={active ? "animate-pulse mb-2" : "mb-2"}>{icon}</div>
      <p className="text-[11px] font-bold text-slate-900 leading-tight">
        {title}
      </p>
      <p className="text-[9px] text-slate-500 mt-1 leading-tight">{desc}</p>
    </div>
  );
}

function MiniInfo({ label, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3">
      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
        {label}
      </p>
      <p className="text-sm font-bold text-slate-800 mt-1">{value}</p>
    </div>
  );
}
