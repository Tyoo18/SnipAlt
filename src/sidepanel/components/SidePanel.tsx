// [INIT]: Import layout rendering dependencies and Dexie database modules
import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../shared/db";
import { type ClipData } from "../../shared/types";
import {
  Trash2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  FolderHeart,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";

export default function SidePanel() {
  // [STATE]: Unified application configuration and tracking hooks
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [resolvedDark, setResolvedDark] = useState(true);

  const clips = useLiveQuery(() =>
    db.clips.orderBy("timestamp").reverse().toArray(),
  );

  // [INIT]: Fetch initial user theme preference state directly from storage hooks
  useEffect(() => {
    const updateResolvedDarkState = (
      currentTheme: "light" | "dark" | "system",
    ) => {
      if (currentTheme === "dark") {
        setResolvedDark(true);
      } else if (currentTheme === "light") {
        setResolvedDark(false);
      } else {
        const isSystemDarkTheme = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;
        setResolvedDark(isSystemDarkTheme);
      }
    };

    chrome.storage.local.get(["snipalt_theme"], (result) => {
      const persistentTheme = result.snipalt_theme || "system";
      setTheme(persistentTheme);
      updateResolvedDarkState(persistentTheme);
    });

    // [UTIL]: Listen to storage mutations reactively from options or dock triggers
    const handleGlobalStorageChanges = (changes: any) => {
      if (changes.snipalt_theme) {
        const targetTheme = changes.snipalt_theme.newValue || "system";
        setTheme(targetTheme);
        updateResolvedDarkState(targetTheme);
      }
    };

    // [UTIL]: Listen to browser/OS color scheme toggles fluidly
    const browserMediaSpec = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemMediaTrigger = (e: MediaQueryListEvent) => {
      chrome.storage.local.get(["snipalt_theme"], (res) => {
        if ((res.snipalt_theme || "system") === "system") {
          setResolvedDark(e.matches);
        }
      });
    };

    chrome.storage.onChanged.addListener(handleGlobalStorageChanges);
    browserMediaSpec.addEventListener("change", handleSystemMediaTrigger);

    return () => {
      chrome.storage.onChanged.removeListener(handleGlobalStorageChanges);
      browserMediaSpec.removeEventListener("change", handleSystemMediaTrigger);
    };
  }, []);

  // [HANDLER]: Cycle internal states sequentially light -> dark -> system
  const handleCycleThemeToggle = () => {
    let progressiveTheme: "light" | "dark" | "system" = "light";
    if (theme === "light") progressiveTheme = "dark";
    else if (theme === "dark") progressiveTheme = "system";
    else if (theme === "system") progressiveTheme = "light";

    setTheme(progressiveTheme);
    chrome.storage.local.set({ snipalt_theme: progressiveTheme });

    // Instantly force compilation update for snappy client feedback
    if (progressiveTheme === "dark") setResolvedDark(true);
    else if (progressiveTheme === "light") setResolvedDark(false);
    else
      setResolvedDark(
        window.matchMedia("(prefers-color-scheme: dark)").matches,
      );
  };

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

  // [RENDER]: Structural node injected with local conditional dark wrapper boundaries
  return (
    <div className={resolvedDark ? "dark" : ""}>
      <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-slate-200 font-sans border-l border-zinc-200 dark:border-white/5 transition-colors duration-200">
        {/* HEADER SECTION */}
        <header className="p-4 bg-white/80 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md transition-colors duration-200">
          <div className="flex items-center gap-2">
            <div className="bg-blue-500/10 p-1.5 rounded-lg text-blue-500 dark:text-blue-400 border border-blue-500/20">
              <FolderHeart size={18} />
            </div>
            <div>
              <h1 className="text-md font-bold tracking-tight text-zinc-900 dark:text-slate-100">
                SnipAlt Vault
              </h1>
              <p className="text-xs text-zinc-400 dark:text-zinc-400">
                Your curated web insights
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* PREMIUM THEME CYCLE TRIGGER BUTTON */}
            <div className="relative group">
              <button
                onClick={handleCycleThemeToggle}
                className="p-1.5 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg border border-zinc-200 dark:border-white/10 transition-all duration-150 flex items-center justify-center cursor-pointer"
              >
                {theme === "light" && <Sun size={14} />}
                {theme === "dark" && <Moon size={14} />}
                {theme === "system" && <Monitor size={14} />}
              </button>
              {/* INLINE MICRO-INTERACTION TOOLTIP */}
              <div className="absolute right-0 top-full mt-2 hidden group-hover:block bg-zinc-900 text-white text-[10px] px-2 py-1 rounded shadow-md font-medium capitalize border border-white/5 whitespace-nowrap z-50">
                Theme: {theme}
              </div>
            </div>

            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-200/70 dark:bg-zinc-900 border border-zinc-300 dark:border-white/5 text-zinc-600 dark:text-zinc-300 rounded-full transition-colors duration-200">
              {clips?.length || 0} Clips
            </span>
          </div>
        </header>

        {/* VAULT LIST / CONTENT SECTION */}
        <main className="flex-1 overflow-y-auto p-4 space-y-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {clips === undefined ? (
            <div className="text-center text-zinc-400 dark:text-zinc-500 py-8 text-sm italic">
              Loading insights...
            </div>
          ) : clips.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-zinc-200 dark:border-white/10 rounded-2xl bg-slate-100/50 dark:bg-zinc-900/20 mt-4 transition-colors duration-200">
              <div className="text-zinc-400 dark:text-zinc-600 flex justify-center mb-2">
                <Sparkles size={32} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Your vault is empty
              </h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-[200px] mx-auto leading-relaxed">
                Highlight text on any webpage and press{" "}
                <kbd className="px-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                  Alt+S
                </kbd>{" "}
                to save an insight.
              </p>
            </div>
          ) : (
            clips.map((clip: ClipData) => (
              <div
                key={clip.id ?? clip.timestamp}
                className="group bg-white dark:bg-zinc-900/30 p-3.5 rounded-xl border border-zinc-200/60 dark:border-white/5 shadow-sm hover:border-brand-500/30 dark:hover:border-blue-500/20 transition-all duration-200 flex flex-col justify-between gap-3"
              >
                {/* TEXT CONTENT */}
                <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-normal break-words select-text selection:bg-blue-500/20">
                  "{clip.textContent}"
                </p>

                {/* FOOTER METADATA */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-white/5 text-[11px] text-zinc-400 dark:text-zinc-500">
                  <a
                    href={clip.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 hover:text-brand-500 dark:hover:text-blue-400 font-medium max-w-[70%] truncate transition-colors duration-150"
                    title={clip.pageTitle}
                  >
                    <ExternalLink size={11} className="shrink-0" />
                    <span className="truncate">{clip.pageTitle}</span>
                  </a>

                  <div className="flex items-center gap-2 shrink-0">
                    <span>{formatTime(clip.timestamp)}</span>
                    <button
                      onClick={() => handleDelete(clip.id)}
                      className="text-zinc-400 dark:text-zinc-500 hover:text-rose-500 dark:hover:text-rose-400 p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors duration-150"
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
        <footer className="p-3 bg-slate-100/90 dark:bg-zinc-900/80 border-t border-zinc-200 dark:border-white/10 backdrop-blur-md transition-colors duration-200">
          <div className="bg-gradient-to-br from-white to-slate-50 dark:from-zinc-900 dark:to-black/40 p-3 rounded-xl border border-zinc-200 dark:border-white/10 flex items-center justify-between gap-2 shadow-sm dark:shadow-inner">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <ShieldCheck
                  size={14}
                  className="text-brand-500 dark:text-blue-400"
                />
                <span className="text-xs font-bold tracking-wide uppercase text-zinc-700 dark:text-zinc-200">
                  Upgrade to Cloud Sync
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-400 leading-normal">
                Access your captured snippets seamlessly across all devices.
              </p>
            </div>
            <button className="bg-brand-500 hover:bg-brand-600 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow transition-all duration-150 shrink-0 border-none cursor-pointer">
              Unlock
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
