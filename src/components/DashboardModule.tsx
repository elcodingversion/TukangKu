import { MaintenanceLog } from "../types";
import { 
  DollarSign, 
  Settings, 
  TrendingUp, 
  Activity, 
  Wrench, 
  Calendar, 
  AlertOctagon, 
  ChevronRight, 
  PlusCircle, 
  LayoutDashboard 
} from "lucide-react";
import { formatRupiah } from "../lib/utils";
import { cn } from "../lib/utils";
import { motion } from "motion/react";

interface DashboardModuleProps {
  history: MaintenanceLog[];
  onSelectLog: (log: MaintenanceLog) => void;
  onNavigateTab: (tab: "scan" | "history" | "reminders") => void;
}

export default function DashboardModule({ history, onSelectLog, onNavigateTab }: DashboardModuleProps) {
  
  // Calculate top-level stats
  const totalSpent = history.reduce((sum, log) => sum + log.totalCost, 0);
  const totalDiagnosisCount = history.length;
  const avgCost = totalDiagnosisCount > 0 ? totalSpent / totalDiagnosisCount : 0;
  
  // High severity count (severity >= 4)
  const highSeverityCount = history.filter(log => log.diagnosis.severity >= 4).length;

  // Group by category (Construction vs AC vs Elektronik vs Lainnya)
  const categorySummary: Record<string, { count: number; totalCost: number }> = {};
  
  history.forEach(log => {
    let cat = "Lainnya";
    const itemLower = log.diagnosis.item.toLowerCase();
    
    if (itemLower.includes("ac")) cat = "AC";
    else if (itemLower.includes("laptop") || itemLower.includes("elektronik") || itemLower.includes("hp")) cat = "Elektronik";
    else if (itemLower.includes("atap") || itemLower.includes("tembok") || itemLower.includes("konstruksi") || itemLower.includes("pintu")) cat = "Konstruksi";

    if (!categorySummary[cat]) {
      categorySummary[cat] = { count: 0, totalCost: 0 };
    }
    categorySummary[cat].count += 1;
    categorySummary[cat].totalCost += log.totalCost;
  });

  // Recent 3 logs
  const recentLogs = [...history].sort((a, b) => b.completedAt - a.completedAt).slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-brand-amber" /> Dashboard Analisis
          </h2>
          <p className="text-sm text-text-secondary mt-1">Laporan finansial, rasio kesehatan aset, dan riwayat perbaikan rumah tangga digital.</p>
        </div>
        
        {totalDiagnosisCount === 0 && (
          <button 
            onClick={() => onNavigateTab("scan")}
            className="btn-primary py-2.5 px-4 h-auto text-xs font-bold shadow-lg shadow-brand-amber/10 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> Diagnosa Pertama Anda
          </button>
        )}
      </div>

      {/* Bento Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Expenses */}
        <div className="card-flat p-5 bg-white border border-border-subtle shadow-sm flex items-center gap-4">
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-100/60">
            <DollarSign className="w-5 h-5 text-brand-amber" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-text-tertiary uppercase tracking-widest leading-none">Total Pengeluaran</p>
            <p className="text-base font-bold text-text-primary font-mono mt-1.5">{formatRupiah(totalSpent)}</p>
          </div>
        </div>

        {/* Total Audits */}
        <div className="card-flat p-5 bg-white border border-border-subtle shadow-sm flex items-center gap-4">
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100/60">
            <Wrench className="w-5 h-5 text-brand-emerald" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-text-tertiary uppercase tracking-widest leading-none">Total Kasus</p>
            <p className="text-base font-bold text-text-primary mt-1.5">{totalDiagnosisCount} Perbaikan</p>
          </div>
        </div>

        {/* Average cost */}
        <div className="card-flat p-5 bg-white border border-border-subtle shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-xl border border-blue-100/60">
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-text-tertiary uppercase tracking-widest leading-none">Biaya Rata-Rata</p>
            <p className="text-base font-bold text-text-primary font-mono mt-1.5">{formatRupiah(avgCost)}</p>
          </div>
        </div>

        {/* High Urgency alert */}
        <div className="card-flat p-5 bg-white border border-border-subtle shadow-sm flex items-center gap-4">
          <div className={cn(
            "p-3 rounded-xl border",
            highSeverityCount > 0 
              ? "bg-red-50 border-red-100" 
              : "bg-gray-50 border-border-subtle"
          )}>
            <AlertOctagon className={cn("w-5 h-5", highSeverityCount > 0 ? "text-brand-red animate-bounce" : "text-text-tertiary")} />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-text-tertiary uppercase tracking-widest leading-none">Kerusakan Kritis</p>
            <p className={cn(
              "text-base font-bold mt-1.5",
              highSeverityCount > 0 ? "text-brand-red" : "text-text-primary"
            )}>
              {highSeverityCount} Kasus Berat
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left span 2: Category distribution & Recent audits */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Category distribution */}
          <div className="card-flat p-6 bg-white border border-border-subtle shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-brand-amber" /> Sebaran Kategori Kerusakan
            </h3>

            {Object.keys(categorySummary).length === 0 ? (
              <p className="text-xs text-text-secondary italic">Belum ada sebaran pengeluaran tercatat.</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(categorySummary).map(([cat, val]) => {
                  const percentage = totalSpent > 0 ? Math.round((val.totalCost / totalSpent) * 100) : 0;
                  return (
                    <div key={cat} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-text-secondary">{cat} <span className="text-[10px] font-medium text-text-tertiary">({val.count}x)</span></span>
                        <span className="font-bold text-text-primary font-mono">{formatRupiah(val.totalCost)} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            cat === "AC" && "bg-blue-500",
                            cat === "Elektronik" && "bg-purple-500",
                            cat === "Konstruksi" && "bg-brand-amber",
                            cat === "Lainnya" && "bg-gray-400"
                          )} 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent audits list */}
          <div className="card-flat p-6 bg-white border border-border-subtle shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2.5 border-b border-border-subtle">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4.5 h-4.5 text-brand-amber" /> Aktivitas Perbaikan Terbaru
              </h3>
              {history.length > 3 && (
                <button 
                  onClick={() => onNavigateTab("history")} 
                  className="text-[10px] uppercase font-extrabold text-brand-amber tracking-wider hover:underline"
                >
                  Semua Riwayat
                </button>
              )}
            </div>

            {recentLogs.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-text-tertiary">Tidak ada riwayat perbaikan saat ini.</p>
              </div>
            ) : (
              <div className="divide-y divide-border-subtle/60">
                {recentLogs.map((log) => (
                  <div 
                    key={log.id} 
                    onClick={() => onSelectLog(log)}
                    className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0 cursor-pointer group hover:bg-gray-50/65 rounded-lg px-2 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-border-subtle bg-gray-50">
                        <img src={log.diagnosis.photoUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text-primary group-hover:text-brand-amber transition-colors line-clamp-1 uppercase tracking-tight">{log.diagnosis.item}</p>
                        <p className="text-[10px] text-text-tertiary font-mono">{new Date(log.completedAt).toLocaleDateString("id-ID")}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs font-bold text-text-primary font-mono">{formatRupiah(log.totalCost)}</p>
                        <span className="text-[9px] uppercase font-bold text-text-tertiary tracking-wide">{log.diagnosis.urgency}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-text-tertiary group-hover:text-brand-amber transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right column: Action Guides helper tip card */}
        <div className="space-y-6">
          
          <div className="card-flat p-6 bg-gradient-to-br from-brand-slate to-slate-800 text-white shadow-md border-0 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-amber">Rekomendasi Strategis AI</h4>
            <div className="space-y-3 pt-1">
              <p className="text-xs text-slate-300 leading-relaxed">
                Berdasarkan riwayat dan analisis pengeluaran Anda, Tukangku AI mendeteksi status risiko kerusakan rumah Anda dalam taraf:
              </p>
              <div className="bg-white/10 p-3.5 rounded-xl border border-white/5 space-y-1">
                <p className="text-xs font-bold text-brand-emerald">STABIL & SANGAT AMAN</p>
                <p className="text-[10px] text-slate-400">Total kerusakan kritis mendekati 0. Program pemeliharaan preventif berjalan lancar.</p>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Disarankan untuk selalu melakukan check-up AC dan atap rutin setiap 4-6 bulan demi mencegah rembesan parah.
              </p>
            </div>
          </div>

          <div className="card-flat p-6 bg-white border border-border-subtle shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">Langkah Diagnosis Selanjutnya?</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Punya peralatan rumah tangga atau bagian bangunan yang dicurigai akan rusak? Gunakan sensor scan kamera pintar sekarang.
            </p>
            <button 
              onClick={() => onNavigateTab("scan")}
              className="w-full btn-secondary py-3 text-xs font-bold flex items-center justify-center gap-2 group border-dashed"
            >
              <PlusCircle className="w-4" /> Mulai Diagnose Baru
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
