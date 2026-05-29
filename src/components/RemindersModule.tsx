import { MaintenanceReminder } from "../types";
import { Bell, Info, CheckCircle2, CloudLightning, Home, Droplets, Calendar, Clock } from "lucide-react";
import { cn } from "../lib/utils";
import { motion } from "motion/react";

interface RemindersModuleProps {
  reminders: MaintenanceReminder[];
}

export default function RemindersModule({ reminders }: RemindersModuleProps) {
  if (reminders.length === 0) {
    const suggestions = [
      { id: '1', title: "Pemeliharaan AC Ruangan", type: "AC", msg: "Lakukan cuci AC setiap 3-4 bulan untuk menjaga efisiensi listrik." },
      { id: '2', title: "Inspeksi Sealant Atap", type: "Konstruksi", msg: "Cek kondisi sealant dan paku atap sebelum memasuki musim hujan." },
      { id: '3', title: "Deep Clean Laptop/PC", type: "Elektronik", msg: "Pembersihan debu internal untuk mencegah overheat dan kerusakan fan." }
    ];

    return (
      <div className="max-w-xl mx-auto space-y-8 py-4">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-text-primary tracking-tight">AI Maintenance</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            Sistem pengingat cerdas berdasarkan riwayat perbaikan Anda untuk meminimalisir kerusakan fatal di masa depan.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest px-1">Rekomendasi Strategis</p>
          {suggestions.map((s) => (
            <div key={s.id} className="card-flat p-5 flex gap-4 bg-gray-50/50 grayscale opacity-70">
              <div className="bg-white p-3 rounded-xl shadow-sm border border-border-subtle h-fit">
                {s.type === 'AC' && <Droplets className="w-5 h-5 text-blue-500" />}
                {s.type === 'Konstruksi' && <Home className="w-5 h-5 text-brand-amber" />}
                {s.type === 'Elektronik' && <CloudLightning className="w-5 h-5 text-purple-500" />}
              </div>
              <div className="space-y-1">
                <p className="font-bold text-text-primary text-sm tracking-tight">{s.title}</p>
                <p className="text-xs text-text-secondary leading-relaxed">{s.msg}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-text-primary tracking-tight">Jadwal Pemeliharaan</h2>
        <p className="text-text-secondary text-sm leading-relaxed">Aksi preventif yang direkomendasikan untuk aset Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reminders.map((r, index) => {
          const isOverdue = new Date(r.dueDate) < new Date();
          return (
            <motion.div 
              key={r.id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card-flat p-6 flex flex-col justify-between bg-white hover:border-brand-amber/30 transition-all group"
            >
              <div className="flex gap-4">
                <div className="bg-amber-50 p-3 rounded-xl h-fit border border-amber-100">
                  <Bell className="w-5 h-5 text-brand-amber" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-bold text-text-primary text-sm leading-tight tracking-tight">{r.title}</h3>
                    <div className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded md flex-shrink-0",
                      isOverdue ? "bg-red-50 text-brand-red border border-red-100" : "bg-gray-50 text-text-secondary border border-border-subtle"
                    )}>
                      <Calendar className="w-3 h-3" />
                      <span className="text-[10px] font-bold tracking-tight uppercase tabular-nums">
                        {new Date(r.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary mt-2 leading-relaxed line-clamp-2">{r.message}</p>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-dashed border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-text-tertiary font-bold tracking-widest uppercase">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Log #{r.originalLogId.slice(0, 5)}</span>
                </div>
                <button className="flex items-center gap-2 text-[11px] font-bold text-brand-emerald hover:text-emerald-700 transition-colors uppercase tracking-wider group-hover:scale-105">
                  <CheckCircle2 className="w-4 h-4" />
                  Tandai Selesai
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
