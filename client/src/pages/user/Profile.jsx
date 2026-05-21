import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Globe, Clock, ShieldCheck, 
  Key, Smartphone, Activity, Download, Trash2, 
  Settings, CheckCircle2, AlertTriangle, Zap, LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

export default function Profile() {
  const { user, token, checkAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  
  // States cho Form Personal Info
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    country: 'Vietnam',
    language: 'English',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        country: user.country || 'Vietnam',
        language: user.language || 'English',
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put('http://localhost:8000/api/v1/users/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await checkAuth(); // Gọi lại hàm checkAuth để cập nhật store
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-[1180px] mx-auto px-5">
        
        {/* PAGE HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Profile</h1>
          <p className="text-slate-500 font-medium mt-2">
            Manage your account information, security settings, tokens, and preferences.
          </p>
        </div>

        {/* 12-COLUMN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* CỘT TRÁI (4 Columns) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 1. Profile Summary Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-md">
                  <User className="w-10 h-10 text-teal-600" />
                </div>
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">{user?.full_name}</h2>
              <p className="text-slate-500 text-sm font-medium">{user?.email}</p>
              
              <div className="flex justify-center gap-2 mt-4">
                <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {user?.role}
                </span>
                <span className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Member Since</p>
                  <p className="text-sm text-slate-700 font-bold mt-1">May 2026</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Last Login</p>
                  <p className="text-sm text-slate-700 font-bold mt-1">Just now</p>
                </div>
              </div>
              <button className="w-full mt-6 bg-slate-50 text-slate-700 border border-slate-200 py-2.5 rounded-xl font-bold hover:bg-slate-100 transition-colors text-sm">
                Edit Avatar
              </button>
            </div>

            {/* 2. Token & Usage Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-1">Token Balance</h3>
              <p className="text-xs text-slate-500 mb-4">Cost per scan: 1 token</p>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center border border-teal-100">
                  <Zap className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <span className="text-3xl font-black text-slate-900">{user?.token_balance || 0}</span>
                  <span className="text-sm font-bold text-slate-400 ml-1">Tokens</span>
                </div>
              </div>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Monthly Usage</span>
                  <span className="text-slate-900 font-bold">12 / 50</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: '24%' }}></div>
                </div>
              </div>
              
              <button className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-2.5 rounded-xl font-bold hover:opacity-90 transition-opacity text-sm shadow-md shadow-teal-500/20">
                Buy Tokens
              </button>
            </div>
          </div>

          {/* CỘT PHẢI (8 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 3. Personal Information Card */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Personal Information</h3>
              <p className="text-sm text-slate-500 mb-6">Update your personal details and contact information.</p>
              
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Full Name</label>
                    <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-sm font-medium text-slate-900 bg-slate-50 focus:bg-white transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Email Address</label>
                    <input type="email" value={user?.email || ''} disabled className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 outline-none text-sm font-medium cursor-not-allowed" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+84..." className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-teal-500 outline-none text-sm font-medium text-slate-900 bg-slate-50 focus:bg-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Country</label>
                    <select name="country" value={formData.country} onChange={handleInputChange} className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-teal-500 outline-none text-sm font-medium text-slate-900 bg-slate-50 focus:bg-white">
                      <option value="Vietnam">Vietnam</option>
                      <option value="United States">United States</option>
                      <option value="Japan">Japan</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                  <button type="button" className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-sm transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 text-sm transition-colors shadow-sm disabled:opacity-70">
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* 4. Security Settings Card */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Security Settings</h3>
              <p className="text-sm text-slate-500 mb-6">Manage your password and secure your account.</p>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <Key className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Password</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Last changed 3 months ago</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-100">
                    Change
                  </button>
                </div>

                <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <Smartphone className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Two-Factor Authentication</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Add an extra layer of security</p>
                    </div>
                  </div>
                  <div className="w-11 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 shadow-sm"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <Activity className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Active Sessions</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Mac OS • Chrome • Bến Tre, VN (Current)</p>
                    </div>
                  </div>
                  <button className="text-sm font-bold text-red-600 hover:text-red-700 flex items-center gap-1">
                    <LogOut className="w-4 h-4" /> Sign out all
                  </button>
                </div>
              </div>
            </div>

            {/* 5. Danger Zone Card */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-red-100 shadow-sm">
              <h3 className="text-lg font-bold text-red-600 mb-1">Danger Zone</h3>
              <p className="text-sm text-slate-500 mb-6">Irreversible and destructive actions.</p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex items-center justify-center gap-2 flex-1 px-5 py-2.5 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-sm">
                  <Download className="w-4 h-4" /> Export Data
                </button>
                <button className="flex items-center justify-center gap-2 flex-1 px-5 py-2.5 rounded-xl font-bold text-red-600 bg-white border border-red-200 hover:bg-red-50 transition-colors text-sm">
                  <Trash2 className="w-4 h-4" /> Delete Account
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}