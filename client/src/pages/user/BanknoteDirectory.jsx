import React, { useEffect, useState } from "react";
import {
  Search,
  MapPin,
  Layers,
  Filter,
  FileText,
  ChevronRight,
  ScanLine,
} from "lucide-react";
import { getBanknotes } from "../../services/currencyService";
import { useNavigate } from "react-router-dom";

export default function BanknoteDirectory() {
  const navigate = useNavigate();
  const [banknotes, setBanknotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchBanknotes = async () => {
      setLoading(true);
      const data = await getBanknotes({ region: "southeast_asia" });
      setBanknotes(data || []);
      setLoading(false);
    };
    fetchBanknotes();
  }, []);

  const filteredData = banknotes.filter(
    (b) =>
      b.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.currency_code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-900 form-content-animate">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Southeast Asia Banknotes
          </h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            Browse supported regional banknotes. Explore detailed metadata and
            AI compatibility.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by country or currency code (e.g., VND, THB)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 bg-slate-100 animate-pulse rounded-3xl"
              ></div>
            ))}
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">
              No banknotes match your search criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((note) => (
              <div
                key={note.id}
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
              >
                <div className="h-40 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6 relative">
                  <div className="text-teal-700 font-mono font-bold text-sm tracking-wider border border-teal-200/60 px-6 py-3 rounded-xl bg-teal-50/50">
                    {note.currency_code} {note.denomination}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {note.denomination} {note.currency_code}
                      </h3>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5" /> {note.country}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-y-3 mb-6 text-sm flex-1">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Material
                      </p>
                      <p className="font-semibold text-slate-700 mt-0.5">
                        {note.material}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Series
                      </p>
                      <p className="font-semibold text-slate-700 mt-0.5">
                        {note.series_year}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/recognize")}
                    className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <ScanLine className="w-4 h-4" /> Scan Similar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
