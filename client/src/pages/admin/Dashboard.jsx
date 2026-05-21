import React from 'react';
import { Users, ScanLine, Wallet, Activity, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const StatCard = ({ title, value, icon: Icon, colorClass, change }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between font-sans">
      <div className="flex items-center gap-4">
        <div className={`p-4 rounded-xl ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{value}</h3>
        </div>
      </div>
      <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
        <TrendingUp className="w-3 h-3" /> {change}
      </span>
    </div>
  );

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">System Performance Dashboard</h2>
        <p className="text-slate-500 text-sm mt-1">Real-time infrastructure metrics and user analytical monitoring.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Users" value="1,248" icon={Users} colorClass="bg-blue-50 text-blue-600" change="+12%" />
        <StatCard title="Total Scans" value="8,492" icon={ScanLine} colorClass="bg-teal-50 text-teal-600" change="+18%" />
        <StatCard title="Revenue (VND)" value="15.2M" icon={Wallet} colorClass="bg-amber-50 text-amber-600" change="+8%" />
        <StatCard title="System Health" value="99.9%" icon={Activity} colorClass="bg-emerald-50 text-emerald-600" change="Stable" />
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-72 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-3">
          <Activity className="w-6 h-6" />
        </div>
        <p className="text-slate-500 font-medium">Pipeline Telemetry Charts</p>
        <p className="text-slate-400 text-xs mt-1">Chart visualization nodes synchronize automatically every 60 seconds.</p>
      </div>
    </div>
  );
}