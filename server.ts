import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = 3000;

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// ==========================================
// LICENSE & DEVICE MANAGEMENT SYSTEM
// ==========================================

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  registeredAt: string;
  lastActive: string;
}

export interface LicenseKey {
  code: string;
  ownerName: string;
  planTier: 'hemat' | 'master' | 'lembaga';
  planName: string;
  maxDevices: number;
  dailyQuota: number; // 0 for unlimited
  usedToday: number;
  lastResetDate: string;
  expiryDate: string; // ISO date or "lifetime"
  activeDevices: DeviceInfo[];
  isActive: boolean;
  notes?: string;
  createdAt: string;
}

// In-memory Database for Licenses (Pre-seeded with default demo codes)
const licensesDb: Record<string, LicenseKey> = {
  'LACI-DEMO-2026': {
    code: 'LACI-DEMO-2026',
    ownerName: 'Guru Pembelajar (Demo)',
    planTier: 'hemat',
    planName: 'Paket Hemat Guru (2 Perangkat)',
    maxDevices: 2,
    dailyQuota: 100,
    usedToday: 0,
    lastResetDate: new Date().toISOString().split('T')[0],
    expiryDate: '2027-12-31',
    activeDevices: [],
    isActive: true,
    notes: 'Lisensi standar demo untuk guru & pengajar.',
    createdAt: new Date().toISOString(),
  },
  'GURU-SUPER-9999': {
    code: 'GURU-SUPER-9999',
    ownerName: 'Instruktur Master (VIP)',
    planTier: 'master',
    planName: 'Paket Master Guru (5 Perangkat)',
    maxDevices: 5,
    dailyQuota: 0, // unlimited
    usedToday: 0,
    lastResetDate: new Date().toISOString().split('T')[0],
    expiryDate: '2028-12-31',
    activeDevices: [],
    isActive: true,
    notes: 'Lisensi pro tanpa batas untuk instruktur/kursus.',
    createdAt: new Date().toISOString(),
  },
  'TIBERSA-VIP-8888': {
    code: 'TIBERSA-VIP-8888',
    ownerName: 'Akademi Tibersa Enterprise',
    planTier: 'lembaga',
    planName: 'Paket Lembaga & Komunitas (20 Perangkat)',
    maxDevices: 20,
    dailyQuota: 0, // unlimited
    usedToday: 0,
    lastResetDate: new Date().toISOString().split('T')[0],
    expiryDate: 'lifetime',
    activeDevices: [],
    isActive: true,
    notes: 'Akses penuh komunitas & pelatihan masal.',
    createdAt: new Date().toISOString(),
  },
};

const ADMIN_KEY = 'ADMIN-TIBERSA-SECRET';

// Helper: Reset daily usage if new day
const checkDailyReset = (license: LicenseKey) => {
  const today = new Date().toISOString().split('T')[0];
  if (license.lastResetDate !== today) {
    license.usedToday = 0;
    license.lastResetDate = today;
  }
};

// ==========================================
// API ROUTES
// ==========================================

