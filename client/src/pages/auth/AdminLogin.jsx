import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, Lock, Mail, Loader2 } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { authService } from "../../services/authService";

export default function AdminLogin() {
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const data = await authService.login(formData.email, formData.password);
      if (data.user.role !== "admin") {
        setError("Access denied. This portal is for Administrators only.");
        return;
      }
      loginStore(data.user, data.access_token);
      navigate("/admin");
    } catch (err) {
      setError("Invalid Administrator credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-sans">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Admin Gateway</h2>
        <p className="text-slate-500 text-sm mt-1">
          Authorized core systems personnel only.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Secure Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
            <input
              type="email"
              required
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl outline-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 text-slate-900 transition"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Master Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
            <input
              type="password"
              required
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl outline-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 text-slate-900 transition"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold flex justify-center items-center"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Authenticate System"
          )}
        </button>
      </form>
    </div>
  );
}
