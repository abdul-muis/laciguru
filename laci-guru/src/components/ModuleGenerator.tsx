import React, { useState } from 'react';
import {
  BookOpen,
  CalendarDays,
  FileSpreadsheet,
  HelpCircle,
  FileCheck2,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Sliders,
  Layers,
  Wand2,
  Clock,
  Target,
  CheckCircle,
} from 'lucide-react';
import { ToolType, VerifiedLicense } from '../types';
import { generateContentAPI } from '../services/api';
import { ModuleOutputView } from './ModuleOutputView';

interface ModuleGeneratorProps {
  activeTool: ToolType;
  license: VerifiedLicense;
  deviceId: string;
  onSaveToLaci: (
    title: string,
    content: string,
    toolType: ToolType,
    toolLabel: string,
    context: string
  ) => void;
  onUsageUpdate?: (usedToday: number) => void;
}

export const ModuleGenerator: React.FC<ModuleGeneratorProps> = ({
  activeTool,
  license,
  deviceId,
  onSaveToLaci,
  onUsageUpdate,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);

  // Form State - Modul Ajar
  const [contextType, setContextType] = useState('Sekolah - Kurikulum Merdeka');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [gradeLevel, setGradeLevel] = useState('SMA / Kelas 10');
  const [duration, setDuration] = useState('2 x 45 Menit (1 Pertemuan)');
  const [approach, setApproach] = useState('Problem-Based Learning (PBL)');
  const [targetAudience, setTargetAudience] = useState('');
  const [extraNotes, setExtraNotes] = useState('');

  // Form State - Prota Prosem
  const [period, setPeriod] = useState('Tahun Ajaran 2026/2027 - Ganjil');
  const [totalHours, setTotalHours] = useState('36 Jam Pelajaran (JP)');
  const [topicsList, setTopicsList] = useState('');

  // Form State - Materi Slide
  const [contentType, setContentType] = useState('Outline Slide Presentasi + Speaker Notes');
  const [depthLevel, setDepthLevel] = useState('Mendalam & Praktis');

  // Form State - Soal & Rubrik
  const [difficulty, setDifficulty] = useState('HOTS (High Order Thinking Skills)');
  const [mcqCount, setMcqCount] = useState(5);
  const [essayCount, setEssayCount] = useState(3);
  const [includeRubric, setIncludeRubric] = useState(true);

  // Form State - LKPD
  const [lkpdTitle, setLkpdTitle] = useState('');
  const [lkpdActivity, setLkpdActivity] = useState('Diskusi Kelompok & Studi Kasus');

  // Form State - Kursus Bootcamp
  const [courseName, setCourseName] = useState('');
  const [fieldCategory, setFieldCategory] = useState('Digital Skill & Teknologi');
  const [durationWeeks, setDurationWeeks] = useState('4 Minggu (16 Jam Total)');
  const [courseGoals, setCourseGoals] = useState('');

  const getToolMetadata = (tool: ToolType) => {
    switch (tool) {
      case 'modul_ajar':
        return {
          label: 'Modul Ajar & Rencana Pembelajaran',
          desc: 'Perancang Modul Ajar Kurikulum Merdeka, RPP, atau Rencana Kursus/Pelatihan.',
          icon: BookOpen,
        };
      case 'prota_prosem':
        return {
          label: 'Program Tahunan & Semester (Prota & Prosem)',
          desc: 'Perencana Alokasi Waktu, Distribusi Topik, & Kalender Pembelajaran Efektif.',
          icon: CalendarDays,
        };
      case 'materi_slide':
        return {
          label: 'Materi, Ringkasan & Slide Presentasi',
          desc: 'Penyusun Bahan Bacaan, Rangkuman Saku, & Slide Presentasi + Speaker Notes.',
          icon: FileSpreadsheet,
        };
      case 'soal_rubrik':
        return {
          label: 'Bank Soal, Kuis & Rubrik Asesmen',
          desc: 'Generator Soal HOTS Pilihan Ganda & Essay + Kunci & Rubrik Penilaian Analitik.',
          icon: HelpCircle,
        };
      case 'lkpd':
        return {
          label: 'Lembar Kerja Peserta Didik (LKPD)',
          desc: 'Panduan Praktikum, Lembar Observasi, & Aktivitas Pembelajaran Interaktif.',
          icon: FileCheck2,
        };
      case 'kursus_bootcamp':
        return {
          label: 'Silabus Kursus, Bootcamp & Pelatihan',
          desc: 'Perancang Kurikulum Komprehensif untuk Kursus Online, Training Karyawan, & Community Class.',
          icon: GraduationCap,
        };
      default:
        return {
          label: 'Generator AI Pembelajaran',
          desc: 'Perancang Konten Instruksional.',
          icon: Sparkles,
        };
    }
  };

  const currentToolMeta = getToolMetadata(activeTool);
  const IconComponent = currentToolMeta.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setGeneratedResult(null);

    let promptData: any = {};

    if (activeTool === 'modul_ajar') {
      if (!subject || !topic) {
        setErrorMsg('Mata Pelajaran/Kursus dan Topik wajib diisi.');
        setLoading(false);
        return;
      }
      promptData = {
        contextType,
        subject,
        topic,
        gradeLevel,
        duration,
        approach,
        targetAudience,
        extraNotes,
      };
    } else if (activeTool === 'prota_prosem') {
      if (!subject || !topicsList) {
        setErrorMsg('Mata Pelajaran/Pelatihan dan Daftar Topik wajib diisi.');
        setLoading(false);
        return;
      }
      promptData = { period, subject, gradeLevel, totalHours, topicsList };
    } else if (activeTool === 'materi_slide') {
      if (!subject || !topic) {
        setErrorMsg('Mata Pelajaran dan Topik wajib diisi.');
        setLoading(false);
        return;
      }
      promptData = { subject, topic, contentType, depthLevel, audience: gradeLevel };
    } else if (activeTool === 'soal_rubrik') {
      if (!subject || !topic) {
        setErrorMsg('Mata Pelajaran/Kursus dan Topik Evaluasi wajib diisi.');
        setLoading(false);
        return;
      }
      promptData = {
        subject,
        topic,
        difficulty,
        mcqCount,
        essayCount,
        includeRubric,
      };
    } else if (activeTool === 'lkpd') {
      if (!lkpdTitle) {
        setErrorMsg('Judul Aktivitas LKPD wajib diisi.');
        setLoading(false);
        return;
      }
      promptData = {
        title: lkpdTitle,
        targetLevel: gradeLevel,
        activityType: lkpdActivity,
        duration,
        instructions: extraNotes || 'Lakukan sesuai prosedur terstruktur.',
      };
    } else if (activeTool === 'kursus_bootcamp') {
      if (!courseName) {
        setErrorMsg('Nama Kursus/Pelatihan wajib diisi.');
        setLoading(false);
        return;
      }
      promptData = {
        courseName,
        fieldCategory,
        targetAudience: gradeLevel,
        durationWeeks,
        goals: courseGoals || 'Penguasaan keterampilan terapan.',
      };
    }

    const res = await generateContentAPI(
      license.code,
      deviceId,
      activeTool,
      promptData
    );

    setLoading(false);

    if (res.success && res.data) {
      setGeneratedResult(res.data);
      if (res.usage && onUsageUpdate) {
        onUsageUpdate(res.usage.usedToday);
      }
    } else {
      setErrorMsg(res.error || 'Gagal menghasilkan konten. Silakan coba lagi.');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Tool Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <IconComponent className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {currentToolMeta.label}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentToolMeta.desc}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs bg-slate-950/80 border border-slate-800 px-3.5 py-2 rounded-xl text-slate-300">
          <Wand2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Ditenagai AI Gemini 3.6 Flash</span>
        </div>
      </div>

      {/* Input Form Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-950/50 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-start space-x-2">
            <span className="font-semibold">Perhatian:</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* TOOL 1: MODUL AJAR / LESSON PLAN */}
          {activeTool === 'modul_ajar' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Kategori / Konteks Pembelajaran
                </label>
                <select
                  value={contextType}
                  onChange={(e) => setContextType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                >
                  <option value="Sekolah - Kurikulum Merdeka">
                    Sekolah - Kurikulum Merdeka (PAUD/SD/SMP/SMA/SMK)
                  </option>
                  <option value="Sekolah - K13">Sekolah - Kurikulum 2013 (K13)</option>
                  <option value="Kursus & Bootcamp Online/Offline">
                    Kursus & Bootcamp (Online / Offline / Skill Training)
                  </option>
                  <option value="Corporate & HR Workplace Training">
                    Corporate & Workplace Training (Karyawan / Onboarding)
                  </option>
                  <option value="Komunitas & Pelatihan Umum">
                    Komunitas, Majlis, & Pelatihan Mandiri
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Mata Pelajaran / Judul Pelatihan *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Contoh: Matematika / Python Data Science / Customer Service Excellence"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Topik Utama Pembelajaran *
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Contoh: Persamaan Kuadrat / API Integration / Handling Objections"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Tingkat / Target Peserta
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                >
                  <option value="SD Kelas 1 - 3 (Fase A/B)">SD Kelas 1 - 3 (Fase A/B)</option>
                  <option value="SD Kelas 4 - 6 (Fase B/C)">SD Kelas 4 - 6 (Fase B/C)</option>
                  <option value="SMP / Kelas 7 - 9 (Fase D)">SMP / Kelas 7 - 9 (Fase D)</option>
                  <option value="SMA / Kelas 10 (Fase E)">SMA / Kelas 10 (Fase E)</option>
                  <option value="SMA/SMK / Kelas 11 - 12 (Fase F)">SMA/SMK / Kelas 11 - 12 (Fase F)</option>
                  <option value="Mahasiswa / Perguruan Tinggi">Mahasiswa / Perguruan Tinggi</option>
                  <option value="Karyawan & Profesional (Corporate)">Karyawan & Profesional (Corporate)</option>
                  <option value="Peserta Umum / Komunitas">Peserta Umum / Komunitas</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Pendekatan Pembelajaran
                </label>
                <select
                  value={approach}
                  onChange={(e) => setApproach(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                >
                  <option value="Problem-Based Learning (PBL)">Problem-Based Learning (PBL)</option>
                  <option value="Project-Based Learning (PjBL)">Project-Based Learning (PjBL)</option>
                  <option value="Discovery / Inquiry Learning">Discovery / Inquiry Learning</option>
                  <option value="ADDIE Instructional Design">ADDIE Instructional Model</option>
                  <option value="Experiential Learning Model">Experiential Learning (Kolb)</option>
                  <option value="Gamification & Roleplay">Gamifikasi & Simulasi Roleplay</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Durasi / Alokasi Waktu
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Contoh: 2 x 45 Menit / 3 Jam Workshop"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-300 font-medium mb-1">
                  Catatan Khusus / Profil Peserta & Sarana
                </label>
                <textarea
                  rows={2}
                  value={extraNotes}
                  onChange={(e) => setExtraNotes(e.target.value)}
                  placeholder="Contoh: Kelas heterogen, ada proyek laptop, sediakan variasi audio-visual."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TOOL 2: PROTA & PROSEM */}
          {activeTool === 'prota_prosem' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Periode Pembelajaran
                </label>
                <input
                  type="text"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder="Contoh: TA 2026/2027 Ganjil / Q1 Batch 5"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Mata Pelajaran / Pelatihan *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Contoh: Biologi / Fullstack Web Dev"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Target Kelas / Tingkat
                </label>
                <input
                  type="text"
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  placeholder="Contoh: SMA Kelas 11 / Trainee Junior"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Total Alokasi Jam (JP)
                </label>
                <input
                  type="text"
                  value={totalHours}
                  onChange={(e) => setTotalHours(e.target.value)}
                  placeholder="Contoh: 36 JP / 12 Sesi"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-300 font-medium mb-1">
                  Daftar Topik / Capaian Pembelajaran *
                </label>
                <textarea
                  rows={3}
                  value={topicsList}
                  onChange={(e) => setTopicsList(e.target.value)}
                  placeholder="Sebutkan bab/topik yang akan diajarkan, pisahkan dengan koma atau baris baru."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                  required
                />
              </div>
            </div>
          )}

          {/* TOOL 3: MATERI & SLIDE PRESENTASI */}
          {activeTool === 'materi_slide' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Mata Pelajaran / Bidang *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Contoh: Ekonomi / UI/UX Design"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Judul Topik Pembelajaran *
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Contoh: Inflasi & Kebijakan Moneter / Wireframing & Prototyping"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Format Output Desain
                </label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                >
                  <option value="Outline Slide Presentasi + Speaker Notes">
                    Outline Slide Presentasi (10+ Slide) + Speaker Notes
                  </option>
                  <option value="Bahan Bacaan & Modul Rangkuman">
                    Bahan Bacaan Komprehensif & Rangkuman Saku
                  </option>
                  <option value="Infografis Text & Cheat Sheet Ringkas">
                    Cheat Sheet / Ringkasan Poin Penting
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Tingkat Kedalaman
                </label>
                <select
                  value={depthLevel}
                  onChange={(e) => setDepthLevel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                >
                  <option value="Populer & Mudah Dipahami">Populer & Mudah Dipahami (Dasar)</option>
                  <option value="Mendalam & Praktis">Mendalam & Praktis (Menengah)</option>
                  <option value="Akademik & Analitis">Akademik & Analitis (Lanjutan)</option>
                </select>
              </div>
            </div>
          )}

          {/* TOOL 4: BANK SOAL & RUBRIK */}
          {activeTool === 'soal_rubrik' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Mata Pelajaran / Kursus *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Contoh: Fisika / Digital Marketing"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Topik Evaluasi *
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Contoh: Hukum Newton / Meta Ads Strategy"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Tingkat Kesulitan
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                >
                  <option value="HOTS (High Order Thinking Skills)">
                    HOTS (High Order Thinking Skills - Analisis & Sintesis)
                  </option>
                  <option value="Sedang (Penalaran & Aplikasi)">Sedang (Penalaran & Aplikasi)</option>
                  <option value="Mudah (Pemahaman & Pemanggilan Informasi)">Mudah (Pemahaman Dasar)</option>
                </select>
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Pilihan Ganda
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={mcqCount}
                    onChange={(e) => setMcqCount(Number(e.target.value))}
                    className="w-24 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Essay / Kasus
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={essayCount}
                    onChange={(e) => setEssayCount(Number(e.target.value))}
                    className="w-24 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="md:col-span-2 flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="rubricCheck"
                  checked={includeRubric}
                  onChange={(e) => setIncludeRubric(e.target.checked)}
                  className="w-4 h-4 text-emerald-500 bg-slate-950 border-slate-700 rounded focus:ring-emerald-500"
                />
                <label htmlFor="rubricCheck" className="text-slate-300 cursor-pointer">
                  Sertakan Rubrik Penilaian Analitik (Skor 1-4 & Deskriptor Kualitatif)
                </label>
              </div>
            </div>
          )}

          {/* TOOL 5: LKPD & WORKSHEET */}
          {activeTool === 'lkpd' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Judul Aktivitas / Praktikum *
                </label>
                <input
                  type="text"
                  value={lkpdTitle}
                  onChange={(e) => setLkpdTitle(e.target.value)}
                  placeholder="Contoh: Lembar Pengamatan Uji Makanan / Studi Kasus Etika Kerja"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Bentuk Aktivitas
                </label>
                <select
                  value={lkpdActivity}
                  onChange={(e) => setLkpdActivity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                >
                  <option value="Diskusi Kelompok & Studi Kasus">Diskusi Kelompok & Studi Kasus</option>
                  <option value="Eksperimen / Laboratorium">Eksperimen & Observasi Laboratorium</option>
                  <option value="Proyek Mini & Presentasi">Proyek Mini (Mini Project)</option>
                  <option value="Simulasi Roleplay / Interview">Simulasi Roleplay / Wawancara</option>
                </select>
              </div>
            </div>
          )}

          {/* TOOL 6: KURSUS & BOOTCAMP */}
          {activeTool === 'kursus_bootcamp' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Nama Kursus / Training *
                </label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="Contoh: Masterclass AI Content Creator / Bootcamp React & Node"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Kategori Bidang
                </label>
                <select
                  value={fieldCategory}
                  onChange={(e) => setFieldCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                >
                  <option value="Digital Skill & Teknologi">Digital Skill & Teknologi</option>
                  <option value="Bisnis & Kewirausahaan">Bisnis & Kewirausahaan</option>
                  <option value="Soft Skills & Komunikasi">Soft Skills & Komunikasi</option>
                  <option value="Desain, Video & Kreatif">Desain, Video & Kreatif</option>
                  <option value="Pendidikan & Keterampilan Khusus">Pendidikan & Hobby</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-300 font-medium mb-1">
                  Project Akhir / Target Kelulusan
                </label>
                <input
                  type="text"
                  value={courseGoals}
                  onChange={(e) => setCourseGoals(e.target.value)}
                  placeholder="Contoh: Peserta mampu meluncurkan toko online sendiri dalam 4 minggu."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-medium text-xs px-6 py-3 rounded-xl shadow-lg shadow-emerald-950/50 flex items-center space-x-2 transition cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Merancang Dokumen dengan AI...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Rancang Dokumen Sekarang</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Generated Result Display */}
      {generatedResult && (
        <ModuleOutputView
          content={generatedResult}
          toolType={activeTool}
          toolLabel={currentToolMeta.label}
          subjectOrContext={subject || lkpdTitle || courseName || 'Modul Pembelajaran'}
          onSaveToLaci={onSaveToLaci}
        />
      )}
    </div>
  );
};
