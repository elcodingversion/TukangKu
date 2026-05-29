import { useState, useEffect } from "react";
import { 
  Clock, 
  Wrench, 
  ChevronRight, 
  ArrowLeft,
  FileText,
  Package,
  Loader2,
  Hammer,
  Zap,
  Check,
  ExternalLink,
  AlertTriangle,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";
import { RepairDiagnosis, RepairRAB, MaintenanceLog } from "../types";
import { cn, formatRupiah } from "../lib/utils";
import ReactMarkdown from "react-markdown";

interface DiagnosisViewProps {
  diagnosis: RepairDiagnosis;
  initialRab?: RepairRAB;
  initialLetter?: string;
  isReadOnly?: boolean;
  onCancel: () => void;
  onComplete?: (log: MaintenanceLog) => void;
}

export default function DiagnosisView({ 
  diagnosis, 
  initialRab, 
  initialLetter, 
  isReadOnly = false, 
  onCancel, 
  onComplete 
}: DiagnosisViewProps) {
  const [view, setView] = useState<"diagnosis" | "rab" | "letter">("diagnosis");
  const [loading, setLoading] = useState(false);
  const [rab, setRab] = useState<RepairRAB | null>(initialRab || null);
  const [letter, setLetter] = useState<string | null>(initialLetter || null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Reset/sync component state if the diagnosis or its props change
  useEffect(() => {
    setView("diagnosis");
    setRab(initialRab || null);
    setLetter(initialLetter || null);
    setLoading(false);
  }, [diagnosis.id, initialRab, initialLetter]);

  const generateRAB = async () => {
    if (rab) {
      setView("rab");
      return;
    }
    
    setLoading(true);
    try {
      const prompt = `Based on this repair diagnosis: "${diagnosis.diagnosisText}" for item "${diagnosis.item}".
      Generate a realistic Indonesian Repair Budget (RAB) in JSON format:
      {
        "materials": [
          { "name": "string", "spec": "string", "minPrice": number, "maxPrice": number }
        ],
        "laborCosts": { "low": number, "mid": number, "high": number },
        "verdict": "string (Repair or Replace)",
        "verdictReason": "string",
        "totalEstimateMin": number,
        "totalEstimateMax": number
      }
      Use current Indonesian market prices in Rupiah. 
      Output ONLY valid JSON.`;

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();

      if (!response.ok) {
        const message = data?.error || "Gagal membuat estimasi anggaran (RAB).";
        alert(`Gagal: ${message}`);
        return;
      }

      const resultText = data?.result || "";
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      const result = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      
      if (result) {
        setRab(result);
        setView("rab");
      } else {
        alert("Gagal memformat hasil analisis anggaran dari AI. Silakan coba sesaat lagi.");
      }
    } catch (error) {
      console.error("RAB generation error:", error);
      alert("Terjadi kesalahan jaringan atau sistem saat menyusun rencana anggaran.");
    } finally {
      setLoading(false);
    }
  };

  const generateLetter = async () => {
    if (letter) {
      setView("letter");
      return;
    }

    setLoading(true);
    try {
      const prompt = `Buatkan Surat Penawaran Kerja (Work Order) formal dalam Bahasa Indonesia berdasarkan:
      Item: ${diagnosis.item}
      Kerusakan: ${diagnosis.cause}
      Estimasi Biaya: ${rab ? formatRupiah(rab.totalEstimateMin) + ' - ' + formatRupiah(rab.totalEstimateMax) : 'TBD'}
      
      Gunakan format surat bisnis Indonesia yang benar dengan tempat untuk Tanggal, Alamat Tukang, dan Tandatangan.
      Nada: Profesional, sopan, dan tegas agar tidak tertipu harga.`;

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();

      if (!response.ok) {
        const message = data?.error || "Gagal membuat surat penawaran resmi.";
        alert(`Gagal: ${message}`);
        return;
      }

      if (data?.result) {
        setLetter(data.result);
        setView("letter");
      } else {
        alert("Format surat kosong. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Letter generation error:", error);
      alert("Terjadi kesalahan jaringan atau sistem saat menyusun surat penawaran.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    setShowSuccess(true);
    setTimeout(() => {
      onComplete?.({
        id: Math.random().toString(36).substr(2, 9),
        diagnosis,
        rab: rab || undefined,
        letter: letter || undefined,
        completedAt: Date.now(),
        totalCost: rab ? (rab.totalEstimateMin + rab.totalEstimateMax) / 2 : 0,
      });
      setShowSuccess(false);
    }, 2800);
  };

  const handleDownloadDiagnosisPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    doc.setProperties({
      title: `Laporan Diagnosis - ${diagnosis.item}`,
      author: "Tukangku AI",
      subject: "Hasil Diagnosis Teknis Mandiri",
      creator: "Tukangku"
    });

    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - (margin * 2);

    let y = margin + 5;

    // Header Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(17, 24, 39);
    doc.text("LAPORAN DIAGNOSIS TEKNIS AI", margin, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text("Dibuat otomatis oleh Tukangku AI - Detektor Kerusakan Rumah Pintar", margin, y);
    y += 8;

    // Thick line indicator
    doc.setDrawColor(217, 119, 6); // Brand amber
    doc.setLineWidth(1);
    doc.line(margin, y, margin + contentWidth, y);
    y += 10;

    // Core Parameters
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);
    doc.text("INFORMASI UTAMA", margin, y);
    y += 6;

    // Metadata Block
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);

    // Grid layout using columns
    const colWidth = contentWidth / 2;
    
    doc.text(`Nama Objek: ${diagnosis.item}`, margin, y);
    doc.text(`Status Urgensi: ${diagnosis.urgency}`, margin + colWidth, y);
    y += 6;

    doc.text(`Tingkat Keparahan: ${diagnosis.severity} / 5`, margin, y);
    doc.text(`Tanggal Audit: ${new Date(diagnosis.timestamp).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`, margin + colWidth, y);
    y += 6;

    doc.text(`Estimasi Waktu: ${diagnosis.estimatedTime}`, margin, y);
    doc.text(`Rekomendasi Tindakan: ${diagnosis.fixability.split(" (")[0]}`, margin + colWidth, y);
    y += 10;

    // Cause Block
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);
    doc.text("PENYEBAB KERUSAKAN", margin, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    const splitCause = doc.splitTextToSize(diagnosis.cause, contentWidth);
    splitCause.forEach((line: string) => {
      doc.text(line, margin, y);
      y += 5.5;
    });
    y += 6;

    // Detailed Analysis Line Separator
    doc.setDrawColor(243, 244, 246);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + contentWidth, y);
    y += 8;

    // Detailed Analysis Markdown
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);
    doc.text("ANALISIS TEKNIS DETAIL", margin, y);
    y += 7;

    const lines = diagnosis.diagnosisText.split(/\r?\n/);
    lines.forEach((line) => {
      let currentLine = line.trim();
      if (!currentLine) {
        y += 4;
        return;
      }

      let isHeader = false;
      let isListItem = false;

      if (currentLine.startsWith("###")) {
        currentLine = currentLine.replace(/^###\s*/, "");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        isHeader = true;
      } else if (currentLine.startsWith("##")) {
        currentLine = currentLine.replace(/^##\s*/, "");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        isHeader = true;
      } else if (currentLine.startsWith("#")) {
        currentLine = currentLine.replace(/^#\s*/, "");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        isHeader = true;
      } else if (currentLine.startsWith("-") || currentLine.startsWith("*")) {
        currentLine = "• " + currentLine.replace(/^[-*]\s*/, "");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        isListItem = true;
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
      }

      currentLine = currentLine.replace(/\*\*/g, "");

      const textIndent = isListItem ? margin + 4 : margin;
      const wrapWidth = isListItem ? contentWidth - 4 : contentWidth;

      const wrapping = doc.splitTextToSize(currentLine, wrapWidth);
      wrapping.forEach((wrapped: string) => {
        if (y > pageHeight - margin - 15) {
          doc.addPage();
          y = margin + 15;
        }
        doc.text(wrapped, textIndent, y);
        y += isHeader ? 7 : 6;
      });

      if (isHeader) {
        y += 2;
      }
    });

    const safeItemName = diagnosis.item.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    doc.save(`Laporan_Diagnosis_${safeItemName}.pdf`);
  };

  const handleDownloadRABPDF = () => {
    if (!rab) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    doc.setProperties({
      title: `Estimasi RAB - ${diagnosis.item}`,
      author: "Tukangku AI",
      subject: "Rencana Anggaran Biaya Perbaikan",
      creator: "Tukangku"
    });

    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - (margin * 2);

    let y = margin + 5;

    // Header Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(17, 24, 39);
    doc.text("RENCANA ANGGARAN BIAYA (RAB) PERBAIKAN", margin, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`Dokumen Referensi #RAB-${diagnosis.id} - Dihasilkan oleh AI`, margin, y);
    y += 8;

    // Yellow decorative line
    doc.setDrawColor(217, 119, 6); // Brand amber
    doc.setLineWidth(1);
    doc.line(margin, y, margin + contentWidth, y);
    y += 10;

    // Summary section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);
    doc.text("IKHTISAR PROYEK", margin, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    doc.text(`Objek Perbaikan: ${diagnosis.item}`, margin, y);
    y += 6;
    doc.text(`Kerusakan: ${diagnosis.cause}`, margin, y);
    y += 6;
    doc.text(`Estimasi Total Biaya: ${formatRupiah(rab.totalEstimateMin)} s/d ${formatRupiah(rab.totalEstimateMax)}`, margin, y);
    y += 10;

    // Materials details
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);
    doc.text("DAFTAR ESTIMASI HARGA MATERIAL & KOMPONEN", margin, y);
    y += 6;

    // Table Header background
    doc.setFillColor(243, 244, 246);
    doc.rect(margin, y, contentWidth, 8, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(55, 65, 81);
    doc.text("No.", margin + 2, y + 5.5);
    doc.text("Material / Layanan", margin + 12, y + 5.5);
    doc.text("Spesifikasi", margin + 72, y + 5.5);
    doc.text("Kisaran Biaya (IDR)", margin + 132, y + 5.5);
    y += 8;

    // Table Row elements
    doc.setFont("helvetica", "normal");
    doc.setTextColor(17, 24, 39);
    
    rab.materials.forEach((m, i) => {
      if (y > pageHeight - margin - 25) {
        doc.addPage();
        y = margin + 15;
        
        // Re-draw table header
        doc.setFillColor(243, 244, 246);
        doc.rect(margin, y, contentWidth, 8, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(55, 65, 81);
        doc.text("No.", margin + 2, y + 5.5);
        doc.text("Material / Layanan", margin + 12, y + 5.5);
        doc.text("Spesifikasi", margin + 72, y + 5.5);
        doc.text("Kisaran Biaya (IDR)", margin + 132, y + 5.5);
        y += 8;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(17, 24, 39);
      }

      const truncatedName = m.name.length > 28 ? m.name.substring(0, 26) + "..." : m.name;
      const truncatedSpec = m.spec.length > 30 ? m.spec.substring(0, 28) + "..." : m.spec;

      doc.text(`${i + 1}`, margin + 2, y + 5);
      doc.text(truncatedName, margin + 12, y + 5);
      doc.text(truncatedSpec, margin + 72, y + 5);
      
      const priceText = `${formatRupiah(m.minPrice)} - ${formatRupiah(m.maxPrice)}`;
      doc.text(priceText, margin + 132, y + 5);

      // Row divider
      doc.setDrawColor(243, 244, 246);
      doc.setLineWidth(0.3);
      doc.line(margin, y + 7, margin + contentWidth, y + 7);
      y += 8;
    });
    y += 4;

    // Labor Rates Column
    if (y > pageHeight - margin - 45) {
      doc.addPage();
      y = margin + 15;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);
    doc.text("ESTIMASI UPAH PENGERJAAN/TUKANG", margin, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    
    doc.text(`- Tingkat Amatir / DIY / Lokal: ${formatRupiah(rab.laborCosts.low)}`, margin + 4, y);
    y += 5.5;
    doc.text(`- Tingkat Menengah / Standar Pasar: ${formatRupiah(rab.laborCosts.mid)} (Direkomendasikan)`, margin + 4, y);
    y += 5.5;
    doc.text(`- Tingkat Profesional / Authorized Kontraktor: ${formatRupiah(rab.laborCosts.high)}`, margin + 4, y);
    y += 10;

    // AI Verdict
    if (y > pageHeight - margin - 45) {
      doc.addPage();
      y = margin + 15;
    }

    // Highlight Box for Verdict
    doc.setFillColor(249, 250, 251);
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.rect(margin, y, contentWidth, 24, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(17, 24, 39);
    doc.text(`Rekomendasi AI: ${rab.verdict.toUpperCase()}`, margin + 5, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99);
    const wrapVerdictReason = doc.splitTextToSize(rab.verdictReason, contentWidth - 10);
    let reasonY = y + 11;
    wrapVerdictReason.forEach((line: string) => {
      doc.text(line, margin + 5, reasonY);
      reasonY += 4.5;
    });

    const safeItemName = diagnosis.item.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    doc.save(`RAB_Perbaikan_${safeItemName}.pdf`);
  };

  const handleDownloadPDF = () => {
    if (!letter) return;
    
    // Create professional and styled PDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    // Document Properties
    doc.setProperties({
      title: `Surat Penawaran - ${diagnosis.item}`,
      author: "Tukangku AI",
      subject: "Surat Penawaran Alternatif Perbaikan",
      creator: "Tukangku"
    });

    // Layout configuration
    const margin = 20; // 20mm margins
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - (margin * 2);

    let y = margin + 10;

    // Split letter into individual text elements to process line-by-line
    const lines = letter.split(/\r?\n/);
    doc.setFont("times", "normal");
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);

    lines.forEach((line) => {
      // Empty line is a height offset
      if (!line.trim()) {
        y += 5;
        return;
      }

      // Check for headings or subject lines
      const lower = line.toLowerCase();
      const isHeaderSubject = 
        lower.startsWith("surat penawaran") ||
        lower.startsWith("hal:") ||
        lower.startsWith("perihal:") ||
        lower.startsWith("re:") ||
        lower.startsWith("lampiran:") ||
        lower.startsWith("kepada:") ||
        lower.startsWith("yth.") ||
        lower.startsWith("hormat kami,") ||
        lower.startsWith("dengan hormat,");

      if (isHeaderSubject) {
        doc.setFont("times", "bold");
      } else {
        doc.setFont("times", "normal");
      }

      const wrapping = doc.splitTextToSize(line, contentWidth);
      wrapping.forEach((wrapped: string) => {
        if (y > pageHeight - margin - 10) {
          doc.addPage();
          y = margin + 15;
        }

        doc.text(wrapped, margin, y);
        y += 6.5;
      });
    });

    const safeItemName = diagnosis.item.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    doc.save(`Surat_Penawaran_${safeItemName}.pdf`);
  };

  const severityColor = diagnosis.severity > 3 ? "tag-red" : "tag-amber";

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-300">
      {/* Navigation Header */}
      <div className="flex items-center gap-4 py-4 border-b border-border-subtle sticky top-0 bg-app-bg z-10">
        <button onClick={onCancel} className="btn-ghost p-2 -ml-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-text-primary tracking-tight truncate">{diagnosis.item}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn("tag", severityColor)}>SEVERITY {diagnosis.severity}/5</span>
            <span className="text-[10px] text-text-tertiary font-bold tracking-widest uppercase">ID #{diagnosis.id}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border border-border-subtle bg-white rounded-xl p-1.5 gap-1.5 shadow-sm">
        <button
          onClick={() => setView("diagnosis")}
          className={cn(
            "flex-1 py-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2",
            view === "diagnosis"
              ? "bg-brand-slate text-white shadow-sm"
              : "text-text-secondary hover:bg-gray-50"
          )}
        >
          <Hammer className="w-4 h-4" />
          <span className="hidden sm:inline">Laporan</span> Diagnosa
        </button>
        <button
          onClick={() => {
            if (rab) {
              setView("rab");
            } else if (!isReadOnly) {
              generateRAB();
            }
          }}
          disabled={isReadOnly && !rab}
          className={cn(
            "flex-1 py-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2",
            view === "rab"
              ? "bg-brand-slate text-white shadow-sm"
              : "text-text-secondary hover:bg-gray-50",
            isReadOnly && !rab ? "opacity-40 cursor-not-allowed" : ""
          )}
        >
          <Package className="w-4 h-4" />
          Estimasi RAB
        </button>
        <button
          onClick={() => {
            if (letter) {
              setView("letter");
            } else if (!isReadOnly && rab) {
              generateLetter();
            }
          }}
          disabled={(isReadOnly && !letter) || (!rab && !isReadOnly)}
          className={cn(
            "flex-1 py-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2",
            view === "letter"
              ? "bg-brand-slate text-white shadow-sm"
              : "text-text-secondary hover:bg-gray-50",
            ((isReadOnly && !letter) || (!rab && !isReadOnly)) ? "opacity-40 cursor-not-allowed" : ""
          )}
        >
          <FileText className="w-4 h-4" />
          Surat Penawaran
        </button>
      </div>

      {loading ? (
        <div className="space-y-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-video skeleton rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 w-1/2 skeleton rounded" />
              <div className="h-4 w-full skeleton rounded" />
              <div className="h-4 w-5/6 skeleton rounded" />
              <div className="h-20 w-full skeleton rounded-xl mt-8" />
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
            <Loader2 className="w-8 h-8 text-brand-amber animate-spin" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
              Kecerdasan Buatan Sedang Menyusun Laporan Teknis...
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Context Column */}
          <div className="lg:col-span-2 space-y-8">
            <AnimatePresence mode="wait">
              {view === "diagnosis" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="card-flat overflow-hidden">
                    <img src={diagnosis.photoUrl} alt={diagnosis.item} className="w-full aspect-video object-cover" />
                    <div className="p-8 space-y-8">
                      <div className="space-y-2">
                        <p className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider">Penyebab Kerusakan</p>
                        <h3 className="text-2xl font-bold text-text-primary tracking-tight">{diagnosis.cause}</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-xl space-y-1">
                          <div className="flex items-center gap-2 text-text-tertiary mb-1">
                            <Clock className="w-4 h-4" />
                            <span className="text-[10px] uppercase font-bold tracking-widest">Estimasi Waktu</span>
                          </div>
                          <p className="text-sm font-bold text-text-primary">{diagnosis.estimatedTime}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl space-y-1">
                          <div className="flex items-center gap-2 text-text-tertiary mb-1">
                            <Hammer className="w-4 h-4" />
                            <span className="text-[10px] uppercase font-bold tracking-widest">Rekomendasi</span>
                          </div>
                          <p className="text-sm font-bold text-text-primary">{diagnosis.fixability}</p>
                        </div>
                      </div>

                      <div className="prose prose-slate prose-sm max-w-none prose-p:leading-relaxed prose-strong:font-bold text-text-secondary border-t border-border-subtle pt-6">
                        <ReactMarkdown>{diagnosis.diagnosisText}</ReactMarkdown>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleDownloadDiagnosisPDF}
                      className="flex-1 btn-secondary h-14 text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Download className="w-5 h-5" />
                      Unduh PDF Laporan
                    </button>
                    {(!rab && !isReadOnly) ? (
                      <button onClick={generateRAB} className="flex-[1.5] btn-primary h-14 text-sm font-bold shadow-lg shadow-brand-amber/10 flex items-center justify-center gap-2">
                        Analisis Estimasi Biaya (RAB)
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    ) : rab ? (
                      <button onClick={() => setView("rab")} className="flex-[1.5] btn-primary h-14 text-sm font-bold shadow-lg shadow-brand-amber/10 flex items-center justify-center gap-2">
                        Lihat Estimasi Biaya (RAB)
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    ) : null}
                  </div>
                </motion.div>
              )}

              {view === "rab" && rab && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="bg-white border border-border-subtle rounded-xl shadow-md overflow-hidden relative">
                    {/* Receipt Aesthetics */}
                    <div className="h-1 bg-brand-amber w-full" />
                    <div className="p-8 space-y-8">
                      <div className="flex justify-between items-start border-b border-border-subtle pb-6">
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-text-primary uppercase tracking-tight italic">Estimasi Anggaran</h3>
                          <p className="text-[10px] text-text-tertiary font-bold tracking-widest uppercase">Dokumen #RAB-{diagnosis.id}</p>
                        </div>
                        <div className="text-right">
                          <div className="tag tag-slate">Market Rate - IDR</div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Daftar Material & Komponen</p>
                        <div className="space-y-3">
                          {rab.materials.map((m, i) => (
                            <div key={i} className="flex justify-between items-baseline group">
                              <div className="min-w-0 pr-4">
                                <p className="text-sm font-bold text-text-primary truncate">{m.name}</p>
                                <p className="text-[10px] text-text-tertiary leading-tight">{m.spec}</p>
                              </div>
                              <div className="flex-1 border-b border-dotted border-border-subtle h-0 mb-1" />
                              <p className="text-sm font-bold text-text-primary pl-4 tabular-nums">{formatRupiah(m.minPrice)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4 pt-4">
                        <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Opsi Upah Pengerjaan</p>
                        <div className="grid grid-cols-3 gap-2">
                          <LabourOption active={false} label="DIY / Lokal" price={rab.laborCosts.low} />
                          <LabourOption active={true} label="Standar Pasar" price={rab.laborCosts.mid} />
                          <LabourOption active={false} label="Resmi / Authorized" price={rab.laborCosts.high} />
                        </div>
                      </div>

                      <div className="bg-brand-slate text-white p-6 rounded-xl space-y-4">
                        <div className="flex items-center gap-2">
                          <Zap className="w-5 h-5 text-brand-amber fill-brand-amber" />
                          <h4 className="text-xs font-bold uppercase tracking-wider">Verifikasi AI & Kesimpulan</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Check className="w-5 h-5 text-brand-emerald" />
                            <p className="text-lg font-bold text-white uppercase italic">{rab.verdict}</p>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed font-medium">
                            {rab.verdictReason}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleDownloadRABPDF}
                      className="flex-1 btn-secondary h-14 text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Download className="w-5 h-5" />
                      Unduh PDF RAB
                    </button>
                    {(!letter && !isReadOnly) ? (
                      <button onClick={generateLetter} className="flex-[1.5] btn-primary h-14 text-sm font-bold">
                        Buat Penawaran Formal
                      </button>
                    ) : letter ? (
                      <button onClick={() => setView("letter")} className="flex-[1.5] btn-primary h-14 text-sm font-bold">
                        Lihat Penawaran Formal
                      </button>
                    ) : null}
                    <button 
                      onClick={isReadOnly ? onCancel : handleFinish} 
                      className="btn-secondary h-14 px-8 text-sm font-bold"
                    >
                      {isReadOnly ? "Kembali ke Riwayat" : "Simpan & Selesai"}
                    </button>
                  </div>
                </motion.div>
              )}
              
              {view === "letter" && letter && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="bg-white p-8 md:p-10 rounded-xl shadow-sm border border-border-subtle font-serif text-text-primary leading-relaxed whitespace-pre-wrap text-sm md:text-base selection:bg-brand-amber/20 min-h-[500px]">
                    {letter}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={handleDownloadPDF}
                      className="flex-1 btn-primary h-14 text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Download className="w-5 h-5" />
                      Unduh PDF Resmi
                    </button>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(letter);
                        alert("Disalin ke clipboard!");
                      }} 
                      className="btn-secondary h-14 px-6 text-sm font-bold flex items-center justify-center gap-2"
                    >
                      Salin Teks
                    </button>
                    <button 
                      onClick={isReadOnly ? onCancel : handleFinish} 
                      className="btn-secondary h-14 px-6 text-sm font-bold flex items-center justify-center gap-2"
                    >
                      {isReadOnly ? "Kembali ke Riwayat" : "Tandai Selesai"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Support Column (Metadata & Details) */}
          <div className="space-y-6">
            <div className="card-flat p-6 space-y-6 bg-white">
              <h4 className="text-xs font-bold uppercase tracking-widest text-text-tertiary">Informasi Pendukung</h4>
              
              <div className="space-y-4">
                <MetaItem label="Tipe Kerusakan" value={diagnosis.fixability.split(' (')[0]} />
                <MetaItem label="Status Urgensi" value={diagnosis.urgency} />
                <MetaItem label="Waktu Audit" value={new Date(diagnosis.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} />
              </div>

              <div className="pt-6 border-t border-border-subtle space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group cursor-help transition-colors hover:bg-amber-50">
                  <div className="bg-white p-2 rounded shadow-xs text-brand-amber transition-transform group-hover:scale-110">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] font-bold text-text-secondary leading-tight">Gunakan diagnosa ini sebagai referensi, bukan pengganti verifikasi fisik profesional.</p>
                </div>
              </div>
            </div>

            <div className="card-flat p-6 bg-brand-slate text-white space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Punya Tukang Langganan?</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Cetak atau bagikan diagnosis ini kepada tukang kepercayaan Anda untuk mempercepat estimasi.
              </p>
              <button onClick={() => window.print()} className="w-full bg-white/10 hover:bg-white/20 text-white rounded-lg py-2 px-4 text-[11px] font-bold transition-all border border-white/10 flex items-center justify-center gap-2">
                <ExternalLink className="w-4 h-4" /> Cetak Laporan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Checkmark Animation Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-brand-slate/90 backdrop-blur-md p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl border border-border-subtle"
            >
              {/* Animated SVG Checkmark */}
              <div className="flex justify-center">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: [1, 1.1, 1], opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="absolute inset-0 bg-brand-emerald/10 rounded-full blur-xl"
                  />
                  <svg
                    viewBox="0 0 52 52"
                    className="w-20 h-20 text-brand-emerald relative z-10 filter drop-shadow-[0_0_8px_rgba(16,185,129,0.35)]"
                  >
                    {/* Circle Draw */}
                    <motion.circle
                      cx="26"
                      cy="26"
                      r="23"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.7, ease: "easeInOut" }}
                    />
                    {/* Checkmark Draw */}
                    <motion.path
                      d="M14.1 27.2l7.1 7.2 16.7-16.8"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
                    />
                  </svg>
                </div>
              </div>

              {/* Text / Status Feed */}
              <div className="space-y-2">
                <motion.h3 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                  className="text-lg font-extrabold text-text-primary uppercase tracking-tight"
                >
                  Laporan Berhasil Disimpan!
                </motion.h3>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.0, duration: 0.4 }}
                  className="text-xs text-text-secondary leading-relaxed"
                >
                  Sinkronisasi dengan basis data riwayat rumah tangga aman Anda.
                </motion.p>
              </div>

              {/* Haptic success feedback line */}
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.8, duration: 1.8, ease: "easeInOut" }}
                className="h-1 bg-brand-emerald/20 rounded-full overflow-hidden"
              >
                <div className="h-full bg-brand-emerald animate-pulse w-full" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetaItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">{label}</p>
      <p className="text-sm font-bold text-text-primary">{value}</p>
    </div>
  );
}

function LabourOption({ active, label, price }: { active: boolean, label: string, price: number }) {
  return (
    <div className={cn(
      "p-3 rounded-lg border text-center space-y-1 transition-all",
      active 
        ? "bg-amber-50 border-brand-amber shadow-sm ring-1 ring-brand-amber/20" 
        : "bg-white border-border-subtle"
    )}>
      <p className={cn(
        "text-[10px] font-bold uppercase tracking-tight",
        active ? "text-brand-amber" : "text-text-tertiary"
      )}>{label}</p>
      <p className="text-xs font-bold text-text-primary tabular-nums">{formatRupiah(price)}</p>
    </div>
  );
}
