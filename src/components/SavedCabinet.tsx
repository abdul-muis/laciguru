import React, { useState } from 'react';
import Markdown from 'react-markdown';
import {
  FolderKanban,
  Search,
  Trash2,
  Copy,
  Check,
  Printer,
  Download,
  X,
  FileText,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { SavedModuleItem } from '../types';

interface SavedCabinetProps {
  isOpen: boolean;
  onClose: () => void;
  savedModules: SavedModuleItem[];
  onDeleteModule: (id: string) => void;
}

export const SavedCabinet: React.FC<SavedCabinetProps> = ({
  isOpen,
  onClose,
  savedModules,
  onDeleteModule,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<SavedModuleItem | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const filtered = savedModules.filter(
    (m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.toolLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subjectOrContext.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = (item: SavedModuleItem) => {
    const blob = new Blob([item.content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${item.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl my-6 overflow-hidden shadow-2xl flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>LACI Saya</span>
                <span className="text-xs font-normal text-slate-400">
                  ({savedModules.length} Dokumen)
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Arsip modul ajar, bank soal, dan materi pembelajaran tersimpan.
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

        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {selectedModule ? (
            /* Detailed View of Selected Module */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <button
                    onClick={() => setSelectedModule(null)}
                    className="text-xs text-emerald-400 hover:underline mb-1 inline-block cursor-pointer font-medium"
                  >
                    ← Kembali ke Daftar LACI
                  </button>
                  <h3 className="text-base font-bold text-white">
                    {selectedModule.title}
                  </h3>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-300">
                      {selectedModule.toolLabel}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {selectedModule.createdAt}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCopy(selectedModule.content)}
                    className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copied ? 'Tersalin' : 'Salin Teks'}</span>
                  </button>

                  <button
                    onClick={() => handleDownloadTxt(selectedModule)}
                    className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh .MD</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-xs text-slate-200 leading-relaxed overflow-x-auto">
                <div className="markdown-body prose prose-invert max-w-none text-xs prose-headings:text-emerald-300 prose-a:text-cyan-400">
                  <Markdown>{selectedModule.content}</Markdown>
                </div>
              </div>
            </div>
          ) : (
            /* Grid List of Saved Modules */
            <>
              {/* Search input */}
              <div className="relative max-w-md">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari berdasarkan judul, topik, atau jenis..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/50 border border-slate-800/80 rounded-2xl p-6 space-y-2">
                  <FileText className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-sm text-slate-400 font-medium">
                    Belum Ada Dokumen di LACI Anda
                  </p>
                  <p className="text-xs text-slate-500">
                    Hasil perancangan modul, soal, dan materi yang Anda simpan akan muncul di sini.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filtered.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between space-y-3 transition group"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                          <span className="bg-slate-800 border border-slate-700 text-emerald-400 px-2.5 py-0.5 rounded-md font-medium">
                            {item.toolLabel}
                          </span>
                          <span className="text-slate-500">{item.createdAt}</span>
                        </div>

                        <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                          {item.subjectOrContext}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-xs">
                        <button
                          onClick={() => setSelectedModule(item)}
                          className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <span>Buka Dokumen</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDeleteModule(item.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded transition cursor-pointer"
                          title="Hapus dari LACI"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
