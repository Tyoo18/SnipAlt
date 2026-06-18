// [INIT]: Import Dexie database instances for backend persistence pipelines
import { db } from "../shared/db";
// [INIT]: Import initialized Supabase client singleton for cloud synchronization
import { supabase } from "../shared/supabaseClient";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-to-snipalt",
    title: "Save to SnipAlt Vault",
    contexts: ["selection"],
  });
});

// [UTIL]: Asynchronous background pipeline to mirror saved clips into Supabase cloud repository
async function syncClipToCloud(
  textContent: string,
  sourceUrl: string,
  pageTitle: string,
  timestamp: number,
) {
  // [FETCH]: Check if there is an active logged-in premium user session email stored locally
  const store = await chrome.storage.local.get("activeUserEmail");
  const userEmail = store.activeUserEmail;

  // [VALIDATE]: Securely abort cloud transmission if user is working locally / not authenticated
  if (!userEmail) return;

  // [FETCH]: Fire non-blocking insert payload directly into your Supabase clips database table
  await supabase.from("clips").insert({
    user_email: userEmail,
    text_content: textContent,
    source_url: sourceUrl,
    page_title: pageTitle,
    timestamp: timestamp,
  });
}

// [UTIL]: Asynchronous downstream pipeline to pull clips from cloud and populate local Dexie store
async function pullClipsFromCloud() {
  const store = await chrome.storage.local.get("activeUserEmail");
  const userEmail = store.activeUserEmail;

  if (!userEmail) return { success: false, message: "No active session found" };

  // [FETCH]: Query all rows from Supabase matched with active user email identifier
  const { data, error } = await supabase
    .from("clips")
    .select("*")
    .eq("user_email", userEmail)
    .order("timestamp", { ascending: false });

  if (error) return { success: false, error: error.message };

  if (data && data.length > 0) {
    // [FORMAT]: Standardize cloud object structures into local Dexie data schemas
    const formattedClips = data.map((clip) => ({
      textContent: clip.text_content,
      sourceUrl: clip.source_url,
      pageTitle: clip.page_title,
      timestamp: Number(clip.timestamp),
    }));

    // [PROCESS]: Clear local Dexie runtime stores to prevent duplicate primary key collisions
    await db.clips.clear();
    // [PROCESS]: Bulk load fresh hydrated remote array streams into offline storage
    await db.clips.bulkAdd(formattedClips);
  }

  return { success: true };
}

// [HANDLER]: Context Menu saving pipeline routing straight to Dexie core
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "save-to-snipalt" && info.selectionText && tab) {
    const cleanText = info.selectionText.trim();
    const now = Date.now();

    // Write directly into extension database instance
    await db.clips.add({
      textContent: cleanText,
      sourceUrl: tab.url || "",
      pageTitle: tab.title || "Unknown Page",
      timestamp: now,
    });

    // [UTIL]: Run background sync asynchronously without blocking main thread flow
    syncClipToCloud(cleanText, tab.url || "", tab.title || "Unknown Page", now);

    // Notify active content frames to render UI updates synchronously
    chrome.tabs.sendMessage(tab.id!, {
      type: "SNIPPET_CAPTURED",
      payload: { text: cleanText },
    });
  }
});

// [HANDLER]: Top level chrome action bar icon click toggle listeners
chrome.action.onClicked.addListener((tab) => {
  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_DOCK" });
  }
});

