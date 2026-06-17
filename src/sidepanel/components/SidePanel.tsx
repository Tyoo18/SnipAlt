// [INIT]: Import layout rendering dependencies and Dexie database modules
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
  // [STATE]: Structural database state managed via live queries
  const clips = useLiveQuery(() =>
    db.clips.orderBy("timestamp").reverse().toArray(),
  );

  // [HANDLER]: Delete clip persistence operation from IndexedDB store
  const handleDelete = async (id?: number) => {
    if (id !== undefined) {
      await db.clips.delete(id);
    }
  };

  // [FORMAT]: Clean format utility for compact timestamp tracking
  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // [RENDER]: Component tree with matching dark sleek layout styles
  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-zinc-950 text-slate-200 font-sans border-l border-white/5">
      {/* HEADER SECTION */}
      <header className="p-4 bg-zinc-900/40 border-b border-white/10 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="bg-blue-500/10 p-1.5 rounded-lg text-blue-400 border border-blue-500/20">
            <FolderHeart size={18} />
          </div>
          <div>
            <h1 className="text-md font-bold tracking-tight text-slate-100">
              SnipAlt Vault
            </h1>
            <p className="text-xs text-zinc-400">Your curated web insights</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 bg-zinc-900 border border-white/5 text-zinc-300 rounded-full">
          {clips?.length || 0} Clips
        </span>
      </header>

      {/* VAULT LIST / CONTENT SECTION */}
      {/* STYLE NOTE: Hiding standard scrollbars natively for seamless presentation */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {clips === undefined ? (
          <div className="text-center text-zinc-500 py-8 text-sm italic">
            Loading insights...
          </div>
        ) : clips.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-white/10 rounded-2xl bg-zinc-900/20 mt-4">
            <div className="text-zinc-600 flex justify-center mb-2">
              <Sparkles size={32} />
            </div>
            <h3 className="text-sm font-semibold text-zinc-300">
              Your vault is empty
            </h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-[200px] mx-auto leading-relaxed">
              Highlight text on any webpage and press{" "}
              <kbd className="px-1 bg-zinc-800 border border-white/10 rounded text-[10px] font-mono text-zinc-400">
                Alt+S
              </kbd>{" "}
              to save an insight.
            </p>
          </div>
        ) : (
          clips.map((clip: ClipData) => (
            <div
              key={clip.id ?? clip.timestamp}
              className="group bg-zinc-900/30 p-3.5 rounded-xl border border-white/5 shadow-sm hover:border-blue-500/20 transition-all duration-200 flex flex-col justify-between gap-3"
            >
              {/* TEXT CONTENT */}
              <p className="text-sm text-zinc-200 leading-relaxed font-normal break-words select-text selection:bg-blue-500/20">
                "{clip.textContent}"
              </p>

              {/* FOOTER METADATA */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-zinc-500">
                <a
                  href={clip.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-zinc-400 hover:text-blue-400 font-medium max-w-[70%] truncate transition-colors duration-150"
                  title={clip.pageTitle}
                >
                  <ExternalLink size={11} className="shrink-0" />
                  <span className="truncate">{clip.pageTitle}</span>
                </a>

                <div className="flex items-center gap-2 shrink-0">
                  <span>{formatTime(clip.timestamp)}</span>
                  <button
                    onClick={() => handleDelete(clip.id)}
                    className="text-zinc-500 hover:text-rose-400 p-1 rounded hover:bg-zinc-800 transition-colors duration-150"
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
      <footer className="p-3 bg-zinc-900/80 border-t border-white/10 backdrop-blur-md">
        <div className="bg-gradient-to-br from-zinc-900 to-black/40 p-3 rounded-xl border border-white/10 flex items-center justify-between gap-2 shadow-inner">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-blue-400" />
              <span className="text-xs font-bold tracking-wide uppercase text-zinc-200">
                Upgrade to Cloud Sync
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 leading-normal">
              Access your captured snippets seamlessly across all devices.
            </p>
          </div>
          <button className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow transition-all duration-150 shrink-0 border-none cursor-pointer">
            Unlock
          </button>
        </div>
      </footer>
    </div>
  );
}
