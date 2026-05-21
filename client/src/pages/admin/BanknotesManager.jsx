import React from 'react';
import { Coins, Plus, Layers } from 'lucide-react';

export default function BanknotesManager() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Coins className="w-5 h-5 text-teal-600" /> Banknotes Database Manager
          </h3>
          <p className="text-slate-500 text-sm mt-1">Add, edit, or remove supported currency denominations.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition">
          <Plus className="w-4 h-4" /> Add New Banknote
        </button>
      </div>
      
      <div className="text-sm text-slate-400 text-center py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50">
        <Layers className="w-8 h-8 mx-auto text-slate-300 mb-2" />
        Banknote data repository synchronized with production database clusters.
      </div>
    </div>
  );
}