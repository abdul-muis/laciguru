export type ToolType =
  | 'modul_ajar'
  | 'prota_prosem'
  | 'materi_slide'
  | 'soal_rubrik'
  | 'lkpd'
  | 'kursus_bootcamp'
  | 'chat_ai'
  | 'laci_saya';

export type PlanTier = 'hemat' | 'master' | 'lembaga';

export interface VerifiedLicense {
  code: string;
  ownerName: string;
  planTier: PlanTier;
  planName: string;
  maxDevices: number;
  activeDevicesCount: number;
  dailyQuota: number;
  usedToday: number;
  expiryDate: string;
}

export interface LicenseKeyAdmin {
  code: string;
  ownerName: string;
  planTier: PlanTier;
  planName: string;
  maxDevices: number;
  dailyQuota: number;
  usedToday: number;
  lastResetDate: string;
  expiryDate: string;
  activeDevices: {
    deviceId: string;
    deviceName: string;
    registeredAt: string;
    lastActive: string;
  }[];
  isActive: boolean;
  notes?: string;
  createdAt: string;
}

export interface SavedModuleItem {
  id: string;
  title: string;
  toolType: ToolType;
  toolLabel: string;
  subjectOrContext: string;
  content: string;
  createdAt: string;
  tags?: string[];
}

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
