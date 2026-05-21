import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header'; // 👈 Trả lại cái Header xịn vào đây
import { useAppStore } from '../store/appStore';

export default function MainLayout() {
  const { theme, initTheme } = useAppStore();
  const isDark = theme === 'dark';

  // Kích hoạt theme Sáng/Tối khi load trang
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${isDark ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* 🚀 ĐÂY LÀ HEADER DÙNG CHUNG CHO CẢ HOME, DIRECTORY, V.V... */}
      <Header />
      
      <main className="flex-grow">
        <Outlet />
      </main>

    </div>
  );
}