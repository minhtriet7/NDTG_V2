import React, { useEffect, useState } from 'react';
import { ArrowRightLeft, TrendingUp, Info, Activity } from 'lucide-react';
// 🌟 SỬA CÁCH IMPORT: Lấy thẳng hàm getRates ra dùng
import { getRates } from "../../services/currencyService";
import { useNavigate } from 'react-router-dom';

export default function CurrencyConverter() {
  const navigate = useNavigate();
  const [ratesData, setRatesData] = useState(null);
  const [amount, setAmount] = useState(100);
  const [fromCurr, setFromCurr] = useState('USD');
  const [toCurr, setToCurr] = useState('VND');

  useEffect(() => {
    const fetchRates = async () => {
      // 🌟 GỌI TRỰC TIẾP HÀM getRates
      const data = await getRates();
      setRatesData(data);
    };
    fetchRates();
  }, []);

  const handleSwap = () => {
    setFromCurr(toCurr);
    setToCurr(fromCurr);
  };

  const calculateResult = () => {
    if (!ratesData || !ratesData.rates) return '0.00';
    const rateFrom = ratesData.rates[fromCurr];
    const rateTo = ratesData.rates[toCurr];
    if (!rateFrom || !rateTo) return '0.00';
    
    // Đưa về đơn vị Base (USD) rồi mới nhân chéo
    const amountInBase = amount / rateFrom;
    const finalAmount = amountInBase * rateTo;
    
    return finalAmount.toLocaleString('en-US', { maximumFractionDigits: 2 });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-900 form-content-animate">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Regional Exchange Calculator</h1>
          <p className="text-slate-500">Indicative exchange rates for Southeast Asian currencies.</p>
          {ratesData && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-100">
              <Activity className="w-3.5 h-3.5" /> Source: {ratesData.source}
            </span>
          )}
        </div>

        <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
            <div className="w-full md:w-2/5 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Amount & From</label>
              <div className="flex bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-teal-500/50">
                <input 
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full p-4 bg-transparent outline-none font-mono text-lg"
                />
                <select 
                  value={fromCurr} 
                  onChange={(e) => setFromCurr(e.target.value)}
                  className="bg-transparent border-l border-slate-200 p-4 font-bold text-slate-700 outline-none cursor-pointer"
                >
                  {ratesData?.rates && Object.keys(ratesData.rates).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <button onClick={handleSwap} className="p-4 bg-white border border-slate-200 rounded-full shadow-sm hover:shadow-md hover:border-teal-200 hover:text-teal-600 transition-all active:scale-95 group z-10">
              <ArrowRightLeft className="w-5 h-5 text-slate-400 group-hover:text-teal-600 transition-colors" />
            </button>

            <div className="w-full md:w-2/5 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Converted To</label>
              <div className="flex bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                 <div className="w-full p-4 bg-slate-100 font-mono text-lg font-bold text-teal-700 flex items-center overflow-x-auto">
                    {ratesData ? calculateResult() : '...'}
                 </div>
                 <select 
                  value={toCurr} 
                  onChange={(e) => setToCurr(e.target.value)}
                  className="bg-transparent border-l border-slate-200 p-4 font-bold text-slate-700 outline-none cursor-pointer"
                >
                  {ratesData?.rates && Object.keys(ratesData.rates).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Info className="w-4 h-4" /> Rates are for informational purposes only.
            </p>
            <button onClick={() => navigate('/recognize')} className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-colors shadow-md">
              Scan a Banknote
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {['100 USD to VND', '1000 THB to VND', '100 SGD to MYR', '500000 VND to USD'].map((pair, idx) => (
             <div key={idx} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer hover:border-teal-500 transition-colors">
               <span className="text-sm font-semibold text-slate-700">{pair}</span>
               <TrendingUp className="w-4 h-4 text-teal-500" />
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}