import React from 'react';
import {
  FolderKanban,
  ShieldCheck,
  CreditCard,
  Settings,
  LogOut,
  Sparkles,
  KeyRound,
  BookmarkCheck,
  Smartphone,
} from 'lucide-react';
import { VerifiedLicense } from '../types';

interface HeaderProps {
  license: VerifiedLicense | null;
  savedCount: number;
  onOpenPricing: () => void;
  onOpenSaved: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
  onOpenLoginModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  license,
  savedCount,
  onOpenPricing,
  onOpenSaved,
  onOpenAdmin,
  onLogout,
  onOpenLoginModal,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-md shadow-emerald-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <FolderKanban className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                LACI GURU
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                v2.5 AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <span>Powered by</span>
              <span className="text-cyan-400 font-semibold">Akademi Tibersa</span>
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Active License Status Badge */}
          {license ? (
            <div className="hidden md:flex items-center bg-slate-800/80 border border-slate-700/70 rounded-lg px-3 py-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mr-2 shrink-0" />
              <div className="text-left">
                <div className="flex items-center space-x-1.5 font-semibold text-slate-200">
                  <span>{license.planName}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-emerald-400 font-mono text-[11px]">
                    {license.code}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-cyan-400" />
                    Perangkat: {license.activeDevicesCount}/{license.maxDevices}
                  </span>
                  <span>•</span>
                  <span>
                    Kuota AI:{' '}
                    {license.dailyQuota === 0
                      ? 'Tanpa Batas (Unlimited)'
                      : `${license.usedToday}/${license.dailyQuota} Hari Ini`}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3.5 py-1.5 rounded-lg font-medium text-xs shadow-md transition-all cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Masukkan Kode Akses</span>
            </button>
          )}

          {/* Pricing Info Button */}
          <button
            onClick={onOpenPricing}
            className="flex items-center space-x-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 px-3 py-1.5 rounded-lg transition cursor-pointer"
            title="Skema Langganan & Proteksi"
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline font-medium">Langganan</span>
          </button>

          {/* Saved Cabinet Button */}
          <button
            onClick={onOpenSaved}
            className="relative flex items-center space-x-1 text-xs text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg transition cursor-pointer"
            title="LACI Saya (Modul Tersimpan)"
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline font-medium">LACI Saya</span>
            {savedCount > 0 && (
              <span className="ml-1 bg-emerald-500 text-slate-950 font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                {savedCount}
              </span>
            )}
          </button>

          {/* Admin Panel Button */}
          <button
            onClick={onOpenAdmin}
            className="flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
            title="Admin Panel Akademi Tibersa"
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden lg:inline text-[11px]">Admin</span>
          </button>

          {/* Logout Button */}
          {license && (
            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title="Keluar / Ganti Kode Akses"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
