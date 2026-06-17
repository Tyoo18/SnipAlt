// [INIT]: Import Dexie live queries, models, and presentation layout icons
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

  // [HANDLER]: Delete clip handling directly from IndexedDB core instance
  const handleDelete = async (id?: number) => {
    if (id !== undefined) {
      await db.clips.delete(id);
    }
  };

  // [FORMAT]: Simple timestamp formatter configured for 24h digital clocks
  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-black text-zinc-200 font-sans">
      {/* HEADER SECTION (TRUE PITCH BLACK) */}
      <header className="p-4 bg-zinc-950 border-b border-white/5 flex items-center justify-between sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="bg-zinc-900 border border-white/10 p-2 rounded-xl text-indigo-400">
            <FolderHeart size={16} />
          </div>
          <div>
            <h1 className="text-xs font-black uppercase tracking-wider text-white m-0">
              SnipAlt Vault
            </h1>
            <p className="text-[10px] text-zinc-500 m-0 mt-0.5">
              Your curated web insights
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 bg-zinc-900 border border-white/5 text-zinc-400 rounded-full">
          {clips?.length || 0} Clips
        </span>
      </header>

      {/* VAULT LIST / CONTENT SECTION (WITH HIDDEN SCROLLBARS) */}
      <main className="content-box flex-1 overflow-y-auto p-4 space-y-3">
        {clips === undefined ? (
          <div className="text-center text-zinc-600 py-8 text-xs italic">
            Loading insights...
          </div>
        ) : clips.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-white/5 rounded-2xl bg-zinc-950/40 mt-4">
            <div className="text-zinc-700 flex justify-center mb-2">
              <Sparkles size={24} className="stroke-[1.5]" />
            </div>
            <h3 className="text-xs font-bold text-zinc-400 m-0">
              Vault masih kosong
            </h3>
            <p className="text-[10px] text-zinc-500 mt-1.5 max-w-[180px] mx-auto leading-relaxed">
              Highlight teks di web lalu tekan{" "}
              <kbd className="px-1 bg-zinc-900 border border-white/10 rounded text-[9px] font-mono text-zinc-400">
                Alt+S
              </kbd>{" "}
              buat nyimpen.
            </p>
          </div>
        ) : (
          clips.map((clip: ClipData) => (
            <div
              key={clip.id ?? clip.timestamp}
              className="group bg-zinc-950 p-3.5 rounded-xl border border-white/5 shadow-sm hover:border-white/10 transition-all duration-200 flex flex-col justify-between gap-3"
            >
              {/* TEXT CONTENT */}
              <p className="text-[11px] text-zinc-300 leading-relaxed font-normal break-words select-text m-0">
                "{clip.textContent}"
              </p>

              {/* FOOTER METADATA */}
              <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.03] text-[10px] text-zinc-500">
                <a
                  href={clip.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-zinc-500 hover:text-indigo-400 font-medium max-w-[70%] truncate transition-colors duration-150 no-underline"
                  title={clip.pageTitle}
                >
                  <ExternalLink size={11} className="shrink-0" />
                  <span className="truncate">{clip.pageTitle}</span>
                </a>

                <div className="flex items-center gap-2 shrink-0">
                  <span>{formatTime(clip.timestamp)}</span>
                  <button
                    onClick={() => handleDelete(clip.id)}
                    className="text-zinc-600 hover:text-rose-400 p-1 rounded hover:bg-zinc-900 bg-transparent border-none cursor-pointer transition-colors duration-150"
                    title="Delete Clip"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      {/* PREMIUM PAYWALL BANNER */}
      <footer className="p-3 bg-black border-t border-white/5">
        <div className="bg-gradient-to-r from-indigo-950/40 to-purple-950/40 border border-indigo-500/10 p-3 rounded-xl text-white flex items-center justify-between gap-2 shadow-sm">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-indigo-400" />
              <span className="text-[10px] font-bold tracking-wide uppercase">
                Upgrade to Cloud Sync
              </span>
            </div>
            <p className="text-[9px] text-zinc-500 m-0 mt-0.5">
              Akses hasil klipingan lu di semua device.
            </p>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white border-none text-[10px] font-bold px-3 py-1.5 rounded-md shadow-sm transition-all duration-150 shrink-0 cursor-pointer">
            Unlock
          </button>
        </div>
      </footer>
    </div>
  );
}
