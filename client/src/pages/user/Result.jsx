import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";

import { useRecognitionStore } from "../../store/recognitionStore";

import {
  Copy,
  Download,
  History,
  RotateCcw,
  FileJson,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";

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

const getAgentDenomination = (agent) => {
  return normalizeText(agent?.menh_gia || agent?.denomination || agent?.result);
};

const getAgentCountry = (agent) => {
  return normalizeText(agent?.quoc_gia || agent?.country);
};

const getAgentReasoning = (agent) => {
  return normalizeText(agent?.quan_diem || agent?.reasoning || agent?.error);
};

const getAgentMethod = (agent, fallback) => {
  return normalizeText(agent?.phuong_phap || agent?.method || fallback);
};

const getConsensusStatusLabel = (consensus) => {
  const status = consensus?.status;
  const matched = Number(consensus?.matched_agents || 0);

  if (String(status).toLowerCase().includes("re-analysis")) {
    return "Need re-analysis";
  }

  if (matched >= 3) return "High consensus";
  if (matched === 2) return "Consensus reached";
  if (status) return status;

  return "Consensus reached";
};

const getConsensusBadgeClass = (consensus) => {
  const label = getConsensusStatusLabel(consensus).toLowerCase();

  if (label.includes("high") || label.includes("reached")) {
    return "bg-teal-50 text-teal-700 border-teal-200";
  }

  if (label.includes("review") || label.includes("analysis")) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  return "bg-slate-100 text-slate-700 border-slate-200";
};

function AgentCard({ agentKey, title, method, data, finalDenomination }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!data) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <span className="inline-block px-2 py-1 bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider rounded mb-3">
          {agentKey}
        </span>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 mt-4">No agent data available.</p>
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
    <div className="flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start gap-4 mb-4">
        <div>
          <span className="inline-block px-2 py-1 bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider rounded mb-2">
            {agentKey}
          </span>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 mt-1">
            {getAgentMethod(data, method)}
          </p>
        </div>

        {isMatched ? (
          <span className="px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-100 text-xs font-bold uppercase tracking-wider rounded whitespace-nowrap">
            Matched
          </span>
        ) : (
          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-100 text-xs font-bold uppercase tracking-wider rounded whitespace-nowrap">
            Different
          </span>
        )}
      </div>

      <div className="space-y-3 mb-6 text-sm">
        <InfoRow label="Denomination" value={agentDenomination} />
        <InfoRow label="Country" value={getAgentCountry(data)} />
        <InfoRow
          label="Material"
          value={normalizeText(data?.chat_lieu || data?.material)}
        />
      </div>

      <div className="mt-auto">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Reasoning
        </p>

        <div
          className={`text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 ${
            !isExpanded ? "line-clamp-5" : ""
          }`}
        >
          <div className="prose prose-sm prose-slate max-w-none">
            <ReactMarkdown>{reasoningText}</ReactMarkdown>
          </div>
        </div>

        {reasoningText.length > 180 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 text-teal-600 hover:text-teal-700 text-sm font-semibold transition-colors"
          >
            {isExpanded ? "Show less" : "Read full reasoning"}
          </button>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-50 pb-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-bold text-slate-900 text-right">
        {normalizeText(value)}
      </span>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
        {label}
      </p>
      <p className="mt-2 text-lg font-black text-slate-900">
        {normalizeText(value)}
      </p>
    </div>
  );
}

function DecisionItem({ label, value, status }) {
  const statusClass =
    status === "matched"
      ? "bg-teal-50 text-teal-700 border-teal-100"
      : status === "different"
        ? "bg-amber-50 text-amber-700 border-amber-100"
        : "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
      <div>
        <p className="text-sm font-bold text-slate-900">{label}</p>
        <p className="text-sm text-slate-500 mt-1">{normalizeText(value)}</p>
      </div>
      <span
        className={`w-fit px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${statusClass}`}
      >
        {status === "matched"
          ? "Matched"
          : status === "different"
            ? "Different"
            : "Final"}
      </span>
    </div>
  );
}

