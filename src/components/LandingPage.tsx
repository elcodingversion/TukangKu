import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Wrench, 
  Shield, 
  Zap, 
  History, 
  Camera, 
  ArrowRight, 
  Lock, 
  CheckCircle, 
  Star, 
  Sparkles, 
  HelpCircle, 
  ChevronDown, 
  Building2, 
  Smartphone,
  Hammer,
  AlertTriangle,
  Info
} from "lucide-react";
import { formatRupiah } from "../lib/utils";

interface LandingPageProps {
  onGetStarted: () => void;
}

const FAQS = [
  {
    question: "Bagaimana cara pintar AI mendiagnosis kerusakan rumah saya?",
    answer: "Tukangku memanfaatkan vision AI yang cerdas untuk mengidentifikasi pola kerusakan fisik dari foto yang Anda unggah (seperti retakan tembok, pipa bocor, atau karat besi). Sistem kemudian mencocokkan pola tersebut dengan basis data penanganan standar untuk merekomendasikan solusi perbaikan yang paling tepat."
  },
  {
    question: "Apakah taksiran RAB dan kebutuhan bahan di sini akurat?",
    answer: "Ya! Estimasi biaya bahan, volume material, serta upah borongan tukang dalam aplikasi kami mengacu pada koefisien standar SNI (Standar Nasional Indonesia) yang kemudian disesuaikan dengan rata-rata fluktuasi harga pasar konstruksi dan peralatan di Indonesia."
  },
  {
    question: "Apa perbedaan antara modul Jasa Borongan (PRO) dan DIY?",
    answer: "Modul DIY dirancang bagi Anda yang ingin menghemat biaya dengan pengerjaan mandiri, lengkap dengan panduan takaran bahan dan toolkit yang harus dibeli. Modul PRO menyertakan upah standar harian/borongan tukang ahli serta pembuatan draf Surat Surat Penawaran (RAB) formal siap pakai."
  },
  {
    question: "Apakah data lokasi dan nomor kontak saya aman?",
    answer: "Sangat aman. Alamat properti, detail kapasitas listrik rumah, dan kontak pribadi Anda disimpan secara pribadi di enkripsi lokal browser Anda dan tidak akan pernah disebarkan ke publik tanpa persetujuan eksplisit saat penawaran jasa diajukan."
  }
];

