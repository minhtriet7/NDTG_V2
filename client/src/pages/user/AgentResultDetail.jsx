import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Cpu, ArrowLeft, Terminal } from 'lucide-react';

export default function AgentResultDetail() {
  return (
    <div className="max-w-4xl mx-auto font-sans space-y-6">
      <Link to="/history" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition">
        <ArrowLeft className="w-4 h-4"/> Back to logs
      </Link>
      <h2 className="text-2xl font-bold text-slate-900">Isolated Instance Weight Metrics</h2>
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-slate-900 rounded-2xl p-6 font-mono text-xs text-slate-300 shadow-inner">
          <div className="flex items-center gap-2 text-teal-400 font-bold mb-3 uppercase tracking-wider"><Terminal className="w-4 h-4"/> Cluster Verdicts Stream</div>
          <p className="text-slate-500">// Processing node metrics log reference</p>
          <pre className="mt-2 text-emerald-400">
{`{
  "node_01_yolo": { "status": 200, "class_index": 4, "confidence": 0.95 },
  "node_02_gemini": { "status": 200, "tokens_evaluated": 421, "match": "VND" },
  "node_03_lens": { "status": 200, "graph_matches_count": 5 }
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}