export default function Result() {
  const navigate = useNavigate();
  const location = useLocation();

  const { currentScanSession } = useRecognitionStore();

  const [showRawLog, setShowRawLog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

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
  const finalDescription = normalizeText(finalData.description);

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
    consensus?.debate_log || "No debate log available."
  );

  const handleCopyJSON = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(currentItem, null, 2));
      toast.success("JSON copied.");
    } catch (error) {
      toast.error("Unable to copy JSON.");
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500 gap-5 p-6">
        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-slate-400" />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-black text-slate-900">
            No result data available
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-md">
            Please run a new banknote scan from the workspace.
          </p>
        </div>
        <button
          onClick={() => navigate("/workspace")}
          className="px-6 py-2.5 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition"
        >
          Go back to Workspace
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Analysis Report
            </h1>
            <p className="text-slate-500 mt-2">
              Review the final decision, agent outputs, and structured JSON
              result.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/history")}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 font-semibold text-slate-700 transition-colors"
            >
              <History className="w-4 h-4" />
              View History
            </button>
            <button
              onClick={() => navigate("/workspace")}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Scan Another
            </button>
          </div>
        </div>

        {resultsArray.length > 1 && (
          <div className="flex gap-2 mb-8 overflow-x-auto border-b border-slate-200 pb-px">
            {resultsArray.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${
                  activeTab === idx
                    ? "border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-lg"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-t-lg"
                }`}
              >
                Banknote Object {idx + 1}
              </button>
            ))}
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 h-full">
            <div className="md:col-span-2 bg-slate-100 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200">
              {previewImage ? (
                <img
                  src={previewImage}
                  className="w-full max-h-80 object-contain rounded-xl drop-shadow-sm"
                  alt="Banknote preview"
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center text-slate-400 font-medium bg-white/60 border border-dashed border-slate-300 rounded-2xl">
                  No image preview
                </div>
              )}

              <span className="mt-6 text-xs font-bold uppercase tracking-wider bg-white border border-slate-200 px-4 py-1.5 rounded-full text-slate-500">
                Uploaded Banknote
              </span>
            </div>

            <div className="md:col-span-3 p-8 md:p-10 flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Final Decision
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getConsensusBadgeClass(
                    consensus
                  )}`}
                >
                  {getConsensusStatusLabel(consensus)}
                </span>
              </div>

              <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">
                {finalDenomination}
              </h2>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Country
                  </p>
                  <p className="font-bold text-slate-900 text-lg">
                    {finalCountry}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Material
                  </p>
                  <p className="font-bold text-slate-900 text-lg">
                    {finalMaterial}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Currency
                  </p>
                  <p className="font-bold text-slate-900 text-lg">
                    {finalCurrency}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Consensus
                  </p>
                  <p className="font-bold text-slate-900 text-lg">
                    {matchedAgents || "N/A"}/3 agents
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Referee Conclusion
                </p>
                <div className="prose prose-slate max-w-none leading-relaxed text-slate-700 text-sm">
                  <ReactMarkdown>{stripMarkdownSymbols(consensusText)}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <SummaryCard label="Denomination" value={finalDenomination} />
          <SummaryCard label="Country" value={finalCountry} />
          <SummaryCard label="Material" value={finalMaterial} />
          <SummaryCard label="Origin" value={finalOrigin} />
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 mb-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Aggregator Decision
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                The aggregator compares all agent outputs and selects the
                majority result.
              </p>
            </div>

            <span
              className={`w-fit px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${getConsensusBadgeClass(
                consensus
              )}`}
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
            />
            <DecisionItem
              label="Agent 2: LLM/API"
              value={getAgentDenomination(agents.llm_api)}
              status={
                getAgentDenomination(agents.llm_api) === finalDenomination
                  ? "matched"
                  : "different"
              }
            />
            <DecisionItem
              label="Agent 3: Visual Search"
              value={getAgentDenomination(agents.visual_search)}
              status={
                getAgentDenomination(agents.visual_search) === finalDenomination
                  ? "matched"
                  : "different"
              }
            />
            <DecisionItem
              label="Final Result"
              value={finalDenomination}
              status="final"
            />
          </div>
        </div>

        <h2 className="text-xl font-extrabold text-slate-900 mb-6">
          Agent Comparison
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <AgentCard
            agentKey="Agent 1"
            title="ML/DL Analysis"
            method="Machine Learning / Deep Learning"
            data={agents.ml_dl}
            finalDenomination={finalDenomination}
          />
          <AgentCard
            agentKey="Agent 2"
            title="LLM/API Analysis"
            method="Language Model / API Reasoning"
            data={agents.llm_api}
            finalDenomination={finalDenomination}
          />
          <AgentCard
            agentKey="Agent 3"
            title="Visual Search"
            method="Google Lens / Visual Search"
            data={agents.visual_search}
            finalDenomination={finalDenomination}
          />
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mb-10">
          <div className="flex justify-between items-center gap-4">
            <div>
              <h3 className="font-extrabold text-xl text-slate-900">
                Full Reasoning Log
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Detailed reasoning is collapsed to keep the report readable.
              </p>
            </div>

            <button
              onClick={() => setShowRawLog(!showRawLog)}
              className="inline-flex items-center gap-2 text-teal-700 font-bold text-sm bg-teal-50 px-4 py-2 rounded-lg hover:bg-teal-100 transition-colors"
            >
              {showRawLog ? (
                <>
                  Hide Log
                  <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  View Full Log
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {showRawLog && (
            <div className="mt-6 p-6 bg-slate-900 text-slate-300 rounded-2xl overflow-auto max-h-[420px] text-sm prose prose-invert max-w-none leading-loose border border-slate-800">
              <ReactMarkdown>{safeDebateLog}</ReactMarkdown>
            </div>
          )}
        </div>

        <div className="bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-800 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <FileJson className="w-5 h-5 text-teal-400" />
              <h3 className="text-white font-bold text-lg">
                Structured JSON Output
              </h3>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCopyJSON}
                className="inline-flex items-center gap-2 text-slate-300 hover:text-white font-semibold text-sm transition-colors bg-slate-800 px-4 py-2 rounded-xl"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
              <button
                onClick={handleDownloadJSON}
                className="inline-flex items-center gap-2 text-slate-300 hover:text-white font-semibold text-sm transition-colors bg-slate-800 px-4 py-2 rounded-xl"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>

          <pre className="text-xs text-teal-300 overflow-auto whitespace-pre-wrap font-mono leading-relaxed max-h-[360px]">
            {JSON.stringify(currentItem, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Continue scanning
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Start another scan or review saved results in your history.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/workspace")}
              className="px-5 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800"
            >
              Scan Another Banknote
            </button>
            <button
              onClick={() => navigate("/history")}
              className="px-5 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50"
            >
              View Scan History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}