// [HANDLER]: Safe unified background interaction communications manager
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "OPEN_SIDEPANEL" && sender.tab?.id) {
    chrome.sidePanel.open({ tabId: sender.tab.id });
  } else if (message.type === "SAVE_CLIP" && message.payload) {
    // Intercept messages sent from Content Scripts and append directly to Dexie database
    db.clips
      .add({
        textContent: message.payload.textContent,
        sourceUrl: message.payload.sourceUrl,
        pageTitle: message.payload.pageTitle,
        timestamp: message.payload.timestamp,
      })
      .then(() => {
        // [UTIL]: Trigger cloud replication seamlessly right after local IndexedDB success resolution
        syncClipToCloud(
          message.payload.textContent,
          message.payload.sourceUrl,
          message.payload.pageTitle,
          message.payload.timestamp,
        );

        if (sendResponse) sendResponse({ success: true });
      });
    return true; // Keep connection active for async channel resolution
  }

  // [HANDLER]: Manual or automated sync command gateway initiated from SidePanel layer
  else if (message.type === "SYNC_FROM_CLOUD") {
    pullClipsFromCloud().then((result) => {
      sendResponse(result);
    });
    return true;
  }

  // [HANDLER]: Handle cloud sync premium activation securely via Gumroad API bypass
  else if (message.type === "VERIFY_LICENSE" && message.payload) {
    // [FETCH]: Execute background network request using accurate product_id and limit flags
    fetch("https://api.gumroad.com/v2/licenses/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: message.payload.productId,
        license_key: message.payload.licenseKey,
        increment_uses_count: true,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        // [VALIDATE]: Ensure license is authentic and not abused over active limits
        if (data.success && !data.uses_count_over_limit) {
          sendResponse({ success: true, data });
        } else {
          sendResponse({
            success: false,
            message: data.message || "Lisensi tidak valid atau limit habis.",
          });
        }
      })
      .catch(() => {
        // [UTIL]: Graceful fallback catch for network dropouts or timeout events
        sendResponse({
          success: false,
          message: "Gagal terhubung ke server Gumroad.",
        });
      });
    return true; // Keeps the async chrome gateway communication open
  }

  // [HANDLER]: Run native Google Account OAuth 2.0 authentication process flow
  else if (message.type === "GOOGLE_SIGN_IN") {
    // [FETCH]: Launch interactive Google login popup container via chrome identity
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError || !token) {
        // [VALIDATE]: Return precise error stack trace if token query aborts mid-flight
        sendResponse({
          success: false,
          message:
            chrome.runtime.lastError?.message || "Gagal mendapatkan token.",
        });
        return;
      }

      // [FETCH]: Fetch Google user profile details using retrieved authorization bearer token
      fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((profile) => {
          if (profile.email) {
            // [STATE]: FIX UTAMA — Bind dan capture email ke storage lokal agar background script tau status login aktif
            chrome.storage.local.set({ activeUserEmail: profile.email }, () => {
              // [CALC]: Langsung tarik data lama dari cloud untuk sinkronisasi awal pasca-login
              pullClipsFromCloud().then(() => {
                // [VALIDATE]: Kembalikan data user ke SidePanel UI
                sendResponse({
                  success: true,
                  user: {
                    email: profile.email,
                    name: profile.name || "Premium User",
                    picture: profile.picture || "",
                  },
                });
              });
            });
          } else {
            sendResponse({
              success: false,
              message: "Gagal memuat profil Google.",
            });
          }
        })
        .catch(() => {
          sendResponse({
            success: false,
            message: "Koneksi Google API terputus.",
          });
        });
    });
    return true; // Keep communication port open
  }

  // [HANDLER]: Clear and revoke cached active Google authentication credentials
  else if (message.type === "GOOGLE_SIGN_OUT") {
    // [FETCH]: Silent non-interactive check to grab cached tokens before purging
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (token) {
        // [UTIL]: Revoke token from Google identity provider cache pipelines
        chrome.identity.removeCachedAuthToken({ token }, () => {
          fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`, {
            method: "POST",
          })
            .then(() => {
              // [STATE]: Hapus email dari storage dan bersihkan Dexie lokal pas user logout
              chrome.storage.local.remove("activeUserEmail", () => {
                db.clips.clear().then(() => {
                  sendResponse({ success: true });
                });
              });
            })
            .catch(() => {
              chrome.storage.local.remove("activeUserEmail", () => {
                db.clips.clear().then(() => {
                  sendResponse({ success: true });
                });
              });
            });
        });
      } else {
        chrome.storage.local.remove("activeUserEmail", () => {
          db.clips.clear().then(() => {
            sendResponse({ success: true });
          });
        });
      }
    });
    return true;
  }
});
