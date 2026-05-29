import { useState } from "react";
import { BookOpen, Search, Wrench, ShieldAlert, CheckCircle, Info, ChevronRight, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

interface GuideStep {
  id: string;
  text: string;
  tip?: string;
}

interface Guide {
  id: string;
  category: "Sanitasi" | "Listrik" | "Struktur" | "Aset Rumah";
  title: string;
  subtitle: string;
  severity: "Ringan" | "Sedang" | "Bahaya";
  description: string;
  steps: GuideStep[];
  toolsNeeded: string[];
}

const EMERGENCY_GUIDES: Guide[] = [
  {
    id: "water-leak",
    category: "Sanitasi",
    title: "Mengatasi Kebocoran Pipa & Kran",
    subtitle: "Mitigasi air merembes untuk mencegah pelapukan plafon dan tagihan bengkak.",
    severity: "Sedang",
    description: "Jika kran atau sambungan pipa bocor, langkah kritis pertama adalah menghentikan aliran air di pusat kontrol agar air tidak merusak panel listrik atau dinding semen.",
    toolsNeeded: ["Seal Tape Teflon", "Kunci Inggris", "Tang Buaya", "Kain Lap Mikrofiber"],
    steps: [
      { id: "1", text: "Matikan Gate Valve (Kran Utama) yang biasanya terletak di dekat meteran air PDAM atau pompa air.", tip: "Keluarkan sisa air di pipa dengan membuka kran terrendah." },
      { id: "2", text: "Lepaskan kran atau sambungan yang bocor berlawanan arah jarum jam dengan Kunci Inggris.", tip: "Beri alas kain tebal pada kran berlapis chrome agar permukaannya tidak lecet." },
      { id: "3", text: "Bersihkan sisa seal-tape lama pada ulir pipa logam maupun plastik.", tip: "Pastikan tidak ada kotoran atau kerak karat tertinggal di drat ulir." },
      { id: "4", text: "Lilitkan Seal Tape baru searah jarum jam sebanyak 15-20 kali putaran secara merata.", tip: "Tekan tipis lilitan agar merekat erat mengikuti lekuk drat." },
      { id: "5", text: "Pasang kembali kran dan kencangkan secukupnya. Jangan terlalu keras agar drat tidak retak.", tip: "Buka kran utama perlahan lalu periksa jika masih ada rembesan mikro." }
    ]
  },
  {
    id: "short-circuit",
    category: "Listrik",
    title: "Mengisolasi Korsleting & MCB Turun",
    subtitle: "Tindakan pengamanan mandiri saat listrik rumah padam sebagian atau seluruhnya.",
    severity: "Bahaya",
    description: "Bahaya kebakaran akibat arus pendek listrik merupakan risiko terbesar. Jangan pernah menyentuh MCB jika dalam kondisi basah atau tangan lembab.",
    toolsNeeded: ["Tespen (Volt Detector)", "Senter / Penerangan Darurat", "Sarung tangan karet kering"],
    steps: [
      { id: "1", text: "Matikan seluruh saklar lampu dan cabut semua steker elektronik dari stopkontak di area bermasalah.", tip: "Korsleting sering bersumber dari beban lebih peralatan masak atau kompresor AC." },
      { id: "2", text: "Buka box sekring lalu naikkan tombol MCB utama ke arah ON.", tip: "Gunakan sandal karet kering saat menyentuh kotak panel demi proteksi isolasi tanah." },
      { id: "3", text: "Colokkan kembali alat elektronik satu per satu sambil memperhatikan kapan MCB kembali jatuh (turun).", tip: "Alat terakhir yang dicolokkan saat MCB turun adalah pemicu korsleting utamanya." },
      { id: "4", text: "Isolasi atau cabut perangkat rusak tersebut, bawa ke tempat servis profesional.", tip: "Bila MCB tetap turun padahal semua beban kosong, berarti ada kebocoran kabel di dalam tembok." }
    ]
  },
  {
    id: "wall-crack",
    category: "Struktur",
    title: "Perbaikan Plesteran Dinding Retak Rambut",
    subtitle: "Mengisi retakan dinding semen luar agar air hujan tidak merembes ke cat interior.",
    severity: "Ringan",
    description: "Retak rambut (lebar < 1mm) muncul akibat penyusutan adukan semen saat pengeringan bangunan. Jika dibiarkan, rembesan air hujan akan menumbuhkan jamur beracun.",
    toolsNeeded: ["Semen Plamir / Wall Filler Waterproof", "Kape (Scraper)", "Kuas Cat 2 Inch", "Amplas Grit 150"],
    steps: [
      { id: "1", text: "Kikis permukaan cat di sepanjang retakan selebar 5 cm menggunakan kape baja.", tip: "Pastikan sisa cat yang mengelupas dan rapuh terangkat seluruhnya." },
      { id: "2", text: "Bersihkan debu dari dalam celah retakan dengan kuas kering atau penyedot debu.", tip: "Tembok yang berdebu akan menghalangi sealant menempel dengan sempurna." },
      { id: "3", text: "Basahi celah retak rambut dengan sedikit air bersih agar semen plamir tidak terlalu cepat kering.", tip: "Ini disebut dehidrasi semen, mencegah retak susulan pasca-aplikasi." },
      { id: "4", text: "Aplikasikan semen plamir atau komponen sealant instan ke celah menggunakan kape. Tekan dengan kuat.", tip: "Buat permukaan sedikit cembung karena semen akan sedikit menyusut saat mengering." },
      { id: "5", text: "Amplas setelah kering 24 jam hingga rata dengan tembok sekitar, lalu siap dicat dasar anti-bocor.", tip: "Gunakan cat jenis elastomeric untuk fleksibilitas jembatan retakan." }
    ]
  },
  {
    id: "ac-leak",
    category: "Aset Rumah",
    title: "Mengatasi AC Bocor Air / Menetes",
    subtitle: "Pembersihan jalur pembuangan kondensasi AC standar ruangan secara mandiri.",
    severity: "Ringan",
    description: "Tetesan air dari unit indoor biasanya terjadi karena saluran pembuangan (drainage) tersumbat lendir debu, membuat bak penampung meluap keluar.",
    toolsNeeded: ["Tangga Lipat", "Obeng Plus (+)", "Pompa Semprot Manual / Selang Air", "Sikat Gigi Bekas"],
    steps: [
      { id: "1", text: "Matikan AC dan cabut listriknya dari stopkontak khusus demi keselamatan.", tip: "Jangan lakukan pembersihan dalam keadaan unit indoor masih menyala." },
      { id: "2", text: "Buka cover indoor AC lalu lepaskan kedua filter udara jaring nilon.", tip: "Cuci filter bersih-bersih dengan sabun cair lalu keringkan di tempat teduh." },
      { id: "3", text: "Temukan lubang kecil pembuangan air di pojok kanan bawah bak evaporator AC.", tip: "Gunakan sikat gigi bekas untuk mengikis gumpalan lendir di sekitar corong." },
      { id: "4", text: "Tembak lubang pembuangan tersebut menggunakan pompa air / ditiup kuat melalui selang fleksibel.", tip: "Lendir penyumbat akan luruh keluar melalui ujung pipa di luar ruangan rumah." },
      { id: "5", text: "Tuang sedikit air hangat ke talang air indoor untuk memastikan aliran sudah lancar.", tip: "Lihat apakah air mengalir deras ke luar tanpa ada kebocoran tersisa." }
    ]
  }
];

export default function DiyModule() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  const toggleStep = (stepId: string) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const resetSteps = () => {
    setCompletedSteps({});
  };

  const categories = ["Semua", "Sanitasi", "Listrik", "Struktur", "Aset Rumah"];

  const filteredGuides = EMERGENCY_GUIDES.filter((guide) => {
    const matchesSearch = guide.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          guide.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          guide.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "Semua" || guide.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">Panduan Mitigasi DIY</h2>
          <p className="text-sm text-text-secondary mt-1">Langkah tanggap darurat semenjana untuk perbaikan instan mandiri.</p>
        </div>
        
        {/* Search tool */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Cari solusi kerusakan..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-border-subtle rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-brand-amber outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Categories Toolbar */}
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

      <AnimatePresence mode="wait">
        {selectedGuide ? (
          <motion.div
            key="guide-detail"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="card-flat p-6 md:p-8 space-y-8 bg-white border border-border-subtle shadow-sm"
          >
            {/* Header Detail */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-border-subtle">
              <div className="space-y-1.5">
                <span className={cn(
                  "tag",
                  selectedGuide.category === "Sanitasi" && "tag-emerald",
                  selectedGuide.category === "Listrik" && "tag-amber",
                  selectedGuide.category === "Struktur" && "bg-red-50 text-red-700 border-red-200",
                  selectedGuide.category === "Aset Rumah" && "bg-blue-50 text-blue-700 border-blue-200"
                )}>
                  {selectedGuide.category}
                </span>
                <h3 className="text-xl font-bold text-text-primary tracking-tight leading-tight uppercase">{selectedGuide.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{selectedGuide.subtitle}</p>
              </div>
              
              <div className={cn(
                "px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider text-center self-start sm:self-auto shadow-sm",
                selectedGuide.severity === "Ringan" && "bg-emerald-50 text-emerald-700 border-emerald-100",
                selectedGuide.severity === "Sedang" && "bg-amber-50 text-amber-700 border-amber-100",
                selectedGuide.severity === "Bahaya" && "bg-red-50 text-red-700 border-red-100"
              )}>
                {selectedGuide.severity === "Bahaya" && "⚠️ "}Tingkat Resiko: {selectedGuide.severity}
              </div>
            </div>

            {/* Warning description */}
            <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-5 flex gap-4">
              <ShieldAlert className="w-5 h-5 text-brand-amber flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-brand-amber uppercase tracking-wider">Perhatian & Tindakan Pencegahan</p>
                <p className="text-xs text-text-secondary leading-relaxed">{selectedGuide.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column: Tools list */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-brand-amber" /> Alat Yang Diperlukan
                </h4>
                <ul className="space-y-2">
                  {selectedGuide.toolsNeeded.map((t, index) => (
                    <li key={index} className="bg-gray-50 border border-border-subtle rounded-lg px-4 py-3 text-xs text-text-primary font-medium flex items-center gap-2.5 shadow-sm">
                      <div className="w-1.5 h-1.5 bg-brand-amber rounded-full" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Column (2 spans): Step by Step interactive list */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-brand-amber" /> Langkah - Langkah Pengerjaan
                  </h4>
                  <button 
                    onClick={resetSteps}
                    className="text-[10px] uppercase font-bold text-text-tertiary hover:text-brand-amber transition-colors"
                  >
                    Reset Ceklist
                  </button>
                </div>

                <div className="space-y-4">
                  {selectedGuide.steps.map((step, idx) => {
                    const isDone = !!completedSteps[step.id];
                    return (
                      <div 
                        key={step.id}
                        onClick={() => toggleStep(step.id)}
                        className={cn(
                          "border rounded-xl p-4 cursor-pointer transition-all flex gap-4 select-none",
                          isDone 
                            ? "bg-emerald-50/30 border-brand-emerald/30 opacity-70" 
                            : "bg-white border-border-subtle hover:border-brand-amber/30 hover:shadow-sm"
                        )}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <div className={cn(
                            "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                            isDone 
                              ? "bg-brand-emerald border-brand-emerald text-white" 
                              : "border-gray-300 bg-white"
                          )}>
                            {isDone && <CheckCircle className="w-3.5 h-3.5" />}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 space-y-2">
                          <p className={cn(
                            "text-xs font-bold leading-relaxed",
                            isDone ? "text-text-tertiary line-through" : "text-text-primary"
                          )}>
                            <span className="font-mono text-[10px] text-text-tertiary mr-1">{step.id}.</span> {step.text}
                          </p>
                          {step.tip && !isDone && (
                            <div className="bg-gray-50 border border-border-subtle/60 rounded-lg p-2.5 flex gap-2 items-start">
                              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                              <p className="text-[10.5px] font-medium text-text-secondary leading-relaxed"><strong className="text-text-primary font-bold">Tips Cerdas:</strong> {step.tip}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer guide details */}
            <div className="pt-6 border-t border-border-subtle flex flex-col sm:flex-row gap-4 items-center justify-between">
              <p className="text-[11px] text-text-tertiary leading-normal text-center sm:text-left flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-brand-amber inline" />
                Jika kebocoran parah atau tidak teratasi dengan langkah di atas, segera gunakan <strong>Diagnosis Visual Baru</strong>.
              </p>
              <button 
                onClick={() => { setSelectedGuide(null); resetSteps(); }}
                className="btn-secondary px-6 py-2.5 text-xs font-bold h-auto w-full sm:w-auto"
              >
                Kembali ke Daftar Panduan
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="guides-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {filteredGuides.length === 0 ? (
              <div className="col-span-full card-flat p-12 text-center bg-gray-50/50">
                <p className="text-text-secondary text-sm">Tidak menemukan panduan DIY yang cocok dengan kata kunci Anda.</p>
              </div>
            ) : (
              filteredGuides.map((guide) => (
                <div 
                  key={guide.id}
                  onClick={() => setSelectedGuide(guide)}
                  className="card-flat p-6 bg-white border border-border-subtle hover:border-brand-amber/30 hover:shadow-md transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "tag",
                        guide.category === "Sanitasi" && "tag-emerald",
                        guide.category === "Listrik" && "tag-amber",
                        guide.category === "Struktur" && "bg-red-50 text-red-700 border-red-200",
                        guide.category === "Aset Rumah" && "bg-blue-50 text-blue-700 border-blue-200"
                      )}>
                        {guide.category}
                      </span>
                      <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">{guide.steps.length} Langkah</span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="font-bold text-text-primary text-base group-hover:text-brand-amber transition-colors line-clamp-1 uppercase tracking-tight">
                        {guide.title}
                      </h3>
                      <p className="text-text-secondary text-xs leading-relaxed line-clamp-2">
                        {guide.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-6 border-t border-dashed border-border-subtle flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-brand-amber uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
                      Pelajari Panduan <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[10px] text-text-tertiary font-mono">Resiko: {guide.severity}</span>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
