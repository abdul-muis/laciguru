import React, { useState, useEffect } from 'react';
import {
  Settings,
  X,
  Key,
  Plus,
  RotateCcw,
  ShieldAlert,
  Smartphone,
  Copy,
  Check,
  Search,
  UserCheck,
  Building,
  RefreshCw,
  Power,
  Sparkles,
} from 'lucide-react';
import { LicenseKeyAdmin } from '../types';
import {
  fetchAdminLicenses,
  createAdminLicense,
  resetAdminDevices,
  toggleAdminLicenseStatus,
} from '../services/api';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  // SECURITY: never pre-fill or default this to the real admin key.
  // It must be typed by the admin every time the panel is opened.
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [licenses, setLicenses] = useState<LicenseKeyAdmin[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form New License State
  const [newOwner, setNewOwner] = useState('');
  const [newTier, setNewTier] = useState('hemat');
  const [newCustomCode, setNewCustomCode] = useState('');
  const [newExpiry, setNewExpiry] = useState('365');
  const [newNotes, setNewNotes] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Reset auth state every time the panel is (re)opened, so a previous
  // session's access doesn't linger and the key must be entered again.
  useEffect(() => {
    if (isOpen) {
      setIsAuthenticated(false);
      setAdminKey('');
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAuth = async () => {
    setLoading(true);
    setErrorMsg(null);
    const res = await fetchAdminLicenses(adminKey);
    setLoading(false);

    if (res.success && res.licenses) {
      setIsAuthenticated(true);
      setLicenses(res.licenses);
      setStats(res.stats);
    } else {
      setIsAuthenticated(false);
      setErrorMsg(res.error || 'Kunci Admin tidak valid.');
    }
  };

  const handleCreateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOwner.trim()) {
      setErrorMsg('Nama Pemilik harus diisi.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await createAdminLicense(adminKey, {
      ownerName: newOwner,
      planTier: newTier,
      customCode: newCustomCode,
      expiryDays: newExpiry,
      notes: newNotes,
    });

    setLoading(false);

    if (res.success && res.license) {
      setSuccessMsg(`Berhasil membuat Kode Akses: ${res.license.code}`);
      setNewOwner('');
      setNewCustomCode('');
      setNewNotes('');
      handleAuth(); // Refresh list
    } else {
      setErrorMsg(res.error || 'Gagal membuat Kode Akses.');
    }
  };

  const handleResetDevices = async (code: string) => {
    if (!confirm(`Reset daftar perangkat untuk kode ${code}?`)) return;

    setLoading(true);
    const res = await resetAdminDevices(adminKey, code);
    setLoading(false);

    if (res.success) {
      setSuccessMsg(`Perangkat untuk ${code} berhasil di-reset.`);
      handleAuth();
    } else {
      setErrorMsg(res.error || 'Gagal mereset perangkat.');
    }
  };

  const handleToggleStatus = async (code: string) => {
    setLoading(true);
    const res = await toggleAdminLicenseStatus(adminKey, code);
    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.message || 'Status berhasil diubah.');
      handleAuth();
    } else {
      setErrorMsg(res.error || 'Gagal mengubah status.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredLicenses = licenses.filter(
    (l) =>
      l.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.planName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl my-6 overflow-hidden shadow-2xl">
        {/* Top Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Manager Lisensi Akademi Tibersa</span>
                <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded-full uppercase">
                  Admin Panel
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Kelola Kode Akses, Beli/Terbitkan Lisensi Guru, & Reset Perangkat Terikat.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* Admin Authentication Card if not authenticated */}
          {!isAuthenticated ? (
            <div className="max-w-md mx-auto bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
              <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto" />
              <div>
                <h3 className="text-base font-bold text-white">
                  Otentikasi Kunci Admin
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Masukkan Kunci Rahasia Admin Akademi Tibersa.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl">
                  {errorMsg}
                </div>
              )}

              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Masukkan kunci admin..."
                className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
              />

              <button
                onClick={handleAuth}
                disabled={loading}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                {loading ? 'Memverifikasi...' : 'Masuk Dashboard Admin'}
              </button>
            </div>
          ) : (
            <>
              {/* Messages Feedback */}
              {errorMsg && (
                <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center justify-between">
                  <span>{errorMsg}</span>
                  <button onClick={() => setErrorMsg(null)}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              {successMsg && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center justify-between">
                  <span>{successMsg}</span>
                  <button onClick={() => setSuccessMsg(null)}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Stats Bar */}
              {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400">
                        Total Lisensi Diterbitkan
                      </span>
                      <div className="text-xl font-bold text-white mt-0.5">
                        {stats.totalKeys} Kode
                      </div>
                    </div>
                    <Key className="w-6 h-6 text-emerald-400 opacity-80" />
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400">
                        Lisensi Aktif
                      </span>
                      <div className="text-xl font-bold text-emerald-400 mt-0.5">
                        {stats.activeKeys} Kode
                      </div>
                    </div>
                    <UserCheck className="w-6 h-6 text-teal-400 opacity-80" />
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400">
                        Perangkat Terikat Aktif
                      </span>
                      <div className="text-xl font-bold text-cyan-400 mt-0.5">
                        {stats.totalDevicesActive} Perangkat
                      </div>
                    </div>
                    <Smartphone className="w-6 h-6 text-cyan-400 opacity-80" />
                  </div>
                </div>
              )}

              {/* Generator Form for New License */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center space-x-2 text-white font-semibold text-sm">
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>Buat / Terbitkan Kode Akses Baru</span>
                </div>

                <form
                  onSubmit={handleCreateLicense}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs"
                >
                  <div>
                    <label className="block text-slate-400 mb-1">
                      Nama Pemilik / Pembeli
                    </label>
                    <input
                      type="text"
                      value={newOwner}
                      onChange={(e) => setNewOwner(e.target.value)}
                      placeholder="Contoh: Bu Ani - SMPN 1"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">
                      Pilihan Paket Langganan
                    </label>
                    <select
                      value={newTier}
                      onChange={(e) => setNewTier(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="hemat">
                        Paket Hemat Guru (2 Perangkat - 100/hari)
                      </option>
                      <option value="master">
                        Paket Master Guru (5 Perangkat - Unlimited)
                      </option>
                      <option value="lembaga">
                        Paket Lembaga (20 Perangkat - Unlimited)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">
                      Masa Aktif
                    </label>
                    <select
                      value={newExpiry}
                      onChange={(e) => setNewExpiry(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="30">1 Bulan (30 Hari)</option>
                      <option value="90">3 Bulan (90 Hari)</option>
                      <option value="365">1 Tahun (365 Hari)</option>
                      <option value="lifetime">Selamanya (Lifetime)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">
                      Custom Kode (Opsional)
                    </label>
                    <input
                      type="text"
                      value={newCustomCode}
                      onChange={(e) =>
                        setNewCustomCode(e.target.value.toUpperCase())
                      }
                      placeholder="Kosongkan untuk auto: LACI-xxxx"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white uppercase font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">
                      Catatan Tambahan
                    </label>
                    <input
                      type="text"
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      placeholder="Misal: Lunas via Transfer BCA"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-lg text-xs transition cursor-pointer flex items-center justify-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Terbitkan Kode Akses</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Search & List of Licenses */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">
                    Daftar Kode Akses Sistem
                  </h3>

                  <div className="flex items-center space-x-2">
                    <div className="relative w-64">
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari nama, kode, paket..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <button
                      onClick={handleAuth}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                      title="Refresh"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900 text-slate-400 font-medium uppercase text-[10px] border-b border-slate-800">
                        <tr>
                          <th className="px-4 py-3">Kode Akses</th>
                          <th className="px-4 py-3">Pemilik</th>
                          <th className="px-4 py-3">Paket</th>
                          <th className="px-4 py-3">Perangkat Terikat</th>
                          <th className="px-4 py-3">Kedaluwarsa</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {filteredLicenses.length === 0 ? (
                          <tr>
                            <td
                              colSpan={7}
                              className="px-4 py-6 text-center text-slate-500 text-xs"
                            >
                              Tidak ada kode akses ditemukan.
                            </td>
                          </tr>
                        ) : (
                          filteredLicenses.map((lic) => (
                            <tr
                              key={lic.code}
                              className="hover:bg-slate-900/50 transition"
                            >
                              <td className="px-4 py-3 font-mono font-bold text-white">
                                <div className="flex items-center space-x-1.5">
                                  <span>{lic.code}</span>
                                  <button
                                    onClick={() => copyToClipboard(lic.code)}
                                    className="text-slate-500 hover:text-emerald-400 p-1"
                                    title="Salin Kode"
                                  >
                                    {copiedCode === lic.code ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </td>

                              <td className="px-4 py-3">
                                <div className="font-medium text-slate-200">
                                  {lic.ownerName}
                                </div>
                                {lic.notes && (
                                  <span className="text-[10px] text-slate-500 block">
                                    {lic.notes}
                                  </span>
                                )}
                              </td>

                              <td className="px-4 py-3">
                                <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-[11px] text-slate-200">
                                  {lic.planName}
                                </span>
                              </td>

                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-1 font-semibold text-slate-200">
                                  <Smartphone className="w-3 h-3 text-cyan-400" />
                                  <span>
                                    {lic.activeDevices.length} / {lic.maxDevices}
                                  </span>
                                </div>
                                {lic.activeDevices.length > 0 && (
                                  <div className="text-[10px] text-slate-500 max-w-xs truncate mt-0.5">
                                    {lic.activeDevices
                                      .map((d) => d.deviceName)
                                      .join(', ')}
                                  </div>
                                )}
                              </td>

                              <td className="px-4 py-3 font-mono text-[11px]">
                                {lic.expiryDate === 'lifetime'
                                  ? 'Selamanya'
                                  : lic.expiryDate}
                              </td>

                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    lic.isActive
                                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                                  }`}
                                >
                                  {lic.isActive ? 'AKTIF' : 'NONAKTIF'}
                                </span>
                              </td>

                              <td className="px-4 py-3 text-right space-x-2">
                                <button
                                  onClick={() => handleResetDevices(lic.code)}
                                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded transition cursor-pointer"
                                  title="Reset Perangkat Terikat"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => handleToggleStatus(lic.code)}
                                  className={`p-1.5 rounded transition cursor-pointer ${
                                    lic.isActive
                                      ? 'bg-rose-950/80 hover:bg-rose-900 text-rose-300'
                                      : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300'
                                  }`}
                                  title={
                                    lic.isActive
                                      ? 'Nonaktifkan Kode'
                                      : 'Aktifkan Kode'
                                  }
                                >
                                  <Power className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
