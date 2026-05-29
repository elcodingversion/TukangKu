import { useState, useEffect } from "react";
import { 
  Zap, 
  Settings, 
  Trash2, 
  Plus, 
  AlertTriangle, 
  HelpCircle, 
  Coins, 
  TrendingDown, 
  Lightbulb, 
  Import,
  RefreshCw,
  Clock,
  Gauge
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { formatRupiah, cn } from "../lib/utils";

interface EnergyAppliance {
  id: string;
  name: string;
  category: string;
  wattage: number;
  hoursPerDay: number;
  quantity: number;
}

interface EnergyCalculatorModuleProps {
  userId?: string;
}

const PRESET_APPLIANCES = [
  { name: "Air Conditioner (AC) 1 PK", category: "AC", wattage: 840, hoursPerDay: 8, quantity: 1 },
  { name: "Kulkas 2 Pintu", category: "Kulkas", wattage: 120, hoursPerDay: 24, quantity: 1 },
  { name: "Televisi LED 43\"", category: "Elektronik", wattage: 75, hoursPerDay: 5, quantity: 1 },
  { name: "Mesin Cuci Buhur", category: "Mesin Cuci", wattage: 350, hoursPerDay: 1, quantity: 1 },
  { name: "Rice Cooker (Memasak)", category: "Dapur", wattage: 400, hoursPerDay: 1, quantity: 1 },
  { name: "Rice Cooker (Menghangatkan)", category: "Dapur", wattage: 50, hoursPerDay: 12, quantity: 1 },
  { name: "Pompa Air", category: "Sanitasi", wattage: 250, hoursPerDay: 2, quantity: 1 },
  { name: "Lampu LED Rumah (Paket 5 Pcs)", category: "Lampu", wattage: 45, hoursPerDay: 10, quantity: 1 },
  { name: "Setrika Listrik", category: "Dapur", wattage: 350, hoursPerDay: 1, quantity: 1 },
  { name: "Laptop & Charger", category: "Elektronik", wattage: 65, hoursPerDay: 6, quantity: 1 },
];

const PLN_TARIFFS = [
  { id: "subsidi-450", name: "R-1/TR (450 VA) - Bersubsidi", rate: 415, maxPower: 450 },
  { id: "subsidi-900", name: "R-1/TR (900 VA) - Bersubsidi", rate: 605, maxPower: 900 },
  { id: "900-non", name: "R-1/TR (900 VA RTM) - Non-Subsidi", rate: 1352, maxPower: 900 },
  { id: "1300", name: "R-1/TR (1300 VA) - Mandiri", rate: 1444.70, maxPower: 1300 },
  { id: "2200", name: "R-1/TR (2200 VA) - Premium", rate: 1444.70, maxPower: 2200 },
  { id: "3500-plus", name: "R-1/TR (3500 VA ke atas)", rate: 1699.53, maxPower: 5500 },
];

export default function EnergyCalculatorModule({ userId = "default" }: EnergyCalculatorModuleProps) {
  const [appliances, setAppliances] = useState<EnergyAppliance[]>([]);
  const [selectedTariff, setSelectedTariff] = useState(PLN_TARIFFS[3]); // Default 1300 VA
  const [showAddPreset, setShowAddPreset] = useState(false);
  
  // Custom form state
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState("Elektronik");
  const [customWattage, setCustomWattage] = useState("");
  const [customHours, setCustomHours] = useState("4");
  const [customQty, setCustomQty] = useState("1");

  // Load appliances
  useEffect(() => {
    const saved = localStorage.getItem(`tukangku_energy_${userId}`);
    if (saved) {
      setAppliances(JSON.parse(saved));
    } else {
      // Default initial calculation items
      const initial = [
        { id: "e1", name: "Air Conditioner (AC) Kamar Utama", category: "AC", wattage: 820, hoursPerDay: 8, quantity: 1 },
        { id: "e2", name: "Kulkas Dua Pintu Inverter", category: "Kulkas", wattage: 100, hoursPerDay: 24, quantity: 1 },
        { id: "e3", name: "Penerangan LED Ruang Tamu & Teras", category: "Lampu", wattage: 50, hoursPerDay: 11, quantity: 1 },
        { id: "e4", name: "LED TV & Soundbar", category: "Elektronik", wattage: 110, hoursPerDay: 4, quantity: 1 },
      ];
      setAppliances(initial);
      localStorage.setItem(`tukangku_energy_${userId}`, JSON.stringify(initial));
    }

    const savedTariffId = localStorage.getItem(`tukangku_tariff_${userId}`);
    if (savedTariffId) {
      const found = PLN_TARIFFS.find(t => t.id === savedTariffId);
      if (found) setSelectedTariff(found);
    }
  }, [userId]);

  const saveToStorage = (updated: EnergyAppliance[]) => {
    setAppliances(updated);
    localStorage.setItem(`tukangku_energy_${userId}`, JSON.stringify(updated));
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName || !customWattage) return;

    const newItem: EnergyAppliance = {
      id: Math.random().toString(36).substring(2, 9),
      name: customName,
      category: customCategory,
      wattage: Math.max(1, Number(customWattage)),
      hoursPerDay: Math.min(24, Math.max(0.1, Number(customHours))),
      quantity: Math.max(1, Number(customQty))
    };

    const updated = [newItem, ...appliances];
    saveToStorage(updated);

    // Reset
    setCustomName("");
    setCustomWattage("");
    setCustomHours("4");
    setCustomQty("1");
    setShowAddPreset(false);
  };

  const handleAddPreset = (preset: typeof PRESET_APPLIANCES[0]) => {
    const newItem: EnergyAppliance = {
      id: Math.random().toString(36).substring(2, 9),
      name: preset.name,
      category: preset.category,
      wattage: preset.wattage,
      hoursPerDay: preset.hoursPerDay,
      quantity: preset.quantity
    };
    const updated = [newItem, ...appliances];
    saveToStorage(updated);
  };

  const handleDeleteItem = (id: string) => {
    const updated = appliances.filter(item => item.id !== id);
    saveToStorage(updated);
  };

  const handleUpdateHours = (id: string, hours: number) => {
    const updated = appliances.map(item => {
      if (item.id === id) {
        return { ...item, hoursPerDay: Math.min(24, Math.max(0.1, Number(hours))) };
      }
      return item;
    });
    saveToStorage(updated);
  };

  const handleUpdateQty = (id: string, qty: number) => {
    const updated = appliances.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, Math.round(Number(qty))) };
      }
      return item;
    });
    saveToStorage(updated);
  };

  // Import from Appliance Inventory
  const handleImportInventory = () => {
    const savedInventory = localStorage.getItem(`tukangku_appliances_${userId}`);
    if (!savedInventory) {
      alert("Belum ada aset terdaftar di tab 'Aset & Garansi'!");
      return;
    }

    const inventoryItems = JSON.parse(savedInventory);
    if (inventoryItems.length === 0) {
      alert("Belum ada aset terdaftar di tab 'Aset & Garansi'!");
      return;
    }

    // Map categories & guess Wattages standard if not defined
    const imported: EnergyAppliance[] = inventoryItems.map((item: any) => {
      // Guess typical wattage based on name or category
      let guessedWattage = 150;
      const nameLower = item.name.toLowerCase();
      const catLower = item.category.toLowerCase();

      if (nameLower.includes("ac") || catLower.includes("ac")) {
        guessedWattage = nameLower.includes("1/5") || nameLower.includes("0.5") ? 360 : 840;
      } else if (nameLower.includes("kulkas") || catLower.includes("refrigerator") || catLower.includes("kulkas")) {
        guessedWattage = nameLower.includes("2 pintu") ? 140 : 80;
      } else if (nameLower.includes("mesin cuci") || nameLower.includes("wash") || catLower.includes("mesin cuci")) {
        guessedWattage = nameLower.includes("dryer") || nameLower.includes("steam") ? 800 : 350;
      } else if (nameLower.includes("tv") || nameLower.includes("televisi") || catLower.includes("tv")) {
        guessedWattage = 80;
      } else if (nameLower.includes("pompa") || nameLower.includes("water pump")) {
        guessedWattage = 250;
      } else if (nameLower.includes("laptop") || nameLower.includes("komputer")) {
        guessedWattage = 65;
      }

      return {
        id: `imported-${item.id}`,
        name: `${item.name} (${item.brand})`,
        category: item.category,
        wattage: guessedWattage,
        hoursPerDay: catLower.includes("kulkas") ? 24 : 4,
        quantity: 1
      };
    });

    const combined = [...appliances];
    // Avoid double imports
    imported.forEach(imp => {
      if (!combined.some(c => c.id === imp.id)) {
        combined.push(imp);
      }
    });

    saveToStorage(combined);
  };

  const handleTariffChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = PLN_TARIFFS.find(t => t.id === e.target.value);
    if (selected) {
      setSelectedTariff(selected);
      localStorage.setItem(`tukangku_tariff_${userId}`, selected.id);
    }
  };

  // Calculations
  const calculateDailyWh = () => {
    return appliances.reduce((sum, item) => sum + (item.wattage * item.hoursPerDay * item.quantity), 0);
  };

  const dailyWh = calculateDailyWh();
  const dailyKWh = dailyWh / 1000;
  const monthlyKWh = dailyKWh * 30;
  const monthlyCost = monthlyKWh * selectedTariff.rate;

  // Maximum active power warning
  const totalSimultaneousWattage = appliances.reduce((sum, item) => sum + (item.wattage * item.quantity), 0);
  const isPowerExceeded = totalSimultaneousWattage > selectedTariff.maxPower;

  // Recommendations generator
  const getSavingsTips = () => {
    if (appliances.length === 0) return [];
    
    // Sort appliances by high consumption (Wattage * Hours * Qty)
    const sorted = [...appliances].sort((a, b) => 
      (b.wattage * b.hoursPerDay * b.quantity) - (a.wattage * a.hoursPerDay * a.quantity)
    );

    const tips = [];
    const mainConsumer = sorted[0];
    const mainCost = (mainConsumer.wattage * mainConsumer.hoursPerDay * mainConsumer.quantity / 1000) * 30 * selectedTariff.rate;

    if (mainConsumer.category === "AC" || mainConsumer.name.toLowerCase().includes("ac")) {
      tips.push({
        title: "Optimasi Penggunaan AC Rumah Tangga",
        desc: `Alat "${mainConsumer.name}" adalah konsumen listrik tertinggi Anda (${formatRupiah(mainCost)}/bulan). Atur suhu stabil di 24°C - 25°C. Menaikkan 1°C menghemat sekitar 6% konsumsi daya AC tersebut.`,
        saving: mainCost * 0.15
      });
    }

    if (mainConsumer.hoursPerDay > 12 && mainConsumer.category !== "Kulkas") {
      tips.push({
        title: "Matikan Unit Saat Tidak Digunakan",
        desc: `"${mainConsumer.name}" menyala selama ${mainConsumer.hoursPerDay} jam sehari. Memangkas waktu penggunaan 2 jam per hari akan memotong biaya tagihan Anda secara signifikan.`,
        saving: (mainConsumer.wattage * 2 * mainConsumer.quantity / 1000) * 30 * selectedTariff.rate
      });
    }

    // Standby Vampires Tip
    tips.push({
      title: "Cegah Arus Bocor (Vampire Draw)",
      desc: "Cabut steker charger laptop, rice cooker, TV, dan dispenser dari stopkontak saat mode siaga. Perangkat siaga menyerap 1-5W konstan yang memboroskan hingga Rp 25.000 sebulan.",
      saving: 25000
    });

    // Bulb eco
    const hasBulb = appliances.some(a => a.category === "Lampu" || a.name.toLowerCase().includes("lampu"));
    if (hasBulb) {
      tips.push({
        title: "Migrasi Lampu LED Hemat Energi",
        desc: "Ganti seluruh lampu pijar atau lampu tabung TL lama Anda dengan LED pintar bersertifikasi hemat energi untuk memangkas konsumsi pencahayaan hingga 80%.",
        saving: 18000
      });
    }

    return tips;
  };

  const tips = getSavingsTips();

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-brand-amber animate-pulse" /> Kalkulator Energi & Biaya Listrik
          </h2>
          <p className="text-sm text-text-secondary mt-1">Eksplorasi penggunaan daya alat elektronik Anda, lakukan audit beban kWh PLN, dan temukan solusi hemat finansial bulanan.</p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleImportInventory}
            className="btn-secondary py-2.5 px-4 text-xs font-bold flex items-center gap-2 hover:border-brand-amber hover:text-brand-amber transition-colors"
            title="Impor alat-alat dari inventaris Anda"
          >
            <Import className="w-4 h-4" /> Impor dari Inventaris
          </button>
          
          <button 
            onClick={() => setShowAddPreset(p => !p)}
            className="btn-primary py-2.5 px-4 text-xs font-bold shadow-lg shadow-brand-amber/10 flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> {showAddPreset ? "Sembunyikan Form" : "Tambah Alat Baru"}
          </button>
        </div>
      </div>

      {/* Main Container Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Billing Summary & Tariff Settings (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Settings Card */}
          <div className="card-flat p-6 bg-white border border-border-subtle shadow-sm space-y-5">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-border-subtle">
              <Settings className="w-4 h-4 text-brand-slate" /> Konfigurasi Golongan Tarif PLN
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-text-tertiary uppercase tracking-wider mb-2">Golongan / Tarif Listrik Saat Ini</label>
                <select
                  value={selectedTariff.id}
                  onChange={handleTariffChange}
                  className="w-full bg-gray-50 border border-border-subtle rounded-xl p-3 text-xs font-medium focus:border-brand-amber outline-none transition-all"
                >
                  {PLN_TARIFFS.map(t => (
                    <option key={t.id} value={t.id}>{t.name} (Rp {t.rate}/kWh)</option>
                  ))}
                </select>
                <p className="text-[10px] text-text-tertiary mt-2">Didasarkan pada ketetapan tarif penyesuaian (Tariff Adjustment) terbaru dari PLN Indonesia.</p>
              </div>

              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-border-subtle">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-text-secondary" />
                  <span className="text-xs text-text-secondary font-medium">Kapasitas Daya Terpasang</span>
                </div>
                <span className="text-xs font-bold text-text-primary font-mono">{selectedTariff.maxPower} VA</span>
              </div>
            </div>
          </div>

          {/* Result Card */}
          <div className="card-flat p-6 bg-brand-slate text-white shadow-xl space-y-6 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Coins className="w-4 h-4 text-brand-amber" /> Estimasi Finansial Penggunaan
            </h3>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Total Tagihan Bulanan</span>
              <div className="text-3xl font-extrabold text-brand-amber font-mono tracking-tight">
                {formatRupiah(monthlyCost)}
              </div>
              <span className="text-[10px] text-slate-300 block italic">Dihitung untuk penggunaan konstan selama 30 Hari</span>
            </div>

            <div className="border-t border-white/5 pt-4 space-y-3.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Konsumsi Harian</span>
                <span className="font-bold text-white font-mono">{dailyKWh.toFixed(2)} kWh <span className="text-[10px] text-slate-400 font-normal">({formatRupiah(dailyKWh * selectedTariff.rate)})</span></span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Konsumsi Bulanan</span>
                <span className="font-bold text-white font-mono">{monthlyKWh.toFixed(1)} kWh</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Beban Puncak Bersamaan</span>
                <span className={cn(
                  "font-bold font-mono px-2 py-0.5 rounded text-[11px]",
                  isPowerExceeded ? "bg-red-500/20 text-red-300" : "bg-white/5 text-amber-300"
                )}>
                  {totalSimultaneousWattage} W / {selectedTariff.maxPower}W
                </span>
              </div>
            </div>

            {isPowerExceeded && (
              <div className="bg-red-500/15 border border-red-500/30 rounded-xl p-3 text-[11px] text-red-200 flex gap-2.5 leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>
                  <strong>Hati-hati:</strong> Total daya seluruh alat menyala bersamaan ({totalSimultaneousWattage}W) melampaui batas meteran daya listrik rumah Anda ({selectedTariff.maxPower}W). Berisiko sekring anjlok (mcb mati).
                </span>
              </div>
            )}
          </div>

          {/* Quick Recommendations/Savings Tips */}
          {tips.length > 0 && (
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-brand-amber" /> Rekomendasi Audit Hemat Energi
              </h4>
              <div className="space-y-3">
                {tips.slice(0, 2).map((item, id) => (
                  <div key={id} className="card-flat p-4 bg-amber-50/50 border border-amber-100/60 rounded-xl flex items-start gap-3">
                    <div className="bg-amber-100 p-2 rounded-lg text-brand-amber mt-0.5 flex-shrink-0">
                      <TrendingDown className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-text-primary leading-tight">{item.title}</h5>
                      <p className="text-[11px] text-text-secondary leading-relaxed mt-1">{item.desc}</p>
                      <div className="text-[10px] font-bold text-brand-emerald uppercase tracking-wider mt-1.5 flex items-center gap-1">
                        <span>Potensi Hemat:</span>
                        <span className="font-mono">{formatRupiah(item.saving)} / Bulan</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: List of Appliances & Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Form Create Preset / Custom Panel */}
          <AnimatePresence>
            {showAddPreset && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="card-flat p-6 bg-white border border-border-subtle shadow-sm space-y-6 mb-6">
                  <div className="flex justify-between items-center border-b border-border-subtle pb-3">
                    <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                      <Plus className="w-4 h-4 text-brand-amber" /> Tambah Alat Elektronik Kustom
                    </h3>
                    <button 
                      onClick={() => setShowAddPreset(false)}
                      className="text-text-tertiary hover:text-text-primary text-xs font-bold"
                    >
                      Batal
                    </button>
                  </div>

                  {/* Add Preset quick picks */}
                  <div>
                    <span className="block text-[10px] font-extrabold text-text-tertiary uppercase tracking-wider mb-2.5">Pilih Preset Alat Standar</span>
                    <div className="flex gap-2 flex-wrap max-h-36 overflow-y-auto pr-1">
                      {PRESET_APPLIANCES.map((p, i) => (
                        <button
                          key={i}
                          onClick={() => handleAddPreset(p)}
                          className="px-3 py-1.5 rounded-lg border border-border-subtle bg-gray-50 hover:bg-amber-50 hover:border-brand-amber transition-colors text-[10px] font-bold text-text-secondary flex items-center gap-1.5"
                        >
                          <Zap className="w-3 h-3 text-text-tertiary" /> {p.name} ({p.wattage}W)
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-border-subtle pt-4">
                    <span className="block text-[10px] font-extrabold text-text-tertiary uppercase tracking-wider mb-3">Atau Isi Form Kustom</span>
                    <form onSubmit={handleAddCustom} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-text-secondary mb-1">Nama Alat / Merk</label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: Kulkas Sharp 2 Pintu, TV Kamar Tidur"
                          value={customName}
                          onChange={e => setCustomName(e.target.value)}
                          className="w-full bg-gray-50 border border-border-subtle rounded-xl py-2 px-3 text-xs font-medium focus:border-brand-amber outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-text-secondary mb-1">Daya Alat (Watt)</label>
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder="Contoh: 150"
                          value={customWattage}
                          onChange={e => setCustomWattage(e.target.value)}
                          className="w-full bg-gray-50 border border-border-subtle rounded-xl py-2 px-3 text-xs font-medium focus:border-brand-amber outline-none transition-all font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-text-secondary mb-1">Kategori Alat</label>
                        <select
                          value={customCategory}
                          onChange={e => setCustomCategory(e.target.value)}
                          className="w-full bg-gray-50 border border-border-subtle rounded-xl py-2 px-3 text-xs font-medium focus:border-brand-amber outline-none transition-all"
                        >
                          <option value="AC">Pendingin Udara (AC)</option>
                          <option value="Lampu">Penerangan / Lampu</option>
                          <option value="Mesin Cuci">Mesin Cuci & Setrika</option>
                          <option value="Kulkas">Mesin Pendingin / Kulkas</option>
                          <option value="Dapur">Peralatan Dapur / Memasak</option>
                          <option value="Elektronik">Hiburan & Elektronik Lab</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-text-secondary mb-1">Durasi Menyala (Jam / Hari)</label>
                        <input
                          type="number"
                          required
                          min="0.1"
                          max="24"
                          step="0.5"
                          placeholder="Contoh: 8"
                          value={customHours}
                          onChange={e => setCustomHours(e.target.value)}
                          className="w-full bg-gray-50 border border-border-subtle rounded-xl py-2 px-3 text-xs font-medium focus:border-brand-amber outline-none transition-all font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-text-secondary mb-1">Jumlah Unit (Qty)</label>
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder="1"
                          value={customQty}
                          onChange={e => setCustomQty(e.target.value)}
                          className="w-full bg-gray-50 border border-border-subtle rounded-xl py-2 px-3 text-xs font-medium focus:border-brand-amber outline-none transition-all font-mono"
                        />
                      </div>

                      <div className="md:col-span-2 flex justify-end pt-2">
                        <button
                          type="submit"
                          className="btn-primary py-2 px-5 text-xs font-bold h-auto shadow-sm"
                        >
                          Masukkan ke Daftar Beban
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header List */}
          <div className="card-flat p-6 bg-white border border-border-subtle shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <Gauge className="w-4 h-4 text-brand-amber" /> Daftar Beban Konsumsi Daya Terdata ({appliances.length})
              </h3>
              
              {appliances.length > 0 && (
                <button
                  onClick={() => saveToStorage([])}
                  className="text-text-tertiary hover:text-brand-red text-xs flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Kosongkan List
                </button>
              )}
            </div>

            {appliances.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                <div className="bg-gray-50 p-4 rounded-full border border-border-subtle">
                  <Zap className="w-8 h-8 text-text-tertiary" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary uppercase">Belum ada beban daya tercatat</h4>
                  <p className="text-[11px] text-text-secondary mt-1 max-w-sm leading-relaxed">
                    Masukkan peralatan elektronik Anda secara kustom atau impor otomatis dari inventaris terdaftar untuk menghitung biaya listrik bulanan.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddPreset(true)}
                  className="btn-secondary py-1.5 px-4 text-xs font-bold h-auto mt-2"
                >
                  Tambah Beban Pertama
                </button>
              </div>
            ) : (
              <div className="divide-y divide-border-subtle max-h-[500px] overflow-y-auto pr-1">
                {appliances.map((item) => {
                  const itemWh = item.wattage * item.hoursPerDay * item.quantity;
                  const itemKwhMonthly = (itemWh / 1000) * 30;
                  const itemCostMonthly = itemKwhMonthly * selectedTariff.rate;

                  return (
                    <div key={item.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0 last:pb-0">
                      
                      {/* Left: icon, badge, details */}
                      <div className="flex gap-3.5 items-start">
                        <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-100 text-brand-amber mt-0.5 max-w-10">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-xs font-bold text-text-primary leading-tight">{item.name}</h4>
                            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-gray-100 text-text-tertiary border border-gray-200">
                              {item.category}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-text-secondary font-medium mt-1.5">
                            <span className="flex items-center gap-1.5">
                              <Gauge className="w-3.5 h-3.5 text-text-tertiary" /> Daya: <span className="font-bold text-text-primary font-mono">{item.wattage} W</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-text-tertiary" /> Durasi: <span className="font-bold text-text-primary font-mono">{item.hoursPerDay} jam/hari</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: slider duration, controls, and costs */}
                      <div className="flex md:flex-col items-between md:items-end justify-between md:justify-start gap-4">
                        <div className="flex items-center gap-3">
                          {/* Unit multiplier input */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-text-tertiary font-bold uppercase">Qty:</span>
                            <input 
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleUpdateQty(item.id, Number(e.target.value))}
                              className="w-12 bg-gray-50 border border-border-subtle rounded-lg py-1 px-1.5 text-xs text-center font-bold font-mono outline-none"
                            />
                          </div>

                          {/* Hours slider */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-text-tertiary font-bold uppercase">Jam:</span>
                            <input 
                              type="range"
                              min="0.5"
                              max="24"
                              step="0.5"
                              value={item.hoursPerDay}
                              onChange={(e) => handleUpdateHours(item.id, Number(e.target.value))}
                              className="w-20 md:w-24 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand-amber"
                            />
                          </div>

                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1 rounded bg-gray-50 text-text-tertiary hover:text-brand-red border border-border-subtle transition-all"
                            title="Hapus beban"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Final Cost Itemized */}
                        <div className="text-right flex flex-col md:items-end">
                          <span className="text-xs font-extrabold text-text-primary font-mono">
                            {formatRupiah(itemCostMonthly)}
                          </span>
                          <span className="text-[9px] text-text-tertiary font-medium uppercase tracking-wider mt-0.5">
                            {(itemKwhMonthly).toFixed(1)} kWh / Bulan
                          </span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
