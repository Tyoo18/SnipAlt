// [INIT]: Initialize context menu entry systems on extension installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "snipalt-capture-selection",
    title: "Save to SnipAlt Vault",
    contexts: ["selection"],
  });
});

// [HANDLER]: Intercept context menu clicks and bridge payloads down to active content script tab
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (
    info.menuItemId === "snipalt-capture-selection" &&
    info.selectionText &&
    tab?.id
  ) {
    chrome.tabs.sendMessage(tab.id, {
      type: "SNIPPET_CAPTURED",
      payload: { text: info.selectionText.trim() },
    });
  }
});

// [HANDLER]: Listen for external UI commands to manage Side Panel triggers seamlessly
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "OPEN_SIDEPANEL") {
    // Open standard side panel engine container
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.sidePanel.open({ tabId: tabs[0].id });
      }
    });
  }
});
