import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';

export default function Login() {
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);
  const { lang, theme } = useAppStore();
  const isDark = theme === 'dark';
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const t = {
    EN: {
      title: "Welcome back", email: "Email Address", emailPh: "you@example.com",
      pass: "Password", passPh: "••••••••", forgot: "Forgot password?",
      btn: "SIGN IN", or: "Or", google: "Continue with Google",
      noAcc: "Don't have an account?", signup: "Sign up"
    },
    VI: {
      title: "Chào mừng trở lại", email: "Địa chỉ Email", emailPh: "ban@vidu.com",
      pass: "Mật khẩu", passPh: "••••••••", forgot: "Quên mật khẩu?",
      btn: "ĐĂNG NHẬP", or: "Hoặc", google: "Tiếp tục với Google",
      noAcc: "Chưa có tài khoản?", signup: "Đăng ký"
    }
  }[lang];

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const data = await authService.login(formData.email, formData.password);
      loginStore(data.user, data.access_token);
      navigate('/'); 
    } catch (err) {
      setError(err.response?.data?.detail || "Sai tài khoản hoặc mật khẩu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 w-full">
      <div className="mb-8 text-center">
        <h2 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.title}</h2>
      </div>

      {error && <div className={`mb-5 p-3 text-sm border rounded-lg text-center ${isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 text-red-600 border-red-100'}`}>{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email" name="email" required
            className={`w-full px-4 py-3.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-[#009688] focus:ring-[#009688]/20 transition-colors ${isDark ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'}`}
            placeholder={t.email}
            value={formData.email} onChange={handleChange}
          />
        </div>

        <div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"} name="password" required
              className={`w-full px-4 py-3.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-[#009688] focus:ring-[#009688]/20 transition-colors ${isDark ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'}`}
              placeholder={t.pass}
              value={formData.password} onChange={handleChange}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <div className="text-right mt-2">
            <Link to="/auth/forgot-password" className={`text-xs font-semibold transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-[#009688]'}`}>{t.forgot}</Link>
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="w-full py-3.5 mt-2 bg-[#009688] hover:bg-teal-700 text-white rounded-xl text-sm font-bold transition-all active:scale-[0.98] flex justify-center items-center shadow-md shadow-teal-900/20">
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t.btn}
        </button>
      </form>

      <div className={`my-6 flex items-center before:flex-1 before:border-t after:flex-1 after:border-t ${isDark ? 'before:border-slate-800 after:border-slate-800' : 'before:border-slate-200 after:border-slate-200'}`}>
        <span className={`px-4 text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{t.or}</span>
      </div>

      <button type="button" onClick={() => window.location.href = 'http://localhost:8000/api/v1/auth/google/login'}
className={`w-full flex items-center justify-center gap-3 py-3.5 border rounded-xl transition-colors text-sm font-semibold active:scale-[0.98] ${isDark ? 'border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-50 text-slate-700'}`}>
        <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        {t.google}
      </button>

      <div className="mt-8 text-center">
        <span className={`text-[13px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t.noAcc} </span>
        <Link to="/auth/register" className={`text-[13px] font-bold transition-colors ${isDark ? 'text-teal-400 hover:text-teal-300' : 'text-[#009688] hover:text-teal-800'}`}>
          {t.signup}
        </Link>
      </div>
    </div>
  );
}