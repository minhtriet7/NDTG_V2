import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";
import { authService } from "../../services/authService";

export default function AdminLogin() {
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);
  const { lang, theme } = useAppStore();

  const isDark = theme === "dark";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const t = useMemo(
    () => ({
      EN: {
        badge: "ADMIN PANEL",
        title: "Admin Sign In",
        subtitle: "Access the management workspace for system administrators.",
        email: "Email",
        emailPlaceholder: "admin@example.com",
        password: "Password",
        passwordPlaceholder: "Enter your password",
        submit: "Sign in to Admin",
        loading: "Checking account...",
        userLogin: "Back to user login",
        accessDenied: "This account does not have administrator access.",
        invalid: "Invalid email or password.",
        note: "Only accounts with the admin role can continue to the dashboard.",
      },
      VI: {
        badge: "QUẢN TRỊ",
        title: "Đăng nhập quản trị",
        subtitle: "Truy cập khu vực quản lý dành cho quản trị viên hệ thống.",
        email: "Email",
        emailPlaceholder: "admin@example.com",
        password: "Mật khẩu",
        passwordPlaceholder: "Nhập mật khẩu",
        submit: "Vào trang quản trị",
        loading: "Đang kiểm tra tài khoản...",
        userLogin: "Quay lại đăng nhập người dùng",
        accessDenied: "Tài khoản này không có quyền quản trị.",
        invalid: "Email hoặc mật khẩu không đúng.",
        note: "Chỉ tài khoản có vai trò admin mới được vào bảng điều khiển.",
      },
    }),
    [],
  );

  const text = t[lang || "EN"] || t.EN;

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isLoading) return;

    setIsLoading(true);
    setError("");

    try {
      const data = await authService.login(formData.email, formData.password);

      const user = data?.user;
      const token = data?.access_token || data?.token;

      if (!user || !token) {
        setError(text.invalid);
        return;
      }

      if (String(user?.role || "").toLowerCase() !== "admin") {
        setError(text.accessDenied);
        return;
      }

      loginStore(user, token);
      navigate("/admin/dashboard", { replace: true });
    } catch {
      setError(text.invalid);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <div
          className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-bold tracking-wide mb-5 ${
            isDark
              ? "bg-teal-500/10 border-teal-500/20 text-teal-300"
              : "bg-teal-50 border-teal-100 text-teal-700"
          }`}
        >
          {text.badge}
        </div>

        <h1
          className={`text-3xl font-black tracking-tight ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          {text.title}
        </h1>

        <p
          className={`mt-3 text-sm leading-relaxed ${
            isDark ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {text.subtitle}
        </p>
      </div>

      {error && (
        <div
          className={`mb-5 p-4 rounded-2xl border text-sm font-semibold ${
            isDark
              ? "bg-rose-500/10 border-rose-500/20 text-rose-300"
              : "bg-rose-50 border-rose-100 text-rose-700"
          }`}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="admin-email"
            className={`block text-sm font-bold mb-2 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}
          >
            {text.email}
          </label>

          <input
            id="admin-email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={(event) => handleChange("email", event.target.value)}
            placeholder={text.emailPlaceholder}
            className={`block w-full h-12 px-4 rounded-xl border outline-none text-sm transition-all ${
              isDark
                ? "bg-slate-950 border-slate-700 text-slate-100 placeholder-slate-600 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
            }`}
          />
        </div>

        <div>
          <label
            htmlFor="admin-password"
            className={`block text-sm font-bold mb-2 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}
          >
            {text.password}
          </label>

          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={(event) => handleChange("password", event.target.value)}
            placeholder={text.passwordPlaceholder}
            className={`block w-full h-12 px-4 rounded-xl border outline-none text-sm transition-all ${
              isDark
                ? "bg-slate-950 border-slate-700 text-slate-100 placeholder-slate-600 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
            }`}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white rounded-xl font-bold flex justify-center items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {text.loading}
            </>
          ) : (
            text.submit
          )}
        </button>
      </form>

      <div
        className={`mt-5 p-4 rounded-2xl border text-sm leading-relaxed ${
          isDark
            ? "bg-slate-950 border-slate-800 text-slate-400"
            : "bg-slate-50 border-slate-100 text-slate-500"
        }`}
      >
        {text.note}
      </div>

      <button
        type="button"
        onClick={() => navigate("/auth/login")}
        className={`mt-5 w-full h-11 rounded-xl border text-sm font-bold transition-colors ${
          isDark
            ? "border-slate-700 text-slate-300 hover:bg-slate-800"
            : "border-slate-200 text-slate-600 hover:bg-slate-50"
        }`}
      >
        {text.userLogin}
      </button>
    </div>
  );
}
