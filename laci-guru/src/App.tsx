/**
 * LACI GURU - Asisten Pembelajaran & Perancang Modul AI
 * Powered by Akademi Tibersa
 */

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CalendarDays,
  FileSpreadsheet,
  HelpCircle,
  FileCheck2,
  GraduationCap,
  MessageSquare,
  BookmarkCheck,
  Sparkles,
  ShieldCheck,
  CreditCard,
  KeyRound,
  ArrowRight,
  FolderKanban,
} from 'lucide-react';

import { ToolType, VerifiedLicense, SavedModuleItem } from './types';
import { getOrCreateDeviceId, getDeviceFriendlyName } from './utils/device';
import { verifyLicenseCode } from './services/api';

import { Header } from './components/Header';
import { LicenseLoginModal } from './components/LicenseLoginModal';
import { PricingModal } from './components/PricingModal';
import { AdminPanel } from './components/AdminPanel';
import { ModuleGenerator } from './components/ModuleGenerator';
import { AIChatAssistant } from './components/AIChatAssistant';
import { SavedCabinet } from './components/SavedCabinet';

export default function App() {
  const [deviceId, setDeviceId] = useState('');
  const [deviceName, setDeviceName] = useState('');

  const [license, setLicense] = useState<VerifiedLicense | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>('modul_ajar');

  // Modals state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSavedOpen, setIsSavedOpen] = useState(false);

  // Saved Cabinet State
  const [savedModules, setSavedModules] = useState<SavedModuleItem[]>([]);

  // Initialize Device & Auto Verification on mount
  useEffect(() => {
    const id = getOrCreateDeviceId();
    const name = getDeviceFriendlyName();
    setDeviceId(id);
    setDeviceName(name);

    // Load saved modules from localStorage
    const localSaved = localStorage.getItem('laci_guru_saved_modules');
    if (localSaved) {
      try {
        setSavedModules(JSON.parse(localSaved));
      } catch (e) {
        console.error('Failed to parse saved modules', e);
      }
    }

    // Check cached license code
    const cachedCode = localStorage.getItem('laci_guru_code');
    if (cachedCode) {
      verifyLicenseCode(cachedCode, id, name).then((res) => {
        if (res.success && res.license) {
          setLicense(res.license);
        } else {
          // Default auto login with demo key for smooth initial preview experience
          handleAutoLoginDemo(id, name);
        }
      });
    } else {
      // Pre-fill demo key so application is immediately ready & interactive
      handleAutoLoginDemo(id, name);
    }
  }, []);

  const handleAutoLoginDemo = (id: string, name: string) => {
    verifyLicenseCode('LACI-DEMO-2026', id, name).then((res) => {
      if (res.success && res.license) {
        setLicense(res.license);
        localStorage.setItem('laci_guru_code', 'LACI-DEMO-2026');
      } else {
        setIsLoginModalOpen(true);
      }
    });
  };

  const handleLoginSuccess = (verified: VerifiedLicense) => {
    setLicense(verified);
    localStorage.setItem('laci_guru_code', verified.code);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('laci_guru_code');
    setLicense(null);
    setIsLoginModalOpen(true);
  };

  const handleSaveToLaci = (
    title: string,
    content: string,
    toolType: ToolType,
    toolLabel: string,
    context: string
  ) => {
    const newItem: SavedModuleItem = {
      id: Date.now().toString(),
      title,
      toolType,
      toolLabel,
      subjectOrContext: context,
      content,
      createdAt: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    };

    const updated = [newItem, ...savedModules];
    setSavedModules(updated);
    localStorage.setItem('laci_guru_saved_modules', JSON.stringify(updated));
  };

  const handleDeleteSaved = (id: string) => {
    const updated = savedModules.filter((m) => m.id !== id);
    setSavedModules(updated);
    localStorage.setItem('laci_guru_saved_modules', JSON.stringify(updated));
  };

  const handleUsageUpdate = (usedToday: number) => {
    if (license) {
      setLicense({ ...license, usedToday });
    }
  };

  const toolTabs = [
    { id: 'modul_ajar', label: 'Modul Ajar / RPP', icon: BookOpen },
    { id: 'prota_prosem', label: 'Prota & Prosem', icon: CalendarDays },
    { id: 'materi_slide', label: 'Materi & Slide', icon: FileSpreadsheet },
    { id: 'soal_rubrik', label: 'Soal & Rubrik', icon: HelpCircle },
    { id: 'lkpd', label: 'LKPD & Worksheet', icon: FileCheck2 },
    { id: 'kursus_bootcamp', label: 'Kursus & Training', icon: GraduationCap },
    { id: 'chat_ai', label: 'Asisten AI Chat', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navigation Bar */}
      <Header
        license={license}
        savedCount={savedModules.length}
        onOpenPricing={() => setIsPricingModalOpen(true)}
        onOpenSaved={() => setIsSavedOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onLogout={handleLogout}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner Welcome & Subtitle */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-cyan-950/80 border border-slate-800 p-6 md:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center space-x-2 bg-slate-900/90 border border-slate-800 rounded-full px-3 py-1 text-xs text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Satu Laci untuk Semua Jenis Pembelajaran & Kursus</span>
            </div>

            <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              LACI GURU{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Asisten Pembelajaran AI
              </span>
            </h1>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Bantu penyusunan Modul Ajar Kurikulum Merdeka, RPP, Prota/Prosem, Bank Soal HOTS, Lembar Kerja (LKPD), hingga Silabus Kursus & Pelatihan Kantor dengan cepat, rapi, dan terstruktur.
            </p>

            {/* License status chip */}
            {license && (
              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                <div className="bg-emerald-950/80 border border-emerald-800/80 px-3 py-1.5 rounded-xl text-emerald-300 flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>
                    Akses Aktif: <strong>{license.planName}</strong>
                  </span>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300">
                  Perangkat Terikat: {license.activeDevicesCount}/{license.maxDevices} Active
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Primary Tool Navigation Tabs */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2 shadow-xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
            {toolTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTool === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTool(tab.id as ToolType)}
                  className={`flex flex-col sm:flex-row items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Tool View */}
        {license ? (
          activeTool === 'chat_ai' ? (
            <AIChatAssistant
              license={license}
              deviceId={deviceId}
              onSaveToLaci={handleSaveToLaci}
            />
          ) : (
            <ModuleGenerator
              activeTool={activeTool}
              license={license}
              deviceId={deviceId}
              onSaveToLaci={handleSaveToLaci}
              onUsageUpdate={handleUsageUpdate}
            />
          )
        ) : (
          <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-4">
            <KeyRound className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">
              Silakan Masukkan Kode Akses Anda
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Aplikasi ini dilindungi oleh sistem verifikasi lisensi dan batas perangkat aktif.
            </p>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-5 py-2.5 rounded-xl transition cursor-pointer"
            >
              Masukkan Kode Akses Sekarang
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500 space-y-2">
        <p className="font-semibold text-slate-400">
          LACI GURU — Powered by Akademi Tibersa
        </p>
        <p className="text-[11px]">
          Solusi AI Perancang Modul Ajar, RPP, Prota/Prosem, Bank Soal, LKPD, & Silabus Kursus Terintegrasi.
        </p>
      </footer>

      {/* Modal Dialogs */}
      <LicenseLoginModal
        isOpen={isLoginModalOpen}
        deviceId={deviceId}
        deviceName={deviceName}
        onSuccess={handleLoginSuccess}
        onOpenPricing={() => {
          setIsLoginModalOpen(false);
          setIsPricingModalOpen(true);
        }}
      />

      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        onSelectPlanDemo={(code) => {
          setIsPricingModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />

      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      <SavedCabinet
        isOpen={isSavedOpen}
        onClose={() => setIsSavedOpen(false)}
        savedModules={savedModules}
        onDeleteModule={handleDeleteSaved}
      />
    </div>
  );
}
