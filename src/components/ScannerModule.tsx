import { useState, useRef, useEffect } from "react";
import { 
  Camera, 
  Loader2, 
  Image as ImageIcon, 
  Home, 
  Zap, 
  Video, 
  VideoOff, 
  RefreshCw, 
  X, 
  Sparkles, 
  AlertCircle 
} from "lucide-react";
import { RepairDiagnosis } from "../types";
import { cn } from "../lib/utils";

interface ScannerModuleProps {
  onDiagnose: (diagnosis: RepairDiagnosis) => void;
}

export default function ScannerModule({ onDiagnose }: ScannerModuleProps) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [cameraError, setCameraError] = useState("");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera stream safely
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setCameraError("");
  };

  // Switch between back/front cameras
  const enumerateCameras = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        return;
      }
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === "videoinput");
      setCameraDevices(videoDevices);
      
      // Select back camera or first device by default
      if (videoDevices.length > 0 && !selectedDeviceId) {
        const backCam = videoDevices.find(d => d.label.toLowerCase().includes("back") || d.label.toLowerCase().includes("rear"));
        setSelectedDeviceId(backCam ? backCam.deviceId : videoDevices[0].deviceId);
      }
    } catch (e) {
      console.warn("Failed to list camera devices:", e);
    }
  };

  // Start video feeding from device
  const startCamera = async (deviceIdToUse?: string) => {
    stopCamera();
    setCameraError("");
    const targetDeviceId = deviceIdToUse || selectedDeviceId;

    try {
      const constraints: MediaStreamConstraints = {
        video: targetDeviceId 
          ? { deviceId: { exact: targetDeviceId } } 
          : { facingMode: { ideal: "environment" } },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setHasPermission(true);
      
      // Refresh available cameras in the selector
      await enumerateCameras();
    } catch (err: any) {
      console.error("Camera access failed:", err);
      setHasPermission(false);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("Izin kamera ditolak. Silakan berikan izin di browser Anda.");
      } else {
        setCameraError("Gagal membuka kamera. Pastikan kamera tidak dipakai aplikasi lain.");
      }
    }
  };

  // Switch to selected device and refresh stream
  const handleDeviceChange = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    if (cameraActive) {
      startCamera(deviceId);
    }
  };

  // Trigger snapshot extraction
  const capturePhoto = () => {
    if (videoRef.current) {
      try {
        const video = videoRef.current;
        const canvas = document.createElement("canvas");
        
        // Match natural resolution of camera track
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        
        const context = canvas.getContext("2d");
        if (context) {
          // Draw frame with possible horizontal flipping if front-facing and requested (kept standard here)
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const base64Image = canvas.toDataURL("image/jpeg", 0.9);
          
          stopCamera();
          setPreview(base64Image);
          diagnoseImage(base64Image);
        }
      } catch (e) {
        console.error("Failed to capture picture from video stream:", e);
        setCameraError("Gagal merekam gambar semenit yang lalu. Coba unggah manual.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        diagnoseImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const diagnoseImage = async (base64Image: string) => {
    setLoading(true);
    try {
      const prompt = `Analyze this image of damage. Output a JSON object with the following fields:
      - item: Name of the item or area (e.g. "Atap Bocor", "Laptop Rusak")
      - cause: Root cause of damage
      - severity: Number 1-5
      - urgency: One of ["Bisa Tunggu", "Perbaiki Minggu Ini", "Darurat"]
      - fixability: One of ["Bisa Sendiri (DIY)", "Panggil Tukang", "Ganti Baru"]
      - estimatedTime: Estimated repair time (e.g. "30 menit", "2 hari")
      - diagnosisText: A detailed explanation of what is wrong and what needs to be done.
      
      Output ONLY valid JSON. Use Indonesian language for all text fields.`;

      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image, prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = data?.error || "Gagal menghubungi server diagnosis.";
        alert(`Diagnosis Gagal: ${message}`);
        return;
      }
      
      let result;
      try {
        const analysisText = data?.analysis || "";
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        result = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      } catch (e) {
        console.error("JSON parse error:", e);
      }

      if (result) {
        onDiagnose({
          ...result,
          id: Math.random().toString(36).substr(2, 9),
          photoUrl: base64Image,
          timestamp: Date.now(),
        });
      } else {
        alert("Gagal memproses hasil analisis gambar. Silakan ulangi dengan foto yang lebih jelas.");
      }
    } catch (error) {
      console.error("Diagnosis error:", error);
      alert("Terjadi masalah jaringan.");
    } finally {
      setLoading(false);
      setPreview(null);
    }
  };

  // Cleanup camera streams on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="max-w-xl mx-auto space-y-7 py-4">
      {/* Title block */}
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-text-primary tracking-tight">Diagnosis Visual Pintar</h2>
          <p className="text-text-secondary text-xs leading-relaxed">
            Identifikasi pola kerusakan dengan mengunggah foto maupun membuka kamera streaming langsung dari handphone atau laptop Anda.
          </p>
        </div>
        <div className="bg-amber-50 text-brand-amber font-mono font-black text-[9px] uppercase px-2.5 py-1 rounded-full border border-amber-100 flex items-center gap-1">
          <Sparkles className="w-3 h-3 fill-brand-amber animate-spin" /> LIVE SENSOR
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="aspect-video w-full rounded-2xl bg-slate-100/80 animate-pulse flex items-center justify-center border border-gray-200">
            <span className="text-sm font-bold text-slate-400">Menyalin Matriks Foto...</span>
          </div>
          <div className="space-y-3">
            <div className="h-6 w-1/3 bg-slate-100 animate-pulse rounded" />
            <div className="h-4 w-full bg-slate-100 animate-pulse rounded" />
            <div className="h-4 w-5/6 bg-slate-100 animate-pulse rounded" />
          </div>
          <div className="flex flex-col items-center gap-3 pt-4">
            <Loader2 className="w-8 h-8 text-brand-amber animate-spin" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
              Kecerdasan Buatan Sedang Menganalisis...
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Main Visual Frame & Controller */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {cameraActive ? (
              /* Live Camera Interface Pane */
              <div className="relative aspect-video bg-black flex flex-col justify-between overflow-hidden group">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* Visual Target Reticle on overlay */}
                <div className="absolute inset-0 border-2 border-white/20 m-6 rounded-xl flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 border-t-2 border-l-2 border-brand-amber absolute top-0 left-0" />
                  <div className="w-12 h-12 border-t-2 border-r-2 border-brand-amber absolute top-0 right-0" />
                  <div className="w-12 h-12 border-b-2 border-l-2 border-brand-amber absolute bottom-0 left-0" />
                  <div className="w-12 h-12 border-b-2 border-r-2 border-brand-amber absolute bottom-0 right-0" />
                  <span className="text-[9px] font-bold font-mono tracking-widest text-white/50 bg-black/40 px-2 py-0.5 rounded-full uppercase">PASKAN PADA AREA RUSAK</span>
                </div>

                {/* Top Control Overlay bar */}
                <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 to-transparent p-4 flex justify-between items-center z-10">
                  {cameraDevices.length > 1 ? (
                    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10">
                      <RefreshCw className="w-3.5 h-3.5 text-slate-300" />
                      <select 
                        value={selectedDeviceId}
                        onChange={(e) => handleDeviceChange(e.target.value)}
                        className="bg-transparent text-[10px] text-white font-bold tracking-wide outline-none border-none pr-4 cursor-pointer"
                      >
                        {cameraDevices.map((device, idx) => (
                          <option key={device.deviceId} value={device.deviceId} className="bg-brand-slate text-white text-xs">
                            {device.label || `Lensa ${idx + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold bg-black/40 px-2 py-1 rounded">Kamera Aktif</span>
                  )}
                  
                  <button 
                    onClick={stopCamera}
                    className="p-1.5 rounded-lg bg-black/60 backdrop-blur-md hover:bg-black/95 text-slate-200 hover:text-white transition-colors border border-white/10"
                    title="Matikan Kamera"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Capture snapshot action bar button */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-5 flex justify-center z-10">
                  <button
                    onClick={capturePhoto}
                    className="h-14 px-8 rounded-full bg-brand-amber hover:bg-amber-500 text-brand-slate shadow-lg shadow-brand-amber/30 hover:scale-105 active:scale-95 transition-all text-xs font-black uppercase tracking-wider flex items-center gap-2.5"
                  >
                    <div className="w-4 h-4 rounded-full bg-white animate-ping" />
                    <span>Ambil Foto Baru (Jepret)</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Standard File Upload drop area preview & Mode Options */
              <div className="p-5 space-y-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative aspect-video w-full rounded-2xl border-2 border-dashed border-gray-200 bg-slate-50 hover:border-brand-amber hover:bg-amber-50/5 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer overflow-hidden"
                >
                  {preview ? (
                    <img src={preview} alt="Pratinjau" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-brand-amber to-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-amber/20 group-hover:scale-105 transition-transform duration-200">
                        <ImageIcon className="w-7 h-7" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-black text-brand-slate">Unggah Gambar Kerusakan Rumah</p>
                        <p className="text-text-tertiary text-[10px] font-bold mt-1">Tekan untuk pilih file dari perangkat Anda</p>
                      </div>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>

                {/* Quick Dual Actions Trigger Selector */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => startCamera()}
                    className="btn-primary h-11 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Video className="w-4 h-4" />
                    Buka Kamera Live
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-secondary h-11 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 bg-white"
                  >
                    <ImageIcon className="w-4 h-4 text-brand-amber" />
                    Pilih File Foto
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Camera Error alert box */}
          {cameraError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold leading-relaxed flex gap-2.5 items-center">
              <AlertCircle className="w-4.5 h-4.5 text-red-600 flex-shrink-0" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Core Categories list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <CategoryInfo 
              icon={<ImageIcon className="w-4 h-4 text-brand-amber animate-pulse" />}
              label="Elektronik & Gadget"
              example="Laptop, AC bocor, Mesin Cuci error, TV"
            />
            <CategoryInfo 
              icon={<Home className="w-4 h-4 text-brand-amber" />}
              label="Struktur & Konstruksi"
              example="Baja ringan, Atap, Tembok retak rambut, Keramik terangkat"
            />
          </div>
          
          {/* Advice/Tips information bubble card */}
          <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex items-start gap-4">
            <div className="bg-white p-2.5 rounded-lg border border-gray-100 flex-shrink-0 shadow-inner">
              <Zap className="w-4 h-4 text-brand-amber fill-brand-amber animate-bounce" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-brand-slate mb-1">Panduan Pengukuran Akurat</p>
              <p className="text-[11px] text-text-secondary leading-normal font-medium">
                Posisikan obyek kerusakan tepat di tengah kotak reticle penunjuk. Gunakan cahaya terang di ruangan atau flash flash light HP agar tekstur retak terlihat jelas oleh AI.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function CategoryInfo({ icon, label, example }: { icon: React.ReactNode, label: string, example: string }) {
  return (
    <div className="card-flat p-4 flex items-start gap-3 bg-white border border-gray-100 rounded-xl shadow-inner-sm">
      <div className="bg-amber-500/5 p-2 rounded-xl flex-shrink-0 border border-amber-500/10">
        {icon}
      </div>
      <div>
        <p className="text-xs font-black text-brand-slate">{label}</p>
        <p className="text-[10px] text-text-tertiary mt-0.5 leading-snug font-medium">{example}</p>
      </div>
    </div>
  );
}

