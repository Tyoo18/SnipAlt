// [INIT]: Import database instance to store incoming insights[cite: 2]
import { db } from "../shared/db";

// [CONFIG]: Configure Side Panel to open automatically on extension icon click
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error("Failed to set panel behavior:", error));

// [HANDLER]: Listen to global Chrome command shortcuts (Alt + S)[cite: 2]
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "capture-snippet") {
    try {
      // [FETCH]: Get the current active tab to extract page metadata[cite: 2]
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab || !tab.id) return;

      // [PROCESS]: Execute script on active tab to get selected text safely[cite: 2]
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.getSelection()?.toString() || "",
      });

      if (!results || !results[0]) return;

      const selectedText = (results[0].result as string)?.trim();

      // Prevent saving empty clips if user presses shortcut without highlighting text[cite: 2]
      if (!selectedText) return;

      // [SAVE]: Commit metadata and clean text into IndexedDB via Dexie[cite: 2]
      await db.clips.add({
        textContent: selectedText,
        sourceUrl: tab.url || "",
        pageTitle: tab.title || "Unknown Page",
        timestamp: Date.now(),
      });

      // [MESSAGE]: Notify Content Script to trigger the Floating Window animation[cite: 2]
      chrome.tabs
        .sendMessage(tab.id, {
          type: "SNIPPET_CAPTURED",
          payload: { text: selectedText },
        })
        .catch(() => {
          // Ignore error if content script hasn't injected yet on old tabs[cite: 2]
        });
    } catch (err) {
      console.error("Failed to process snippet capture:", err); //[cite: 2]
    }
  }
});
