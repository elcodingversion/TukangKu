import { useState } from "react";
import { Phone, Search, ShieldAlert, Award, Star, ExternalLink, MessageSquare, AlertTriangle, Users, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

interface PublicService {
  name: string;
  phone: string;
  description: string;
  urgency: "Sangat Kritis" | "Sedang";
}

interface ProfessionalVendor {
  id: string;
  name: string;
  category: "Listrik" | "Sanitasi / Pipa" | "Pendingin Ruangan (AC)" | "Konstruksi Rumah";
  rating: number;
  reviews: number;
  location: string;
  phone: string;
  experience: string;
  vetted: boolean;
  avatar: string;
}

const PUBLIC_SERVICES: PublicService[] = [
  { name: "PLN (Gangguan Listrik)", phone: "123", description: "Layanan penanganan korsleting tiang, trafo meledak, atau meteran listrik rusak.", urgency: "Sangat Kritis" },
  { name: "Pemadam Kebakaran (Damkar)", phone: "113", description: "Darurat pemadaman api, korsleting besar, evakuasi hewan liar di rumah.", urgency: "Sangat Kritis" },
  { name: "PDAM (Kebocoran Air Utama)", phone: "108", description: "Lapor saluran air bersih pecah di depan rumah atau kendala meteran macet.", urgency: "Sedang" },
  { name: "Ambulans / Gawat Darurat", phone: "118", description: "Layanan medis evakuasi darurat, kecelakaan kerja renovasi bangunan.", urgency: "Sangat Kritis" }
];

const VENDOR_DIRECTORY: ProfessionalVendor[] = [
  {
    id: "v1",
    name: "Haryono Teknik (Sertifikasi PLN)",
    category: "Listrik",
    rating: 4.9,
    reviews: 124,
    location: "Jakarta Selatan, DKI Jakarta",
    phone: "081234567890",
    experience: "12 Tahun",
    vetted: true,
    avatar: "H"
  },
  {
    id: "v2",
    name: "Abadi Sanitary & Pipa",
    category: "Sanitasi / Pipa",
    rating: 4.8,
    reviews: 89,
    location: "Depok, Jawa Barat",
    phone: "082345678901",
    experience: "8 Tahun",
    vetted: true,
    avatar: "A"
  },
  {
    id: "v3",
    name: "Sinar Jaya Mandiri AC",
    category: "Pendingin Ruangan (AC)",
    rating: 4.9,
    reviews: 215,
    location: "Tangerang, Banten",
    phone: "083456789012",
    experience: "10 Tahun",
    vetted: true,
    avatar: "S"
  },
  {
    id: "v4",
    name: "Karya Agung Structural Specialist",
    category: "Konstruksi Rumah",
    rating: 4.7,
    reviews: 62,
    location: "Bekasi, Jawa Barat",
    phone: "084567890123",
    experience: "15 Tahun",
    vetted: true,
    avatar: "K"
  },
  {
    id: "v5",
    name: "Budi Jaya Kelistrikan",
    category: "Listrik",
    rating: 4.6,
    reviews: 45,
    location: "Bandung, Jawa Barat",
    phone: "085678901234",
    experience: "5 Tahun",
    vetted: false,
    avatar: "B"
  }
];

export default function EmergencyContactsModule() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"Semua" | "Listrik" | "Sanitasi" | "AC" | "Konstruksi">("Semua");
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 1500);
  };

  const getFilteredVendors = () => {
    return VENDOR_DIRECTORY.filter(vendor => {
      const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            vendor.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = 
        activeTab === "Semua" ||
        (activeTab === "Listrik" && vendor.category === "Listrik") ||
        (activeTab === "Sanitasi" && vendor.category === "Sanitasi / Pipa") ||
        (activeTab === "AC" && vendor.category === "Pendingin Ruangan (AC)") ||
        (activeTab === "Konstruksi" && vendor.category === "Konstruksi Rumah");

      return matchesSearch && matchesCategory;
    });
  };

  const currentVendors = getFilteredVendors();

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-amber" /> Kontak & Teknisi Gawat Darurat
          </h2>
          <p className="text-sm text-text-secondary mt-1">Layanan publik siaga bencana rumah tangga dan daftar teknisi bersertifikat terpercaya.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Cari lokasi atau nama teknisi..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-border-subtle rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-brand-amber outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Grid: Public Service & Tech directory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Span: Public Services Quick Call (1 span) */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2.5 border-b border-border-subtle">
            <ShieldAlert className="w-5 h-5 text-brand-red" />
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Layanan Darurat Publik</h3>
          </div>

          <div className="space-y-4">
            {PUBLIC_SERVICES.map((srv, index) => (
              <div 
                key={index}
                className="card-flat p-4 bg-white border border-border-subtle hover:border-brand-red/20 transition-all flex flex-col justify-between"
              >
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-text-primary uppercase">{srv.name}</span>
                    <span className={cn(
                      "text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded",
                      srv.urgency === "Sangat Kritis" ? "bg-red-50 text-red-700 border border-red-100" : "bg-amber-50 text-amber-700 border border-amber-100"
                    )}>
                      {srv.urgency}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{srv.description}</p>
                </div>

                <div className="flex gap-2">
                  <a 
                    href={`tel:${srv.phone}`}
                    className="flex-1 btn-primary py-2 px-3 text-xs font-bold h-auto bg-brand-red hover:bg-red-600 border-0 text-white flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" /> Panggil: {srv.phone}
                  </a>
                  <button 
                    onClick={() => handleCopyPhone(srv.phone)}
                    className="btn-secondary py-2 px-3 text-xs font-bold h-auto w-fit"
                  >
                    {copiedPhone === srv.phone ? "Tersalin" : "Salin"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-amber-50/60 border border-amber-100/80 rounded-xl p-4 flex gap-3 text-xs leading-relaxed">
            <AlertTriangle className="w-5 h-5 text-brand-amber flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-amber-800">SOP Tanggap Darurat</p>
              <p className="text-text-secondary text-[11px]">
                Dalam kondisi darurat kebakaran atau sengatan listrik parah, segera matikan MCB utama atau kran PDAM pusat sebelum melakukan panggilan darurat. Keamanan diri Anda adalah yang paling nomor satu!
              </p>
            </div>
          </div>
        </div>

        {/* Right Span: Curated Vets Handymen (2 span) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Internal Categories Tab for directory */}
          <div className="flex overflow-x-auto gap-2 pb-2 border-b border-border-subtle scrollbar-none">
            {(["Semua", "Listrik", "Sanitasi", "AC", "Konstruksi"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 text-xs font-bold uppercase tracking-wider border rounded-lg transition-all whitespace-nowrap",
                  activeTab === tab
                    ? "bg-brand-slate text-white border-brand-slate shadow-sm"
                    : "bg-white text-text-secondary border-border-subtle hover:bg-gray-50"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Directory Listings */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-text-tertiary uppercase tracking-wider">
              Menampilkan {currentVendors.length} Partner Rekomendasi
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {currentVendors.map((vendor) => (
                  <motion.div
                    key={vendor.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="card-flat p-5 bg-white border border-border-subtle hover:border-brand-amber/30 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3.5">
                      {/* Top Header Card */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 text-brand-amber flex items-center justify-center font-bold text-sm">
                          {vendor.avatar}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-xs text-text-primary uppercase truncate tracking-tight">{vendor.name}</h4>
                            {vendor.vetted && (
                              <Award className="w-4 h-4 text-brand-amber flex-shrink-0" />
                            )}
                          </div>
                          <span className="text-[10px] text-brand-amber font-extrabold uppercase tracking-wide">{vendor.category}</span>
                        </div>
                      </div>

                      {/* Details Rating, review, location */}
                      <div className="space-y-1.5 text-xs text-text-secondary">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Star className="w-3.5 h-3.5 text-brand-amber fill-brand-amber" />
                          <span className="font-mono font-bold text-text-primary">{vendor.rating}</span>
                          <span className="text-text-tertiary">({vendor.reviews} review perbaikan)</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-text-tertiary" />
                          <span className="truncate">{vendor.location}</span>
                        </div>

                        <div className="flex justify-between text-[11px] pt-1.5 border-t border-dashed border-border-subtle font-mono">
                          <span>Pengalaman: <strong>{vendor.experience}</strong></span>
                          {vendor.vetted ? (
                            <span className="text-brand-emerald font-bold uppercase tracking-widest text-[9px]">Sertifikasi AI Vetted</span>
                          ) : (
                            <span className="text-text-tertiary font-bold uppercase tracking-widest text-[9px]">Umum</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions call or chat to consult */}
                    <div className="flex gap-2 mt-5">
                      <a 
                        href={`https://wa.me/${vendor.phone.replace(/^0/, "62")}?text=Halo%20${encodeURIComponent(vendor.name)}!%20Saya%20membutuhkan%20estimasi%20layanan%20kategori%20${encodeURIComponent(vendor.category)}%20untuk%20rumah%20saya.`}
                        target="_blank"
                        referrerPolicy="no-referrer"
                        className="flex-1 btn-secondary py-2 text-xs font-bold h-auto bg-emerald-50 text-brand-emerald border-brand-emerald/10 hover:bg-emerald-100 flex items-center justify-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Konsultasi WA
                      </a>
                      <a 
                        href={`tel:${vendor.phone}`}
                        className="btn-primary py-2 px-3 text-xs font-bold h-auto w-fit bg-brand-slate hover:bg-slate-800 border-0 flex items-center"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {currentVendors.length === 0 && (
              <div className="card-flat p-12 text-center bg-gray-50/50">
                <p className="text-text-secondary text-sm">Tidak menemukan partner teknisi yang cocok di daerah ini.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
