// [INIT]: Import Dexie live queries and icons
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../shared/db";
import { type ClipData } from "../../shared/types";
import {
  Trash2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  FolderHeart,
} from "lucide-react";

export default function SidePanel() {
  // [STATE]: Bind IndexedDB directly to React state with reactive live queries
  const clips = useLiveQuery(() =>
    db.clips.orderBy("timestamp").reverse().toArray(),
  );

  // [HANDLER]: Delete clip handling from IndexedDB
  const handleDelete = async (id?: number) => {
    if (id !== undefined) {
      await db.clips.delete(id);
    }
  };

  // [FORMAT]: Simple timestamp formatter to look clean
  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-50 font-sans">
      {/* HEADER SECTION */}
      <header className="p-4 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-brand-500 p-1.5 rounded-lg text-white">
            <FolderHeart size={18} />
          </div>
          <div>
            <h1 className="text-md font-bold tracking-tight text-slate-900">
              SnipAlt Vault
            </h1>
            <p className="text-xs text-slate-500">Your curated web insights</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
          {clips?.length || 0} Clips
        </span>
      </header>

      {/* VAULT LIST / CONTENT SECTION */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3">
        {clips === undefined ? (
          <div className="text-center text-slate-400 py-8 text-sm">
            Loading insights...
          </div>
        ) : clips.length === 0 ? (
          <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-white mt-4">
            <div className="text-slate-300 flex justify-center mb-2">
              <Sparkles size={32} />
            </div>
            <h3 className="text-sm font-semibold text-slate-700">
              Vault masih kosong
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">
              Highlight teks di web lalu tekan{" "}
              <kbd className="px-1 bg-slate-100 border rounded text-[10px] font-mono">
                Alt+S
              </kbd>{" "}
              buat nyimpen.
            </p>
          </div>
        ) : (
          clips.map((clip: ClipData) => (
            <div
              key={clip.id ?? clip.timestamp}
              className="group bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-brand-500/20 transition-all duration-200 flex flex-col justify-between gap-3"
            >
              {/* TEXT CONTENT */}
              <p className="text-sm text-slate-800 leading-relaxed font-normal break-words select-text selection:bg-brand-50">
                "{clip.textContent}"
              </p>

              {/* FOOTER METADATA */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                <a
                  href={clip.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-slate-500 hover:text-brand-500 font-medium max-w-[70%] truncate transition-colors duration-150"
                  title={clip.pageTitle}
                >
                  <ExternalLink size={11} className="shrink-0" />
                  <span className="truncate">{clip.pageTitle}</span>
                </a>

                <div className="flex items-center gap-2 shrink-0">
                  <span>{formatTime(clip.timestamp)}</span>
                  <button
                    onClick={() => handleDelete(clip.id)}
                    className="text-slate-300 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors duration-150"
                    title="Delete Clip"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      {/* PREMIUM PAYWALL BANNER */}
      <footer className="p-3 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
        <div className="bg-gradient-to-r from-brand-500 to-indigo-600 p-3 rounded-xl text-white flex items-center justify-between gap-2 shadow-sm">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-indigo-200" />
              <span className="text-xs font-bold tracking-wide uppercase">
                Upgrade to Cloud Sync
              </span>
            </div>
            <p className="text-[10px] text-indigo-100">
              Akses hasil klipingan lu di semua device.
            </p>
          </div>
          <button className="bg-white text-brand-600 hover:bg-indigo-50 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all duration-150 shrink-0">
            Unlock
          </button>
        </div>
      </footer>
    </div>
  );
}
