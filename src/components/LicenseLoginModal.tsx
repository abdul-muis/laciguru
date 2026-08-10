import React, { useState } from 'react';
import {
  KeyRound,
  ShieldCheck,
  Smartphone,
  AlertCircle,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Lock,
} from 'lucide-react';
import { verifyLicenseCode } from '../services/api';
import { VerifiedLicense } from '../types';

interface LicenseLoginModalProps {
  isOpen: boolean;
  deviceId: string;
  deviceName: string;
  onSuccess: (license: VerifiedLicense) => void;
  onOpenPricing: () => void;
}

export const LicenseLoginModal: React.FC<LicenseLoginModalProps> = ({
  isOpen,
  deviceId,
  deviceName,
  onSuccess,
  onOpenPricing,
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify = async (inputCode?: string) => {
    const codeToTest = inputCode || code;
    if (!codeToTest.trim()) {
      setErrorMsg('Masukkan Kode Akses yang Anda miliki.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await verifyLicenseCode(codeToTest, deviceId, deviceName);
    setLoading(false);

    if (res.success && res.license) {
      onSuccess(res.license);
    } else {
      setErrorMsg(res.error || 'Verifikasi Kode Akses gagal.');
    }
  };

  const handleDemoFill = (demoCode: string) => {
    setCode(demoCode);
    handleVerify(demoCode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-900/60 via-slate-900 to-cyan-900/60 p-6 border-b border-slate-800 text-center relative">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <KeyRound className="w-7 h-7 text-emerald-400" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight">
            Verifikasi Kode Akses
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Sistem Keamanan & Proteksi Perangkat <span className="text-emerald-400 font-semibold">LACI GURU</span>
          </p>
        </div>

        {/* Content Form */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 bg-rose-950/50 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block">Akses Ditolak</span>
                <p className="whitespace-pre-line leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Masukkan Kode Akses Anda</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  ID Perangkat: {deviceId.substring(0, 12)}...
                </span>
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: LACI-DEMO-2026"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white font-mono uppercase placeholder-slate-600 tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                  disabled={loading}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={loading || !code.trim()}
                  className="absolute right-2 top-2 bottom-2 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg font-medium text-xs flex items-center space-x-1 transition cursor-pointer"
                >
                  {loading ? (
                    <span className="animate-spin text-white">⏳</span>
                  ) : (
                    <>
                      <span>Masuk</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Quick Demo Access Codes for Evaluators / Teachers */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Uji Coba Kode Demo Instan:
              </span>
            </div>

            <div className="grid grid-cols-1 gap-1.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => handleDemoFill('LACI-DEMO-2026')}
                className="w-full text-left bg-slate-900/90 hover:bg-emerald-950/30 border border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-300 px-3 py-1.5 rounded-lg flex items-center justify-between transition cursor-pointer"
              >
                <span>LACI-DEMO-2026</span>
                <span className="text-[10px] text-slate-500 font-sans">
                  Hemat (Max 2 Perangkat)
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('GURU-SUPER-9999')}
                className="w-full text-left bg-slate-900/90 hover:bg-teal-950/30 border border-slate-800 hover:border-teal-500/50 text-slate-300 hover:text-teal-300 px-3 py-1.5 rounded-lg flex items-center justify-between transition cursor-pointer"
              >
                <span>GURU-SUPER-9999</span>
                <span className="text-[10px] text-slate-500 font-sans">
                  Master (Max 5 Perangkat)
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('TIBERSA-VIP-8888')}
                className="w-full text-left bg-slate-900/90 hover:bg-cyan-950/30 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 px-3 py-1.5 rounded-lg flex items-center justify-between transition cursor-pointer"
              >
                <span>TIBERSA-VIP-8888</span>
                <span className="text-[10px] text-slate-500 font-sans">
                  Enterprise (Max 20 Perangkat)
                </span>
              </button>
            </div>
          </div>

          {/* Security & Device info note */}
          <div className="text-[11px] text-slate-400 leading-relaxed space-y-1.5 bg-slate-800/30 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 font-semibold text-slate-300">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ketentuan Keamanan & Perangkat:</span>
            </div>
            <p>
              Tiap Kode Akses akan mencatat ID Perangkat unik (
              <span className="text-slate-300">{deviceName}</span>). Akses di luar batas kuota perangkat paket akan ditolak otomatis.
            </p>
          </div>

          {/* Footer Action */}
          <div className="pt-2 text-center">
            <button
              onClick={onOpenPricing}
              className="text-xs text-slate-400 hover:text-emerald-400 font-medium inline-flex items-center gap-1 underline underline-offset-4 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Belum Memiliki Kode Akses? Lihat Skema Paket Langganan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
