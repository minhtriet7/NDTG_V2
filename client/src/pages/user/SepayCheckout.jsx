import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Copy,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";

export default function SepayCheckout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Giải nén an toàn hóa đơn chuyển khoản từ trang Pricing đưa sang
  const invoice = location.state?.invoice;

  // Bảo vệ route: Nếu cố tình gõ URL /checkout mà chưa chọn gói -> Trả về pricing
  useEffect(() => {
    if (!invoice) {
      navigate("/pricing");
    }
  }, [invoice, navigate]);

  if (!invoice) return null;

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans text-slate-900 animate-[formFadeIn_0.4s_ease-out]">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/pricing")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={18} /> Quay lại bảng giá
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
          {/* CỘT TRÁI: KHUNG ĐEN QUÉT MÃ QR BIẾN ĐỘNG SỐ DƯ */}
          <div className="w-full md:w-1/2 bg-slate-900 text-white p-8 md:p-12 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 text-white">
              <ShieldCheck size={120} />
            </div>

            <div className="z-10 text-center w-full">
              <h2 className="text-2xl font-bold mb-2">Thanh Toán VietQR</h2>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                Mở ứng dụng ngân hàng (iBanking) bất kỳ và tiến hành quét mã QR
                dưới đây để tự động điền nội dung.
              </p>

              <div className="bg-white p-4 rounded-2xl shadow-xl inline-block mb-8 transition-transform hover:scale-[1.02]">
                <img
                  src={invoice.qr_url}
                  alt="VietQR Automatic Code"
                  className="w-56 h-56 object-contain"
                />
              </div>

              <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-medium">
                <RefreshCw size={16} className="animate-spin" /> Đang chờ cổng
                thanh toán xác nhận...
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: THÔNG TIN BANKING THỦ CÔNG */}
          <div className="w-full md:w-1/2 p-8 md:p-12 bg-white flex flex-col justify-center">
            <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">
              Chuyển khoản thủ công
            </h3>

            <div className="space-y-5">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
                  Ngân hàng
                </p>
                <p className="font-extrabold text-slate-900 text-base">
                  {invoice.bank_name || "Vietcombank (VCB)"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
                  Số tài khoản
                </p>
                <div className="flex items-center gap-3">
                  <p className="text-xl font-extrabold text-teal-600 font-mono tracking-wider">
                    {invoice.bank_account}
                  </p>
                  <button
                    onClick={() =>
                      handleCopy(invoice.bank_account, "Số tài khoản")
                    }
                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
                  Chủ tài khoản
                </p>
                <p className="font-bold text-slate-900 uppercase">
                  {invoice.account_name || "HUYNH NGUYEN MINH TRIET"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
                  Số tiền
                </p>
                <p className="text-xl font-extrabold text-slate-900">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(invoice.amount)}
                </p>
              </div>

              {/* KHUNG NỘI DUNG BẮT BUỘC ĐỂ WEBHOOK BẮT ĐƯỢC MÃ */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
                <p className="text-xs text-amber-700 font-bold uppercase tracking-wider mb-1">
                  Nội dung bắt buộc ghi
                </p>
                <div className="flex items-center gap-3">
                  <p className="text-lg font-black text-amber-900 font-mono tracking-wide">
                    {invoice.transaction_code}
                  </p>
                  <button
                    onClick={() =>
                      handleCopy(
                        invoice.transaction_code,
                        "Nội dung chuyển khoản",
                      )
                    }
                    className="p-2 bg-amber-100 hover:bg-amber-200 rounded-lg text-amber-700 transition-colors"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-start gap-3 text-xs text-slate-500 leading-relaxed">
              <Info size={20} className="shrink-0 text-slate-400 mt-0.5" />
              <p>
                Hệ thống tự động cộng số dư{" "}
                <strong>{invoice.tokens_added} Token</strong> vào tài khoản của
                bạn ngay khi nhận được tín hiệu biến động số dư ngân hàng thành
                công.
              </p>
            </div>

            <button
              onClick={() => navigate("/workspace")}
              className="mt-6 w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm transition-transform active:scale-[0.99]"
            >
              Tôi đã chuyển khoản xong
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
