// src/pages/user/Checkout.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const invoice = location.state?.invoice;

  if (!invoice) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <p className="text-slate-500 mb-4">Không tìm thấy thông tin hóa đơn.</p>
        <button onClick={() => navigate('/pricing')} className="px-4 py-2 bg-teal-600 text-white rounded-xl">Quay lại Bảng giá</button>
      </div>
    );
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép!");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans text-slate-900">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate('/pricing')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold mb-6">
          <ArrowLeft size={18} /> Trở lại
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
          
          {/* Cột trái: QR Code */}
          <div className="md:w-1/2 p-8 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col items-center justify-center bg-slate-50/50">
            <h2 className="text-lg font-bold mb-6 text-center">Quét mã QR để thanh toán</h2>
            {invoice.qr_url ? (
               <img src={invoice.qr_url} alt="QR Code" className="w-64 h-64 object-contain rounded-xl bg-white p-2 border border-slate-200 shadow-sm" />
            ) : (
               <div className="w-64 h-64 bg-slate-200 animate-pulse rounded-xl"></div>
            )}
            <p className="mt-4 text-sm text-slate-500 text-center font-medium">
              Sử dụng ứng dụng ngân hàng hoặc ví điện tử để quét mã.
            </p>
          </div>

          {/* Cột phải: Thông tin chuyển khoản thủ công */}
          <div className="md:w-1/2 p-8">
            <h3 className="text-xl font-bold mb-6">Thông tin chuyển khoản</h3>
            
            <div className="space-y-5">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Ngân hàng</p>
                <p className="font-semibold">{invoice.bank_name || "Vietcombank (VCB)"}</p>
              </div>
              
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Số tài khoản</p>
                <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                  <p className="font-mono font-bold text-lg text-teal-700">{invoice.bank_account}</p>
                  <button onClick={() => handleCopy(invoice.bank_account)} className="text-slate-400 hover:text-teal-600"><Copy size={16}/></button>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Tên tài khoản</p>
                <p className="font-semibold">{invoice.account_name}</p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Số tiền</p>
                <p className="font-black text-xl">{new Intl.NumberFormat('vi-VN').format(invoice.amount)} đ</p>
              </div>

              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mt-2">
                <p className="text-xs font-bold text-amber-700 uppercase mb-1">Nội dung chuyển khoản (Bắt buộc)</p>
                <div className="flex items-center justify-between">
                  <p className="font-mono font-bold text-xl text-amber-600 tracking-wider">{invoice.transaction_code}</p>
                  <button onClick={() => handleCopy(invoice.transaction_code)} className="text-amber-500 hover:text-amber-700"><Copy size={18}/></button>
                </div>
                <p className="text-[11px] text-amber-600 mt-2">Ghi chính xác nội dung này để hệ thống tự động cộng Token.</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-start gap-3">
               <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0" />
               <p className="text-sm text-slate-600 leading-relaxed font-medium">
                 Sau khi thanh toán thành công, Token sẽ được cộng tự động vào tài khoản của bạn trong 1-3 phút.
               </p>
            </div>
            
            <button 
              onClick={() => navigate('/workspace')} 
              className="w-full mt-6 py-3 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl font-bold text-slate-700 transition-colors"
            >
               Về Workspace
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}