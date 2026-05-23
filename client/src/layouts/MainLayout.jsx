import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header'; 
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore'; // 👈 Import authStore vào đây

export default function MainLayout() {
  const { theme, initTheme } = useAppStore();
  
  // 👈 Lấy token và hàm syncProfile từ store
  const { token, syncProfile } = useAuthStore(); 
  
  const isDark = theme === 'dark';

  // Kích hoạt theme Sáng/Tối khi load trang
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  // 🌟 ĐỒNG BỘ DỮ LIỆU USER KHI VÀO TRANG
  useEffect(() => {
    if (token) {
      syncProfile();
    }
  }, [token, syncProfile]); 
  // Chỉ chạy khi token thay đổi (vd: vừa đăng nhập) hoặc F5 trang

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