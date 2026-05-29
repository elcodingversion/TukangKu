import { useState, useEffect } from "react";
import { 
  Tv, 
  Trash2, 
  Plus, 
  Search, 
  Calendar, 
  Tag, 
  ShieldCheck, 
  ShieldAlert, 
  Info, 
  Sparkles, 
  AlertCircle, 
  Layers,
  Coins,
  Pencil
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { formatRupiah } from "../lib/utils";
import { cn } from "../lib/utils";

interface ApplianceItem {
  id: string;
  name: string;
  brand: string;
  category: "AC" | "Kulkas" | "Mesin Cuci" | "Televisi" | "Pompa Air" | "Water Heater" | "Dispenser" | "Kompor / Grill" | "Lainnya";
  purchaseDate: string; // YYYY-MM-DD
  price: number;
  warrantyDurationYears: number;
  serialNumber?: string;
  notes?: string;
}

const DEFAULT_APPLIANCES: ApplianceItem[] = [
  {
    id: "a1",
    name: "Inverter Compressor Refrigerator",
    brand: "Samsung Dual Tech",
    category: "Kulkas",
    purchaseDate: "2024-11-15",
    price: 8500000,
    warrantyDurationYears: 10,
    serialNumber: "REF-SAMS-9021-X",
    notes: "Klaim garansi kompresor wajib menyertakan kartu garansi fisik hologram merah."
  },
  {
    id: "a2",
    name: "AC Split 1 PK Eco-Smart",
    brand: "Daikin Thailand",
    category: "AC",
    purchaseDate: "2025-01-10",
    price: 5200000,
    warrantyDurationYears: 3,
    serialNumber: "AC-DAI-PL-192",
    notes: "Garansi sparepart 1 tahun, garansi evaporator & kompresor 3 tahun."
  },
  {
    id: "a3",
    name: "Front Load Steam Washer",
    brand: "LG ThinQ IoT",
    category: "Mesin Cuci",
    purchaseDate: "2023-05-20",
    price: 7400000,
    warrantyDurationYears: 2,
    serialNumber: "WASH-LG-Q-11",
    notes: "Garansi motor Direct Drive tertera 10 tahun, garansi modul panel 2 tahun."
  }
];

interface ApplianceInventoryModuleProps {
  userId?: string;
}

export default function ApplianceInventoryModule({ userId = "default" }: ApplianceInventoryModuleProps) {
  const [appliances, setAppliances] = useState<ApplianceItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form States
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState<ApplianceItem["category"]>("Lainnya");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [price, setPrice] = useState("");
  const [warrantyDurationYears, setWarrantyDurationYears] = useState("1");
  const [serialNumber, setSerialNumber] = useState("");
  const [notes, setNotes] = useState("");

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem(`tukangku_appliances_${userId}`);
    if (saved) {
      setAppliances(JSON.parse(saved));
    } else {
      setAppliances(DEFAULT_APPLIANCES);
      localStorage.setItem(`tukangku_appliances_${userId}`, JSON.stringify(DEFAULT_APPLIANCES));
    }
  }, [userId]);

  // Sync back on edit
  const syncLocalStorage = (updated: ApplianceItem[]) => {
    setAppliances(updated);
    localStorage.setItem(`tukangku_appliances_${userId}`, JSON.stringify(updated));
  };

  const handleAddAppliance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !brand || !purchaseDate) return;

    if (editingId) {
      // Edit mode implementation
      const updated = appliances.map(item => {
        if (item.id === editingId) {
          return {
            ...item,
            name,
            brand,
            category,
            purchaseDate,
            price: price ? Number(price) : 0,
            warrantyDurationYears: Number(warrantyDurationYears),
            serialNumber: serialNumber || undefined,
            notes: notes || undefined
          };
        }
        return item;
      });
      syncLocalStorage(updated);
      setEditingId(null);
    } else {
      // Add mode implementation
      const newItem: ApplianceItem = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        brand,
        category,
        purchaseDate,
        price: price ? Number(price) : 0,
        warrantyDurationYears: Number(warrantyDurationYears),
        serialNumber: serialNumber || undefined,
        notes: notes || undefined
      };

      const updated = [newItem, ...appliances];
      syncLocalStorage(updated);
    }

    // Reset Form
    handleCancelForm();
  };

  const handleStartEdit = (item: ApplianceItem) => {
    setEditingId(item.id);
    setName(item.name);
    setBrand(item.brand);
    setCategory(item.category);
    setPurchaseDate(item.purchaseDate);
    setPrice(item.price ? String(item.price) : "");
    setWarrantyDurationYears(String(item.warrantyDurationYears));
    setSerialNumber(item.serialNumber || "");
    setNotes(item.notes || "");
    setShowAddForm(true);

    // Smooth scroll to form area
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelForm = () => {
    setName("");
    setBrand("");
    setCategory("Lainnya");
    setPurchaseDate("");
    setPrice("");
    setWarrantyDurationYears("1");
    setSerialNumber("");
    setNotes("");
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleDeleteItem = (id: string) => {
    const isConfirmed = window.confirm("Apakah Anda yakin ingin menghapus aset peralatan rumah ini dari daftar inventaris?");
    if (isConfirmed) {
      const updated = appliances.filter(item => item.id !== id);
      syncLocalStorage(updated);
      if (editingId === id) {
        setEditingId(null);
      }
    }
  };

  // Calculations
  const getWarrantyStatus = (item: ApplianceItem) => {
    const purchase = new Date(item.purchaseDate).getTime();
    const durationMs = item.warrantyDurationYears * 365 * 24 * 60 * 60 * 1000;
    const expiry = purchase + durationMs;
    const now = Date.now();
    const isExpired = now > expiry;
    const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    return {
      isExpired,
      daysLeft: isExpired ? 0 : daysLeft,
      expiryDate: new Date(expiry).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })
    };
  };

  const totalAssetsValue = appliances.reduce((sum, item) => sum + item.price, 0);
  const activeWarrantiesCount = appliances.filter(item => !getWarrantyStatus(item).isExpired).length;
  
  const expiringSoonCount = appliances.filter(item => {
    const stat = getWarrantyStatus(item);
    return !stat.isExpired && stat.daysLeft <= 90; // expiring in 3 months
  }).length;

  const categories = ["Semua", "AC", "Kulkas", "Mesin Cuci", "Televisi", "Pompa Air", "Water Heater", "Dispenser", "Kompor / Grill", "Lainnya"];

  const filteredAppliances = appliances.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.serialNumber && item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = activeCategory === "Semua" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-amber" /> Inventaris & Garansi Peralatan Rumah
          </h2>
          <p className="text-sm text-text-secondary mt-1">Lacak masa aktif proteksi asuransi, garansi, model nomor, dan draf manual klaim servis kompartemen rumah tangga Anda.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Cari nama, merek, atau SN..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-border-subtle rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-brand-amber outline-none transition-all shadow-sm"
            />
          </div>
          <button 
            type="button"
            onClick={() => { if (showAddForm) { handleCancelForm(); } else { setShowAddForm(true); } }}
            className="btn-primary py-2.5 px-4 h-auto text-xs font-bold shadow-lg shadow-brand-amber/10 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> {showAddForm ? "Sembunyikan Form" : editingId ? "Edit Detail Aset" : "Tambah Aset Baru"}
          </button>
        </div>
      </div>

      {/* Overview Bento Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Assets Investement */}
        <div className="card-flat p-5 bg-white border border-border-subtle shadow-sm flex items-center gap-4">
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-100/60">
            <Coins className="w-5 h-5 text-brand-amber" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-text-tertiary uppercase tracking-widest leading-none">Total Nilai Aset</p>
            <p className="text-base font-bold text-text-primary font-mono mt-1.5">{formatRupiah(totalAssetsValue)}</p>
          </div>
        </div>

        {/* Active warranties count */}
        <div className="card-flat p-5 bg-white border border-border-subtle shadow-sm flex items-center gap-4">
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100/60">
            <ShieldCheck className="w-5 h-5 text-brand-emerald" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-text-tertiary uppercase tracking-widest leading-none">Garansi Aktif</p>
            <p className="text-base font-bold text-text-primary mt-1.5">{activeWarrantiesCount} dari {appliances.length} Aset</p>
          </div>
        </div>

        {/* Expiring warranties alert */}
        <div className="card-flat p-5 bg-white border border-border-subtle shadow-sm flex items-center gap-4">
          <div className={cn(
            "p-3 rounded-xl border",
            expiringSoonCount > 0 ? "bg-red-50 border-red-100" : "bg-gray-50 border-border-subtle"
          )}>
            <ShieldAlert className={cn("w-5 h-5", expiringSoonCount > 0 ? "text-brand-red animate-pulse" : "text-text-tertiary")} />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-text-tertiary uppercase tracking-widest leading-none">Hampir Kedaluwarsa</p>
            <p className={cn(
              "text-base font-bold mt-1.5",
              expiringSoonCount > 0 ? "text-brand-red" : "text-text-primary"
            )}>
              {expiringSoonCount} Aset (90 Hari)
            </p>
          </div>
        </div>
      </div>

      {/* Form Overlay Modal or Accordion */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAddAppliance} className="card-flat p-6 bg-white border border-border-subtle shadow-sm space-y-6">
              <div className="flex items-center gap-2 pb-2.5 border-b border-border-subtle">
                <Sparkles className="w-5 h-5 text-brand-amber" />
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  {editingId ? "Edit Detail Aset Rumah Tangga" : "Form Pengisian Aset Elektronik Rumah"}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary">Nama Peralatan *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Contoh: Kulkas Side-by-Side Inverter" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-gray-50 border border-border-subtle rounded-lg p-2.5 text-xs focus:bg-white focus:border-brand-amber outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary">Merek / Seri model *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Contoh: Panasonic Prime-Fresh" 
                    value={brand} 
                    onChange={e => setBrand(e.target.value)}
                    className="w-full bg-gray-50 border border-border-subtle rounded-lg p-2.5 text-xs focus:bg-white focus:border-brand-amber outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary">Kategori Aset</label>
                  <select 
                    value={category} 
                    onChange={e => setCategory(e.target.value as ApplianceItem["category"])}
                    className="w-full bg-gray-50 border border-border-subtle rounded-lg p-2.5 text-xs focus:bg-white focus:border-brand-amber outline-none"
                  >
                    {categories.filter(c => c !== "Semua").map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary">Tanggal Pembelian *</label>
                  <input 
                    type="date" 
                    required 
                    value={purchaseDate} 
                    onChange={e => setPurchaseDate(e.target.value)}
                    className="w-full bg-gray-50 border border-border-subtle rounded-lg p-2.5 text-xs focus:bg-white focus:border-brand-amber outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary">Harga Pembelian (Rupiah)</label>
                  <input 
                    type="number" 
                    placeholder="Contoh: 4500000" 
                    value={price} 
                    onChange={e => setPrice(e.target.value)}
                    className="w-full bg-gray-50 border border-border-subtle rounded-lg p-2.5 text-xs focus:bg-white focus:border-brand-amber outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary">Durasi Masa Garansi (Tahun)</label>
                  <select 
                    value={warrantyDurationYears} 
                    onChange={e => setWarrantyDurationYears(e.target.value)}
                    className="w-full bg-gray-50 border border-border-subtle rounded-lg p-2.5 text-xs focus:bg-white focus:border-brand-amber outline-none font-mono"
                  >
                    {[1, 2, 3, 5, 10, 15].map(yr => (
                      <option key={yr} value={yr}>{yr} Tahun</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-3">
                  <label className="text-xs font-bold text-text-secondary">Nomor Seri (Serial Number / SN)</label>
                  <input 
                    type="text" 
                    placeholder="Tulis SN model yang tertera pada kardus atau bodi dalam aset" 
                    value={serialNumber} 
                    onChange={e => setSerialNumber(e.target.value)}
                    className="w-full bg-gray-50 border border-border-subtle rounded-lg p-2.5 text-xs focus:bg-white focus:border-brand-amber outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-3">
                  <label className="text-xs font-bold text-text-secondary">Catatan Tambahan & Info Kontak Agen Servis resmi</label>
                  <textarea 
                    rows={2}
                    placeholder="Tuliskan draf prosedur klaim, kontak cs distributor resmi, atau tempat pembelian aset." 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)}
                    className="w-full bg-gray-50 border border-border-subtle rounded-lg p-3 text-xs focus:bg-white focus:border-brand-amber outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
                <button 
                  type="button" 
                  onClick={handleCancelForm} 
                  className="btn-secondary px-5 py-2 text-xs font-bold h-auto"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn-primary px-5 py-2 text-xs font-bold h-auto shadow-sm"
                >
                  {editingId ? "Simpan Perubahan Aset" : "Simpan Aset ke Database"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs Menu Categories */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all whitespace-nowrap",
              activeCategory === cat
                ? "bg-brand-slate text-white border-brand-slate shadow-sm"
                : "bg-white text-text-secondary border-border-subtle hover:bg-gray-50"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Appliance items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
        {filteredAppliances.length === 0 ? (
          <div className="col-span-full card-flat p-12 text-center bg-gray-50/50">
            <p className="text-text-secondary text-sm">Belum ada aset terdaftar di dalam kategori ini.</p>
          </div>
        ) : (
          filteredAppliances.map((item) => {
            const stat = getWarrantyStatus(item);
            return (
              <div 
                key={item.id}
                className="card-flat p-5 bg-white border border-border-subtle hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top line with tag & Delete actions */}
                  <div className="flex justify-between items-start">
                    <span className="tag bg-orange-50 text-brand-amber border-orange-100/50">
                      {item.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleStartEdit(item)}
                        className="text-text-tertiary hover:text-brand-amber p-1 rounded-md transition-colors"
                        title="Edit Aset"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-text-tertiary hover:text-brand-red p-1 rounded-md transition-colors"
                        title="Hapus Aset"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Header Title & Brand details */}
                  <div className="space-y-1">
                    <h3 className="font-bold text-text-primary text-base uppercase tracking-tight line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-text-secondary font-medium">Merk: <strong className="text-text-primary font-bold">{item.brand}</strong></p>
                  </div>

                  {/* Warranty and purchasing details */}
                  <div className="grid grid-cols-2 gap-4 text-xs pt-3.5 border-t border-dashed border-border-subtle">
                    <div className="space-y-1">
                      <p className="text-text-tertiary uppercase text-[9px] font-extrabold tracking-widest leading-none">Harga Pembelian</p>
                      <p className="font-mono font-bold text-text-primary">{item.price > 0 ? formatRupiah(item.price) : "-"}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-text-tertiary uppercase text-[9px] font-extrabold tracking-widest leading-none">Dibeli Pada</p>
                      <p className="font-bold text-text-primary flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-text-tertiary" />
                        {new Date(item.purchaseDate).toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>

                  {/* Warranty active bar display */}
                  <div className="bg-gray-50 border border-border-subtle/40 rounded-xl p-3.5 flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {stat.isExpired ? (
                        <ShieldAlert className="w-4 h-4 text-brand-red" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-brand-emerald" />
                      )}
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className={cn(
                          "font-bold uppercase tracking-wide",
                          stat.isExpired ? "text-brand-red" : "text-brand-emerald"
                        )}>
                          {stat.isExpired ? "Garansi Habis" : "Garansi Aktif"}
                        </span>
                        {!stat.isExpired && (
                          <span className="font-mono font-bold text-text-primary text-[10.5px]">{stat.daysLeft} Hari Lagi</span>
                        )}
                      </div>
                      <p className="text-[10px] text-text-secondary truncate">Kadaluwarsa: {stat.expiryDate} ({item.warrantyDurationYears} thn)</p>
                    </div>
                  </div>

                  {/* Serial number & Notes displays */}
                  {item.serialNumber && (
                    <div className="text-[10px] text-text-tertiary font-mono bg-gray-50 border border-dashed border-border-subtle px-2.5 py-1 w-fit rounded">
                      S/N: {item.serialNumber}
                    </div>
                  )}

                  {item.notes && (
                    <div className="bg-amber-50/40 border border-amber-100/40 rounded-lg p-2.5 flex gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-brand-amber flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] text-text-secondary leading-relaxed font-medium"><strong className="text-text-primary">Catatan:</strong> {item.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="bg-gray-50 border border-border-subtle rounded-xl p-5 flex gap-4">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <p className="font-bold text-text-primary">Bagaimana Cara Kerja Sistem Garansi Rumah Tangga?</p>
          <p className="text-text-secondary leading-relaxed">
            Sistem ini melakukan sinkronisasi otomatis tanggal invoice pembelian dengan total proteksi garansi pabrik. Dengan mencatat nomor seri dan draf prosedural, Anda tidak perlu lagi panik mencari struk pembayaran yang pudar saat kompresor atau evaporator AC bocor.
          </p>
        </div>
      </div>
    </div>
  );
}
