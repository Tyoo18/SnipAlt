// [INIT]: Import layout rendering dependencies and Dexie database modules
import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../shared/db";
import { type ClipData, type UserProfile } from "../../shared/types";
import {
  Trash2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  FolderHeart,
  Sun,
  Moon,
  Cloud,
  LogOut,
  RefreshCw, // Added for manual sync
} from "lucide-react";
// 1. Add the supabase import at the top of your imports
import { supabase } from "../../shared/supabaseClient"; // Ensure path is correct

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

  // [STATE]: User Google profile authentication states
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // [STATE]: Manual sync loading indicator
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  const clips = useLiveQuery(() =>
    db.clips.orderBy("timestamp").reverse().toArray(),
  );

  // [INIT]: Fetch initial user theme preference, premium status, and profile from local storage
  useEffect(() => {
    // [UTIL]: Core routine to resolve dark class mapping
    const updateResolvedDarkState = (currentTheme: "light" | "dark") => {
      setResolvedDark(currentTheme === "dark");
    };

    chrome.storage.local.get(
      ["snipalt_theme", "snipalt_is_premium", "snipalt_user_profile"],
      (result) => {
        const persistentTheme =
          result.snipalt_theme === "light" ? "light" : "dark";
        setTheme(persistentTheme);
        updateResolvedDarkState(persistentTheme);

        if (result.snipalt_is_premium) {
          setIsPremium(true);
        }
        if (result.snipalt_user_profile) {
          setUser(result.snipalt_user_profile);

          // ✨ NEW: Silently catch up and sync from cloud right when sidepanel opens
          chrome.runtime.sendMessage({ type: "SYNC_FROM_CLOUD" });
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
      if (changes.snipalt_user_profile) {
        setUser(changes.snipalt_user_profile.newValue || null);
      }
    };

    chrome.storage.onChanged.addListener(handleGlobalStorageChanges);

    return () => {
      chrome.storage.onChanged.removeListener(handleGlobalStorageChanges);
    };
  }, []);

  // 3. NEW FEATURE: Realtime auto-update synchronization effect engine
  useEffect(() => {
    // Only subscribe if the user is verified premium and authenticated
    if (!isPremium || !user?.email) return;

    // // [INIT]: Establish a premium real-time listening pipeline for database changes
    const cloudSyncChannel = supabase
      .channel("live-clips-sync")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "clips",
          filter: `user_email=eq.${user.email}`, // Safely isolate this user's data stream
        },
        async (payload) => {
          const remoteClip = payload.new;

          // Deduplicate: check if this clip already exists locally in Dexie
          const isDuplicate = await db.clips
            .where("timestamp")
            .equals(Number(remoteClip.timestamp))
            .first();

          if (!isDuplicate) {
            // [PROCESS]: Silently append the incoming remote row into offline Dexie storage
            await db.clips.add({
              textContent: remoteClip.text_content,
              sourceUrl: remoteClip.source_url,
              pageTitle: remoteClip.page_title,
              timestamp: Number(remoteClip.timestamp),
            });
          }
        },
      )
      .subscribe();

    // Clean up subscription channel when SidePanel closes
    return () => {
      supabase.removeChannel(cloudSyncChannel);
    };
  }, [isPremium, user?.email]);

  // [HANDLER]: Cycle internal states sequentially light <-> dark (2‑way)
  const handleCycleThemeToggle = () => {
    const progressiveTheme = theme === "light" ? "dark" : "light";

    setTheme(progressiveTheme);
    chrome.storage.local.set({ snipalt_theme: progressiveTheme });
    setResolvedDark(progressiveTheme === "dark");
  };

  // [HANDLER]: Manual cloud sync trigger
  const handleForceSync = () => {
    if (!isPremium || !user) return;
    setIsManualSyncing(true);
    chrome.runtime.sendMessage({ type: "SYNC_FROM_CLOUD" }, () => {
      setTimeout(() => {
        setIsManualSyncing(false);
      }, 600);
    });
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

  // [HANDLER]: Execute Google OAuth background process via runtime messenger channels
  const handleGoogleSignIn = () => {
    setAuthLoading(true);
    chrome.runtime.sendMessage({ type: "GOOGLE_SIGN_IN" }, (response) => {
      setAuthLoading(false);
      if (response && response.success && response.user) {
        chrome.storage.local.set(
          { snipalt_user_profile: response.user },
          () => {
            setUser(response.user);
          },
        );
      } else {
        alert(response?.message || "Gagal masuk menggunakan Google.");
      }
    });
  };

  // [HANDLER]: Wipe Google authorization sessions out of memory and state pipelines
  const handleGoogleSignOut = () => {
    chrome.runtime.sendMessage({ type: "GOOGLE_SIGN_OUT" }, (response) => {
      if (response && response.success) {
        chrome.storage.local.remove("snipalt_user_profile", () => {
          setUser(null);
        });
      }
    });
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

            {/* MANUAL SYNC BUTTON - only for premium authenticated users */}
            {isPremium && user && (
              <button
                onClick={handleForceSync}
                disabled={isManualSyncing}
                className="p-1.5 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-lg border border-zinc-200 dark:border-white/10 transition-all duration-150 flex items-center justify-center cursor-pointer disabled:opacity-40"
                title="Sync with Cloud"
              >
                <RefreshCw
                  size={14}
                  className={
                    isManualSyncing
                      ? "animate-spin text-blue-500 dark:text-blue-400"
                      : ""
                  }
                />
              </button>
            )}

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

        {/* [STYLE]: Refactored dual-state footer management boundary */}
        {isPremium ? (
          // [RENDER]: Ultra-clean premium management dashboard footer area
          <footer className="p-3 bg-white/80 dark:bg-zinc-900/60 border-t border-zinc-200 dark:border-white/10 backdrop-blur-md transition-colors duration-200">
            {user ? (
              <div className="flex items-center justify-between bg-slate-100/50 dark:bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-200 dark:border-white/5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-7 h-7 rounded-full border border-zinc-300 dark:border-white/10 bg-zinc-800 shrink-0 object-cover shadow-sm"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-bold text-zinc-800 dark:text-slate-200 truncate">
                      {user.name}
                    </span>
                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500 truncate leading-tight">
                      {user.email}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[9px] bg-blue-500/10 text-blue-500 dark:text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/10 font-semibold tracking-wide uppercase">
                    Synced
                  </span>
                  <button
                    onClick={handleGoogleSignOut}
                    className="p-1.5 text-zinc-400 dark:text-zinc-500 hover:text-rose-500 dark:hover:text-rose-400 bg-transparent border-none cursor-pointer rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-900 transition-all"
                    title="Sign Out"
                  >
                    <LogOut size={12} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4 p-1">
                <div className="flex items-center gap-1.5">
                  <Cloud
                    size={14}
                    className="text-blue-500 dark:text-blue-400 animate-pulse"
                  />
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                    Backup cloud disconnected
                  </span>
                </div>
                {/* UPDATED GOOGLE SIGN-IN BUTTON – dark styling for both themes */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={authLoading}
                  className="bg-blue-500 hover:bg-zinc-800 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow transition-all duration-150 cursor-pointer shrink-0 disabled:opacity-50 flex items-center gap-1 border-none"
                >
                  {authLoading ? (
                    <span className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-100 rounded-full animate-spin" />
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 text-white fill-current shrink-0"
                        viewBox="0 0 24 24"
                      >
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      Login
                    </>
                  )}
                </button>
              </div>
            )}
          </footer>
        ) : (
          <footer className="p-3 bg-slate-100/90 dark:bg-zinc-900/80 border-t border-zinc-200 dark:border-white/10 backdrop-blur-md transition-colors duration-200">
            {!showForm ? (
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
