import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  BookmarkPlus,
  Zap,
  Lightbulb,
} from 'lucide-react';
import { ChatMessageItem, VerifiedLicense } from '../types';
import { sendAIChatAPI } from '../services/api';

interface AIChatAssistantProps {
  license: VerifiedLicense;
  deviceId: string;
  onSaveToLaci: (
    title: string,
    content: string,
    toolType: any,
    toolLabel: string,
    context: string
  ) => void;
}

export const AIChatAssistant: React.FC<AIChatAssistantProps> = ({
  license,
  deviceId,
  onSaveToLaci,
}) => {
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Halo! Saya **Asisten AI LACI GURU** (Powered by Akademi Tibersa). Ada yang bisa saya bantu terkait strategi mengajar, revisi modul, pembuatan soal, atau solusi kendala kelas Anda hari ini?',
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
  ]);

  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputMsg;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessageItem = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMsg('');
    setLoading(true);

    const apiMessages = newHistory.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const res = await sendAIChatAPI(license.code, deviceId, apiMessages);
    setLoading(false);

    if (res.success && res.message) {
      const assistantMsg: ChatMessageItem = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.message,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } else {
      const errorMsgItem: ChatMessageItem = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ Maaf, terjadi kendala: ${res.error || 'Gagal merespons.'}`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages((prev) => [...prev, errorMsgItem]);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveMessage = (msg: ChatMessageItem) => {
    onSaveToLaci(
      `Konsultasi AI - ${msg.content.substring(0, 30)}...`,
      msg.content,
      'chat_ai',
      'Konsultasi AI Pembelajaran',
      'Sesi Chat Asisten'
    );
    setSavedId(msg.id);
    setTimeout(() => setSavedId(null), 2000);
  };

  const quickPrompts = [
    'Buatkan 3 Ice Breaking seru untuk awal kelas',
    'Bagaimana cara membedakan modul untuk siswa kinestetik?',
    'Buatkan 5 Pertanyaan Pemantik yang memicu diskusi HOTS',
    'Analisis miskonsepsi yang sering terjadi pada mata pelajaran ini',
    'Bagaimana merancang strategi gamifikasi tanpa gadget di kelas?',
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[75vh] animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Asisten AI Konsultan Pembelajaran</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full">
                Online
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Diskusikan modul, strategi kelas, atau solusi mengajar secara interaktif.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Prompts Bar */}
      <div className="bg-slate-950/60 border-b border-slate-800 px-4 py-2.5 overflow-x-auto flex items-center space-x-2 text-xs">
        <span className="text-slate-400 shrink-0 flex items-center gap-1 font-medium">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          Picu Diskusi:
        </span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="whitespace-nowrap bg-slate-800 hover:bg-emerald-950/50 hover:border-emerald-500/50 border border-slate-700/70 text-slate-300 hover:text-emerald-300 px-3 py-1 rounded-full transition cursor-pointer text-[11px]"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${
              msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.role === 'user'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-emerald-600 text-slate-950'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-cyan-950/80 border border-cyan-800 text-slate-100 rounded-tr-none'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}
            >
              <div className="markdown-body prose prose-invert max-w-none text-xs prose-headings:text-emerald-300 prose-a:text-cyan-400">
                <Markdown>{msg.content}</Markdown>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                <span>{msg.timestamp}</span>

                {msg.role === 'assistant' && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="hover:text-slate-300 p-1 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>

                    <button
                      onClick={() => handleSaveMessage(msg)}
                      className="hover:text-emerald-400 p-1 flex items-center gap-1 cursor-pointer"
                      title="Simpan ke LACI"
                    >
                      {savedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <BookmarkPlus className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-slate-950 flex items-center justify-center">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-400 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Asisten AI sedang mengetik balasan...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Field Bar */}
      <div className="bg-slate-950 p-4 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Tuliskan pertanyaan atau arahan untuk AI..."
            className="flex-1 bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !inputMsg.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white p-2.5 rounded-xl transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
