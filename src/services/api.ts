import {
  VerifiedLicense,
  ToolType,
  LicenseKeyAdmin,
} from '../types';

export async function verifyLicenseCode(
  code: string,
  deviceId: string,
  deviceName: string
): Promise<{ success: boolean; license?: VerifiedLicense; error?: string }> {
  try {
    const res = await fetch('/api/license/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, deviceId, deviceName }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Gagal memverifikasi Kode Akses.' };
    }

    return { success: true, license: data.license };
  } catch (err: any) {
    return { success: false, error: 'Tidak dapat terhubung ke server.' };
  }
}

export async function generateContentAPI(
  code: string,
  deviceId: string,
  toolType: ToolType,
  promptData: any
): Promise<{
  success: boolean;
  data?: string;
  usage?: { usedToday: number; dailyQuota: number };
  error?: string;
}> {
  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, deviceId, toolType, promptData }),
    });

    const result = await res.json();
    if (!res.ok) {
      return { success: false, error: result.error || 'Gagal merancang modul.' };
    }

    return { success: true, data: result.data, usage: result.usage };
  } catch (err: any) {
    return { success: false, error: 'Terjadi kesalahan jaringan/server.' };
  }
}

export async function sendAIChatAPI(
  code: string,
  deviceId: string,
  messages: { role: 'user' | 'assistant'; content: string }[]
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, deviceId, messages }),
    });

    const result = await res.json();
    if (!res.ok) {
      return { success: false, error: result.error || 'Gagal merespons percakapan.' };
    }

    return { success: true, message: result.message };
  } catch (err: any) {
    return { success: false, error: 'Gagal menghubungi server AI.' };
  }
}

// ADMIN APIS
export async function fetchAdminLicenses(
  adminKey: string
): Promise<{
  success: boolean;
  licenses?: LicenseKeyAdmin[];
  stats?: any;
  error?: string;
}> {
  try {
    const res = await fetch('/api/admin/licenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminKey }),
    });

    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, licenses: data.licenses, stats: data.stats };
  } catch (err: any) {
    return { success: false, error: 'Koneksi server gagal.' };
  }
}

export async function createAdminLicense(
  adminKey: string,
  payload: {
    ownerName: string;
    planTier: string;
    customCode?: string;
    expiryDays?: string;
    notes?: string;
  }
): Promise<{ success: boolean; license?: LicenseKeyAdmin; error?: string }> {
  try {
    const res = await fetch('/api/admin/create-license', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminKey, ...payload }),
    });

    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, license: data.license };
  } catch (err: any) {
    return { success: false, error: 'Koneksi server gagal.' };
  }
}

export async function resetAdminDevices(
  adminKey: string,
  code: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/admin/reset-devices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminKey, code }),
    });

    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, message: data.message };
  } catch (err: any) {
    return { success: false, error: 'Koneksi server gagal.' };
  }
}

export async function toggleAdminLicenseStatus(
  adminKey: string,
  code: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/admin/toggle-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminKey, code }),
    });

    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, message: data.message };
  } catch (err: any) {
    return { success: false, error: 'Koneksi server gagal.' };
  }
}
