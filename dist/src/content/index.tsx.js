import { createHotContext as __vite__createHotContext } from "/vendor/vite-client.js";import.meta.hot = __vite__createHotContext("/src/content/index.tsx.js");import __vite__cjsImport0_react_jsxDevRuntime from "/vendor/.vite-deps-react_jsx-dev-runtime.js__v--1724e9a0.js"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import * as RefreshRuntime from "/vendor/react-refresh.js";
const inWebWorker = typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
let prevRefreshReg;
let prevRefreshSig;
if (import.meta.hot && !inWebWorker) {
  if (!window.$RefreshReg$) {
    throw new Error(
      "@vitejs/plugin-react can't detect preamble. Something is wrong."
    );
  }
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("C:/Users/User/Desktop/NgodingVScode/Chrome EXT/snipalt/src/content/index.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}
var _s = $RefreshSig$(), _s2 = $RefreshSig$();
import __vite__cjsImport3_react from "/vendor/.vite-deps-react.js__v--1724e9a0.js"; const React = __vite__cjsImport3_react.__esModule ? __vite__cjsImport3_react.default : __vite__cjsImport3_react; const useEffect = __vite__cjsImport3_react["useEffect"]; const useState = __vite__cjsImport3_react["useState"];
import __vite__cjsImport4_reactDom_client from "/vendor/.vite-deps-react-dom_client.js__v--499dcbf0.js"; const ReactDOM = __vite__cjsImport4_reactDom_client.__esModule ? __vite__cjsImport4_reactDom_client.default : __vite__cjsImport4_reactDom_client;
import styleText from "/src/content/style.css__inline.js";
const Toast = ({ text, onClose }) => {
  _s();
  useEffect(() => {
    const timer = setTimeout(onClose, 3e3);
    return () => clearTimeout(timer);
  }, [onClose]);
  return /* @__PURE__ */ jsxDEV("div", { className: "snipalt-toast", children: /* @__PURE__ */ jsxDEV("div", { className: "snipalt-toast-content", children: [
    /* @__PURE__ */ jsxDEV("span", { className: "snipalt-toast-icon", children: "✨" }, void 0, false, {
      fileName: "C:/Users/User/Desktop/NgodingVScode/Chrome EXT/snipalt/src/content/index.tsx",
      lineNumber: 38,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "snipalt-toast-text", children: [
      /* @__PURE__ */ jsxDEV("strong", { children: "Saved to Vault" }, void 0, false, {
        fileName: "C:/Users/User/Desktop/NgodingVScode/Chrome EXT/snipalt/src/content/index.tsx",
        lineNumber: 40,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("p", { children: [
        text.substring(0, 50),
        text.length > 50 ? "..." : ""
      ] }, void 0, true, {
        fileName: "C:/Users/User/Desktop/NgodingVScode/Chrome EXT/snipalt/src/content/index.tsx",
        lineNumber: 41,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "C:/Users/User/Desktop/NgodingVScode/Chrome EXT/snipalt/src/content/index.tsx",
      lineNumber: 39,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "C:/Users/User/Desktop/NgodingVScode/Chrome EXT/snipalt/src/content/index.tsx",
    lineNumber: 37,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "C:/Users/User/Desktop/NgodingVScode/Chrome EXT/snipalt/src/content/index.tsx",
    lineNumber: 36,
    columnNumber: 5
  }, this);
};
_s(Toast, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = Toast;
const ContentApp = () => {
  _s2();
  const [activeToast, setActiveToast] = useState(null);
  useEffect(() => {
    const listener = (message) => {
      if (message.type === "SNIPPET_CAPTURED") {
        setActiveToast(message.payload.text);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);
  if (!activeToast) return null;
  return /* @__PURE__ */ jsxDEV(Toast, { text: activeToast, onClose: () => setActiveToast(null) }, void 0, false, {
    fileName: "C:/Users/User/Desktop/NgodingVScode/Chrome EXT/snipalt/src/content/index.tsx",
    lineNumber: 65,
    columnNumber: 5
  }, this);
};
_s2(ContentApp, "DVrCAJmi/G1Th4dD4JEKSLxFBqM=");
_c2 = ContentApp;
const rootElement = document.createElement("div");
rootElement.id = "snipalt-root";
document.body.appendChild(rootElement);
const shadowRoot = rootElement.attachShadow({ mode: "open" });
const shadowContainer = document.createElement("div");
shadowRoot.appendChild(shadowContainer);
const styleElement = document.createElement("style");
styleElement.textContent = styleText;
shadowRoot.appendChild(styleElement);
ReactDOM.createRoot(shadowContainer).render(
  /* @__PURE__ */ jsxDEV(React.StrictMode, { children: /* @__PURE__ */ jsxDEV(ContentApp, {}, void 0, false, {
    fileName: "C:/Users/User/Desktop/NgodingVScode/Chrome EXT/snipalt/src/content/index.tsx",
    lineNumber: 85,
    columnNumber: 5
  }, this) }, void 0, false, {
    fileName: "C:/Users/User/Desktop/NgodingVScode/Chrome EXT/snipalt/src/content/index.tsx",
    lineNumber: 84,
    columnNumber: 3
  }, this)
);
var _c, _c2;
$RefreshReg$(_c, "Toast");
$RefreshReg$(_c2, "ContentApp");
if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}
if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("C:/Users/User/Desktop/NgodingVScode/Chrome EXT/snipalt/src/content/index.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("C:/Users/User/Desktop/NgodingVScode/Chrome EXT/snipalt/src/content/index.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}
