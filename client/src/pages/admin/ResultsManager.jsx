import React from 'react';
import { FileSpreadsheet, Layers } from 'lucide-react';

export default function ResultsManager() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-teal-600" /> Scan Results Ledger
          </h3>
          <p className="text-slate-500 text-sm mt-1">Manage and audit all Multi-Agent consensus history.</p>
        </div>
      </div>
      
      <div className="text-sm text-slate-400 text-center py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50">
        <Layers className="w-8 h-8 mx-auto text-slate-300 mb-2" />
        No diagnostic recognition records found in the pipeline buffer.
      </div>
    </div>
  );
}