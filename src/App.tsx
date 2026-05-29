/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { 
  Camera, 
  History, 
  Bell, 
  Wrench, 
  LogOut,
  User as UserIcon,
  ChevronRight,
  Settings,
  LayoutDashboard,
  BookOpen,
  Coins,
  Users,
  Layers,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Zap,
  Calculator
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./lib/utils";
import { 
  RepairDiagnosis, 
  RepairRAB, 
  MaintenanceLog, 
  MaintenanceReminder,
  MockUser
} from "./types";

// Components
import ScannerModule from "./components/ScannerModule";
import HistoryModule from "./components/HistoryModule";
import RemindersModule from "./components/RemindersModule";
import DiagnosisView from "./components/DiagnosisView";
import LandingPage from "./components/LandingPage";
import AuthModule from "./components/AuthModule";
import DiyModule from "./components/DiyModule";
import SavingsModule from "./components/SavingsModule";
import DashboardModule from "./components/DashboardModule";
import EmergencyContactsModule from "./components/EmergencyContactsModule";
import ApplianceInventoryModule from "./components/ApplianceInventoryModule";
import EnergyCalculatorModule from "./components/EnergyCalculatorModule";
import RenovationEstimatorModule from "./components/RenovationEstimatorModule";
import UserProfileModal from "./components/UserProfileModal";

export default function App() {
  const [user, setUser] = useState<MockUser | null>(null);
  const [view, setView] = useState<"landing" | "auth" | "app">("landing");
  const [activeTab, setActiveTab] = useState<"scan" | "history" | "reminders" | "diy" | "savings" | "dashboard" | "contacts" | "appliances" | "energy" | "paint">("dashboard");
  const [history, setHistory] = useState<MaintenanceLog[]>([]);
  const [reminders, setReminders] = useState<MaintenanceReminder[]>([]);
  const [currentDiagnosis, setCurrentDiagnosis] = useState<RepairDiagnosis | null>(null);
  const [selectedHistoricalLog, setSelectedHistoricalLog] = useState<MaintenanceLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleUpdateUser = (updatedUser: MockUser) => {
    setUser(updatedUser);
    localStorage.setItem("tukangku_current_user", JSON.stringify(updatedUser));
  };

  // Auth & Storage Init
  useEffect(() => {
    const savedUser = localStorage.getItem("tukangku_current_user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setView("app");
      
      const userHistory = localStorage.getItem(`tukangku_history_${parsedUser.id}`);
      const userReminders = localStorage.getItem(`tukangku_reminders_${parsedUser.id}`);
      if (userHistory) setHistory(JSON.parse(userHistory));
      if (userReminders) setReminders(JSON.parse(userReminders));
    }
    setLoading(false);
  }, []);

  // Sync data to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(`tukangku_history_${user.id}`, JSON.stringify(history));
      localStorage.setItem(`tukangku_reminders_${user.id}`, JSON.stringify(reminders));
    }
  }, [history, reminders, user]);

  const handleLoginSuccess = (newUser: MockUser) => {
    setUser(newUser);
    localStorage.setItem("tukangku_current_user", JSON.stringify(newUser));
    
    const userHistory = localStorage.getItem(`tukangku_history_${newUser.id}`);
    const userReminders = localStorage.getItem(`tukangku_reminders_${newUser.id}`);
    setHistory(userHistory ? JSON.parse(userHistory) : []);
    setReminders(userReminders ? JSON.parse(userReminders) : []);
    
    setView("app");
  };

  const handleDiagnosisComplete = (diagnosis: RepairDiagnosis) => {
    setCurrentDiagnosis(diagnosis);
  };

  const handleRepairComplete = (log: MaintenanceLog) => {
    if (!user) return;

    const finalLog = {
      ...log,
      id: Math.random().toString(36).substr(2, 9),
      completedAt: Date.now()
    };

    setHistory(prev => [finalLog, ...prev]);
    setCurrentDiagnosis(null);
    setActiveTab("history");
    
    // Auto-generate reminders based on item type
    const item = log.diagnosis.item.toLowerCase();
    let reminderData: Partial<MaintenanceReminder> | null = null;

    if (item.includes("ac")) {
      reminderData = {
        title: "Pembersihan Berkala AC",
        message: "Lakukan pencucian filter dan pengisian freon setiap 4 bulan untuk efisiensi energi.",
        dueDate: Date.now() + 1000 * 60 * 60 * 24 * 120,
        originalLogId: finalLog.id,
        type: "AC"
      };
    } else if (item.includes("laptop") || item.includes("elektronik")) {
      reminderData = {
        title: "Inspeksi Perangkat Internal",
        message: "Cek suhu CPU dan pembersihan fan dalam 6 bulan untuk mencegah overheat.",
        dueDate: Date.now() + 1000 * 60 * 60 * 24 * 180,
        originalLogId: finalLog.id,
        type: "Elektronik"
      };
    } else if (item.includes("atap") || item.includes("tembok") || item.includes("konstruksi")) {
      reminderData = {
        title: "Pemantauan Struktur Tahunan",
        message: "Lakukan pengecekan ketahanan sealant atap/dinding setahun setelah perbaikan.",
        dueDate: Date.now() + 1000 * 60 * 60 * 24 * 365,
        originalLogId: finalLog.id,
        type: "Konstruksi"
      };
    }

    if (reminderData) {
      setReminders(prev => [{
        ...reminderData,
        id: Math.random().toString(36).substr(2, 9),
      } as MaintenanceReminder, ...prev]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("tukangku_current_user");
    setUser(null);
    setHistory([]);
    setReminders([]);
    setView("landing");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg flex flex-col items-center justify-center p-6 gap-6">
        <div className="bg-brand-amber p-4 rounded-2xl shadow-xl shadow-brand-amber/20 animate-pulse">
          <Wrench className="w-10 h-10 text-white" />
        </div>
        <p className="text-text-tertiary font-bold text-[10px] uppercase tracking-widest animate-pulse">Sinkronisasi Keamanan & Data...</p>
      </div>
    );
  }

  if (view === "landing") return <LandingPage onGetStarted={() => setView("auth")} />;
  if (view === "auth") return <AuthModule onBack={() => setView("landing")} onSuccess={handleLoginSuccess} />;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-app-bg text-text-primary">
      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 md:hidden"
            />

            {/* Sidebar Slider Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed top-0 bottom-0 left-0 w-80 bg-brand-slate text-white z-55 md:hidden flex flex-col shadow-2xl overflow-y-auto"
            >
              {/* Header inside drawer */}
              <div className="p-6 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="bg-brand-amber p-1.5 rounded-lg">
                    <Wrench className="w-4 h-4 text-white" />
                  </div>
                  <h1 className="text-base font-bold tracking-tight uppercase">TUKANGKU</h1>
                </div>
                <button 
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation lists */}
              <div className="flex-1 p-6 space-y-2">
                <DesktopNavButton 
                  active={activeTab === "dashboard"} 
                  onClick={() => { setActiveTab("dashboard"); setIsMobileOpen(false); setCurrentDiagnosis(null); setSelectedHistoricalLog(null); }}
                  icon={<LayoutDashboard className="w-4 h-4" />}
                  label="Dashboard Analisis"
                  collapsed={false}
                />
                <DesktopNavButton 
                  active={activeTab === "scan"} 
                  onClick={() => { setActiveTab("scan"); setIsMobileOpen(false); setCurrentDiagnosis(null); setSelectedHistoricalLog(null); }}
                  icon={<Camera className="w-4 h-4" />}
                  label="Diagnosis Visual Baru"
                  collapsed={false}
                />
                <DesktopNavButton 
                  active={activeTab === "history"} 
                  onClick={() => { setActiveTab("history"); setIsMobileOpen(false); setCurrentDiagnosis(null); setSelectedHistoricalLog(null); }}
                  icon={<History className="w-4 h-4" />}
                  label="Log Riwayat Perbaikan"
                  collapsed={false}
                />
                <DesktopNavButton 
                  active={activeTab === "reminders"} 
                  onClick={() => { setActiveTab("reminders"); setIsMobileOpen(false); setCurrentDiagnosis(null); setSelectedHistoricalLog(null); }}
                  icon={<Bell className="w-4 h-4" />}
                  label="Jadwal Maintenance"
                  collapsed={false}
                />
                <DesktopNavButton 
                  active={activeTab === "diy"} 
                  onClick={() => { setActiveTab("diy"); setIsMobileOpen(false); setCurrentDiagnosis(null); setSelectedHistoricalLog(null); }}
                  icon={<BookOpen className="w-4 h-4" />}
                  label="Panduan Mitigasi DIY"
                  collapsed={false}
                />
                <DesktopNavButton 
                  active={activeTab === "savings"} 
                  onClick={() => { setActiveTab("savings"); setIsMobileOpen(false); setCurrentDiagnosis(null); setSelectedHistoricalLog(null); }}
                  icon={<Coins className="w-4 h-4" />}
                  label="Simulasi Tabungan"
                  collapsed={false}
                />
                <DesktopNavButton 
                  active={activeTab === "energy"} 
                  onClick={() => { setActiveTab("energy"); setIsMobileOpen(false); setCurrentDiagnosis(null); setSelectedHistoricalLog(null); }}
                  icon={<Zap className="w-4 h-4" />}
                  label="Kalkulator Listrik"
                  collapsed={false}
                />
                <DesktopNavButton 
                  active={activeTab === "paint"} 
                  onClick={() => { setActiveTab("paint"); setIsMobileOpen(false); setCurrentDiagnosis(null); setSelectedHistoricalLog(null); }}
                  icon={<Calculator className="w-4 h-4" />}
                  label="Estimator Cat & RAB"
                  collapsed={false}
                />
                <DesktopNavButton 
                  active={activeTab === "contacts"} 
                  onClick={() => { setActiveTab("contacts"); setIsMobileOpen(false); setCurrentDiagnosis(null); setSelectedHistoricalLog(null); }}
                  icon={<Users className="w-4 h-4" />}
                  label="Kontak Gawat Darurat"
                  collapsed={false}
                />
                <DesktopNavButton 
                  active={activeTab === "appliances"} 
                  onClick={() => { setActiveTab("appliances"); setIsMobileOpen(false); setCurrentDiagnosis(null); setSelectedHistoricalLog(null); }}
                  icon={<Layers className="w-4 h-4" />}
                  label="Inventaris & Garansi"
                  collapsed={false}
                />
              </div>

              {/* Profile area inside drawer */}
              <div className="p-6 border-t border-white/5 space-y-6">
                <div 
                  onClick={() => { setIsProfileOpen(true); setIsMobileOpen(false); }}
                  className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 -m-2 rounded-xl transition-all"
                  title="Buka Detail Profil & Rumah"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-amber to-amber-700 flex items-center justify-center border border-white/10 shadow-inner flex-shrink-0">
                    {user?.avatarEmoji ? (
                      <span className="text-xl select-none">{user.avatarEmoji}</span>
                    ) : (
                      <UserIcon className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{user?.name || "Member"}</p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Akun Personal</p>
                  </div>
                </div>
                <div>
                  <button 
                    onClick={() => { handleLogout(); setIsMobileOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-red-400 hover:bg-red-400/10 rounded-xl transition-all border border-white/5"
                  >
                    <LogOut className="w-4 h-4" /> Keluar Sesi
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside 
        animate={{ width: isSidebarCollapsed ? 80 : 288 }}
        transition={{ type: "spring", stiffness: 220, damping: 26 }}
        className="hidden md:flex flex-col bg-brand-slate text-white h-screen sticky top-0 shadow-2xl z-50 flex-shrink-0 overflow-hidden border-r border-white/5"
      >
        <div className={cn("p-6 flex flex-col h-full select-none justify-between min-h-0", isSidebarCollapsed ? "px-4" : "p-6")}>
          <div className="flex flex-col flex-1 min-h-0 space-y-6">
            {/* Header logo & fold switch with modern custom animated hamburger */}
            <div className={cn("flex items-center justify-between gap-3 flex-shrink-0", isSidebarCollapsed ? "flex-col items-center gap-4 animate-none" : "")}>
              <div className="flex items-center gap-3">
                <div className="bg-brand-amber p-2.5 rounded-xl flex-shrink-0 shadow-md shadow-brand-amber/15">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
                {!isSidebarCollapsed && (
                  <motion.h1 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-base font-extrabold tracking-tight uppercase bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent"
                  >
                    TUKANGKU
                  </motion.h1>
                )}
              </div>
              
              <button
                onClick={() => setIsSidebarCollapsed(prev => !prev)}
                className="p-2.5 rounded-xl bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-all border border-white/5 active:scale-95 flex items-center justify-center flex-shrink-0"
                title={isSidebarCollapsed ? "Perluas Menu" : "Kecilkan Menu"}
              >
                <div className="relative w-4 h-4 flex flex-col justify-center items-center gap-1.5">
                  {/* Beautiful customized spring-morphed hamburger lines */}
                  <motion.span 
                    animate={{ 
                      rotate: isSidebarCollapsed ? 0 : 45, 
                      y: isSidebarCollapsed ? 0 : 6,
                      width: isSidebarCollapsed ? 16 : 16
                    }}
                    transition={{ type: "spring", stiffness: 280, damping: 18 }}
                    className="h-0.5 bg-current rounded-full" 
                    style={{ width: 16 }}
                  />
                  <motion.span 
                    animate={{ 
                      opacity: isSidebarCollapsed ? 1 : 0, 
                      scale: isSidebarCollapsed ? 1 : 0
                    }}
                    transition={{ duration: 0.15 }}
                    className="h-0.5 bg-current rounded-full" 
                    style={{ width: 16 }}
                  />
                  <motion.span 
                    animate={{ 
                      rotate: isSidebarCollapsed ? 0 : -45, 
                      y: isSidebarCollapsed ? 0 : -6,
                      width: isSidebarCollapsed ? 16 : 16
                    }}
                    transition={{ type: "spring", stiffness: 280, damping: 18 }}
                    className="h-0.5 bg-current rounded-full" 
                    style={{ width: 16 }}
                  />
                </div>
              </button>
            </div>
            
            {/* Nav links - scrollable and sleek */}
            <nav className="space-y-1.5 font-medium flex-1 overflow-y-auto scrollbar-none pb-4 pr-0.5">
              <DesktopNavButton 
                active={activeTab === "dashboard"} 
                onClick={() => { setActiveTab("dashboard"); setCurrentDiagnosis(null); setSelectedHistoricalLog(null); }}
                icon={<LayoutDashboard className="w-4 h-4" />}
                label="Dashboard Analisis"
                collapsed={isSidebarCollapsed}
              />
              <DesktopNavButton 
                active={activeTab === "scan"} 
                onClick={() => { setActiveTab("scan"); setCurrentDiagnosis(null); setSelectedHistoricalLog(null); }}
                icon={<Camera className="w-4 h-4" />}
                label="Diagnosis Visual Baru"
                collapsed={isSidebarCollapsed}
              />
              <DesktopNavButton 
                active={activeTab === "history"} 
                onClick={() => { setActiveTab("history"); setCurrentDiagnosis(null); setSelectedHistoricalLog(null); }}
                icon={<History className="w-4 h-4" />}
                label="Log Riwayat Perbaikan"
                collapsed={isSidebarCollapsed}
              />
              <DesktopNavButton 
                active={activeTab === "reminders"} 
                onClick={() => { setActiveTab("reminders"); setCurrentDiagnosis(null); setSelectedHistoricalLog(null); }}
                icon={<Bell className="w-4 h-4" />}
                label="Jadwal Maintenance"
                collapsed={isSidebarCollapsed}
              />
              <DesktopNavButton 
                active={activeTab === "diy"} 
                onClick={() => { setActiveTab("diy"); setCurrentDiagnosis(null); setSelectedHistoricalLog(null); }}
                icon={<BookOpen className="w-4 h-4" />}
                label="Panduan Mitigasi DIY"
                collapsed={isSidebarCollapsed}
              />
              <DesktopNavButton 
                active={activeTab === "savings"} 
                onClick={() => { setActiveTab("savings"); setCurrentDiagnosis(null); setSelectedHistoricalLog(null); }}
                icon={<Coins className="w-4 h-4" />}
                label="Simulasi Tabungan"
                collapsed={isSidebarCollapsed}
              />
              <DesktopNavButton 
                active={activeTab === "energy"} 
                onClick={() => { setActiveTab("energy"); setCurrentDiagnosis(null); setSelectedHistoricalLog(null); }}
                icon={<Zap className="w-4 h-4" />}
                label="Kalkulator Listrik"
                collapsed={isSidebarCollapsed}
              />
              <DesktopNavButton 
                active={activeTab === "paint"} 
                onClick={() => { setActiveTab("paint"); setCurrentDiagnosis(null); setSelectedHistoricalLog(null); }}
                icon={<Calculator className="w-4 h-4" />}
                label="Estimator Cat & RAB"
                collapsed={isSidebarCollapsed}
              />
              <DesktopNavButton 
                active={activeTab === "contacts"} 
                onClick={() => { setActiveTab("contacts"); setCurrentDiagnosis(null); setSelectedHistoricalLog(null); }}
                icon={<Users className="w-4 h-4" />}
                label="Kontak Gawat Darurat"
                collapsed={isSidebarCollapsed}
              />
              <DesktopNavButton 
                active={activeTab === "appliances"} 
                onClick={() => { setActiveTab("appliances"); setCurrentDiagnosis(null); setSelectedHistoricalLog(null); }}
                icon={<Layers className="w-4 h-4" />}
                label="Inventaris & Garansi"
                collapsed={isSidebarCollapsed}
              />
            </nav>
          </div>
          
          {/* User profile & actions footer */}
          <div className="border-t border-white/5 pt-6 space-y-6 flex-shrink-0">
            <div 
              onClick={() => setIsProfileOpen(true)}
              className={cn(
                "flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 -m-2 rounded-xl transition-all", 
                isSidebarCollapsed ? "justify-center" : ""
              )}
              title="Buka Detail Profil & Rumah"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-amber to-amber-700 flex items-center justify-center border border-white/10 shadow-inner flex-shrink-0">
                {user?.avatarEmoji ? (
                  <span className="text-xl select-none">{user.avatarEmoji}</span>
                ) : (
                  <UserIcon className="w-5 h-5 text-white" />
                )}
              </div>
              {!isSidebarCollapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{user?.name || "Member"}</p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Akun Personal</p>
                </div>
              )}
            </div>
            
            <div className="w-full">
              <button 
                onClick={handleLogout}
                className={cn(
                  "flex items-center justify-center gap-2 w-full px-3 py-2.5 text-xs font-bold text-red-400 hover:bg-red-400/10 rounded-xl transition-all border border-transparent",
                  isSidebarCollapsed ? "justify-center px-1" : ""
                )}
                title="Keluar Sesi"
              >
                <LogOut className="w-4 h-4" /> 
                {!isSidebarCollapsed && "Keluar Sesi"}
              </button>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Top Header */}
      <header className="md:hidden bg-white border-b border-border-subtle px-5 py-4 flex items-center justify-between sticky top-0 z-40 bg-white/95 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="p-2 -ml-1 rounded-lg bg-gray-50 border border-border-subtle text-text-primary hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5 text-brand-slate" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-brand-amber p-1.5 rounded-lg">
              <Wrench className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-extrabold tracking-tight text-brand-slate uppercase">TUKANGKU</span>
          </div>
        </div>
        
        <div 
          onClick={() => setIsProfileOpen(true)}
          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 -m-1.5 rounded-xl transition-all"
          title="Buka Detail Profil & Rumah"
        >
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-extrabold text-text-primary uppercase line-clamp-1 max-w-[80px]">{user?.name || "User"}</span>
            <span className="text-[8px] text-text-tertiary uppercase tracking-widest font-bold">Akun Aktif</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-amber to-amber-700 flex items-center justify-center text-white border border-brand-amber/20 shadow-sm flex-shrink-0">
            {user?.avatarEmoji ? (
              <span className="text-sm select-none">{user.avatarEmoji}</span>
            ) : (
              <UserIcon className="w-3.5 h-3.5" />
            )}
          </div>
        </div>
      </header>

      {/* Mobile Horizontal Sliding Tabs */}
      <div className="md:hidden bg-white border-b border-border-subtle overflow-x-auto flex gap-6 px-6 py-3 whitespace-nowrap scrollbar-none sticky top-[72px] z-30 bg-white/95 backdrop-blur-md">
        {(["dashboard", "scan", "history", "reminders", "diy", "savings", "energy", "paint", "contacts", "appliances"] as const).map((tab) => {
          const labels: Record<string, string> = {
            dashboard: "Dashboard",
            scan: "Diagnosis",
            history: "Riwayat",
            reminders: "Pengingat",
            diy: "Tips DIY",
            savings: "Tabungan",
            energy: "Kalkulator Listrik",
            paint: "Estimator Cat",
            contacts: "Kontak Darurat",
            appliances: "Aset & Garansi"
          };
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setCurrentDiagnosis(null); setSelectedHistoricalLog(null); }}
              className={cn(
                "text-xs font-extrabold uppercase tracking-wider relative pb-1 transition-all duration-300",
                isActive ? "text-brand-amber font-black" : "text-text-tertiary hover:text-text-secondary"
              )}
            >
              {labels[tab]}
              {isActive && (
                <motion.div 
                  layoutId="mobile-nav-line"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-amber rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Container */}
      <main className="flex-1 overflow-x-hidden pb-32 md:pb-8">
        <div className="p-6 md:p-12 max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {selectedHistoricalLog ? (
              <motion.div
                key={`historical-log-${selectedHistoricalLog.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <DiagnosisView 
                  diagnosis={selectedHistoricalLog.diagnosis} 
                  initialRab={selectedHistoricalLog.rab}
                  initialLetter={selectedHistoricalLog.letter}
                  isReadOnly={true}
                  onCancel={() => setSelectedHistoricalLog(null)}
                />
              </motion.div>
            ) : currentDiagnosis ? (
              <motion.div
                key={`diagnosis-${currentDiagnosis.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <DiagnosisView 
                  diagnosis={currentDiagnosis} 
                  onCancel={() => setCurrentDiagnosis(null)}
                  onComplete={handleRepairComplete}
                />
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "dashboard" && (
                  <DashboardModule 
                    history={history} 
                    onSelectLog={(log) => setSelectedHistoricalLog(log)} 
                    onNavigateTab={(tab) => { setActiveTab(tab); setCurrentDiagnosis(null); setSelectedHistoricalLog(null); }}
                  />
                )}
                {activeTab === "scan" && <ScannerModule onDiagnose={handleDiagnosisComplete} />}
                {activeTab === "history" && (
                  <HistoryModule 
                    history={history} 
                    onSelectLog={(log) => setSelectedHistoricalLog(log)} 
                  />
                )}
                {activeTab === "reminders" && <RemindersModule reminders={reminders} />}
                {activeTab === "diy" && <DiyModule />}
                {activeTab === "savings" && <SavingsModule />}
                {activeTab === "energy" && <EnergyCalculatorModule userId={user?.id} />}
                {activeTab === "paint" && <RenovationEstimatorModule />}
                {activeTab === "contacts" && <EmergencyContactsModule />}
                {activeTab === "appliances" && <ApplianceInventoryModule userId={user?.id} />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-xl border-t border-border-subtle flex justify-around items-center px-4 z-50">
        <NavButton 
          active={activeTab === "history"} 
          onClick={() => { setActiveTab("history"); setCurrentDiagnosis(null); setSelectedHistoricalLog(null); }}
          icon={<History className="w-5 h-5" />}
          label="Riwayat"
        />
        
        {/* Shutter Button Container */}
        <div className="relative h-full w-16">
          <button 
            onClick={() => { setActiveTab("scan"); setCurrentDiagnosis(null); setSelectedHistoricalLog(null); }}
            className={cn(
              "absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 active:scale-90",
              activeTab === "scan" 
                ? "bg-brand-amber text-white shadow-brand-amber/30 scale-110" 
                : "bg-brand-slate text-white shadow-slate-900/20"
            )}
          >
            <Camera className="w-6 h-6" />
          </button>
        </div>

        <NavButton 
          active={activeTab === "reminders"} 
          onClick={() => { setActiveTab("reminders"); setCurrentDiagnosis(null); setSelectedHistoricalLog(null); }}
          icon={<Bell className="w-5 h-5" />}
          label="Pengingat"
        />
      </nav>

      {/* Rincian Profil & Rumah Detil Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onUpdateUser={handleUpdateUser}
        historyCount={history.length}
        remindersCount={reminders.length}
        appliancesCount={(() => {
          if (!user) return 0;
          const saved = localStorage.getItem(`tukangku_appliances_${user.id}`);
          if (saved) {
            try { return JSON.parse(saved).length; } catch (e) { return 3; }
          }
          return 3;
        })()}
      />
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all duration-300",
        active ? "text-brand-amber" : "text-text-tertiary"
      )}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      {active && (
        <motion.div 
          layoutId="nav-dot"
          className="w-1 h-1 bg-brand-amber rounded-full mt-1"
        />
      )}
    </button>
  );
}

function DesktopNavButton({ 
  active, 
  onClick, 
  icon, 
  label, 
  collapsed 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string; 
  collapsed: boolean 
}) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "relative group w-full flex items-center rounded-xl text-sm transition-all duration-300",
        collapsed ? "justify-center p-3" : "px-4 py-3 gap-3",
        active 
          ? "bg-white/10 text-white shadow-sm ring-1 ring-white/10" 
          : "text-slate-400 hover:text-white hover:bg-white/5"
      )}
    >
      <span className={cn("transition-colors duration-200", active ? "text-brand-amber" : "text-slate-500 group-hover:text-white")}>
        {icon}
      </span>
      
      {!collapsed && (
        <motion.span 
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          className="tracking-tight font-medium"
        >
          {label}
        </motion.span>
      )}
      
      {!collapsed && active && (
        <ChevronRight className="w-4 h-4 ml-auto text-brand-amber" />
      )}

      {/* Hover tooltip for collapsed state */}
      {collapsed && (
        <div className="absolute left-[70px] top-1/2 -translate-y-1/2 bg-slate-900 border border-slate-800 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-x-2 group-hover:translate-x-0 whitespace-nowrap z-50 shadow-xl">
          {label}
        </div>
      )}
    </button>
  );
}
