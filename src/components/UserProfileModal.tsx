import { useState, useEffect } from "react";
import { 
  X, 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Zap, 
  Check, 
  Sparkles, 
  Crown, 
  ShieldCheck, 
  History, 
  Bell, 
  Layers, 
  Save, 
  Heart,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MockUser } from "../types";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: MockUser | null;
  onUpdateUser: (updatedUser: MockUser) => void;
  historyCount: number;
  remindersCount: number;
  appliancesCount: number;
}

const AVATAR_EMOJIS = ["👨‍🔧", "👩‍🔧", "🏠", "👷", "⚡", "🔧", "🛠️", "⚙️", "🏡", "🦊", "🐯", "🦁", "🐼"];

const POWER_RATINGS = [
  "900 VA (Subsidi)",
  "1300 VA (Standar)",
  "2200 VA (Menengah)",
  "3300 VA (Premium)",
  "4400 VA (Bisnis)",
  "5500 VA (Luxury)",
  "6600 VA+ (Ultra)"
];

export default function UserProfileModal({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  historyCount,
  remindersCount,
  appliancesCount
}: UserProfileModalProps) {
  // Local active state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [electricityPower, setElectricityPower] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [avatarEmoji, setAvatarEmoji] = useState("👨‍🔧");

  // Interaction feedback states
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Initialize from props
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
      setElectricityPower(user.electricityPower || POWER_RATINGS[1]);
      setIsPremium(!!user.isPremium);
      setAvatarEmoji(user.avatarEmoji || "👨‍🔧");
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  // Save details function
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    setTimeout(() => {
      const updated: MockUser = {
        ...user,
        name,
        email,
        phone,
        address,
        electricityPower,
        isPremium,
        avatarEmoji
      };
      
      onUpdateUser(updated);
      setSaving(false);
      setSaveSuccess(true);
      
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    }, 800);
  };

  // Toggle Premium / Upgrade simulation
  const handleUpgradeToggle = () => {
    if (!isPremium) {
      setIsPremium(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    } else {
      setIsPremium(false);
    }
  };

  const memberSinceDate = new Date(user.createdAt || Date.now()).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
        {/* Backdrop filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
          id="profile-modal-backdrop"
        />

        {/* Modal Canvas */}
        <motion.div
          initial={{ scale: 0.95, y: 15, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 15, opacity: 0 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-100 relative max-h-[90vh] flex flex-col z-10"
          id="profile-modal-container"
        >
          {showConfetti && (
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-emerald-500/10 pointer-events-none animate-pulse flex items-center justify-center z-50">
              <span className="text-xl font-extrabold text-brand-slate animate-bounce bg-white/95 px-6 py-3 rounded-full shadow-2xl border border-brand-amber">
                ✨ Selamat! Mode Premium Diaktifkan 🎉
              </span>
            </div>
          )}

          {/* Modal Header Banner */}
          <div className="bg-brand-slate text-white px-6 py-7 relative overflow-hidden flex-shrink-0">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-brand-amber/20 to-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-6 left-12 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />

            <div className="flex justify-between items-start relative z-10">
              <div className="flex gap-4 items-center">
                <div className="relative group">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-amber to-amber-700 flex items-center justify-center text-3xl shadow-inner border border-white/20 select-none">
                    {avatarEmoji}
                  </div>
                  {isPremium && (
                    <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-brand-slate rounded-full p-1 border-2 border-brand-slate shadow-md" title="Masa Aktif Premium">
                      <Crown className="w-3.5 h-3.5 text-white fill-white" />
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold tracking-tight">{name || "Pengguna Tukangku"}</h3>
                    {isPremium ? (
                      <span className="bg-amber-500 text-brand-slate text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                        PRO
                      </span>
                    ) : (
                      <span className="bg-white/10 text-slate-300 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        BASIC
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                    <Mail className="w-3 h-3" /> {email}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                     ID: <span className="text-amber-400">{user.id}</span> • Terdaftar sejak {memberSinceDate}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 transition-all active:scale-95"
                aria-label="Tutup Panel"
                id="close-profile-modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body and Forms Scroll Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 border border-border-subtle p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                <History className="w-5 h-5 text-brand-slate mb-1" />
                <span className="text-xs font-semibold text-text-tertiary">Riwayat</span>
                <span className="text-sm font-extrabold text-brand-slate font-mono mt-0.5">{historyCount} Sesi</span>
              </div>
              <div className="bg-gray-50 border border-border-subtle p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                <Bell className="w-5 h-5 text-brand-amber mb-1" />
                <span className="text-xs font-semibold text-text-tertiary">Jadwal</span>
                <span className="text-sm font-extrabold text-brand-slate font-mono mt-0.5">{remindersCount} Alarm</span>
              </div>
              <div className="bg-gray-50 border border-border-subtle p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                <Layers className="w-5 h-5 text-brand-emerald mb-1" />
                <span className="text-xs font-semibold text-text-tertiary">Aset</span>
                <span className="text-sm font-extrabold text-brand-slate font-mono mt-0.5">{appliancesCount} Unit</span>
              </div>
            </div>

            {/* Premium Simulation Showcase */}
            <div className={`p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
              isPremium 
                ? "bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border-amber-500/30 shadow-sm" 
                : "bg-gray-50 border-gray-200"
            }`}>
              <div className="absolute top-0 right-0 p-3 pointer-events-none text-amber-500/20">
                <Crown className={`w-12 h-12 ${isPremium ? "text-amber-500/20 animate-pulse" : "text-gray-300/20"}`} />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-brand-amber" /> Status Layanan: {isPremium ? "Prioritas Gold VIP" : "Layanan Klasik / Basic"}
                  </h4>
                  <p className="text-[11px] text-text-secondary leading-relaxed max-w-md">
                    {isPremium 
                      ? "Selamat! Anda memiliki hak istimewa prioritas tukang darurat 24 jam, konsultasi AI tanpa kuota harian, serta diskon kemitraan lokal." 
                      : "Upgrade ke status PRO Premium untuk mengakses diagnosis kerusakan tak terbatas, diskon borongan 10%, dan bantuan cepat dari vendor berizin."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleUpgradeToggle}
                  className={`px-4 py-2 text-[10px] font-black uppercase rounded-xl tracking-wider transition-all shadow-sm ${
                    isPremium 
                      ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" 
                      : "bg-gradient-to-r from-brand-amber to-amber-600 text-white hover:brightness-110"
                  }`}
                  id="simulate-premium-btn"
                >
                  {isPremium ? "Downgrade Sesi" : "Aktifkan PRO Premium"}
                </button>
              </div>
            </div>

            {/* Editable Form */}
            <form onSubmit={handleSave} className="space-y-5">
              <h4 className="text-xs font-extrabold text-text-primary uppercase tracking-widest border-l-2 border-brand-amber pl-2">
                Informasi & Profil Properti Anda
              </h4>

              {/* Avatar Selector */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider font-extrabold text-text-tertiary">Pilih Avatar Emoji Anda</label>
                <div className="flex flex-wrap gap-2.5 p-3.5 bg-gray-50 border border-border-subtle rounded-2xl">
                  {AVATAR_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setAvatarEmoji(emoji)}
                      className={`text-2xl p-2 rounded-xl transition-all hover:scale-110 active:scale-95 ${
                        avatarEmoji === emoji 
                          ? "bg-white border-2 border-brand-amber shadow-sm scale-105" 
                          : "border-2 border-transparent hover:bg-white/50"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid 2-cols */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-extrabold text-text-tertiary block">Nama Pemilik Profil</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama lengkap"
                      className="w-full bg-white border border-border-subtle hover:border-gray-300 focus:border-brand-amber rounded-xl text-xs font-bold pl-10 pr-4 py-3 outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Email (fixed) */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-extrabold text-text-tertiary block">Email Akun (Permanent)</label>
                  <div className="relative opacity-60">
                    <Mail className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      disabled
                      value={email}
                      className="w-full bg-gray-50 border border-border-subtle rounded-xl text-xs font-bold pl-10 pr-4 py-3 outline-none cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Whatsapp */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-extrabold text-text-tertiary block">No. WhatsApp / Telepon</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+62 812-xxxx-xxxx"
                      className="w-full bg-white border border-border-subtle hover:border-gray-300 focus:border-brand-amber rounded-xl text-xs font-bold pl-10 pr-4 py-3 outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Electrical power */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-extrabold text-text-tertiary block">Batasan Kapasitas Listrik Rumah</label>
                  <div className="relative">
                    <Zap className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={electricityPower}
                      onChange={(e) => setElectricityPower(e.target.value)}
                      className="w-full bg-white border border-border-subtle hover:border-gray-300 focus:border-brand-amber rounded-xl text-xs font-bold pl-10 pr-4 py-3 outline-none transition-colors appearance-none cursor-pointer"
                    >
                      {POWER_RATINGS.map((power) => (
                        <option key={power} value={power}>{power}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Main property address */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-extrabold text-text-tertiary block">Alamat Utama Properti (Klaim Layanan & Pengiriman Tukang)</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-text-tertiary absolute left-3.5 top-3.5" />
                  <textarea
                    rows={2.5}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Contoh: Perumahan Cluster Harmoni Hijau Blok C-12, Kebayoran Baru, Jakarta Selatan"
                    className="w-full bg-white border border-border-subtle hover:border-gray-300 focus:border-brand-amber rounded-xl text-xs font-bold pl-10 pr-4 py-3.5 outline-none transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Premium Perks Info */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div className="text-[11px] text-text-secondary leading-relaxed">
                  <span className="font-extrabold text-text-primary">Keamanan Server Tukangku</span>: Kami mengenkripsi alamat properti dan nomor telepon Anda sesuai standar perlindungan data pribadi dan hanya diteruskan ke mitra insinyur lapangan saat pesanan Anda dikonfirmasi.
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-3 border-t border-gray-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 btn-secondary py-3.5 text-xs font-bold rounded-xl"
                >
                  Tutup Tanpa Menyimpan
                </button>
                <button
                  type="submit"
                  disabled={saving || saveSuccess}
                  className="flex-1 bg-brand-slate hover:bg-slate-800 text-white py-3.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  id="save-profile-settings-btn"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sedikit lagi...</span>
                    </>
                  ) : saveSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-brand-emerald" />
                      <span>Tersimpan!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4.5 h-4.5 text-brand-amber" />
                      <span>Simpan Rincian Profil</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