// 1. Verify and Login with License Code
app.post('/api/license/verify', (req: Request, res: Response) => {
  const { code, deviceId, deviceName } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Kode Akses harus diisi' });
  }

  const cleanCode = code.trim().toUpperCase();
  const license = licensesDb[cleanCode];

  if (!license) {
    return res.status(404).json({
      error: 'Kode Akses tidak ditemukan atau tidak valid. Silakan hubungi Akademi Tibersa.',
    });
  }

  if (!license.isActive) {
    return res.status(403).json({
      error: 'Kode Akses ini telah dinonaktifkan oleh administrator.',
    });
  }

  // Check Expiry
  if (license.expiryDate !== 'lifetime') {
    const expiry = new Date(license.expiryDate);
    if (new Date() > expiry) {
      return res.status(403).json({
        error: `Kode Akses telah kadaluarsa pada ${license.expiryDate}. Silakan perpanjang masa langganan di Akademi Tibersa.`,
      });
    }
  }

  checkDailyReset(license);

  // Device Binding Logic
  const existingDevice = license.activeDevices.find(
    (d) => d.deviceId === deviceId
  );

  if (existingDevice) {
    // Device already registered, update last active
    existingDevice.lastActive = new Date().toISOString();
  } else {
    // New device attempt
    if (license.activeDevices.length >= license.maxDevices) {
      return res.status(403).json({
        error: `Batas perangkat tercapai! Paket ini hanya mengizinkan maksimal ${license.maxDevices} perangkat aktif.
Perangkat aktif saat ini: ${license.activeDevices.length}/${license.maxDevices}.
Silakan gunakan perangkat yang sudah terdaftar atau minta reset perangkat ke Admin Akademi Tibersa.`,
        activeDevicesCount: license.activeDevices.length,
        maxDevices: license.maxDevices,
      });
    }

    // Register new device
    license.activeDevices.push({
      deviceId,
      deviceName: deviceName || 'Perangkat Baru',
      registeredAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    });
  }

  res.json({
    success: true,
    message: 'Kode Akses Berhasil Diverifikasi',
    license: {
      code: license.code,
      ownerName: license.ownerName,
      planTier: license.planTier,
      planName: license.planName,
      maxDevices: license.maxDevices,
      activeDevicesCount: license.activeDevices.length,
      dailyQuota: license.dailyQuota,
      usedToday: license.usedToday,
      expiryDate: license.expiryDate,
    },
    deviceRegistered: deviceId,
  });
});

