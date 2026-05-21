import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";
import toast from "react-hot-toast";
import { 
  Coins, 
  CheckCircle2, 
  CreditCard, 
  History, 
  ScanLine, 
  Receipt,
  Loader2,
  Lock,
  Clock,
  QrCode,
  Landmark,
  TerminalSquare
} from "lucide-react";

import { getTokenPackages, createCheckoutSession } from "../../services/paymentService"; 

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { lang } = useAppStore();
  
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedGateway, setSelectedGateway] = useState("sepay");
  const [transactions, setTransactions] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  // --- TỪ ĐIỂN SONG NGỮ (i18n) ---
  const t = {
    EN: {
      title: "Recharge Tokens",
      subtitle: "Buy tokens to run banknote scans, review agent results, and export JSON reports. 1 successful scan uses 1 token.",
      currBalance: "Current Balance",
      toWorkspace: "Go to Workspace",
      selectPkg: "Select a package",
      bestValue: "Best Value",
      selected: "Selected",
      choose: "Choose",
      payMethod: "Payment Method",
      sepay: "VietQR / SePay",
      sepayDesc: "Scan bank QR code",
      bankTx: "Bank Transfer",
      bankTxDesc: "Manual bank transfer",
      vnpay: "VNPay",
      vnpayDesc: "Pay via VNPay gateway",
      mock: "Sandbox (Mock)",
      mockDesc: "Instant test payment (Saves to DB)",
      comingSoon: "Coming Soon",
      summary: "Order Summary",
      pkg: "Package",
      tokensInc: "Tokens included",
      gateway: "Gateway",
      total: "Total Due",
      selectFirst: "Select a package to continue",
      btnPay: "Continue to Payment",
      btnMock: "Process Mock Payment",
      loading: "Processing...",
      howItWorks: "How Tokens Work",
      step1Title: "Choose a package",
      step1Desc: "Select the token bundle that fits your needs.",
      step2Title: "Complete payment",
      step2Desc: "Pay securely via VietQR, Bank Transfer or Sandbox.",
      step3Title: "Receive Tokens",
      step3Desc: "Tokens are automatically added to your balance.",
      step4Title: "Start scanning",
      step4Desc: "Return to the Workspace and analyze banknotes.",
      history: "Recent Token Activity",
      noHistory: "No token activity yet",
      noHistoryDesc: "Your transaction history will appear here.",
      thDate: "Date",
      thType: "Transaction Type",
      thTokens: "Tokens",
      thAmount: "Amount",
      thStatus: "Status",
      errSelect: "Please select a token package.",
      errPay: "Unable to process payment. Please try again.",
      successInit: "Invoice generated successfully!",
      successMock: "Sandbox payment successful! Tokens added."
    },
    VI: {
      title: "Nạp Token",
      subtitle: "Mua token để quét tiền, xem kết quả phân tích và xuất báo cáo JSON. 1 lần quét thành công sử dụng 1 token.",
      currBalance: "Số dư hiện tại",
      toWorkspace: "Vào Workspace",
      selectPkg: "Chọn gói token",
      bestValue: "Khuyên Dùng",
      selected: "Đã chọn",
      choose: "Chọn",
      payMethod: "Phương thức thanh toán",
      sepay: "VietQR / SePay",
      sepayDesc: "Quét mã QR ngân hàng",
      bankTx: "Chuyển khoản",
      bankTxDesc: "Chuyển khoản theo hóa đơn",
      vnpay: "VNPay",
      vnpayDesc: "Thanh toán qua cổng VNPay",
      mock: "Sandbox (Giả lập)",
      mockDesc: "Thanh toán test (Lưu vào DB)",
      comingSoon: "Sắp có",
      summary: "Tóm tắt đơn hàng",
      pkg: "Gói",
      tokensInc: "Token nhận được",
      gateway: "Cổng thanh toán",
      total: "Tổng thanh toán",
      selectFirst: "Chọn một gói để tiếp tục",
      btnPay: "Tiếp tục thanh toán",
      btnMock: "Xử lý thanh toán giả lập",
      loading: "Đang tạo hóa đơn...",
      howItWorks: "Hướng dẫn mua và sử dụng Token",
      step1Title: "Chọn gói token",
      step1Desc: "Lựa chọn gói phù hợp với nhu cầu của bạn.",
      step2Title: "Thanh toán",
      step2Desc: "Thanh toán an toàn qua mã VietQR hoặc chuyển khoản.",
      step3Title: "Nhận Token",
      step3Desc: "Token được cộng tự động sau khi hệ thống xác nhận.",
      step4Title: "Sử dụng",
      step4Desc: "Quay lại Workspace tải ảnh lên và bắt đầu phân tích.",
      history: "Lịch sử giao dịch gần đây",
      noHistory: "Chưa có giao dịch token",
      noHistoryDesc: "Lịch sử nạp và sử dụng token của bạn sẽ hiển thị tại đây.",
      thDate: "Ngày",
      thType: "Loại giao dịch",
      thTokens: "Số lượng Token",
      thAmount: "Số tiền",
      thStatus: "Trạng thái",
      errSelect: "Vui lòng chọn một gói token.",
      errPay: "Không thể xử lý thanh toán. Vui lòng thử lại.",
      successInit: "Khởi tạo hóa đơn thành công!",
      successMock: "Thanh toán giả lập thành công! Đã cộng token."
    }
  };

  const text = t[lang || "EN"];

  // Dữ liệu gói tĩnh (Fallback nâng cao)
  const enhancedFeatures = {
    "pkg_1": lang === "VI" 
      ? ["Phân tích đa tác tử cơ bản", "Xuất dữ liệu JSON tiêu chuẩn", "Lưu trữ lịch sử 30 ngày"]
      : ["Basic multi-agent analysis", "Standard JSON export", "30-day history retention"],
    "pkg_2": lang === "VI" 
      ? ["Phân tích đối chiếu chéo chuyên sâu", "Xuất toàn bộ lược đồ JSON", "Lưu trữ lịch sử vĩnh viễn", "Độ ưu tiên hàng đợi cao"]
      : ["Advanced cross-checking analysis", "Full JSON schema export", "Lifetime history retention", "High queue priority"],
    "pkg_3": lang === "VI" 
      ? ["Hỗ trợ xử lý tải lên hàng loạt", "Quyền truy cập API tích hợp", "Tinh chỉnh Agent tùy chỉnh", "Hỗ trợ kỹ thuật ưu tiên 24/7"]
      : ["Bulk upload processing support", "Integrated API access", "Custom agent fine-tuning", "24/7 priority technical support"],
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const pkgs = await getTokenPackages();
        if (pkgs && pkgs.length > 0) {
          // Bơm thêm tính năng chi tiết vào dữ liệu API trả về để UI nhìn chuyên nghiệp hơn
          const enrichedPkgs = pkgs.map(p => ({
            ...p,
            features: enhancedFeatures[p.id] || enhancedFeatures["pkg_1"]
          }));
          setPackages(enrichedPkgs);
          setSelectedPackage(enrichedPkgs[1] || enrichedPkgs[0]); // Default to Pro pack
        }
      } catch (error) {
        toast.error("Network error while loading packages.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [lang]);

  const handleCheckout = async () => {
    if (!selectedPackage) return toast.error(text.errSelect);
    setIsCheckoutLoading(true);
    
    try {
      // Gọi API Backend
      const invoiceData = await createCheckoutSession({ 
        package_id: selectedPackage.id,
        gateway: selectedGateway 
      });
      
      // SỬA CHỖ NÀY: Xử lý logic Mock rẽ nhánh rõ ràng
      if (selectedGateway === "mock") {
        toast.success(text.successMock);
        
        // Cập nhật state token ngay lập tức để user thấy
        if (user) {
          useAuthStore.setState({
            user: { 
              ...user, 
              token_balance: user.token_balance + (selectedPackage.tokens_included || selectedPackage.tokens) 
            }
          });
        }
        
        // Chuyển thẳng về Workspace vì đã nạp xong
        navigate("/workspace");
      } 
      else if (selectedGateway === "sepay" || selectedGateway === "bank_transfer") {
        // Chỉ chuyển sang trang checkout quét mã nếu KHÔNG PHẢI là mock
        navigate("/checkout", { state: { invoice: invoiceData } });
        toast.success(text.successInit);
      } 
      else if (selectedGateway === "vnpay" && invoiceData.checkout_url) {
        window.location.href = invoiceData.checkout_url;
      }
    } catch (error) {
      toast.error(text.errPay);
      console.error("Checkout Error:", error);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900 animate-[fadeInUp_0.4s_ease-out]">
      
      {/* HEADER SECTION */}
      <div className="bg-white border-b border-slate-200 pt-10 pb-10 mb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">{text.title}</h1>
            <p className="text-slate-500 text-lg leading-relaxed">{text.subtitle}</p>
          </div>
          
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center gap-5 w-full md:w-auto shadow-sm">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-600">
              <Coins size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{text.currBalance}</p>
              <p className="text-2xl font-bold text-slate-900">{user?.token_balance || 0} <span className="text-lg text-slate-500 font-medium">tokens</span></p>
            </div>
            <div className="ml-auto md:ml-4 border-l border-slate-200 pl-5">
              <button 
                onClick={() => navigate("/workspace")}
                className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors whitespace-nowrap"
              >
                {text.toWorkspace} &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Pricing Cards */}
          <div>
            <h2 className="text-xl font-bold mb-4">{text.selectPkg}</h2>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <div key={i} className="h-80 bg-slate-100 rounded-3xl animate-pulse"></div>)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {packages.map((pkg, idx) => {
                  const isSelected = selectedPackage?.id === pkg.id;
                  const isPro = pkg.id === 'pkg_2' || idx === 1; 
                  
                  return (
                    <div 
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`relative cursor-pointer transition-all duration-200 rounded-3xl p-6 bg-white flex flex-col
                        ${isSelected ? 'ring-2 ring-teal-500 border-transparent shadow-md scale-[1.02] z-10' : 'border border-slate-200 shadow-sm hover:border-teal-300'}
                      `}
                    >
                      {isPro && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-500 text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm whitespace-nowrap">
                          {text.bestValue}
                        </div>
                      )}
                      
                      <div className="mb-4">
                        <h3 className="font-bold text-lg text-slate-900">{pkg.name}</h3>
                        <p className="text-slate-500 text-sm mt-1">{pkg.tokens_included || pkg.tokens} tokens</p>
                      </div>
                      
                      <div className="mb-6">
                        <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{formatPrice(pkg.price_vnd)}</span>
                      </div>
                      
                      <ul className="space-y-3 mb-8 text-sm text-slate-600 flex-1">
                        {(pkg.features || []).map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 leading-snug">
                            <CheckCircle2 size={16} className="text-teal-500 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <div className={`w-full py-3 rounded-xl text-center font-bold text-sm transition-colors
                        ${isSelected ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'}
                      `}>
                        {isSelected ? text.selected : text.choose}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Payment Methods */}
          <div>
            <h2 className="text-xl font-bold mb-4">{text.payMethod}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              {/* VietQR / SePay */}
              <button 
                onClick={() => setSelectedGateway("sepay")}
                className={`relative flex flex-col items-center justify-center p-5 rounded-2xl border transition-all text-center ${
                  selectedGateway === "sepay" ? "border-teal-500 bg-teal-50/50 shadow-sm ring-1 ring-teal-500" : "bg-white border-slate-200 hover:border-teal-300"
                }`}
              >
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                  <QrCode className="text-blue-600" size={20} />
                </div>
                <span className="text-sm font-bold text-slate-900 mb-1">{text.sepay}</span>
                <span className="text-[10px] text-slate-500 leading-tight">{text.sepayDesc}</span>
                {selectedGateway === "sepay" && <CheckCircle2 size={16} className="absolute top-3 right-3 text-teal-600" />}
              </button>

              {/* Chuyển khoản */}
              <button 
                onClick={() => setSelectedGateway("bank_transfer")}
                className={`relative flex flex-col items-center justify-center p-5 rounded-2xl border transition-all text-center ${
                  selectedGateway === "bank_transfer" ? "border-teal-500 bg-teal-50/50 shadow-sm ring-1 ring-teal-500" : "bg-white border-slate-200 hover:border-teal-300"
                }`}
              >
                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                  <Landmark className="text-emerald-600" size={20} />
                </div>
                <span className="text-sm font-bold text-slate-900 mb-1">{text.bankTx}</span>
                <span className="text-[10px] text-slate-500 leading-tight">{text.bankTxDesc}</span>
                {selectedGateway === "bank_transfer" && <CheckCircle2 size={16} className="absolute top-3 right-3 text-teal-600" />}
              </button>

              {/* VNPay (Disabled/Coming Soon) */}
              <button disabled className="relative flex flex-col items-center justify-center p-5 rounded-2xl border border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed text-center">
                <div className="absolute top-0 right-0 bg-slate-200 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-bl-lg rounded-tr-xl">{text.comingSoon}</div>
                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center mb-3">
                  <CreditCard className="text-slate-500" size={20} />
                </div>
                <span className="text-sm font-bold text-slate-600 mb-1">{text.vnpay}</span>
                <span className="text-[10px] text-slate-500 leading-tight">{text.vnpayDesc}</span>
              </button>

              {/* Sandbox (Mock Payment) - Nút Giả lập DB */}
              <button 
                onClick={() => setSelectedGateway("mock")}
                className={`relative flex flex-col items-center justify-center p-5 rounded-2xl border transition-all text-center ${
                  selectedGateway === "mock" ? "border-amber-500 bg-amber-50/50 shadow-sm ring-1 ring-amber-500" : "bg-white border-slate-200 hover:border-amber-300"
                }`}
              >
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mb-3">
                  <TerminalSquare className="text-amber-600" size={20} />
                </div>
                <span className="text-sm font-bold text-slate-900 mb-1">{text.mock}</span>
                <span className="text-[10px] text-slate-500 leading-tight">{text.mockDesc}</span>
                {selectedGateway === "mock" && <CheckCircle2 size={16} className="absolute top-3 right-3 text-amber-600" />}
              </button>

            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ORDER SUMMARY */}
        <div className="xl:col-span-1">
          <div className="sticky top-6 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Receipt size={20} className="text-teal-600" />
              {text.summary}
            </h2>
            
            {!selectedPackage ? (
              <div className="py-10 text-center text-slate-500 flex flex-col items-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <ScanLine size={32} className="opacity-20 mb-3 text-slate-400" />
                <p className="font-medium">{text.selectFirst}</p>
              </div>
            ) : (
              <>
                <div className="space-y-5 mb-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">{text.pkg}</span>
                    <span className="font-bold text-slate-900">{selectedPackage.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">{text.tokensInc}</span>
                    <span className="font-bold text-slate-900">{selectedPackage.tokens_included || selectedPackage.tokens}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">{text.gateway}</span>
                    <span className={`font-bold uppercase ${selectedGateway === 'mock' ? 'text-amber-600' : 'text-slate-900'}`}>
                      {selectedGateway === 'sepay' ? text.sepay : 
                       selectedGateway === 'bank_transfer' ? text.bankTx : 
                       selectedGateway === 'mock' ? text.mock : selectedGateway}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-5 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="text-slate-900 font-bold">{text.total}</span>
                    <span className="text-3xl font-black text-teal-600 tracking-tight">{formatPrice(selectedPackage.price_vnd)}</span>
                  </div>
                </div>

                <button 
                  onClick={handleCheckout}
                  disabled={isCheckoutLoading}
                  className={`w-full py-4 text-white rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${
                    selectedGateway === "mock" ? "bg-amber-600 hover:bg-amber-700" : "bg-slate-900 hover:bg-slate-800"
                  }`}
                >
                  {isCheckoutLoading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
                  {isCheckoutLoading ? text.loading : (selectedGateway === "mock" ? text.btnMock : text.btnPay)}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* HOW TOKENS WORK */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-24">
        <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">{text.howItWorks}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { step: '1', title: text.step1Title, desc: text.step1Desc },
            { step: '2', title: text.step2Title, desc: text.step2Desc },
            { step: '3', title: text.step3Title, desc: text.step3Desc },
            { step: '4', title: text.step4Title, desc: text.step4Desc },
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-teal-50 text-teal-700 font-black rounded-full flex items-center justify-center mb-4 border border-teal-100">
                {item.step}
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* TRANS HISTORY */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-20">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <History size={24} className="text-slate-400" />
          {text.history}
        </h2>
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center justify-center bg-slate-50/50">
              <Clock size={48} className="text-slate-300 mb-4" />
              <h3 className="text-slate-900 font-bold text-lg">{text.noHistory}</h3>
              <p className="text-slate-500 text-sm mt-1 font-medium">{text.noHistoryDesc}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">{text.thDate}</th>
                    <th className="px-6 py-4">{text.thType}</th>
                    <th className="px-6 py-4">{text.thTokens}</th>
                    <th className="px-6 py-4">{text.thAmount}</th>
                    <th className="px-6 py-4">{text.thStatus}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {transactions.map((tx, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">{new Date(tx.created_at).toLocaleDateString('vi-VN')}</td>
                      <td className="px-6 py-4 text-slate-900">{tx.package_name || "Nạp token"}</td>
                      <td className="px-6 py-4 text-teal-600 font-bold">+{tx.tokens_added}</td>
                      <td className="px-6 py-4">{formatPrice(tx.amount)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg border text-xs font-bold uppercase tracking-wider ${
                          tx.status === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          tx.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}