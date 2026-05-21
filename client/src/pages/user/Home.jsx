import React from "react";
import { Link } from "react-router-dom";
import {
  ScanLine,
  Zap,
  Layers3,
  ShieldCheck,
  ChevronRight,
  Cpu,
  BotMessageSquare,
  SearchCheck,
  GitMerge,
  DatabaseZap,
  Activity,
  CodeXml,
} from "lucide-react";

import Header from "../../components/layout/Header";
import { useAppStore } from "../../store/appStore";
import { useAuthStore } from "../../store/authStore";

// ==========================================
// COMPONENT: MÔ PHỎNG WORKSPACE
// ==========================================
const HeroVisualMockup = ({ isDark }) => (
  <div
    className={`relative border shadow-2xl rounded-3xl p-8 transition-transform hover:scale-[1.01] ${isDark ? "bg-slate-900 border-slate-800 shadow-slate-900/50" : "bg-white border-slate-200 shadow-slate-200/50"}`}
  >
    <div className="absolute -inset-10 bg-teal-400/10 blur-3xl rounded-full -z-10" />
    <div
      className={`flex items-center justify-between pb-6 border-b mb-6 ${isDark ? "border-slate-800" : "border-slate-100"}`}
    >
      <div className="flex items-center gap-x-3">
        <Layers3 className="w-7 h-7 text-[#009688]" />
        <div>
          <h4
            className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-950"}`}
          >
            BanknoteAI Workspace
          </h4>
          <p className="text-xs text-slate-500 font-medium">
            Multi-Agent Engine - LIVE
          </p>
        </div>
      </div>
      <span
        className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-x-1.5 border ${isDark ? "bg-teal-900/30 border-teal-800 text-teal-400" : "bg-teal-50 border-teal-100 text-[#009688]"}`}
      >
        <Zap className="w-4 h-4 animate-pulse" /> Processing
      </span>
    </div>

    <div className="grid md:grid-cols-3 gap-8">
      {/* Khối Upload */}
      <div
        className={`md:col-span-1 flex flex-col gap-y-6 border p-6 rounded-xl ${isDark ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-100"}`}
      >
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDark ? "border-slate-600 text-slate-400 hover:border-[#009688] hover:text-[#009688]" : "border-slate-300 text-slate-600 hover:border-[#009688] hover:text-[#009688]"}`}
        >
          <ScanLine className="w-12 h-12 mx-auto mb-3" />
          <span className="text-sm font-bold block">Upload Note</span>
        </div>
        <div className="space-y-3">
          <h5
            className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}
          >
            Consensus Status
          </h5>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
            <span className="text-xs text-slate-500">
              Aggregating 3 outputs...
            </span>
          </div>
        </div>
      </div>

      {/* Khối Kết quả (Mô phỏng kiến trúc mới) */}
      <div className="md:col-span-2 grid grid-cols-2 gap-6">
        <div
          className={`p-5 rounded-xl border shadow-sm col-span-2 flex items-center gap-x-4 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}
        >
          <div
            className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1 w-20 ${isDark ? "bg-teal-900/30 border-teal-800 text-teal-400" : "bg-teal-50 border-teal-100 text-[#009688]"}`}
          >
            <span className="text-xs font-bold border-b border-teal-200/50 pb-1 w-full text-center">
              ML/DL
            </span>
            <span className="text-xs font-bold border-b border-teal-200/50 pb-1 w-full text-center">
              LLM
            </span>
            <span className="text-xs font-bold">Lens</span>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Majority Consensus
            </p>
            <h3
              className={`text-xl md:text-2xl font-black tracking-tight mt-1 ${isDark ? "text-teal-400" : "text-[#009688]"}`}
            >
              Consistent Results
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              3/3 Agents agree on data.
            </p>
          </div>
        </div>

        <div
          className={`p-5 rounded-xl border shadow-sm flex flex-col gap-y-1.5 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}
        >
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            Detected Value
          </p>
          <span
            className={`text-3xl lg:text-4xl font-black tracking-tighter ${isDark ? "text-white" : "text-slate-950"}`}
          >
            500k <span className="text-xl">VND</span>
          </span>
        </div>
        <div
          className={`p-5 rounded-xl border shadow-sm flex flex-col gap-y-1.5 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}
        >
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            Converted (USD)
          </p>
          <span
            className={`text-3xl lg:text-4xl font-black tracking-tighter ${isDark ? "text-blue-400" : "text-blue-600"}`}
          >
            ~ $19.65
          </span>
        </div>
      </div>
    </div>
  </div>
);

// ==========================================
// COMPONENT CHÍNH: TRANG CHỦ
// ==========================================
export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const { lang, theme } = useAppStore();
  const isDark = theme === "dark";

  // TỪ ĐIỂN DỊCH THUẬT (Không dùng từ mạnh, mô tả đúng kiến trúc)
  const content = {
    EN: {
      badge: "MULTI-AGENT ENGINE V2.0",
      h1_1: "Intelligent Analysis for",
      h1_2: "Global Banknotes",
      desc: "Upload an image of a banknote and let our Multi-Agent AI system analyze visual features, verify information across diverse models, and provide a comprehensive, consensus-based result.",
      btn_launch: "Launch Workspace",
      btn_arch: "System Architecture",
      f_title: "Comprehensive Recognition Architecture",
      f_desc:
        "We utilize a robust workflow combining Machine Learning, Large Language Models, and Visual Search to cross-verify and aggregate accurate banknote information.",
      api_title: "Reliable Integration API",
      api_desc:
        "Integrate our consensus-based banknote recognition engine into your applications, offering structured JSON results including denomination, origin, and descriptions.",
      cta_title: "Experience intelligent banknote analysis today.",
      cta_btn: "Create Free Account",
    },
    VI: {
      badge: "LÕI PHÂN TÍCH ĐA TÁC TỬ V2.0",
      h1_1: "Phân tích Thông minh",
      h1_2: "Tiền giấy Toàn cầu",
      desc: "Tải lên hình ảnh tờ tiền và để hệ thống AI Đa tác tử phân tích đặc điểm trực quan, đối chiếu thông tin qua nhiều mô hình độc lập, và trả về kết quả tổng hợp đáng tin cậy.",
      btn_launch: "Mở Không gian quét",
      btn_arch: "Kiến trúc Hệ thống",
      f_title: "Kiến trúc Phân tích Đa chiều",
      f_desc:
        "Sử dụng quy trình kết hợp Học máy (ML/DL), Mô hình Ngôn ngữ Lớn (LLMs API), và Tìm kiếm Thị giác (Lens) để đối chiếu chéo và biểu quyết khách quan.",
      api_title: "API Tích hợp Đáng tin cậy",
      api_desc:
        "Tích hợp lõi nhận diện tiền giấy vào hệ thống của bạn, nhận kết quả JSON cấu trúc tốt bao gồm thông tin, mệnh giá, xuất xứ và mô tả chi tiết.",
      cta_title: "Trải nghiệm phân tích tiền giấy thông minh ngay hôm nay.",
      cta_btn: "Tạo tài khoản Miễn phí",
    },
  };

  const t = content[lang] || content["EN"]; // Fallback an toàn

  const features = [
    {
      icon: Cpu,
      title:
        lang === "VI" ? "Tác tử Học máy (ML/DL)" : "Machine Learning Agent",
      desc:
        lang === "VI"
          ? "Mô hình chuyên biệt phân tích các đặc trưng hình ảnh đặc thù của tiền giấy."
          : "Specialized models analyze specific visual characteristics of banknotes.",
      color: "text-teal-500",
    },
    {
      icon: BotMessageSquare,
      title: lang === "VI" ? "Tác tử Ngữ nghĩa (LLMs)" : "Semantic LLM Agent",
      desc:
        lang === "VI"
          ? "Truy xuất và đối chiếu thông tin văn bản, bối cảnh lịch sử trên tờ tiền qua API."
          : "Retrieves and cross-references text and contextual information via API.",
      color: "text-violet-500",
    },
    {
      icon: SearchCheck,
      title: lang === "VI" ? "Tác tử Thị giác (Lens)" : "Visual Search Agent",
      desc:
        lang === "VI"
          ? "Sử dụng dữ liệu tìm kiếm hình ảnh diện rộng để củng cố cơ sở dữ liệu nhận diện."
          : "Leverages broad visual search data to reinforce recognition confidence.",
      color: "text-blue-500",
    },
    {
      icon: GitMerge,
      title:
        lang === "VI" ? "Cơ chế Đồng thuận (Voting)" : "Consensus Mechanism",
      desc:
        lang === "VI"
          ? "Agent tổng hợp biểu quyết kết quả từ 3 nguồn. Chạy lại tiến trình nếu có xung đột."
          : "Aggregator votes on results from 3 sources. Retries process upon conflicts.",
      color: "text-amber-500",
    },
    {
      icon: DatabaseZap,
      title:
        lang === "VI" ? "Cấu trúc JSON Trực quan" : "Structured JSON Output",
      desc:
        lang === "VI"
          ? "Trả về định dạng rõ ràng: Thông tin, Mệnh giá, Xuất xứ, Mô tả, Quốc gia."
          : "Returns clear format: Info, Denomination, Origin, Description, Country.",
      color: "text-[#009688]",
    },
    {
      icon: Activity,
      title: lang === "VI" ? "Đồng bộ Tỷ giá" : "Exchange Sync",
      desc:
        lang === "VI"
          ? "Hỗ trợ tính toán quy đổi giá trị mệnh giá nhận diện được theo thời gian thực."
          : "Calculates and converts detected denomination values using real-time rates.",
      color: "text-slate-500",
    },
  ];

  const stats = [
    {
      value: "3",
      label: lang === "VI" ? "Tác tử Độc lập" : "Independent Agents",
    },
    {
      value: "JSON",
      label: lang === "VI" ? "Đầu ra Cấu trúc" : "Structured Data",
    },
    {
      value: "Voting",
      label: lang === "VI" ? "Cơ chế Biểu quyết" : "Consensus Logic",
    },
    {
      value: "API",
      label: lang === "VI" ? "Sẵn sàng Tích hợp" : "Ready Integration",
    },
  ];

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 ${isDark ? "bg-slate-950 text-slate-200" : "bg-slate-50 text-slate-900"}`}
    >
      

     
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div
          className={`absolute top-1/2 left-1/4 w-80 h-80 rounded-full blur-3xl -z-10 ${isDark ? "bg-teal-900/30" : "bg-teal-300/20"}`}
        />
        <div
          className={`absolute top-0 right-10 w-96 h-96 rounded-full blur-3xl -z-10 ${isDark ? "bg-blue-900/20" : "bg-blue-300/20"}`}
        />

        <div className="max-w-7xl mx-auto px-5 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 relative z-10">
            <span
              className={`inline-flex items-center gap-x-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${isDark ? "bg-slate-800 text-teal-400 border border-slate-700" : "bg-slate-950 text-white"}`}
            >
              <Layers3 className="w-4 h-4 text-[#009688]" /> {t.badge}
            </span>

            <h1
              className={`text-5xl lg:text-6xl font-black tracking-tighter leading-[1.1] ${isDark ? "text-white" : "text-slate-950"}`}
            >
              {t.h1_1} <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#009688] via-teal-500 to-blue-600">
                {t.h1_2}
              </span>
            </h1>

            <p
              className={`text-lg max-w-2xl leading-relaxed font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}
            >
              {t.desc}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
              <Link
                to={isAuthenticated ? "/recognize" : "/auth/login"}
                className="flex justify-center items-center gap-x-2 bg-gradient-to-r from-[#009688] to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:opacity-90 transition-all shadow-lg shadow-teal-900/20 group"
              >
                {t.btn_launch}{" "}
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/info"
                className={`flex justify-center items-center gap-x-2 border-2 px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-sm ${isDark ? "bg-slate-900 border-slate-700 text-white hover:bg-slate-800" : "bg-white border-slate-200 text-slate-900 hover:bg-slate-50"}`}
              >
                {t.btn_arch}
              </Link>
            </div>

            <div
              className={`flex flex-wrap justify-center lg:justify-start gap-6 mt-8 pt-8 border-t w-full max-w-lg ${isDark ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-500"}`}
            >
              <span className="font-semibold text-sm">
                ✓ Tri-Agent Verification
              </span>
              <span className="font-semibold text-sm">✓ JSON Output</span>
              <span className="font-semibold text-sm">✓ Voting Consensus</span>
            </div>
          </div>

          <div className="flex-1 relative w-full lg:max-w-xl">
            <HeroVisualMockup isDark={isDark} />
          </div>
        </div>
      </section>

      {/* ⭐ ARCHITECTURE FEATURES GRID */}
      <section
        className={`py-24 border-y ${isDark ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-100 shadow-inner"}`}
      >
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-16">
            <h2
              className={`text-3xl md:text-4xl font-black tracking-tight mb-4 ${isDark ? "text-white" : "text-slate-950"}`}
            >
              {t.f_title}
            </h2>
            <p
              className={`text-lg max-w-2xl mx-auto ${isDark ? "text-slate-400" : "text-slate-600"}`}
            >
              {t.f_desc}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((item, idx) => (
              <div
                key={idx}
                className={`p-8 rounded-2xl border shadow-sm transition-transform hover:-translate-y-1 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 hover:shadow-md"}`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner ${isDark ? "bg-slate-800 border border-slate-700" : "bg-slate-50 border border-slate-100"}`}
                >
                  <item.icon className={`w-7 h-7 ${item.color}`} />
                </div>
                <h3
                  className={`text-xl font-bold mb-3 ${isDark ? "text-white" : "text-slate-950"}`}
                >
                  {item.title}
                </h3>
                <p
                  className={`text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⭐ STATS SECTION (Focus on System Capabilities) */}
      <section className="bg-slate-950 py-20 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-blue-600/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
            {stats.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-8 rounded-3xl shadow-lg flex flex-col items-center justify-center text-center"
              >
                <span className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-3">
                  {item.value}
                </span>
                <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⭐ API SECTION (Showcasing JSON Output) */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-5">
          <div
            className={`rounded-[2.5rem] p-10 md:p-16 grid md:grid-cols-2 gap-12 items-center border shadow-2xl relative overflow-hidden ${isDark ? "bg-slate-900 border-slate-800 shadow-slate-950/50" : "bg-slate-900 border-slate-800 shadow-slate-400/20"}`}
          >
            <div className="space-y-6 z-10">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-6">
                <CodeXml className="w-7 h-7 text-teal-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                {t.api_title}
              </h2>
              <p className="text-base text-slate-300 leading-relaxed">
                {t.api_desc}
              </p>
              <Link
                to="/info"
                className="inline-block bg-[#009688] text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-700 transition-colors"
              >
                Read Documentation
              </Link>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-inner font-mono text-sm text-teal-400 overflow-x-auto z-10">
              <pre>
                {`{
  "status": "success",
  "consensus_reached": true,
  "data": {
    "info": "Banknote recognized via Tri-Agent",
    "denomination": 500000,
    "origin": "State Bank of Vietnam",
    "description": "Polymer, Ho Chi Minh portrait",
    "country": "Vietnam"
  },
  "agent_responses": {
    "agent_1_ml": "500k VND",
    "agent_2_llm": "500k VND",
    "agent_3_lens": "500k VND"
  }
}`}
              </pre>
            </div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 blur-[100px] rounded-full pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ⭐ FINAL CTA */}
      <section
        className={`py-24 border-t ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}
      >
        <div className="max-w-4xl mx-auto px-5 text-center space-y-8">
          <h2
            className={`text-3xl md:text-4xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-950"}`}
          >
            {t.cta_title}
          </h2>
          <div className="flex justify-center gap-4">
            <Link
              to="/auth/register"
              className="bg-gradient-to-r from-[#009688] to-blue-600 text-white px-10 py-4 rounded-xl text-lg font-bold hover:opacity-90 transition-all shadow-lg shadow-teal-900/20"
            >
              {t.cta_btn}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
