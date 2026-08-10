import React from 'react';
import {
  CheckCircle2,
  X,
  Smartphone,
  ShieldCheck,
  Zap,
  Sparkles,
  Lock,
  Building2,
  UserCheck,
  Check,
  Key,
  MessageCircle,
} from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlanDemo?: (planTier: string) => void;
}

// ==========================================
// PEMBELIAN VIA WHATSAPP
// ==========================================
// Ganti nomor & rekening di sini kalau suatu saat berubah.
const WHATSAPP_NUMBER = '6285195555674'; // format internasional, tanpa "+" (0851... -> 62851...)
const BANK_NAME = 'Bank Syariah Indonesia';
const BANK_ACCOUNT_NUMBER = '7113396371';
const BANK_ACCOUNT_NAME = 'Abdul Muis';

function buildWhatsAppOrderUrl(planName: string, price: string): string {
  const message =
    `Hi Kak saya mau beli LACI GURU Paket ${planName}, ` +
    `saya akan transfer sebesar ${price} ke nomor rekening ${BANK_NAME} ` +
    `No Rek ${BANK_ACCOUNT_NUMBER} a.n ${BANK_ACCOUNT_NAME}, ` +
    `setelah saya transfer saya akan kembali kirim buktinya disini, mohon di cek.`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function handleSelectPlan(planName: string, price: string) {
  window.open(buildWhatsAppOrderUrl(planName, price), '_blank', 'noopener,noreferrer');
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl my-8 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/30">
                Skema Akses Berlangganan
              </span>
              <span className="text-xs text-cyan-400 font-semibold">
                Powered by Akademi Tibersa
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Pilihan Paket & Proteksi Lisensi Multi-Perangkat
            </h2>
            <p className="text-xs text-slate-400">
              Sistem proteksi Kode Akses berbasis batas perangkat aktif demi mencegah penyalahgunaan akun.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8 max-h-[80vh] overflow-y-auto">
          {/* Info Beli (dipindah ke atas) */}
          <div className="bg-emerald-950/30 border border-emerald-800/60 rounded-xl p-4 text-xs text-slate-300 flex items-center justify-between gap-4">
            <div className="flex items-start gap-2.5">
              <MessageCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-white">Ingin Membeli Kode Akses Resmi?</span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Pilih salah satu paket di bawah, lalu klik tombol "Pilih Paket Ini" — kamu akan diarahkan ke WhatsApp Admin Akademi Tibersa untuk menyelesaikan pembelian.
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Paket Hemat Guru */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-500/50 transition relative group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-lg">
                    Paket Hemat Guru
                  </span>
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                </div>

                <div className="mb-4">
                  <div className="text-2xl font-bold text-white">
                    Rp 49.000{' '}
                    <span className="text-xs font-normal text-slate-400">
                      / bulan
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Cocok untuk guru individu atau pengajar mandiri.
                  </p>
                </div>

                <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-xl p-2.5 mb-4 text-xs font-semibold text-emerald-300 flex items-center justify-between">
                  <span>Maksimal Perangkat:</span>
                  <span className="bg-emerald-500 text-slate-950 px-2 py-0.5 rounded font-bold">
                    2 Perangkat
                  </span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>2 Perangkat Aktif (misal: HP & Laptop)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>100 Generasi Modul AI / Hari</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Modul Ajar Sekolah & RPP K13</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Bank Soal, LKPD & Prota/Prosem</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-500">
                    <X className="w-4 h-4 shrink-0" />
                    <span>Tanpa Asisten Chat Pedagogi VIP</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-900">
                <button
                  onClick={() => handleSelectPlan('Hemat Guru', 'Rp 49.000')}
                  className="w-full bg-slate-900 hover:bg-emerald-600 text-slate-200 hover:text-white py-2 rounded-xl text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Pilih Paket Ini
                </button>
              </div>
            </div>

            {/* Card 2: Paket Master Guru (RECOMMENDED) */}
            <div className="bg-slate-950 border-2 border-emerald-500/80 rounded-2xl p-5 flex flex-col justify-between shadow-xl shadow-emerald-950/30 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow">
                Paling Populer & Laris
              </div>

              <div>
                <div className="flex items-center justify-between mb-3 mt-1">
                  <span className="text-xs font-semibold text-teal-300 bg-teal-950/80 border border-teal-800/80 px-2.5 py-1 rounded-lg">
                    Paket Master Guru
                  </span>
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>

                <div className="mb-4">
                  <div className="text-2xl font-bold text-white">
                    Rp 89.000{' '}
                    <span className="text-xs font-normal text-slate-400">
                      / bulan
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Untuk instruktur kursus, trainer, & guru profesional.
                  </p>
                </div>

                <div className="bg-teal-950/40 border border-teal-800/80 rounded-xl p-2.5 mb-4 text-xs font-semibold text-teal-200 flex items-center justify-between">
                  <span>Maksimal Perangkat:</span>
                  <span className="bg-teal-400 text-slate-950 px-2 py-0.5 rounded font-bold">
                    5 Perangkat
                  </span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-200">
                  <li className="flex items-center gap-2 font-medium text-emerald-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>5 Perangkat Aktif bersamaan</span>
                  </li>
                  <li className="flex items-center gap-2 font-medium text-amber-300">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Kuota AI Tanpa Batas (Unlimited)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Semua Generator Modul & Kursus</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Asisten AI Chat Konsultan Pedagogi VIP</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Export Lengkap PDF / Markdown / Text</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-900">
                <button
                  onClick={() => handleSelectPlan('Master Guru', 'Rp 89.000')}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl text-xs font-medium shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Pilih Paket Ini
                </button>
              </div>
            </div>

            {/* Card 3: Paket Lembaga & Komunitas */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-cyan-500/50 transition">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-2.5 py-1 rounded-lg">
                    Paket Lembaga / Tim
                  </span>
                  <Building2 className="w-4 h-4 text-cyan-400" />
                </div>

                <div className="mb-4">
                  <div className="text-2xl font-bold text-white">
                    Rp 199.000{' '}
                    <span className="text-xs font-normal text-slate-400">
                      / bulan
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Untuk Sekolah, MGMP, Lembaga Kursus & Tim Trainer.
                  </p>
                </div>

                <div className="bg-cyan-950/30 border border-cyan-900/50 rounded-xl p-2.5 mb-4 text-xs font-semibold text-cyan-300 flex items-center justify-between">
                  <span>Maksimal Perangkat:</span>
                  <span className="bg-cyan-400 text-slate-950 px-2 py-0.5 rounded font-bold">
                    20 Perangkat
                  </span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>20 Perangkat untuk seluruh tim/guru</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Kuota Tanpa Batas (Unlimited)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Dashboard Reset Perangkat Mandiri</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Custom Branding Modul Pelatihan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Dukungan Prioritas Akademi Tibersa</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-900">
                <button
                  onClick={() => handleSelectPlan('Lembaga / Tim', 'Rp 199.000')}
                  className="w-full bg-slate-900 hover:bg-cyan-600 text-slate-200 hover:text-white py-2 rounded-xl text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Pilih Paket Ini
                </button>
              </div>
            </div>
          </div>

          {/* Security Architecture Details Section */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm">
              <Lock className="w-4 h-4" />
              <span>Sistem Proteksi Anti-Pembobolan & Penguncian Perangkat</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Fingerprint ID Perangkat</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Tiap kali login, sistem membuat sidik jari perangkat unik berbasis browser & OS. ID ini didaftarkan ke server secara otomatis.
                </p>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>Validasi Batas Kuota</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Jika kode dipakai di perangkat melebihi batas paket (misal perangkat ke-3 di Paket Hemat 2 Perangkat), akses langsung diblokir.
                </p>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Reset & Revokasi Admin</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Admin Akademi Tibersa dapat melakukan reset pendaftaran perangkat atau menonaktifkan kode yang terindikasi dibocorkan secara publik.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
