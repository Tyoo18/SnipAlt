import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import styleText from "./style.css?inline";

interface CapturedMessage {
  type: "SNIPPET_CAPTURED";
  payload: { text: string };
}

const Toast = ({ text, onClose }: { text: string; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="snipalt-toast">
      <div className="snipalt-toast-content">
        <span className="snipalt-toast-icon">✨</span>
        <div className="snipalt-toast-text">
          <strong>Saved to Vault</strong>
          <p>{text.substring(0, 50)}{text.length > 50 ? "..." : ""}</p>
        </div>
      </div>
    </div>
  );
};

const ContentApp = () => {
  const [activeToast, setActiveToast] = useState<string | null>(null);

  useEffect(() => {
    const listener = (message: CapturedMessage) => {
      if (message.type === "SNIPPET_CAPTURED") {
        setActiveToast(message.payload.text);
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  if (!activeToast) return null;

  return (
    <Toast text={activeToast} onClose={() => setActiveToast(null)} />
  );
};

// Create a shadow DOM to avoid style leakage
const rootElement = document.createElement("div");
rootElement.id = "snipalt-root";
document.body.appendChild(rootElement);

const shadowRoot = rootElement.attachShadow({ mode: "open" });
const shadowContainer = document.createElement("div");
shadowRoot.appendChild(shadowContainer);

// Inject styles into shadow DOM
const styleElement = document.createElement("style");
styleElement.textContent = styleText;
shadowRoot.appendChild(styleElement);

ReactDOM.createRoot(shadowContainer).render(
  <React.StrictMode>
    <ContentApp />
  </React.StrictMode>
);
