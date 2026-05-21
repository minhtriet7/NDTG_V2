import React from 'react';
import { CreditCard, CheckCircle, ArrowDownRight } from 'lucide-react';

export default function Transactions() {
  return (
    <div className="max-w-4xl mx-auto font-sans">
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Transaction History</h2>
      <p className="text-slate-500 text-sm mb-6">Track all your token package purchases and billing receipts.</p>
      
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider grid grid-cols-4">
          <span>Reference ID</span>
          <span>Package Name</span>
          <span>Amount</span>
          <span className="text-right">Status</span>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="p-6 grid grid-cols-4 items-center text-sm">
            <span className="font-mono text-slate-900 font-semibold">TXN-8F42A1D9</span>
            <span className="text-slate-700">Pro Pack (200 Tokens)</span>
            <span className="font-bold text-slate-900">150,000 VND</span>
            <span className="text-right"><span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md text-xs font-semibold"><CheckCircle className="w-3.5 h-3.5"/> Completed</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}