// 2. Generate Content Endpoint (Modul Ajar, Prota/Prosem, Soal, LKPD, Kursus)
app.post('/api/generate', async (req: Request, res: Response) => {
  try {
    const { code, deviceId, toolType, promptData } = req.body;

    if (!code || !licensesDb[code.trim().toUpperCase()]) {
      return res
        .status(401)
        .json({ error: 'Sesi tidak valid. Sila masuk menggunakan Kode Akses.' });
    }

    const license = licensesDb[code.trim().toUpperCase()];

    // Verify device belongs to active devices
    const isDeviceAllowed = license.activeDevices.some(
      (d) => d.deviceId === deviceId
    );
    if (!isDeviceAllowed) {
      return res.status(403).json({
        error: 'Perangkat ini tidak terdaftar dalam lisensi aktif.',
      });
    }

    checkDailyReset(license);

    if (license.dailyQuota > 0 && license.usedToday >= license.dailyQuota) {
      return res.status(429).json({
        error: `Batas kuota generasi harian (${license.dailyQuota} kali) untuk Paket ${license.planName} telah tercapai. Upgrade ke Paket Master untuk kuota Tanpa Batas!`,
      });
    }

    const ai = getGeminiClient();

    let systemInstruction = `Anda adalah "LACI GURU" AI, asisten instruksional profesional yang ditenagai oleh Akademi Tibersa. 
Tugas Anda adalah merancang dokumen pembelajaran, modul ajar, program tahunan/semester, bank soal, LKPD, dan kurikulum pelatihan dengan standar tinggi, komprehensif, terstruktur rapi dengan Markdown, dan dapat langsung digunakan.
Gunakan bahasa Indonesia yang santai, edukatif, profesional, dan inspiratif.
Gunakan format Markdown lengkap dengan judul, sub-judul (#, ##, ###), tabel Markdown jika relevan, bullet points, dan kotak tips.`;

    let userPrompt = '';

    if (toolType === 'modul_ajar') {
      const {
        contextType,
        subject,
        topic,
        gradeLevel,
        duration,
        approach,
        targetAudience,
        extraNotes,
      } = promptData;

      userPrompt = `Buatkan Dokumen Lengkap Modul Ajar / Rencana Pembelajaran dengan rincian berikut:
- Kategori / Konteks: ${contextType} (Contoh: Sekolah Kurikulum Merdeka / Kursus / Pelatihan Kantor / Komunitas)
- Mata Pelajaran / Judul Kursus: ${subject}
- Topik Pembelajaran: ${topic}
- Tingkat / Target Peserta: ${gradeLevel} (Peserta: ${targetAudience || 'Umum'})
- Durasi / Jumlah Pertemuan: ${duration}
- Pendekatan / Metode Pembelajaran: ${approach}
- Catatan Tambahan: ${extraNotes || 'Tidak ada'}

Struktur dokumen yang wajib Anda hasilkan:
1. INFORMASI UMUM (Identitas, Profil Peserta, Sarana/Prasarana, Model Pembelajaran)
2. KOMPETENSI INTI & TUJUAN PEMBELAJARAN (Tujuan spesifik, Pemahaman Bermakna, Pertanyaan Pemantik)
3. KEGIATAN PEMBELAJARAN DETAIL (Pendahuluan, Kegiatan Inti berurutan langkah demi langkah, Penutup & Refleksi)
4. RENCANA ASESMEN / EVALUASI (Awal, Proses/Formatif, Akhir/Sumatif)
5. LAMPIRAN & BAHAN BACAAN (Ringkasan materi utama, Glosarium, Daftar Pustaka)

Buat sangat mendalam, kaya strategi interaktif, dan fleksibel.`;
    } else if (toolType === 'prota_prosem') {
      const { period, subject, gradeLevel, totalHours, topicsList } = promptData;
      userPrompt = `Buatkan Rancangan Program Tahunan & Program Semester (Prota & Prosem) terstruktur dalam tabel Markdown:
- Periode: ${period}
- Mata Pelajaran / Judul Pelatihan: ${subject}
- Tingkat / Target: ${gradeLevel}
- Total Jam Pelajaran (JP) / Durasi: ${totalHours}
- Daftar Topik / Capaian Pembelajaran: ${topicsList}

Hasilkan:
1. Matriks Distribusi Alokasi Waktu Prota (Per Elemen/Topik, Jam Pelajaran, Alasan Alokasi)
2. Tabel Matriks Prosem (Pembagian Per Bulan & Pekan, Jadwal Ujian/Asesmen, Pembelajaran Efektif)
3. Rekomendasi Strategi Manajemen Waktu & Remidial/Pengayaan.`;
    } else if (toolType === 'materi_slide') {
      const { subject, topic, contentType, depthLevel, audience } = promptData;
      userPrompt = `Buatkan Bahan Ajar & Outline Slide Presentasi:
- Judul Topik: ${topic} (${subject})
- Tipe Output: ${contentType} (Ringkasan Materi, Outline Slide Presentasi, atau Lembar Rangkuman Saku)
- Tingkat Kedalaman: ${depthLevel}
- Target Pembaca/Siswa: ${audience}

Sediakan:
1. Ringkasan Konsep Utama & Analogi Sederhana untuk Memudahkan Pemahaman
2. Outline Slide-demi-Slide Presentasi (Slide 1 s.d. Slide 10+) mencakup: Judul Slide, Poin Kunci, Visual Suggestion (Saran Gambar/Diagram), dan Speaker Notes (Catatan Pengajar)
3. Ringkasan Poin Penting (Takeaway) & Istilah Kunci.`;
    } else if (toolType === 'soal_rubrik') {
      const {
        subject,
        topic,
        difficulty,
        mcqCount,
        essayCount,
        includeRubric,
      } = promptData;
      userPrompt = `Buatkan Bank Soal Evaluasi & Rubrik Penilaian Analitik:
- Mata Pelajaran / Kursus: ${subject}
- Topik: ${topic}
- Tingkat Kesulitan: ${difficulty} (Mudah / Sedang / HOTS - High Order Thinking Skills)
- Jumlah Soal Pilihan Ganda: ${mcqCount || 5}
- Jumlah Soal Essay / Studi Kasus: ${essayCount || 3}
- Sertakan Rubrik Penilaian Analitik: ${includeRubric ? 'Ya' : 'Tidak'}

Hasilkan:
1. Lembar Soal (Pilihan Ganda A-D/E + Soal Essay Berbasis Studi Kasus/Analisis)
2. Kunci Jawaban Lengkap dengan Pembahasan Logis
3. Rubrik Penilaian Analitik (Tabel Kriteria, Skorsing 1-4, Deskriptor Kualitatif) untuk Soal Essay/Praktik.`;
    } else if (toolType === 'lkpd') {
      const { title, targetLevel, activityType, duration, instructions } =
        promptData;
      userPrompt = `Buatkan Lembar Kerja Peserta Didik (LKPD / Worksheet) Interaktif & Siap Cetak:
- Judul Aktivitas: ${title}
- Target Tingkat/Siswa: ${targetLevel}
- Jenis Aktivitas: ${activityType} (Diskusi Kelompok / Eksperimen / Studi Kasus / Project)
- Durasi: ${duration}
- Instruksi Tambahan: ${instructions}

Struktur LKPD:
1. HEADER LKPD (Nama Kelompok, Anggota, Tanggal, Kelas/Modul)
2. TUJUAN AKTIVITAS & SARANA
3. STIMULUS / CERITA / KASUS PEMBUKA
4. LANGKAH KERJA & INSTRUKSI PENGERJAAN
5. KOLOM ISIAN / TABEL OBSERVASI & PERTANYAAN DISKUSI
6. LEMBAR KESIMPULAN & REFLEKSI DIRI.`;
    } else if (toolType === 'kursus_bootcamp') {
      const { courseName, fieldCategory, targetAudience, durationWeeks, goals } =
        promptData;
      userPrompt = `Buatkan Kurikulum & Silabus Lengkap Kursus / Bootcamp / Pelatihan Mandiri:
- Nama Kursus / Training: ${courseName}
- Kategori/Bidang: ${fieldCategory}
- Target Peserta: ${targetAudience}
- Durasi Pelatihan: ${durationWeeks}
- Hasil Akhir / Project Target: ${goals}

Hasilkan:
1. RINGKASAN SILABUS & SKILL MATRIX
2. MODUL MINGGUAN / SILABUS CHRONOLOGICAL (Minggu 1 s.d Selesai: Topik, Teori, Live Coding/Praktek, Tugas/Project)
3. KRITERIA KELULUSAN & CAPSTONE PROJECT BRIEFS
4. DAFTAR REKOMENDASI RESOURCE & TOOLS.`;
    } else {
      userPrompt = JSON.stringify(promptData);
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const outputText = response.text || 'Tidak ada respons yang dihasilkan.';

    // Increment daily usage
    license.usedToday += 1;

    res.json({
      success: true,
      data: outputText,
      usage: {
        usedToday: license.usedToday,
        dailyQuota: license.dailyQuota,
      },
    });
  } catch (error: any) {
    console.error('Error generating content:', error);
    res.status(500).json({
      error:
        error.message ||
        'Gagal menghasilkan dokumen dengan AI. Silakan coba lagi.',
    });
  }
});

// 3. AI Chat Assistant Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { code, deviceId, messages } = req.body;

    if (!code || !licensesDb[code.trim().toUpperCase()]) {
      return res
        .status(401)
        .json({ error: 'Sesi tidak valid. Sila masuk menggunakan Kode Akses.' });
    }

    const license = licensesDb[code.trim().toUpperCase()];
    checkDailyReset(license);

    if (license.dailyQuota > 0 && license.usedToday >= license.dailyQuota) {
      return res.status(429).json({
        error: `Batas kuota harian (${license.dailyQuota}) tercapai. Upgrade ke Paket Master untuk kuota unlimited!`,
      });
    }

    const ai = getGeminiClient();

    const formattedMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: formattedMessages,
      config: {
        systemInstruction: `Anda adalah "Asisten AI LACI GURU" (Powered by Akademi Tibersa). 
Anda spesialis konsultan pedagogi, desain instruksional, penyusun modul ajar, dan metode pengajaran modern (Kurikulum Merdeka, ADDIE, Bloom Taxonomy, Problem-Based Learning, Gamifikasi, Differentiated Learning).
Bantu guru, dosen, instruktur kursus, dan corporate trainer menyusun materi, menyelesaikan tantangan mengajar, merancang permainan edukatif, dan meningkatkan efektivitas kelas.
Gunakan bahasa Indonesia yang ramah, membantu, praktis, dan terstruktur.`,
        temperature: 0.7,
      },
    });

    license.usedToday += 1;

    res.json({
      success: true,
      message: response.text || 'Terima kasih, ada yang bisa saya bantu lagi?',
    });
  } catch (error: any) {
    console.error('Error in AI Chat:', error);
    res.status(500).json({ error: error.message || 'Gagal merespons percakapan.' });
  }
});

