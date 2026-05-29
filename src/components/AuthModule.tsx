import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Wrench, 
  ArrowLeft, 
  Mail, 
  Lock, 
  User, 
  UserPlus, 
  LogIn, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Building2, 
  CheckCircle,
  HelpCircle,
  Info
} from "lucide-react";

interface AuthModuleProps {
  onBack: () => void;
  onSuccess: (user: any) => void;
}

const DEMO_PROFILES = [
  {
    name: "Budi Pratama",
    email: "budi@tukangku.id",
    password: "budi123",
    role: "Pemilik Rumah",
    avatar: "👨‍🔧",
    electricityPower: "2200 VA (Menengah)",
    phone: "+62 812-3456-7890",
    address: "Perumahan Harmoni Asri No. 12, Cilandak, Jakarta Selatan"
  },
  {
    name: "Siti Lestari",
    email: "siti@tukangku.id",
    password: "siti123",
    role: "Pengelola Rumah Kos",
    avatar: "👩‍🔧",
    electricityPower: "5500 VA (Luxury)",
    phone: "+62 821-9876-5432",
    address: "Kost Exclusive Sekar Melati RT 04 / RW 02, Kebon Jeruk, Jakarta Barat"
  }
];

export default function AuthModule({ onBack, onSuccess }: AuthModuleProps) {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Initialize dummy users in localStorage on first mount if they don't exist
  useEffect(() => {
    const existing = localStorage.getItem("tukangku_dummy_users");
    if (!existing) {
      const initialUsers = DEMO_PROFILES.map((p, idx) => ({
        id: `demo_${idx}`,
        name: p.name,
        email: p.email,
        password: p.password,
        phone: p.phone,
        address: p.address,
        electricityPower: p.electricityPower,
        avatarEmoji: p.avatar,
        isPremium: idx === 1, // Let Siti be premium for variety!
        createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000 // 10 days ago
      }));
      localStorage.setItem("tukangku_dummy_users", JSON.stringify(initialUsers));
    }
  }, []);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    await new Promise(resolve => setTimeout(resolve, 900));

    try {
      const users = JSON.parse(localStorage.getItem("tukangku_dummy_users") || "[]");

      if (mode === "register") {
        if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
          throw new Error("Mohon lengkapi seluruh formulir registrasi.");
        }
        
        if (formData.password.length < 5) {
          throw new Error("Kata sandi demi keamanan harus minimal 5 karakter.");
        }

        if (users.find((u: any) => u.email.toLowerCase() === formData.email.toLowerCase())) {
          throw new Error("Alamat email ini sudah pernah didaftarkan.");
        }

        const newUser = {
          id: Math.random().toString(36).substr(2, 9),
          name: formData.name,
          email: formData.email.toLowerCase(),
          password: formData.password,
          createdAt: Date.now(),
          phone: "+62 812-XXXX-XXXX",
          address: "Belum Diatur (Silakan ubah di Profil Properi)",
          electricityPower: "1300 VA (Standar)",
          isPremium: false,
          avatarEmoji: ["🏠", "👨‍🔧", "⚡", "🔧", "🏡"][Math.floor(Math.random() * 5)]
        };

        users.push(newUser);
        localStorage.setItem("tukangku_dummy_users", JSON.stringify(users));
        
        setSuccessMsg("Pendaftaran berhasil! Mengalihkan ke aplikasi...");
        setTimeout(() => {
          onSuccess(newUser);
        }, 800);
        
      } else {
        const user = users.find(
          (u: any) => 
            u.email.toLowerCase() === formData.email.toLowerCase() && 
            u.password === formData.password
        );
        
        if (!user) {
          throw new Error("Kombinasi email atau kata sandi tidak cocok.");
        }

        setSuccessMsg("Verifikasi berhasil! Selamat datang kembali.");
        setTimeout(() => {
          onSuccess(user);
        }, 700);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Autofill a demo account
  const handleAutofill = (demo: typeof DEMO_PROFILES[0]) => {
    setMode("login");
    setFormData({
      name: demo.name,
      email: demo.email,
      password: demo.password
    });
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Visual Background Light Radiants */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-slate/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Dual-Pane Bento Container card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]"
        id="auth-canvas-container"
      >
        {/* Left Interactive Promo Pane - Hide on mobile */}
        <div className="hidden md:flex md:col-span-5 bg-brand-slate text-white p-8 flex-col justify-between relative overflow-hidden">
          {/* Subtle decoration pattern */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-brand-amber/20 to-transparent rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />

          {/* Core Info header */}
          <div className="space-y-6 relative z-10">
            <button 
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali Ke Utama
            </button>

            <div className="space-y-3 pt-4">
              <div className="bg-gradient-to-br from-brand-amber to-amber-600 p-2.5 rounded-xl w-fit shadow-md">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-extrabold text-white tracking-tight">Kemandirian Pemeliharaan Rumah</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                Diagnosis mandiri, rekam histori perbaikan, cegah kebocoran tagihan listrik, dan susun RAB borongan SNI dalam satu ekosistem pribadi.
              </p>
            </div>
          </div>

          {/* Micro bullet specifications */}
          <div className="space-y-4 py-8 relative z-10">
            <div className="flex gap-3 items-start">
              <div className="bg-white/10 p-1.5 rounded-lg text-brand-amber mt-0.5">
                <Sparkles className="w-3.5 h-3.5 fill-brand-amber" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Analisis Pola Kerusakan AI</h4>
                <p className="text-[10px] text-slate-400">Deteksi visual struktur retak & rembesan pipa semen instan.</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="bg-white/10 p-1.5 rounded-lg text-brand-amber mt-0.5">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">RAB Berstandar SNI</h4>
                <p className="text-[10px] text-slate-400">Taksiran kalkulasi bahan, semen, cat & upah tukang borongan real-time.</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="bg-white/10 p-1.5 rounded-lg text-brand-amber mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">100% Data Terenkripsi Lokal</h4>
                <p className="text-[10px] text-slate-400">Privasi nomor seluler dan alamat properti terkunci aman.</p>
              </div>
            </div>
          </div>

          {/* Small identity footer */}
          <div className="border-t border-white/5 pt-4 flex gap-2 items-center text-[10px] text-slate-400 tracking-wider">
            <span className="font-bold text-white">TUKANGKU</span> v2.6.0 Pro Edition
          </div>
        </div>

        {/* Right Dynamic Form Pane */}
        <div className="col-span-1 md:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          
          {/* Header Mobile Only Switch back */}
          <div className="md:hidden flex justify-between items-center mb-6">
            <button 
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs font-bold text-text-secondary bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-xl transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali
            </button>
            <div className="flex items-center gap-1.5">
              <Wrench className="w-4.5 h-4.5 text-brand-amber" />
              <span className="text-xs font-black tracking-wider text-brand-slate uppercase">TUKANGKU</span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Title Block */}
            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-black text-brand-slate tracking-tight">
                {mode === "login" ? "Masuk ke Akun Anda" : "Buka Akun Tukangku Baru"}
              </h2>
              <p className="text-xs text-text-secondary">
                {mode === "login" 
                  ? "Akses kembali diagnosis cerdas AI, inventaris, dan hitungan semen/cat Anda." 
                  : "Mulai perjalanan pemeliharaan properti Anda dengan standardisasi SNI Indonesia."}
              </p>
            </div>

            {/* Error or Success notification block */}
            <AnimatePresence mode="popLayout">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium flex gap-2 items-center"
                >
                  <span className="bg-red-200 text-red-700 w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs">!</span>
                  <span>{error}</span>
                </motion.div>
              )}

              {successMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex gap-2 items-center"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{successMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Primary Form Input */}
            <form onSubmit={handleAction} className="space-y-4">
              {/* Full name on registration only */}
              {mode === "register" && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-text-tertiary">Nama Lengkap</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-tertiary" />
                    <input 
                      type="text" 
                      required
                      placeholder="Contoh: Budi Pratama"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-border-subtle hover:border-gray-300 focus:border-brand-amber focus:bg-white rounded-xl outline-none transition-all text-xs font-bold"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-text-tertiary">Alamat Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-tertiary" />
                  <input 
                    type="email" 
                    required
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-border-subtle hover:border-gray-300 focus:border-brand-amber focus:bg-white rounded-xl outline-none transition-all text-xs font-bold"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-text-tertiary">Sandi Pengaman</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] text-brand-amber hover:underline font-bold"
                  >
                    {showPassword ? "Sembunyikan" : "Tampilkan"}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-tertiary" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-11 pr-11 py-3 bg-gray-50 border border-border-subtle hover:border-gray-300 focus:border-brand-amber focus:bg-white rounded-xl outline-none transition-all text-xs font-bold font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <button 
                type="submit"
                disabled={loading}
                className="w-full btn-primary h-12 text-xs font-black uppercase tracking-wider mt-5 shadow-lg shadow-brand-amber/15 flex items-center justify-center gap-2"
                id="submit-auth-btn"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memproses Sesi...</span>
                  </>
                ) : (
                  <>
                    {mode === "login" ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    <span>{mode === "login" ? "Masuk Ke Panel Tukangku" : "Daftarkan Akun Anda"}</span>
                  </>
                )}
              </button>
            </form>

            {/* Selector Link Trigger */}
            <div className="text-center pt-2">
              <button 
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setError("");
                  setSuccessMsg("");
                }}
                className="text-xs font-bold text-brand-amber hover:underline"
              >
                {mode === "login" 
                  ? "Belum ada akun di perangkat ini? Daftar Sini" 
                  : "Sudah pernah buat akun? Masuk Sini"}
              </button>
            </div>
          </div>

          {/* Quick Demo Accounts Selector (Premium Showcase Experience) */}
          <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold text-brand-slate uppercase tracking-wider">LOGIN CEPAT DEMO INSTAN (REKOMENDASI):</span>
              <span className="bg-amber-100 text-brand-amber text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded">MUDAH</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DEMO_PROFILES.map((demo) => (
                <button
                  key={demo.email}
                  onClick={() => handleAutofill(demo)}
                  type="button"
                  className="p-3 text-left bg-gradient-to-br from-slate-50 to-gray-50/50 hover:from-amber-500/5 hover:to-amber-500/10 border border-gray-200/50 hover:border-brand-amber/40 rounded-xl transition-all flex items-center gap-3 group relative overflow-hidden active:scale-95"
                >
                  <div className="w-9 h-9 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-lg shadow-sm group-hover:scale-105 transition-transform flex-shrink-0 select-none">
                    {demo.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-text-primary group-hover:text-amber-600 transition-colors leading-[1.2]">{demo.name}</p>
                    <p className="text-[9px] text-text-tertiary mt-0.5 font-medium truncate italic">{demo.role} • {demo.electricityPower.split(" ")[0]}</p>
                  </div>
                  <div className="text-[8px] font-bold text-brand-slate bg-gray-200/50 px-1.5 py-0.5 rounded uppercase font-mono tracking-wider flex-shrink-0 group-hover:bg-amber-400 group-hover:text-brand-slate transition-colors">
                    Isi
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

