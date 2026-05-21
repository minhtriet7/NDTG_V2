import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAppStore } from '../../store/appStore'; // Import global store

export default function ForgotPassword() {
  const { theme, lang } = useAppStore(); // Lấy biến toàn cục
  const isDark = theme === 'dark';
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  // 🔴 GỌI API THẬT
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await authService.forgotPassword(email);
      setIsSent(true);
    } catch (err) {
      setError(err.response?.data?.detail || (lang === 'VI' ? 'Không thể gửi yêu cầu. Thử lại sau.' : 'Failed to send request. Try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  // MÀN HÌNH SAU KHI GỬI THÀNH CÔNG
  if (isSent) {
    return (
      <div className="animate-in slide-in-from-right-4 fade-in duration-500 text-center">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border shadow-sm ${isDark ? 'bg-teal-900/30 border-teal-800' : 'bg-teal-50 border-teal-100'}`}>
          <CheckCircle2 className="w-8 h-8 text-[#009688]" />
        </div>
        <h2 className={`text-3xl font-bold tracking-tight mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {lang === 'VI' ? 'Kiểm tra email' : 'Check your email'}
        </h2>
        <p className={`text-sm leading-relaxed mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {lang === 'VI' ? 'Chúng tôi đã gửi link đặt lại mật khẩu đến' : 'A password recovery link has been sent to'} <br/>
          <span className={`font-bold mt-1 block ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{email}</span>
        </p>
        <Link 
          to="/auth/login" 
          className="w-full py-3.5 bg-[#009688] hover:bg-teal-700 text-white rounded-xl text-sm font-bold tracking-wide transition-all flex justify-center items-center hover:scale-[1.02]"
        >
          {lang === 'VI' ? 'QUAY LẠI ĐĂNG NHẬP' : 'BACK TO SIGN IN'}
        </Link>
      </div>
    );
  }

  // MÀN HÌNH NHẬP EMAIL
  return (
    <div className="animate-in slide-in-from-left-4 fade-in duration-500">
      <div className="mb-8 text-center md:text-left">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border shadow-sm ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
          <KeyRound className={`w-6 h-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} />
        </div>
        <h2 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {lang === 'VI' ? 'Quên mật khẩu?' : 'Forgot Password?'}
        </h2>
        <p className={`text-sm mt-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {lang === 'VI' ? 'Nhập email liên kết với tài khoản của bạn để nhận hướng dẫn đặt lại.' : 'Enter your registered email and we will send you a reset link.'}
        </p>
      </div>

      {error && (
        <div className={`mb-6 p-3 text-sm border rounded-xl ${isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-100 text-red-600'}`}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className={`block text-[11px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {lang === 'VI' ? 'Địa chỉ Email' : 'Email Address'}
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            <input
              type="email" 
              required
              className={`w-full pl-11 pr-4 py-3.5 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:border-[#009688] focus:ring-[#009688] transition-colors ${
                isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
              placeholder="you@example.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit" 
          disabled={isLoading}
          className="w-full py-3.5 bg-[#009688] hover:bg-teal-700 text-white rounded-xl text-sm font-bold tracking-wide transition-all flex justify-center items-center hover:scale-[1.02] shadow-sm"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (lang === 'VI' ? 'GỬI LINK ĐẶT LẠI' : 'SEND RESET LINK')}
        </button>
      </form>

      <div className="mt-8 text-center md:text-left">
        <Link 
          to="/auth/login" 
          className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-[#009688] hover:text-teal-800'}`}
        >
          <ArrowLeft className="w-4 h-4" /> {lang === 'VI' ? 'Quay lại Đăng nhập' : 'Back to sign in'}
        </Link>
      </div>
    </div>
  );
}