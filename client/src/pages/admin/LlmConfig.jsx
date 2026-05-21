import React from 'react';
import { Brain, Save } from 'lucide-react';

export default function LlmConfig() {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-500" /> Agent 2: Gemini LLM Configuration
        </h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition">
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Model Version</label>
          <select className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none font-mono text-sm">
            <option>gemini-2.5-flash</option>
            <option>gemini-2.5-pro</option>
            <option>gemini-1.5-pro</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">System Temperature</label>
          <input type="range" min="0" max="1" step="0.1" defaultValue="0.2" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600" />
          <span className="text-xs text-slate-400">Low values make results more deterministic and strict.</span>
        </div>
      </div>
    </div>
  );
}