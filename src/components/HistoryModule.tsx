import { useState } from "react";
import { MaintenanceLog } from "../types";
import { formatRupiah } from "../lib/utils";
import { Calendar, Search, ArrowRight, User, Package, Hammer, BarChart3, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from "recharts";

interface HistoryModuleProps {
  history: MaintenanceLog[];
  onSelectLog: (log: MaintenanceLog) => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-border-subtle rounded-xl shadow-md font-sans text-xs">
        <p className="font-bold text-text-primary mb-1">{label}</p>
        <p className="font-bold text-brand-amber text-sm">{formatRupiah(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export default function HistoryModule({ history, onSelectLog }: HistoryModuleProps) {
  const [searchTerm, setSearchTerm] = useState("");

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="bg-gray-100 p-8 rounded-full mb-6">
          <Calendar className="w-12 h-12 text-gray-300" />
        </div>
        <h3 className="text-xl font-bold text-text-primary mb-2">Riwayat Kosong</h3>
        <p className="text-text-secondary text-sm max-w-xs leading-relaxed">
          Unggah foto kerusakan pertama Anda untuk mulai mencatat riwayat pemeliharaan aset rumah tangga.
        </p>
      </div>
    );
  }

  // Generate list of the last 6 months dynamically based on the current date
  const getLastSixMonthsData = () => {
    const months = [];
    const now = new Date();
    // Build array from 5 months ago to current month
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleDateString("id-ID", { month: "short" });
      const yearLabel = d.getFullYear();
      months.push({
        monthName: `${monthLabel} ${yearLabel}`,
        year: d.getFullYear(),
        month: d.getMonth(),
        total: 0,
      });
    }

    // Populate with actual expenditure totals
    history.forEach((log) => {
      const logDate = new Date(log.completedAt);
      const logYear = logDate.getFullYear();
      const logMonth = logDate.getMonth();

      const matchedMonth = months.find(
        (m) => m.year === logYear && m.month === logMonth
      );
      if (matchedMonth) {
        matchedMonth.total += log.totalCost;
      }
    });

    return months;
  };

  const chartData = getLastSixMonthsData();
  const grandTotal6Months = chartData.reduce((acc, curr) => acc + curr.total, 0);

  // Filter history based on search term (item name or cause)
  const filteredHistory = history.filter((log) => {
    const searchLow = searchTerm.toLowerCase();
    return (
      log.diagnosis.item.toLowerCase().includes(searchLow) ||
      log.diagnosis.cause.toLowerCase().includes(searchLow)
    );
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">Riwayat Pemeliharaan</h2>
          <p className="text-text-secondary text-sm mt-1">Daftar perbaikan yang telah diselesaikan.</p>
        </div>
        <div className="relative group max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary transition-colors group-focus-within:text-brand-amber" />
          <input 
            type="text" 
            placeholder="Cari berdasarkan item..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-border-subtle rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-brand-amber outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Financial Analytics & Repair Trend Chart */}
      <div className="card-flat p-6 md:p-8 space-y-6 bg-white shadow-sm border border-border-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-100">
              <TrendingUp className="w-5 h-5 text-brand-amber" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary tracking-tight">Tren Pengeluaran Perbaikan</h3>
              <p className="text-xs text-text-secondary mt-0.5">Analisis total biaya dalam 6 bulan terakhir.</p>
            </div>
          </div>
          <div className="bg-amber-50/50 rounded-xl px-4 py-2.5 border border-amber-100/80 flex items-center gap-3 self-start sm:self-auto">
            <div className="w-2 h-2 rounded-full bg-brand-amber animate-pulse" />
            <div>
              <p className="text-[9px] text-brand-amber font-bold uppercase tracking-widest leading-none">Total Pengeluaran</p>
              <p className="text-sm font-bold text-text-primary mt-1 tabular-nums">{formatRupiah(grandTotal6Months)}</p>
            </div>
          </div>
        </div>

        <div className="h-64 md:h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis 
                dataKey="monthName" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#4B5563', fontSize: 10, fontWeight: 500 }} 
              />
              <YAxis 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#4B5563', fontSize: 10, fontWeight: 500 }}
                tickFormatter={(value) => {
                  if (value >= 1000000) {
                    return `Rp${(value / 1000000).toFixed(1)}jt`;
                  }
                  if (value >= 1000) {
                    return `Rp${(value / 1000).toFixed(0)}rb`;
                  }
                  return `Rp${value}`;
                }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F9FAFB' }} />
              <Bar 
                dataKey="total" 
                radius={[6, 6, 0, 0]} 
                maxBarSize={45}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.total > 0 ? '#D97706' : '#E5E7EB'} 
                    className="transition-all duration-300 hover:fill-opacity-90 cursor-pointer"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* History Items Listing */}
      <div className="space-y-6">
        <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest px-1">
          Daftar Log Riwayat ({filteredHistory.length})
        </p>

        {filteredHistory.length === 0 ? (
          <div className="card-flat p-12 text-center bg-gray-50/50">
            <p className="text-text-secondary text-sm">Tidak menemukan riwayat yang sesuai dengan kata kunci.</p>
          </div>
        ) : (
          <div className="relative pl-8 space-y-10">
            {/* Vertical Line */}
            <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-border-subtle" />

            {filteredHistory.map((log, index) => {
              const isConstruction = log.diagnosis.item.toLowerCase().includes("atap") || log.diagnosis.item.toLowerCase().includes("plafon");
              return (
                <motion.div 
                  key={log.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative"
                >
                  {/* Timeline Node */}
                  <div className="absolute -left-[28px] top-4">
                    <div className="w-[14px] h-[14px] rounded-full border-2 border-brand-emerald bg-white shadow-sm" />
                  </div>

                  <div 
                    onClick={() => onSelectLog(log)}
                    className={cn(
                      "card-flat flex flex-col md:flex-row gap-6 p-6 hover:border-brand-amber/30 transition-all duration-300 group cursor-pointer border-l-4",
                      isConstruction ? "border-l-brand-amber" : "border-l-brand-emerald"
                    )}
                  >
                    <div className="w-full md:w-40 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50 border border-border-subtle">
                      <img src={log.diagnosis.photoUrl} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex flex-wrap justify-between items-start gap-4 mb-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-text-primary text-base tracking-tight truncate group-hover:text-brand-amber transition-colors uppercase">
                                {log.diagnosis.item}
                              </h3>
                              <span className={cn("tag", isConstruction ? "tag-amber" : "tag-emerald")}>
                                {isConstruction ? "Konstruksi" : "Perangkat"}
                              </span>
                            </div>
                            <p className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest tabular-nums">
                              {new Date(log.completedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest mb-1">Total Biaya</p>
                            <p className="text-sm font-bold text-text-primary tabular-nums">{formatRupiah(log.totalCost)}</p>
                          </div>
                        </div>
                        <p className="text-text-secondary text-xs leading-relaxed line-clamp-2 max-w-xl">
                          {log.diagnosis.cause}. {log.rab?.verdictReason}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t border-dashed border-border-subtle">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 grayscale opacity-60">
                            <Hammer className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wide">{log.diagnosis.fixability.split(' (')[0]}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-brand-amber">
                          <span className="text-[10px] font-bold uppercase tracking-wider group-hover:mr-1 transition-all">Lihat Detail</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