// ==========================================
// ADMIN API ROUTES (AKADEMI TIBERSA ADMIN)
// ==========================================

// Get All Licenses List
app.post('/api/admin/licenses', (req: Request, res: Response) => {
  const { adminKey } = req.body;
  if (adminKey !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Kunci Admin tidak valid!' });
  }

  const list = Object.values(licensesDb).map((l) => {
    checkDailyReset(l);
    return l;
  });

  res.json({
    success: true,
    licenses: list,
    stats: {
      totalKeys: list.length,
      activeKeys: list.filter((k) => k.isActive).length,
      totalDevicesActive: list.reduce((acc, k) => acc + k.activeDevices.length, 0),
    },
  });
});

// Create New License Code
app.post('/api/admin/create-license', (req: Request, res: Response) => {
  const { adminKey, ownerName, planTier, customCode, expiryDays, notes } = req.body;

  if (adminKey !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Kunci Admin tidak valid!' });
  }

  let code = customCode ? customCode.trim().toUpperCase() : '';
  if (!code) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const prefix = planTier === 'lembaga' ? 'TIBERSA' : planTier === 'master' ? 'GURU' : 'LACI';
    code = `${prefix}-${randomSuffix}-2026`;
  }

  if (licensesDb[code]) {
    return res.status(400).json({ error: `Kode Akses "${code}" sudah ada dalam sistem.` });
  }

  let maxDevices = 2;
  let planName = 'Paket Hemat Guru (2 Perangkat)';
  let dailyQuota = 100;

  if (planTier === 'master') {
    maxDevices = 5;
    planName = 'Paket Master Guru (5 Perangkat)';
    dailyQuota = 0; // unlimited
  } else if (planTier === 'lembaga') {
    maxDevices = 20;
    planName = 'Paket Lembaga & Komunitas (20 Perangkat)';
    dailyQuota = 0;
  }

  let expiryDate = '2027-12-31';
  if (expiryDays) {
    if (expiryDays === 'lifetime') {
      expiryDate = 'lifetime';
    } else {
      const d = new Date();
      d.setDate(d.getDate() + Number(expiryDays));
      expiryDate = d.toISOString().split('T')[0];
    }
  }

  const newLicense: LicenseKey = {
    code,
    ownerName: ownerName || 'Pengguna Baru Akademi Tibersa',
    planTier: planTier || 'hemat',
    planName,
    maxDevices,
    dailyQuota,
    usedToday: 0,
    lastResetDate: new Date().toISOString().split('T')[0],
    expiryDate,
    activeDevices: [],
    isActive: true,
    notes: notes || 'Dibuat via Admin Panel Akademi Tibersa',
    createdAt: new Date().toISOString(),
  };

  licensesDb[code] = newLicense;

  res.json({
    success: true,
    message: `Kode Akses ${code} berhasil dibuat!`,
    license: newLicense,
  });
});

