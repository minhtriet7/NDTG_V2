import React, { useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ScanLine } from 'lucide-react';
import ThemeLangToggle from '../components/common/ThemeLangToggle';
import { useAppStore } from '../store/appStore';

export default function AuthLayout() {
  const location = useLocation();
  const isLogin = location.pathname.includes('login');
  
  const { theme, initTheme, lang } = useAppStore();
  const isDark = theme === 'dark';

  useEffect(() => { initTheme(); }, [initTheme]);

  // 👇 LINK ẢNH NỀN BÊN CẠNH FORM (Bác có thể tự thay) 👇
  const loginBg = "https://res.cloudinary.com/dg0qiq4zd/image/upload/v1779085695/13_26_26_18_thg_5_2026_ic0ar6.png"; 
  const registerBg = "https://res.cloudinary.com/dg0qiq4zd/image/upload/v1779085978/ChatGPT_Image_13_31_38_18_thg_5_2026_ospg93.png";

  return (
    <div className={`relative min-h-screen flex justify-center items-center p-0 md:p-4 font-sans overflow-hidden transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      
      {/* ─── THANH ĐIỀU HƯỚNG TRÊN CÙNG (Cố định, không bị trượt) ─── */}
      <div className="absolute top-0 left-0 right-0 w-full px-6 py-4 flex justify-between items-center z-50">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-[#009688] rounded-lg flex items-center justify-center shadow-sm">
            <ScanLine className="w-5 h-5 text-white" />
          </div>
          <span className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Banknote<span className="text-[#009688]">AI</span>
          </span>
        </Link>
        
        {/* Nút Ngôn ngữ & Sáng/Tối */}
        <ThemeLangToggle />
      </div>

      {/* ─── MAIN CONTAINER CÓ HIỆU ỨNG TRƯỢT ─── */}
      <div className={`relative w-full max-w-[1000px] h-screen md:h-[680px] md:shadow-2xl md:rounded-3xl overflow-hidden flex transition-colors duration-300 ${
        isDark ? 'bg-slate-900 border-slate-800 shadow-slate-900/50 border' : 'bg-white border-slate-200 shadow-slate-300/50 border'
      }`}>
        
        {/* 1. KHỐI CHỨA FORM (Z-20) - Trượt Trái <-> Phải */}
        <div 
          className={`absolute top-0 bottom-0 left-0 w-full md:w-1/2 h-full flex flex-col items-center justify-center p-6 sm:p-12 z-20 transition-transform duration-[800ms] cubic-bezier-auth ${
            isLogin ? 'translate-x-0' : 'md:translate-x-full'
          } ${isDark ? 'bg-slate-900' : 'bg-white'}`}
        >
          {/* Card Form */}
          <div className="w-full max-w-[380px]">
            <Outlet />
          </div>
        </div>

        {/* 2. KHỐI CHỨA ẢNH (Z-10) - Trượt Phải <-> Trái */}
        <div 
          className={`hidden md:block absolute top-0 bottom-0 right-0 w-1/2 z-10 transition-transform duration-[800ms] cubic-bezier-auth ${
            isLogin ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div 
            className={`absolute inset-0 bg-cover bg-center transition-all duration-[800ms] cubic-bezier-auth ${isLogin ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
            style={{ backgroundImage: `url(${loginBg})` }}
          />
          <div 
            className={`absolute inset-0 bg-cover bg-center transition-all duration-[800ms] cubic-bezier-auth ${isLogin ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
            style={{ backgroundImage: `url(${registerBg})` }}
          />
          {/* Lớp phủ cho ảnh */}
          <div className={`absolute inset-0 pointer-events-none transition-colors duration-300 ${isDark ? 'bg-slate-950/20' : 'bg-slate-900/5'}`}></div>
        </div>

      </div>
    </div>
  );
}