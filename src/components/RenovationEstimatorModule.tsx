import { useState } from "react";
import { 
  Building2, 
  HelpCircle, 
  Sparkles, 
  CheckCircle, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Brush, 
  Coins, 
  Copy, 
  Check, 
  RotateCcw, 
  Calculator,
  UserCheck,
  Hammer
} from "lucide-react";
import { formatRupiah } from "../lib/utils";

const PAINT_GRADES = [
  { id: "ekonomis", name: "Cat Ekonomis (Cepat Kering)", pricePerLiter: 38000, coveragePerLiter: 10, brand: "Cat Kiloan / Standard" },
  { id: "premium", name: "Cat Premium (Bisa Dilap/Washable)", pricePerLiter: 85000, coveragePerLiter: 12, brand: "Dulux Catylac / Jotun" },
  { id: "luxury", name: "Cat Luxury Ultra (Anti-Bakteri & Mewah)", pricePerLiter: 155000, coveragePerLiter: 14, brand: "Dulux EasyClean / Nippon Spot-less" },
];

const WALL_CONDITIONS = [
  { id: "mulus", name: "Mulus & Siap Cat (Cat Ulang Standar)", primerCoats: 1, topCoats: 2, multiplier: 1 },
  { id: "retak", name: "Retak Rambut Tipis (Butuh Plamir Tambahan)", primerCoats: 1, topCoats: 2, multiplier: 1.2 },
  { id: "lembab", name: "Dinding Lembab / Kupas Cat Lama (Kerokan Total)", primerCoats: 2, topCoats: 3, multiplier: 1.5 },
];