// Reset Active Devices for a License Key
app.post('/api/admin/reset-devices', (req: Request, res: Response) => {
  const { adminKey, code } = req.body;

  if (adminKey !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Kunci Admin tidak valid!' });
  }

  const cleanCode = code ? code.trim().toUpperCase() : '';
  const license = licensesDb[cleanCode];

  if (!license) {
    return res.status(404).json({ error: 'Kode Akses tidak ditemukan.' });
  }

  license.activeDevices = [];

  res.json({
    success: true,
    message: `Daftar perangkat aktif untuk kode ${cleanCode} berhasil di-reset!`,
    license,
  });
});

// Toggle Active/Deactive License Code
app.post('/api/admin/toggle-status', (req: Request, res: Response) => {
  const { adminKey, code } = req.body;

  if (adminKey !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Kunci Admin tidak valid!' });
  }

  const cleanCode = code ? code.trim().toUpperCase() : '';
  const license = licensesDb[cleanCode];

  if (!license) {
    return res.status(404).json({ error: 'Kode Akses tidak ditemukan.' });
  }

  license.isActive = !license.isActive;

  res.json({
    success: true,
    message: `Status kode ${cleanCode} diubah menjadi ${license.isActive ? 'AKTIF' : 'NONAKTIF'}.`,
    license,
  });
});

// ==========================================
// VITE & SERVER BOOTSTRAP
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LACI GURU Server running on http://localhost:${PORT}`);
  });
}

startServer();
