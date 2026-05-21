import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Brain, ScanLine, Globe, Cpu, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { recognitionService } from '../../services/recognitionService';
import { useAuthStore } from '../../store/authStore';

export default function Processing() {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateTokenBalance, user } = useAuthStore();
  
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [agentsStatus, setAgentsStatus] = useState({
    yolo: 'scanning', llm: 'scanning', lens: 'scanning', aggregator: 'waiting'
  });

  // Lấy file ảnh được truyền từ trang Recognition sang
  const imageFile = location.state?.imageFile;

  useEffect(() => {
    if (!imageFile) {
      navigate('/recognize'); // Nếu không có file, đá về lại trang upload
      return;
    }

    let isMounted = true;

    // 1. Chạy thanh tiến trình ảo cho đẹp mắt trong lúc chờ API
    const progressInterval = setInterval(() => {
      setProgress(prev => (prev < 90 ? prev + 1 : prev));
    }, 100);

    // 2. Gọi API THẬT gửi ảnh lên Server
    const processBanknote = async () => {
      try {
        const result = await recognitionService.scan(imageFile);
        
        if (isMounted) {
          // Thành công: Đẩy thanh tiến trình lên 100%
          clearInterval(progressInterval);
          setProgress(100);
          setAgentsStatus({ yolo: 'done', llm: 'done', lens: 'done', aggregator: 'done' });
          
          // Trừ đi 1 token ở Frontend cho đồng bộ với Backend
          if (user) updateTokenBalance(user.token_balance - 1);

          // Chờ 1 giây cho user xem full 100% rồi đẩy sang trang Kết quả (Result)
          setTimeout(() => {
            navigate('/result', { state: { scanResult: result } });
          }, 1000);
        }
      } catch (err) {
        if (isMounted) {
          clearInterval(progressInterval);
          setError(err.response?.data?.detail || 'Quá trình phân tích thất bại.');
        }
      }
    };

    processBanknote();

    return () => {
      isMounted = false;
      clearInterval(progressInterval);
    };
  }, [imageFile, navigate, updateTokenBalance, user]);

  const AgentCard = ({ icon: Icon, name, status, desc }) => (
    <div className={`p-5 rounded-2xl border transition-all duration-500 ${status === 'done' ? 'bg-teal-50 border-teal-200' : 'bg-white border-slate-200 shadow-sm'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status === 'done' ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-500'}`}>
          <Icon className="w-5 h-5" />
        </div>
        {status === 'scanning' ? <Loader2 className="w-5 h-5 text-teal-500 animate-spin" /> : status === 'done' ? <CheckCircle2 className="w-5 h-5 text-teal-500" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-200"></div>}
      </div>
      <h4 className="font-bold text-slate-900">{name}</h4>
      <p className="text-xs text-slate-500 mt-1">{desc}</p>
    </div>
  );

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Analysis Failed</h2>
        <p className="text-slate-500 mb-8">{error}</p>
        <button onClick={() => navigate('/recognize')} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-semibold">Try Again</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 relative">
          <Cpu className="w-10 h-10 animate-pulse" />
          <div className="absolute inset-0 border-4 border-teal-200 rounded-full animate-ping opacity-20"></div>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Analyzing Banknote</h2>
        <p className="text-slate-500">Connecting to AI Models...</p>
      </div>

      <div className="mb-10">
        <div className="flex justify-between text-sm font-semibold text-slate-600 mb-2">
          <span>Overall Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-teal-500 transition-all duration-300 ease-out rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <AgentCard icon={ScanLine} name="Agent 1: YOLO" status={progress === 100 ? 'done' : 'scanning'} desc="Detecting shapes and patterns" />
        <AgentCard icon={Brain} name="Agent 2: Gemini" status={progress === 100 ? 'done' : 'scanning'} desc="Analyzing visual context" />
        <AgentCard icon={Globe} name="Agent 3: Lens" status={progress === 100 ? 'done' : 'scanning'} desc="Fetching global database" />
      </div>
    </div>
  );
}