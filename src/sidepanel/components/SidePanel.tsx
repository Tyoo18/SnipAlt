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
  Cloud,
} from "lucide-react";

// [UTIL]: Product setup credentials pointing directly to your Gumroad store dashboard
const GUMROAD_PRODUCT_URL =
  "https://aldorise6.gumroad.com/l/trlznx?_gl=1*1o875eo*_ga*MTM3MDEyNzkyOC4xNzc5Mzg2OTA4*_ga_6LJN6D94N6*czE3ODE3NzA2NDgkbzIwJGcxJHQxNzgxNzcwNjU3JGo1MSRsMCRoMA..";
// [UTIL]: Unique Gumroad product identifier string obtained from the verification error
const PRODUCT_ID = "lfolmfoFW1tlkatqc3vRXw==";

export default function SidePanel() {
  // [STATE]: Unified application configuration and tracking hooks
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [resolvedDark, setResolvedDark] = useState(true);

  // [STATE]: Premium entitlement verification tracking nodes
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [licenseKey, setLicenseKey] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);

  const clips = useLiveQuery(() =>
    db.clips.orderBy("timestamp").reverse().toArray(),
  );

  // [INIT]: Fetch initial user theme preference and premium status from local storage
  useEffect(() => {
    // [UTIL]: Core routine to resolve dark class mapping
    const updateResolvedDarkState = (currentTheme: "light" | "dark") => {
      setResolvedDark(currentTheme === "dark");
    };

    chrome.storage.local.get(
      ["snipalt_theme", "snipalt_is_premium"],
      (result) => {
        const persistentTheme =
          result.snipalt_theme === "light" ? "light" : "dark";
        setTheme(persistentTheme);
        updateResolvedDarkState(persistentTheme);

        if (result.snipalt_is_premium) {
          setIsPremium(true);
        }
      },
    );

    // [UTIL]: Listen to storage mutations reactively from options or dock triggers
    const handleGlobalStorageChanges = (changes: any) => {
      if (changes.snipalt_theme) {
        const targetTheme =
          changes.snipalt_theme.newValue === "light" ? "light" : "dark";
        setTheme(targetTheme);
        updateResolvedDarkState(targetTheme);
      }
      if (changes.snipalt_is_premium) {
        setIsPremium(!!changes.snipalt_is_premium.newValue);
      }
    };

    chrome.storage.onChanged.addListener(handleGlobalStorageChanges);

    return () => {
      chrome.storage.onChanged.removeListener(handleGlobalStorageChanges);
    };
  }, []);

  // [HANDLER]: Cycle internal states sequentially light <-> dark (2‑way)
  const handleCycleThemeToggle = () => {
    const progressiveTheme = theme === "light" ? "dark" : "light";

    setTheme(progressiveTheme);
    chrome.storage.local.set({ snipalt_theme: progressiveTheme });
    setResolvedDark(progressiveTheme === "dark");
  };

  // [HANDLER]: Delete clip persistence operation from IndexedDB store
  const handleDelete = async (id?: number) => {
    if (id !== undefined) {
      await db.clips.delete(id);
    }
  };

  // [HANDLER]: Open Gumroad checkout workflow safely on an active external tab
  const handleBuyClick = () => {
    chrome.tabs.create({ url: GUMROAD_PRODUCT_URL });
  };

  // [HANDLER]: Dispatch licence activation network queries to backend runtime workers
  const handleVerifyLicense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey.trim()) return;

    setIsLoading(true);
    setStatusMsg(null);

    // [FETCH]: Pipe interaction signatures across background runtime cross-contexts
    chrome.runtime.sendMessage(
      {
        type: "VERIFY_LICENSE",
        payload: {
          licenseKey: licenseKey.trim(),
          productId: PRODUCT_ID,
        },
      },
      (response) => {
        setIsLoading(false);

        // [VALIDATE]: Mutate persistent cloud parameters upon validating license codes
        if (response && response.success) {
          chrome.storage.local.set({ snipalt_is_premium: true }, () => {
            setIsPremium(true);
            setShowForm(false);
          });
        } else {
          setStatusMsg({
            text:
              response?.message ||
              "Verifikasi gagal, periksa kembali kode Anda.",
            isError: true,
          });
        }
      },
    );
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
              {/* [STYLE]: Premium-aware heading layout structure with unified brand tokens */}
              <div className="flex items-center gap-1.5">
                <h1 className="text-md font-bold tracking-tight text-zinc-900 dark:text-slate-100">
                  SnipAlt Vault
                </h1>
                {isPremium && (
                  <div className="relative group/cloud flex items-center cursor-help">
                    <Cloud
                      size={14}
                      className="text-blue-500 dark:text-blue-400 drop-shadow-[0_0_4px_rgba(59,130,246,0.35)] transition-all duration-300 hover:scale-110"
                    />
                    {/* ICON TOOLTIP */}
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover/cloud:block bg-zinc-900 text-white text-[9px] px-1.5 py-0.5 rounded shadow-md border border-white/5 whitespace-nowrap z-50 font-medium tracking-normal normal-case">
                      Cloud Sync Active
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs text-zinc-400 dark:text-zinc-400">
                Your curated web insights
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* THEME TOGGLE BUTTON */}
            <div className="relative group">
              <button
                onClick={handleCycleThemeToggle}
                className="p-1.5 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg border border-zinc-200 dark:border-white/10 transition-all duration-150 flex items-center justify-center cursor-pointer"
              >
                {theme === "light" ? <Sun size={14} /> : <Moon size={14} />}
              </button>
              {/* TOOLTIP */}
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
        {!isPremium && (
          <footer className="p-3 bg-slate-100/90 dark:bg-zinc-900/80 border-t border-zinc-200 dark:border-white/10 backdrop-blur-md transition-colors duration-200">
            {!showForm ? (
              // [RENDER]: Original promotional card layout enhanced with multi-state trigger toggles
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
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    onClick={handleBuyClick}
                    className="bg-brand-500 hover:bg-brand-600 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg shadow transition-all duration-150 border-none cursor-pointer text-center"
                  >
                    Unlock
                  </button>
                  <button
                    onClick={() => setShowForm(true)}
                    className="text-[9px] font-medium text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors text-center bg-transparent border-none cursor-pointer underline decoration-dotted"
                  >
                    Enter Key
                  </button>
                </div>
              </div>
            ) : (
              // [RENDER]: Ultra-clean license validation submission micro-form
              <form
                onSubmit={handleVerifyLicense}
                className="bg-gradient-to-br from-white to-slate-50 dark:from-zinc-900 dark:to-black/40 p-3 rounded-xl border border-zinc-200 dark:border-white/10 space-y-2.5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-wide uppercase text-zinc-500 dark:text-zinc-400">
                    Gumroad License Key
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setStatusMsg(null);
                    }}
                    className="text-[10px] text-zinc-400 dark:text-zinc-500 hover:text-rose-500 border-none bg-transparent cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    disabled={isLoading}
                    placeholder="Paste license key..."
                    className="flex-1 bg-slate-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 dark:focus:border-blue-500/50 transition-all font-mono"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !licenseKey.trim()}
                    className="bg-brand-500 hover:bg-brand-600 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow disabled:opacity-40 transition-all duration-150 shrink-0 border-none cursor-pointer flex items-center justify-center min-w-[55px]"
                  >
                    {isLoading ? (
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Verify"
                    )}
                  </button>
                </div>
                {statusMsg && (
                  <p
                    className={`text-[10px] font-medium leading-tight ${statusMsg.isError ? "text-rose-500 dark:text-rose-400" : "text-emerald-500 dark:text-emerald-400"}`}
                  >
                    {statusMsg.text}
                  </p>
                )}
              </form>
            )}
          </footer>
        )}
      </div>
    </div>
  );
}
