import React from 'react';
import { Sun, Moon, Globe } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

export default function ThemeLangToggle() {
  const { theme, lang, toggleTheme, toggleLang } = useAppStore();
  const isDark = theme === 'dark';

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Nút đổi Ngôn ngữ */}
      <button 
        onClick={toggleLang}
        className={`flex items-center gap-1.5 px-3 py-2 shadow-sm border rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.05] active:scale-95 ${
          isDark ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
        }`}
      >
        <Globe className="w-4 h-4" /> {lang}
      </button>

      {/* Nút đổi Sáng/Tối */}
      <button 
        onClick={toggleTheme}
        className={`flex items-center justify-center p-2 shadow-sm border rounded-xl transition-all duration-200 hover:scale-[1.05] active:scale-95 ${
          isDark ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
        }`}
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
    </div>
  );
}