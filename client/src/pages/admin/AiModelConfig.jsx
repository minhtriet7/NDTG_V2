import React from 'react';
import { Sliders, Save } from 'lucide-react';

export default function AiModelConfig() {
  return (
    <div className="max-w-3xl space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-teal-500" /> Agent 1: YOLO Machine Learning Weights
        </h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition">
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Confidence Threshold</label>
          <input type="number" step="0.01" defaultValue="0.15" className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none font-mono text-sm" />
          <span className="text-xs text-slate-400">Minimum reliability rate to consider a bounding box valid.</span>
        </div>
      </div>
    </div>
  );
}