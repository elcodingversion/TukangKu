import { useState } from "react";
import { Coins, HardHat, TrendingUp, Info, HelpCircle, ShieldAlert, Sparkles, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { formatRupiah } from "../lib/utils";
import { cn } from "../lib/utils";

export default function SavingsModule() {
  const [houseSize, setHouseSize] = useState<number>(100); // in sqm
  const [houseAge, setHouseAge] = useState<number>(5); // in years
  const [condition, setCondition] = useState<"Bagus" | "Menengah" | "Banyak Kerusakan">("Bagus");
  const [monthlySavings, setMonthlySavings] = useState<number>(350000); // monthly savings

  // Standard construction replacement cost estimate in Indonesia: ~Rp4,500,000 / sqm
  const buildingReconstructionCost = houseSize * 4500000;

  // Yearly maintenance cost:
  // Home Age factor: <3 yrs: 1.0%, 3-8 yrs: 1.5%, >8 yrs: 2.2%
  // Condition factor: Bagus: 1.0x, Menengah: 1.3x, Banyak Kerusakan: 1.8x
  const getAgeFactor = (age: number) => {
    if (age < 3) return 0.01;
    if (age <= 8) return 0.015;
    return 0.022;
  };

  const getConditionMultiplier = (cond: string) => {
    switch (cond) {
      case "Bagus": return 1.0;
      case "Menengah": return 1.3;
      case "Banyak Kerusakan": return 1.8;
      default: return 1.0;
    }
  };

  const ageFactor = getAgeFactor(houseAge);
  const conditionMult = getConditionMultiplier(condition);

  // Recommended annual maintenance budget
  const annualMaintenanceCost = buildingReconstructionCost * ageFactor * conditionMult;
  const recommendedMonthlySavings = Math.round(annualMaintenanceCost / 12);

  // Years to reach standard safety buffer (Standard buffer = 1% of total building value)
  const targetBuffer = buildingReconstructionCost * 0.015;
  const savingMonthTarget = monthlySavings > 0 ? Math.ceil(targetBuffer / monthlySavings) : 0;
  
  // Percent efficiency vs recommended
  const savingScore = Math.min(100, Math.round((monthlySavings / recommendedMonthlySavings) * 100));

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-text-primary tracking-tight">Kalkulator Dana Darurat Rumah</h2>
        <p className="text-sm text-text-secondary mt-1">Estimasi kebutuhan anggaran mitigasi perawatan berdasarkan spesifikasi ketahanan fisik rumah.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left: Input Control Forum (Spans 1 on large) */}
        <div className="card-flat p-6 bg-white border border-border-subtle shadow-sm space-y-6 h-fit">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border-subtle">
            <HardHat className="w-5 h-5 text-brand-amber text-medium" />
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Parameter Bangunan</h3>
          </div>

          {/* Size Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-text-secondary">Luas Bangunan</label>
              <span className="font-bold text-brand-amber font-mono text-[13px]">{houseSize} m²</span>
            </div>
            <input 
              type="range" 
              min="20" 
              max="400" 
              value={houseSize}
              onChange={(e) => setHouseSize(Number(e.target.value))}
              className="w-full accent-brand-amber bg-gray-100 rounded-lg appearance-none h-1.5 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-text-tertiary font-mono">
              <span>20 m²</span>
              <span>400 m²</span>
            </div>
          </div>

          {/* Age Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-text-secondary">Usia Rumah sejak dibangun</label>
              <span className="font-bold text-brand-amber font-mono text-[13px]">{houseAge} Tahun</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="40" 
              value={houseAge}
              onChange={(e) => setHouseAge(Number(e.target.value))}
              className="w-full accent-brand-amber bg-gray-100 rounded-lg appearance-none h-1.5 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-text-tertiary font-mono">
              <span>Baru</span>
              <span>40 Tahun</span>
            </div>
          </div>

          {/* Physical condition rating */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-text-secondary block">Kondisi Kerusakan Sekarang</label>
            <div className="grid grid-cols-3 gap-2">
              {(["Bagus", "Menengah", "Banyak Kerusakan"] as const).map((cond) => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => setCondition(cond)}
                  className={cn(
                    "py-2 px-1 text-[10px] font-bold uppercase tracking-wider border rounded-lg transition-all",
                    condition === cond
                      ? "bg-brand-amber border-brand-amber text-white shadow-sm"
                      : "bg-white text-text-secondary border-border-subtle hover:bg-gray-50"
                  )}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-border-subtle space-y-4">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-text-secondary">Simulasi Tabungan Mandiri</label>
              <span className="font-bold text-brand-amber font-mono text-[13px]">{formatRupiah(monthlySavings)} / bln</span>
            </div>
            <input 
              type="range" 
              min="50000" 
              max="2000000" 
              step="25000"
              value={monthlySavings}
              onChange={(e) => setMonthlySavings(Number(e.target.value))}
              className="w-full accent-brand-amber bg-gray-100 rounded-lg appearance-none h-1.5 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-text-tertiary font-mono">
              <span>Rp50rb</span>
              <span>Rp2jt</span>
            </div>
          </div>
        </div>

        {/* Right: Output calculation stats (spans 2 on large) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Bento Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Reconstruction Estimate */}
            <div className="card-flat p-6 bg-white border border-border-subtle shadow-sm space-y-2">
              <span className="text-[10px] font-extrabold text-text-tertiary uppercase tracking-widest leading-none">Nilai Konstruksi Rumah</span>
              <p className="text-xl font-bold text-text-primary font-mono tracking-tight tabular-nums">{formatRupiah(buildingReconstructionCost)}</p>
              <p className="text-[11px] text-text-secondary leading-relaxed pt-1.5 border-t border-dashed border-border-subtle">
                Dihitung berdasarkan estimasi biaya bangun pasar rata-rata lokal Rp4,5jt/m².
              </p>
            </div>

            {/* Target Buffer for Safety */}
            <div className="card-flat p-6 bg-white border border-border-subtle shadow-sm space-y-2">
              <span className="text-[10px] font-extrabold text-text-tertiary uppercase tracking-widest leading-none">Target Dana Cadangan Ideal</span>
              <p className="text-xl font-bold text-brand-emerald font-mono tracking-tight tabular-nums">{formatRupiah(targetBuffer)}</p>
              <p className="text-[11px] text-text-secondary leading-relaxed pt-1.5 border-t border-dashed border-border-subtle">
                Standar rasio ideal 1,5% dari total konstruksi untuk mitigasi darurat jangka panjang.
              </p>
            </div>
          </div>

          {/* Results Summary Box with Score Panel */}
          <div className="card-flat p-6 md:p-8 bg-brand-slate text-white space-y-6 shadow-md border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/5">
                  <Coins className="w-5 h-5 text-brand-amber animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">Rekomendasi Setoran Pemeliharaan</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Saran kalkulasi cerdas dari Tukangku AI.</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-brand-amber font-mono text-lg tabular-nums">{formatRupiah(recommendedMonthlySavings)} <span className="text-white text-xs">/ bln</span></p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              {/* Saving status dial */}
              <div className="flex flex-col items-center justify-center space-y-2 border-r border-white/5 last:border-r-0">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  {/* Circle outline */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="38" className="stroke-white/5" strokeWidth="8" fill="transparent" />
                    <circle 
                      cx="48" 
                      cy="48" 
                      r="38" 
                      className="stroke-brand-amber transition-all duration-500" 
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray="238"
                      strokeDashoffset={238 - (238 * savingScore) / 100}
                    />
                  </svg>
                  <span className="absolute font-mono font-bold text-base text-white">{savingScore}%</span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Kesehatan Anggaran</p>
              </div>

              {/* Target saving timeline detail */}
              <div className="sm:col-span-2 space-y-4">
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-brand-amber uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Prospek Simulasi Sesuai Anggaran Anda
                  </h4>
                  <p className="text-xs text-slate-350 leading-relaxed">
                    Dengan menyisihkan <strong className="text-white">{formatRupiah(monthlySavings)}/bulan</strong>, Anda akan memperoleh perlindungan dana darurat penuh senilai <strong className="text-white">{formatRupiah(targetBuffer)}</strong> dalam waktu sekitar <strong className="text-white font-mono text-sm">{savingMonthTarget} bulan</strong>.
                  </p>
                </div>

                {savingScore < 60 ? (
                  <div className="bg-red-950/40 border border-red-900/50 rounded-lg p-3 flex gap-2.5 items-start">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-red-250 leading-relaxed">
                      Nilai setoran Anda masih di bawah saran AI untuk umur rumah {houseAge} tahun. Pertimbangkan menaikkan setoran agar terhindar dari krisis biaya saat renovasi atap atau kran mendadak.
                    </p>
                  </div>
                ) : (
                  <div className="bg-emerald-950/40 border border-emerald-900/50 rounded-lg p-3 flex gap-2.5 items-start">
                    <TrendingUp className="w-4 h-4 text-brand-emerald flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-emerald-250 leading-relaxed">
                      Luar biasa! Target penyisihan dana duka/alat Anda sudah sangat memadai dengan resiko konstruksi fisik masa kini. Teruskan konsistensi ini!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-border-subtle rounded-xl p-5 flex gap-4">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-bold text-text-primary">Mengapa Harus Ada Dana Darurat Pemeliharaan Rumah?</p>
              <p className="text-text-secondary leading-relaxed">
                Biaya pemeliharaan properti bukanlah biaya statis melainkan eksponensial. Plafon yang rembes selama 3 bulan dapat merusak rangka atap baja ringan dan merobohkan gypsum, melipatgandakan biaya perbaikan hingga 5x lipat dari perbaikan mikro kran awal.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