export default function RenovationEstimatorModule() {
  // Dimensions
  const [length, setLength] = useState(4); // meters
  const [width, setWidth] = useState(3); // meters
  const [height, setHeight] = useState(3); // meters
  const [doors, setDoors] = useState(1); // Standard door is ~1.6m2
  const [windows, setWindows] = useState(1); // Standard window is ~1.2m2
  
  // Customizations
  const [paintGrade, setPaintGrade] = useState(PAINT_GRADES[1]); // Premium
  const [wallCondition, setWallCondition] = useState(WALL_CONDITIONS[0]); // Mulus
  const [serviceType, setServiceType] = useState<"diy" | "pro">("pro");
  const [copied, setCopied] = useState(false);

  // Constants
  const doorArea = 1.6;
  const windowArea = 1.2;
  const laborCostPerM2 = 25000; // Rp 25.000 / m2
  const plamirCostPerM2 = 8000;
  const materialKitCostFlump = 120000; // roller, brush, sandpaper, tape, drop-cloth

  // Reset factors
  const handleReset = () => {
    setLength(4);
    setWidth(3);
    setHeight(3);
    setDoors(1);
    setWindows(1);
    setPaintGrade(PAINT_GRADES[1]);
    setWallCondition(WALL_CONDITIONS[0]);
    setServiceType("pro");
  };

  // Calculations
  const calculateWallArea = () => {
    // 4 walls = 2 * (L * H) + 2 * (W * H)
    const rawArea = 2 * (length * height) + 2 * (width * height);
    const openingsSubtracted = (doors * doorArea) + (windows * windowArea);
    const netArea = Math.max(5, rawArea - openingsSubtracted);
    return Math.round(netArea * 10) / 10;
  };

  const calculateCeilingArea = () => {
    return Math.round(length * width * 10) / 10;
  };

  const netWallArea = calculateWallArea();
  const ceilingArea = calculateCeilingArea();
  const totalPaintableArea = netWallArea; // default paint wall only

  // Prime/undercoat sealer liters (1 liter coverage = approx 10m2 per coat)
  const primerLitersNeeded = Math.ceil((totalPaintableArea * wallCondition.primerCoats) / 10);
  const primerCost = primerLitersNeeded * 45000; // Average primer is Rp 45K per liter

  // Topcoat paint liters needed
  const paintLitersNeeded = Math.ceil((totalPaintableArea * wallCondition.topCoats * wallCondition.multiplier) / paintGrade.coveragePerLiter);
  const paintCost = paintLitersNeeded * paintGrade.pricePerLiter;

  // Plamir / compound wall filler (needed for bad walls)
  const isPlamirNeeded = wallCondition.id !== "mulus";
  const plamirKgNeeded = isPlamirNeeded ? Math.ceil(totalPaintableArea * 0.15) : 0; // 0.15 kg per m2
  const plamirCost = plamirKgNeeded * 20000; // Average Rp 20.000 / kg

  // Labor rates standard
  const actualLaborMultiplier = wallCondition.id === "lembab" ? 1.4 : wallCondition.id === "retak" ? 1.15 : 1;
  const handymanLaborWages = serviceType === "pro" ? Math.round(totalPaintableArea * laborCostPerM2 * actualLaborMultiplier) : 0;
  const plamirLaborWages = (serviceType === "pro" && isPlamirNeeded) ? Math.round(totalPaintableArea * plamirCostPerM2) : 0;
  const totalLaborCost = handymanLaborWages + plamirLaborWages;

  const totalMaterialsCost = paintCost + primerCost + plamirCost + materialKitCostFlump;
  const totalProjectCost = totalMaterialsCost + totalLaborCost;

  const getInvoiceText = () => {
    return `==========================================
    ESTIMASI RINCIAN BIAYA PENGECATAN RUANG
    *TUKANGKU PROFESSIONAL ESTIMATOR*
==========================================
PENGATURAN RUANG:
- Dimensi Ruangan: ${length}m x ${width}m x ${height}m
- Luasan Dinding Bersih: ${netWallArea} m²
- Jumlah Pintu/Jendela: ${doors} Pintu, ${windows} Jendela
- Kondisi Tembok: ${wallCondition.name}
- Kualitas Cat: ${paintGrade.name} (${paintGrade.brand})
- Tipe Pengerjaan: ${serviceType === "pro" ? "Jasa Tukang Borongan" : "DIY (Kerjakan Sendiri)"}

RINCIAN ESTIMASI BAHAN / MATERIAL:
1. Cat Sealer / Primer: ${primerLitersNeeded} Liter -> Rp ${primerCost.toLocaleString("id-ID")}
2. Cat Warna Utama (Topcoat): ${paintLitersNeeded} Liter -> Rp ${paintCost.toLocaleString("id-ID")}
3. Plamir Dinding: ${plamirKgNeeded} Kg -> Rp ${plamirCost.toLocaleString("id-ID")}
4. Toolkit Utama (Kuas, Rol, Tape, Alas): 1 Paket -> Rp ${materialKitCostFlump.toLocaleString("id-ID")}
------------------------------------------
TOTAL MATERIAL: Rp ${totalMaterialsCost.toLocaleString("id-ID")}

RINCIAN ESTIMASI UPAH TUKANG:
- Upah Pengecatan Borongan: Rp ${handymanLaborWages.toLocaleString("id-ID")}
- Upah Plamir / Perbaikan Retak: Rp ${plamirLaborWages.toLocaleString("id-ID")}
------------------------------------------
TOTAL UPAH JASA: Rp ${totalLaborCost.toLocaleString("id-ID")}

==========================================
ESTIMASI TOTAL BIAYA: Rp ${totalProjectCost.toLocaleString("id-ID")}
==========================================
*Catatan: Estimasi ini bersifat referensi primer berbasis standard koefisien SNI Indonesia. Biaya riil di lapangan dapat sedikit bervariasi bergantung situasi lokal vendor.*`;
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(getInvoiceText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Calculator className="w-5 h-5 text-brand-amber" /> Estimator Biaya Renovasi & Cat Dinding
          </h2>
          <p className="text-sm text-text-secondary mt-1">Simulasikan dimensi ruangan Anda, pilih tipe cat, perhitungkan upah tukang borongan, dan dapatkan draf rincian RAB pengecatan instan.</p>
        </div>

        <button
          onClick={handleReset}
          className="btn-secondary h-10 px-4 text-xs font-bold flex items-center gap-2 self-start md:self-auto"
        >
          <RotateCcw className="w-4 h-4" /> Reset Nilai
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Grid: Input Sliders & Selectors (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card 1: Dimensi Ruang */}
          <div className="card-flat p-6 bg-white border border-border-subtle shadow-sm space-y-6">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2 pb-2.5 border-b border-border-subtle">
              <Maximize2 className="w-4.5 h-4.5 text-brand-amber" /> 1. Konfigurasi Volume Ruangan & Bukaan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Length */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-extrabold text-text-tertiary uppercase">Panjang Ruang</label>
                  <span className="text-xs font-bold font-mono text-text-primary">{length} Meter</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="12"
                  step="0.5"
                  value={length}
                  onChange={e => setLength(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand-amber"
                />
              </div>

              {/* Width */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-extrabold text-text-tertiary uppercase">Lebar Ruang</label>
                  <span className="text-xs font-bold font-mono text-text-primary">{width} Meter</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="12"
                  step="0.5"
                  value={width}
                  onChange={e => setWidth(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand-amber"
                />
              </div>

              {/* Height */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-extrabold text-text-tertiary uppercase">Tinggi Plafon</label>
                  <span className="text-xs font-bold font-mono text-text-primary">{height} Meter</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="5"
                  step="0.1"
                  value={height}
                  onChange={e => setHeight(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand-amber"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-gray-100">
              {/* Doors */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-extrabold text-text-tertiary uppercase">Jumlah Pintu Utama</label>
                  <span className="text-xs font-bold font-mono text-text-primary">{doors} unit</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="1"
                  value={doors}
                  onChange={e => setDoors(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand-amber"
                />
                <span className="text-[9px] text-text-tertiary block font-mono">Bukaan dikurangi ±{(doors * doorArea).toFixed(1)} m²</span>
              </div>

              {/* Windows */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-extrabold text-text-tertiary uppercase">Jumlah Jendela</label>
                  <span className="text-xs font-bold font-mono text-text-primary">{windows} unit</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="6"
                  step="1"
                  value={windows}
                  onChange={e => setWindows(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand-amber"
                />
                <span className="text-[9px] text-text-tertiary block font-mono">Bukaan dikurangi ±{(windows * windowArea).toFixed(1)} m²</span>
              </div>
            </div>
          </div>

          {/* Card 2: Paint & Materials Specification */}
          <div className="card-flat p-6 bg-white border border-border-subtle shadow-sm space-y-6">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2 pb-2.5 border-b border-border-subtle">
              <Brush className="w-4.5 h-4.5 text-brand-amber" /> 2. Kualitas Cat & Kondisi Media Dinding
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Paint Quality */}
              <div className="space-y-2">
                <label className="block text-[10px] font-extrabold text-text-tertiary uppercase tracking-wider">Mutu Cat (Topcoat)</label>
                <div className="space-y-2">
                  {PAINT_GRADES.map((grade) => (
                    <button
                      key={grade.id}
                      onClick={() => setPaintGrade(grade)}
                      className={`w-full text-left p-3 rounded-xl border text-xs font-bold flex flex-col transition-all gap-1.5 ${
                        paintGrade.id === grade.id 
                          ? "border-brand-amber bg-amber-50/20 text-text-primary" 
                          : "border-border-subtle hover:bg-gray-50 text-text-secondary"
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span>{grade.name}</span>
                        <span className="font-mono text-brand-amber">{formatRupiah(grade.pricePerLiter)}/L</span>
                      </div>
                      <span className="text-[10px] font-normal text-text-tertiary block">Rekomendasi Merk: {grade.brand}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Surface condition */}
              <div className="space-y-2">
                <label className="block text-[10px] font-extrabold text-text-tertiary uppercase tracking-wider">Kondisi Fisik Tembok</label>
                <div className="space-y-2">
                  {WALL_CONDITIONS.map((cond) => (
                    <button
                      key={cond.id}
                      onClick={() => setWallCondition(cond)}
                      className={`w-full text-left p-3 rounded-xl border text-xs font-bold flex flex-col transition-all gap-1.5 ${
                        wallCondition.id === cond.id 
                          ? "border-brand-amber bg-amber-50/20 text-text-primary" 
                          : "border-border-subtle hover:bg-gray-50 text-text-secondary"
                      }`}
                    >
                      <span>{cond.name}</span>
                      <span className="text-[10px] font-normal text-text-tertiary block">
                        Butuh {cond.primerCoats} lapis sealer & {cond.topCoats} lapis utama.
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Employment Mode selection */}
          <div className="card-flat p-6 bg-white border border-border-subtle shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2 pb-2.5 border-b border-border-subtle">
              <Hammer className="w-4.5 h-4.5 text-brand-amber" /> 3. Pembagian Metode Eksekusi
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setServiceType("diy")}
                className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-2 transition-all ${
                  serviceType === "diy"
                    ? "border-brand-amber bg-amber-50/25"
                    : "border-border-subtle bg-white hover:bg-gray-50"
                }`}
              >
                <Brush className={`w-6 h-6 ${serviceType === "diy" ? "text-brand-amber" : "text-text-tertiary"}`} />
                <div>
                  <h4 className="text-xs font-bold text-text-primary">Eksklusi: DIY Pengecatan Mandiri</h4>
                  <p className="text-[10px] text-text-tertiary mt-1">Tanpa upah bayar tukang. Sangat hemat budget.</p>
                </div>
              </button>

              <button
                onClick={() => setServiceType("pro")}
                className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-2 transition-all ${
                  serviceType === "pro"
                    ? "border-brand-amber bg-amber-50/25"
                    : "border-border-subtle bg-white hover:bg-gray-50"
                }`}
              >
                <UserCheck className={`w-6 h-6 ${serviceType === "pro" ? "text-brand-amber" : "text-text-tertiary"}`} />
                <div>
                  <h4 className="text-xs font-bold text-text-primary">Inklusi: Jasa Tukang Ahli</h4>
                  <p className="text-[10px] text-text-tertiary mt-1">Disertai standar koefisien borongan wilayah Anda.</p>
                </div>
              </button>
            </div>
          </div>

        </div>

        {/* Right Grid: Financial Breakdown & Copyable Invoice (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick Stats Invoice Card */}
          <div className="card-flat p-6 bg-brand-slate text-white shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">PROJECT ESTIMATE</span>
                <h4 className="text-lg font-extrabold text-white mt-1">Draf Rincian RAB</h4>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500 text-brand-slate font-sans">
                {serviceType === "pro" ? "Borongan" : "Do It Yourself"}
              </span>
            </div>

            {/* Total */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">TOTAL ESTIMASI BIAYA</span>
              <div className="text-3xl font-extrabold text-brand-amber font-mono tracking-tight">
                {formatRupiah(totalProjectCost)}
              </div>
              <span className="text-[10px] text-slate-300 block italic leading-tight">Berubah otomatis mengikuti volume media dinding</span>
            </div>

            {/* Key factors */}
            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4 text-xs">
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider mb-1">Volume Bersih Dinding</span>
                <span className="font-extrabold text-white font-mono">{netWallArea} m²</span>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider mb-1">Cat Utama Diperlukan</span>
                <span className="font-extrabold text-white font-mono">{paintLitersNeeded} Liter</span>
              </div>
            </div>

            {/* Itemized Invoice rows */}
            <div className="space-y-3.5 border-t border-white/5 pt-4 text-xs font-medium">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">1. Cat Sealer Dasar ({primerLitersNeeded}L)</span>
                <span className="font-bold text-white font-mono">{formatRupiah(primerCost)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">2. Cat Warna Utama ({paintLitersNeeded}L)</span>
                <span className="font-bold text-white font-mono">{formatRupiah(paintCost)}</span>
              </div>
              {isPlamirNeeded && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">3. Bahan Plamir Dinding ({plamirKgNeeded} kg)</span>
                  <span className="font-bold text-white font-mono">{formatRupiah(plamirCost)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-slate-400">4. Paket Toolkit cat standar</span>
                <span className="font-bold text-white font-mono">{formatRupiah(materialKitCostFlump)}</span>
              </div>
              {serviceType === "pro" && (
                <div className="flex justify-between items-center border-t border-white/5 pt-3.5 text-amber-300">
                  <span>5. Jasa Upah Borongan Tukang</span>
                  <span className="font-bold font-mono">{formatRupiah(totalLaborCost)}</span>
                </div>
              )}
            </div>

            {/* Action check copy */}
            <div className="pt-2">
              <button
                onClick={handleCopyToClipboard}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-white text-brand-slate hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-brand-emerald" />
                    <span>Salin Berhasil!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Rencana Anggaran (RAB)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Legal / safety guide disclaimer details */}
          <div className="card-flat p-4 bg-gray-50 border border-border-subtle text-[11px] text-text-secondary leading-relaxed space-y-2">
            <span className="font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-brand-emerald" /> Rekomendasi Alur Pengerjaan:
            </span>
            <ul className="list-decimal pl-4 space-y-1.5 font-medium text-text-secondary">
              <li>Lakukan amplas permukaan dinding terlebih dahulu agar cat lama teraplikasi rata.</li>
              <li>Pastikan mengoleskan 1 lapis Cat Sealer (Primer) alkali resisting sebelum cat warna utama demi ketahanan jangka panjang dan anti jamur.</li>
              <li>Gunakan roll bulu pendek untuk dinding beton dan roll bulu panjang bagi plafon bertekstur kasar.</li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
