// [INIT]: Import Dexie database instances for backend persistence pipelines
import { db } from "../shared/db";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-to-snipalt",
    title: "Save to SnipAlt Vault",
    contexts: ["selection"],
  });
});

// [HANDLER]: Context Menu saving pipeline routing straight to Dexie core
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "save-to-snipalt" && info.selectionText && tab) {
    const cleanText = info.selectionText.trim();

    // Write directly into extension database instance
    await db.clips.add({
      textContent: cleanText,
      sourceUrl: tab.url || "",
      pageTitle: tab.title || "Unknown Page",
      timestamp: Date.now(),
    });

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
        if (sendResponse) sendResponse({ success: true });
      });
    return true; // Keep connection active for async channel resolution
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
});
