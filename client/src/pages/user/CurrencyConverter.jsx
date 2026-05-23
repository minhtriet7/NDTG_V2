import React, { useEffect, useState } from 'react';
import { ArrowRightLeft, TrendingUp, Info, Activity } from 'lucide-react';
import { getRates } from "../../services/currencyService";
import { useNavigate } from 'react-router-dom';
import { useAppStore } from "../../store/appStore";

export default function CurrencyConverter() {
  const navigate = useNavigate();
  const { lang } = useAppStore(); // Lấy ngôn ngữ từ store chung

  const [ratesData, setRatesData] = useState(null);
  const [amount, setAmount] = useState(100);
  const [fromCurr, setFromCurr] = useState('USD');
  const [toCurr, setToCurr] = useState('VND');

  // --- TỪ ĐIỂN SONG NGỮ ---
  const t = {
    EN: {
      title: "Regional Exchange Calculator",
      subtitle: "Indicative exchange rates for Southeast Asian currencies.",
      source: "Source",
      amtFrom: "Amount & From",
      convertedTo: "Converted To",
      info: "Rates are for informational purposes only.",
      scanBtn: "Scan a Banknote",
      calculating: "Calculating..."
    },
    VI: {
      title: "Công Cụ Quy Đổi Ngoại Tệ",
      subtitle: "Tỷ giá tham khảo cho các loại tiền tệ khu vực Đông Nam Á.",
      source: "Nguồn",
      amtFrom: "Số lượng & Tiền gốc",
      convertedTo: "Quy Đổi Thành",
      info: "Tỷ giá chỉ mang tính chất tham khảo.",
      scanBtn: "Quét Tiền Giấy",
      calculating: "Đang tính..."
    }
  };

  const text = t[lang || 'EN'];

  useEffect(() => {
    const fetchRates = async () => {
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-10 font-sans text-slate-900 dark:text-slate-100 form-content-animate transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors">
            {text.title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 transition-colors">
            {text.subtitle}
          </p>
          {ratesData && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full border border-blue-100 dark:border-blue-800/50 transition-colors">
              <Activity className="w-3.5 h-3.5" /> {text.source}: {ratesData.source}
            </span>
          )}
        </div>

        {/* CALCULATOR CARD */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-10 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden transition-colors">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 dark:bg-teal-900/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-colors"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
            {/* TỪ (FROM) */}
            <div className="w-full md:w-2/5 space-y-2">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider transition-colors">
                {text.amtFrom}
              </label>
              <div className="flex bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-teal-500/50 transition-colors">
                <input 
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full p-4 bg-transparent outline-none font-mono text-lg text-slate-900 dark:text-white transition-colors"
                />
                <select 
                  value={fromCurr} 
                  onChange={(e) => setFromCurr(e.target.value)}
                  className="bg-transparent dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 p-4 font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer transition-colors"
                >
                  {ratesData?.rates && Object.keys(ratesData.rates).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* NÚT HOÁN ĐỔI */}
            <button 
              onClick={handleSwap} 
              className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm hover:shadow-md hover:border-teal-200 dark:hover:border-teal-600 transition-all active:scale-95 group z-10"
            >
              <ArrowRightLeft className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" />
            </button>

            {/* SANG (TO) */}
            <div className="w-full md:w-2/5 space-y-2">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider transition-colors">
                {text.convertedTo}
              </label>
              <div className="flex bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden transition-colors">
                 <div className="w-full p-4 bg-slate-100 dark:bg-slate-800/80 font-mono text-lg font-bold text-teal-700 dark:text-teal-400 flex items-center overflow-x-auto transition-colors">
                    {ratesData ? calculateResult() : text.calculating}
                 </div>
                 <select 
                  value={toCurr} 
                  onChange={(e) => setToCurr(e.target.value)}
                  className="bg-transparent dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 p-4 font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer transition-colors"
                >
                  {ratesData?.rates && Object.keys(ratesData.rates).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* FOOTER BÊN TRONG CARD */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 transition-colors">
            <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5 transition-colors">
              <Info className="w-4 h-4" /> {text.info}
            </p>
            <button 
              onClick={() => navigate('/recognize')} 
              className="px-6 py-2.5 bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white font-semibold rounded-xl text-sm transition-all shadow-sm active:scale-95"
            >
              {text.scanBtn}
            </button>
          </div>
        </div>

        {/* QUICK SUGGESTIONS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {['100 USD to VND', '1000 THB to VND', '100 SGD to MYR', '500000 VND to USD'].map((pair, idx) => (
             <div 
               key={idx} 
               onClick={() => {
                 // Gán nhanh trạng thái (tuỳ chọn chức năng)
                 const parts = pair.split(' ');
                 if(parts.length === 4) {
                   setAmount(Number(parts[0]));
                   setFromCurr(parts[1]);
                   setToCurr(parts[3]);
                 }
               }}
               className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer hover:border-teal-500 dark:hover:border-teal-500 transition-colors"
             >
               <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors">{pair}</span>
               <TrendingUp className="w-4 h-4 text-teal-500 dark:text-teal-400 transition-colors" />
             </div>
           ))}
        </div>
        
      </div>
    </div>
  );
}