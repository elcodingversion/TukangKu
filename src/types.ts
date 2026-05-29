export interface MockUser {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  createdAt: number;
  phone?: string;
  address?: string;
  electricityPower?: string;
  isPremium?: boolean;
  avatarEmoji?: string;
}

export type Severity = 1 | 2 | 3 | 4 | 5;
export type Urgency = "Bisa Tunggu" | "Perbaiki Minggu Ini" | "Darurat";
export type Fixability = "Bisa Sendiri (DIY)" | "Panggil Tukang" | "Ganti Baru";

export interface RepairDiagnosis {
  id: string;
  item: string;
  cause: string;
  severity: Severity;
  urgency: Urgency;
  fixability: Fixability;
  estimatedTime: string;
  diagnosisText: string;
  photoUrl: string;
  timestamp: number;
}

export interface MaterialCost {
  name: string;
  spec: string;
  minPrice: number;
  maxPrice: number;
}

export interface RepairRAB {
  materials: MaterialCost[];
  laborCosts: {
    low: number;
    mid: number;
    high: number;
  };
  verdict: string;
  verdictReason: string;
  totalEstimateMin: number;
  totalEstimateMax: number;
}

export interface MaintenanceLog {
  id: string;
  diagnosis: RepairDiagnosis;
  rab?: RepairRAB;
  letter?: string;
  completedAt: number;
  totalCost: number;
  notes?: string;
}

export interface MaintenanceReminder {
  id: string;
  title: string;
  message: string;
  dueDate: number;
  originalLogId: string;
  type: "AC" | "Cat" | "Elektronik" | "Konstruksi" | "Lainnya";
}