const PREVIEW_ISSUES = [
  {
    id: "roof",
    label: "Atap Bocor & Rembes",
    emoji: "🏠",
    problem: "Rembesan air hujan pada sambungan beton/genteng",
    diagnosis: "Keretakan mikro pada coating waterproofing atap dak beton.",
    difficulty: "Sedang (Akses Ketinggian)",
    materials: ["1 Galon Waterproofing Elastomer", "Serat Polyester Tape/Polyester Mesh", "Semen Grouting Sealant"],
    estCost: 350000
  },
  {
    id: "ac",
    label: "AC Kurang Dingin",
    emoji: "❄️",
    problem: "Udara blower hangat, terdapat tetesan air di unit indoor",
    diagnosis: "Penyumbatan debu tebal pada filter & indikasi awal kebocoran freon.",
    difficulty: "Ringan (Solusi Pembersihan)",
    materials: ["Jasa Cuci AC Tekanan Tinggi", "Pengisian Freon R32", "Pembersihan Saluran Drainase"],
    estCost: 220000
  },
  {
    id: "circuit",
    label: "Listrik Sering Turun",
    emoji: "⚡",
    problem: "MCB jatuh ketika menyalakan AC bersama pompa air",
    diagnosis: "Overload beban kumulatif, arus melampaui limit MCB pembatas.",
    difficulty: "Tinggi (Butuh Ahli)",
    materials: ["MCB Schneider 10A Kuat", "Kabel NYM 2.5mm² Standar LMK", "Jasa Split Group Sekring"],
    estCost: 450000
  }
];

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [selectedIssue, setSelectedIssue] = useState(PREVIEW_ISSUES[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const triggerScan = (issue: typeof PREVIEW_ISSUES[0]) => {
    if (isScanning) return;
    setIsScanning(true);
    setSelectedIssue(issue);
    setTimeout(() => {
      setIsScanning(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col text-slate-800 font-sans">
      {/* Decorative Blur Spotlight Backgrounds */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Modern Navigation Header */}
      <header className="px-6 py-5 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 transition-all">
        <div className="max-w-6xl mx-auto flex justify-between items-center w-full">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-brand-amber to-amber-600 p-2 rounded-xl shadow-lg shadow-brand-amber/15">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wider text-brand-slate uppercase leading-none">TUKANGKU</h1>
              <span className="text-[10px] text-text-tertiary font-bold tracking-widest font-mono">INTELLIGENT HUB</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={onGetStarted}
              className="btn-secondary h-10 px-4.5 text-xs font-bold flex items-center gap-2 bg-white/95 border border-border-subtle shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
            >
              <Lock className="w-3.5 h-3.5 text-brand-amber" /> 
              <span>Masuk Aplikasi</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section Container */}
      <section className="relative px-6 pt-12 pb-20 md:py-24 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading, Info, CTAs */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200/60 text-brand-amber px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-amber fill-brand-amber animate-spin" />
              Sistem Estimator & Dashboard Rumah Pintar #1
            </motion.div>
            
            <div className="space-y-4">
              <motion.h2 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-brand-slate tracking-tight leading-[1.08]"
              >
                Atasi Kerusakan Rumah dengan <span className="text-brand-amber italic font-black relative">
                  Diagnosis Cerdas <span className="absolute left-0 bottom-1.5 w-full h-1.5 bg-amber-400/20 -z-10" />
                </span>
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-text-secondary text-sm sm:text-base leading-relaxed max-w-xl"
              >
                Gunakan asisten andalan Anda untuk mengunggah foto kerusakan rumah, kalkulasi pemakaian daya AC/pompa, hitung draf RAB pengecatan cepat, dan terima draf Surat Penawaran (RAB) resmi secara instan.
              </motion.p>
            </div>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3.5"
            >
              <button 
                onClick={onGetStarted}
                className="btn-primary h-13 px-8 text-xs font-black uppercase tracking-wider shadow-lg shadow-brand-amber/25 flex items-center justify-center gap-2.5"
              >
                <span>Buka Diagnosis & Kalkulator</span> 
                <ArrowRight className="w-4.5 h-4.5" />
              </button>
              <a 
                href="#fitur-unggulan"
                className="btn-secondary h-13 px-6 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 bg-white"
              >
                Pelajari Fitur Utama
              </a>
            </motion.div>

            {/* Quick Micro App Tractions */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pt-6 border-t border-gray-200/80 flex flex-wrap gap-6 text-xs font-medium"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4.5 h-4.5 text-brand-emerald" />
                <span className="text-text-secondary"><strong className="text-brand-slate">98.4%</strong> Efisiensi AI Vision</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4.5 h-4.5 text-brand-emerald" />
                <span className="text-text-secondary"><strong className="text-brand-slate">RAB SNI</strong> Standar Indonesia</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4.5 h-4.5 text-brand-emerald" />
                <span className="text-text-secondary"><strong className="text-brand-slate">100%</strong> Offline Encrypted</span>
              </div>
            </motion.div>
          </div>
          
          {/* Right Column: Dynamic Live Interactive App Mockup Simulation */}
          <div className="lg:col-span-5">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-5 border border-gray-200/70 shadow-2xl space-y-4 relative overflow-hidden"
            >
              {/* App header mock */}
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-[10px] font-bold text-text-tertiary ml-1.5 uppercase tracking-wider">TUKANGKU PANEL DEMO</span>
                </div>
                <div className="bg-brand-slate text-brand-amber text-[8px] font-bold tracking-widest px-2 py-0.5 rounded-md">LIVE INTERACTIVE</div>
              </div>

              {/* Title prompt */}
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-text-tertiary tracking-wider block">PILIH MOCK MASALAH UNTUK TES DIAGNOSIS AI:</span>
                <div className="grid grid-cols-3 gap-2">
                  {PREVIEW_ISSUES.map((issue) => (
                    <button
                      key={issue.id}
                      onClick={() => triggerScan(issue)}
                      className={`py-2 px-2 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-all border ${
                        selectedIssue.id === issue.id 
                          ? "bg-amber-500 border-amber-600 text-white shadow-md shadow-amber-500/20" 
                          : "bg-gray-50 border-gray-200 text-text-secondary hover:bg-gray-100"
                      }`}
                    >
                      <span className="text-base">{issue.emoji}</span>
                      <span className="text-[9px] font-bold text-center leading-tight truncate w-full">{issue.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulation Screen Canvas */}
              <div className="bg-brand-slate text-slate-100 rounded-2xl p-4 min-h-[220px] relative overflow-hidden flex flex-col justify-between border border-white/5">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl" />

                {isScanning ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 py-6">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center animate-spin border-2 border-t-brand-amber border-r-transparent border-l-transparent border-b-transparent" />
                    <div className="space-y-1.5 text-center">
                      <p className="text-xs text-brand-amber font-extrabold tracking-widest uppercase animate-pulse">SISTEM AI MENDIAGNOSIS...</p>
                      <p className="text-[9px] text-slate-400 font-mono">Memindai database material SNI setempat...</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Header bar of diagnosis */}
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <div className="flex items-center gap-1.5 text-[9px] text-amber-400 font-bold uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 fill-amber-400 animate-pulse" /> Hasil Diagnosis AI
                      </div>
                      <span className="text-[8px] font-bold bg-white/10 text-slate-300 px-2 py-0.5 rounded uppercase">{selectedIssue.difficulty}</span>
                    </div>

                    {/* Problem Description */}
                    <div className="space-y-1">
                      <span className="text-[8px] text-slate-400 uppercase font-extrabold tracking-wider">Pola Fisik Terbaca</span>
                      <p className="text-xs font-bold text-white leading-snug">{selectedIssue.problem}</p>
                    </div>

                    {/* AI Diagnosis Result */}
                    <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 space-y-1">
                      <span className="text-[8px] text-amber-300 lowercase font-bold tracking-wider uppercase block">Analsis Rekomendasi</span>
                      <p className="text-2xs text-slate-300 leading-normal font-medium">{selectedIssue.diagnosis}</p>
                    </div>

                    {/* Draft Material and Price */}
                    <div className="space-y-1">
                      <span className="text-[8px] text-slate-400 uppercase font-extrabold tracking-wider">Kebutuhan Bahan & Material (Est)</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedIssue.materials.map((mat, idx) => (
                          <span key={idx} className="bg-white/10 text-white rounded text-[8px] px-1.5 py-0.5 block border border-white/5">
                            {mat}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Total cost estimate row */}
                    <div className="flex justify-between items-center pt-2.5 border-t border-white/5">
                      <div>
                        <span className="text-[8px] text-slate-400 uppercase font-bold tracking-wider block">Total Estimasi RAB</span>
                        <div className="text-sm font-extrabold text-brand-amber font-mono">{formatRupiah(selectedIssue.estCost)}</div>
                      </div>
                      <button 
                        onClick={onGetStarted}
                        className="bg-brand-amber hover:bg-amber-500 text-brand-slate text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                      >
                        Buka Detail <ChevronDown className="w-3 h-3 -rotate-90" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Visual disclaimer mock */}
              <div className="flex gap-2 items-center bg-gray-50 border border-gray-100 p-2.5 rounded-xl text-[10px] text-text-secondary leading-relaxed">
                <Info className="w-4 h-4 text-brand-amber flex-shrink-0" />
                <span>Tekan tombol di atas untuk melihat bagaimana asisten AI menyusun rincian penanganan masalah dalam waktu singkat.</span>
              </div>
            </motion.div>
          </div>
          
        </div>
      </section>

      {/* Key Stats Banner (Traction) */}
      <section className="bg-brand-slate text-white py-12 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <span className="block text-3xl md:text-4xl font-extrabold text-brand-amber font-mono">15K+</span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 uppercase tracking-wider font-extrabold">Aset Terdaftar</span>
            </div>
            <div className="space-y-1">
              <span className="block text-3xl md:text-4xl font-extrabold text-brand-amber font-mono">Rp4.6M+</span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 uppercase tracking-wider font-extrabold">RAB Terkalkulasi</span>
            </div>
            <div className="space-y-1">
              <span className="block text-3xl md:text-4xl font-extrabold text-brand-amber font-mono">98.4%</span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 uppercase tracking-wider font-extrabold">Akurasi Analisa AI</span>
            </div>
            <div className="space-y-1">
              <span className="block text-3xl md:text-4xl font-extrabold text-brand-amber font-mono">24/7</span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 uppercase tracking-wider font-extrabold">Kemandirian Rumah</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pipeline: Cara Kerja Cerdas (How It Works) */}
      <section className="px-6 py-20 max-w-6xl mx-auto w-full" id="fitur-unggulan">
        <div className="text-center space-y-3 max-w-xl mx-auto mb-16">
          <span className="text-[10px] font-black uppercase text-brand-amber tracking-widest block">PIPELINE SISTEM</span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-brand-slate tracking-tight">4 Langkah Alur Solusi Cerdas Rumah Anda</h3>
          <p className="text-xs text-text-secondary">Aplikasi kami memandu Anda secara logis mulai dari memotret bukti fisik hingga menyimpan ke arsip digital jangka panjang.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <HowCard 
            step="01"
            icon={<Camera className="w-5 h-5 text-amber-500" />}
            title="Foto Kerusakan"
            desc="Ambil gambar dari kamera Handphone atau komputer Anda untuk didiagnosis oleh sensor pola kecerdasan buatan."
          />
          <HowCard 
            step="02"
            icon={<Wrench className="w-5 h-5 text-amber-500" />}
            title="Analisis & Estimasi"
            desc="Sistem menyusun draf rincian bahan material berdasarkan standard SNI terpercaya dan upah borongan wilayah."
          />
          <HowCard 
            step="03"
            icon={<Zap className="w-5 h-5 text-amber-500" />}
            title="Kalkulasi Tagihan"
            desc="Simulasi pemakaian daya bulanan AC, pompa, kulkas di rincian kelistrikan untuk mencegah sirkuit overload."
          />
          <HowCard 
            step="04"
            icon={<History className="w-5 h-5 text-amber-500" />}
            title="Pengingat Berkala"
            desc="Daftarkan alarm pemeliharaan otomatis seperti mencuci filter AC atau perbaikan keretakan agar struktur terlindungi."
          />
        </div>
      </section>

      {/* Core Features Grid cards */}
      <section className="bg-white py-16 px-6 border-y border-gray-100">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-brand-amber tracking-wider block">CRAFTED DOCK</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-brand-slate tracking-tight">Perlengkapan Manajemen Properti Profesional</h3>
            </div>
            <p className="text-xs text-text-secondary max-w-md">Dirancang khusus untuk membantu pemilik hunian, arsitek pemula, kontraktor, dan pengelola kontrakan mengatur keuangan perbaikan.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={<Camera className="w-5 h-5 text-brand-amber" />}
              title="AI Visual Inspection"
              desc="Deteksi retak dinding semen, indikasi struktur korosif, dan rembes pipa air dalam 2 detik."
            />
            <FeatureCard 
              icon={<Zap className="w-5 h-5 text-brand-amber" />}
              title="Estimator Listrik Rumah"
              desc="Simulasi beban alat elektronik Anda agar tagihan bulanan terkontrol dengan rekomendasi pola hemat energi."
            />
            <FeatureCard 
              icon={<Shield className="w-5 h-5 text-brand-amber" />}
              title="Surat Penawaran Formal"
              desc="Ekspor dokumen penawaran harga borongan (RAB) formal lengkap ke Clipboard untuk dibagikan ke kontraktor."
            />
            <FeatureCard 
              icon={<History className="w-5 h-5 text-brand-amber" />}
              title="Kalkulasi Estimasi Cat"
              desc="Taksir volume liter cat dasar & warna primer ruang berdasarkan luas bukaan jendela dan pintu ruangan."
            />
          </div>
        </div>
      </section>

      {/* Accordion FAQ Area */}
      <section className="px-6 py-20 max-w-4xl mx-auto w-full">
        <div className="text-center space-y-3 mb-12">
          <HelpCircle className="w-8 h-8 text-brand-amber mx-auto" />
          <h3 className="text-2xl font-extrabold text-brand-slate tracking-tight">Tanya Jawab Terintegrasi</h3>
          <p className="text-xs text-text-secondary">Temukan penjelasan komprehensif mengenai keandalan layanan estimasi digital konstruksi Tukangku.</p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left px-5 py-4.5 flex justify-between items-center gap-4 transition-colors hover:bg-gray-50 bg-white"
                >
                  <span className="text-xs sm:text-sm font-bold text-text-primary">{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 text-text-tertiary transition-transform duration-300 flex-shrink-0 ${isOpen ? "rotate-180 text-brand-amber" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-5 pb-5 pt-1 border-t border-gray-100 text-xs text-text-secondary leading-relaxed bg-slate-50/50">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* Action CTA Banner */}
      <section className="px-6 pb-20 max-w-5xl mx-auto w-full">
        <div className="bg-gradient-to-br from-brand-slate to-slate-900 rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-2xl border border-white/5 space-y-6">
          <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 right-10 w-48 h-48 bg-gradient-to-tr from-brand-amber/10 to-transparent rounded-full blur-2xl pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">Siap Melakukan Efisiensi Perawatan Properti Pertama Anda?</h4>
            <p className="text-xs text-slate-300 leading-relaxed">Bergabunglah secara offline-first untuk mendiagnosis, mengatur inventaris perlengkapan, dan menyusun estimasi biaya renovasi secara mandiri.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3.5 justify-center relative z-10 max-w-sm mx-auto">
            <button 
              onClick={onGetStarted}
              className="btn-primary h-12 w-full text-xs font-black uppercase tracking-wider bg-brand-amber hover:bg-amber-500 text-brand-slate shadow-lg shadow-brand-amber/20"
            >
              Mulai Sesi Sekarang
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 px-6 bg-white flex-shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5 opacity-85">
            <div className="bg-brand-amber p-1.5 rounded-lg text-white">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-brand-slate block leading-none">TUKANGKU</span>
              <span className="text-[7px] text-text-tertiary font-bold tracking-widest font-mono">ESTIMATOR SERVICES 2026</span>
            </div>
          </div>
          <p className="text-text-tertiary text-[10px] uppercase font-bold tracking-wider font-mono">
            © 2026 TUKANGKU INDONESIA • SECURED OFFLINE DESIGN SYSTEM • KOEFISIEN RAB BERDASARKAN SNI
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="card-flat p-6.5 bg-white border border-gray-200/80 rounded-2xl flex flex-col gap-4 hover:border-brand-amber/30 hover:shadow-lg hover:shadow-gray-100 transition-all duration-300 group">
      <div className="bg-gray-50 p-2.5 rounded-xl w-fit group-hover:bg-amber-50 transition-colors border border-gray-100/30">
        {icon}
      </div>
      <div className="space-y-1.5">
        <h3 className="font-extrabold text-brand-slate text-xs sm:text-sm">{title}</h3>
        <p className="text-text-secondary text-[11px] leading-relaxed font-medium">{desc}</p>
      </div>
    </div>
  );
}

function HowCard({ step, icon, title, desc }: { step: string, icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-white border border-gray-200/80 p-6.5 rounded-2xl relative space-y-4 hover:border-brand-amber/30 transition-all shadow-sm group">
      <div className="flex justify-between items-center">
        <div className="bg-amber-50 p-2.5 rounded-xl text-brand-amber group-hover:scale-105 transition-transform">
          {icon}
        </div>
        <span className="text-xs font-black font-mono text-brand-amber bg-amber-50 px-2 py-0.5 rounded-full">{step}</span>
      </div>
      <div className="space-y-1.5">
        <h4 className="font-extrabold text-brand-slate text-xs">{title}</h4>
        <p className="text-text-secondary text-[11px] leading-relaxed font-semibold">{desc}</p>
      </div>
    </div>
  );
}

