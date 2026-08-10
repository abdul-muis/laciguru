import React, { useState } from 'react';
import Markdown from 'react-markdown';
import {
  Copy,
  Check,
  BookmarkPlus,
  Download,
  Printer,
  Sparkles,
  FileText,
  Share2,
} from 'lucide-react';
import { ToolType } from '../types';

interface ModuleOutputViewProps {
  content: string;
  toolType: ToolType;
  toolLabel: string;
  subjectOrContext: string;
  onSaveToLaci: (title: string, content: string, toolType: ToolType, toolLabel: string, context: string) => void;
}

export const ModuleOutputView: React.FC<ModuleOutputViewProps> = ({
  content,
  toolType,
  toolLabel,
  subjectOrContext,
  onSaveToLaci,
}) => {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveTitle, setSaveTitle] = useState(
    `${toolLabel} - ${subjectOrContext || 'Dokumen Baru'}`
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    onSaveToLaci(saveTitle, content, toolType, toolLabel, subjectOrContext);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `${saveTitle.replace(/[^a-zA-Z0-9]/g, '_')}.md`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-0">
      {/* Action Toolbar */}
      <div className="bg-slate-950 border-b border-slate-800 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>{toolLabel}</span>
            <span className="text-xs font-normal text-slate-400">
              ({subjectOrContext})
            </span>
          </h3>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer font-medium"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Salin Teks</span>
              </>
            )}
          </button>

          {/* Save to LACI Button */}
          <button
            onClick={handleSave}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              saved
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
            }`}
          >
            {saved ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Tersimpan di LACI!</span>
              </>
            ) : (
              <>
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>Simpan ke LACI</span>
              </>
            )}
          </button>

          {/* Download Markdown */}
          <button
            onClick={handleDownloadTxt}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
            title="Unduh File Markdown (.md)"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Unduh .MD</span>
          </button>

          {/* Print View */}
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
            title="Cetak / PDF"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* Title Input Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-2.5 flex items-center space-x-2 text-xs">
        <span className="text-slate-400 font-medium shrink-0">Judul Simpan:</span>
        <input
          type="text"
          value={saveTitle}
          onChange={(e) => setSaveTitle(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-lg px-3 py-1 text-slate-200 text-xs focus:outline-none"
        />
      </div>

      {/* Rendered Content Document Area */}
      <div className="p-6 md:p-8 text-slate-200 leading-relaxed text-sm overflow-x-auto print:bg-white print:text-black">
        <div className="markdown-body prose prose-invert max-w-none prose-headings:text-emerald-300 prose-headings:font-bold prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-a:text-cyan-400 prose-strong:text-white prose-table:border prose-table:border-slate-800 prose-th:bg-slate-800/80 prose-th:p-2.5 prose-td:p-2.5 prose-td:border-t prose-td:border-slate-800">
          <Markdown>{content}</Markdown>
        </div>
      </div>
    </div>
  );
};
