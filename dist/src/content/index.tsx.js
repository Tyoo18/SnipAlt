import { createHotContext as __vite__createHotContext } from "/vendor/vite-client.js";import.meta.hot = __vite__createHotContext("/src/content/index.tsx.js");import __vite__cjsImport0_react_jsxDevRuntime from "/vendor/.vite-deps-react_jsx-dev-runtime.js__v--44d1a227.js"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
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
var _s = $RefreshSig$();
import __vite__cjsImport3_react from "/vendor/.vite-deps-react.js__v--44d1a227.js"; const React = __vite__cjsImport3_react.__esModule ? __vite__cjsImport3_react.default : __vite__cjsImport3_react; const useEffect = __vite__cjsImport3_react["useEffect"]; const useState = __vite__cjsImport3_react["useState"]; const useRef = __vite__cjsImport3_react["useRef"];
import __vite__cjsImport4_reactDom_client from "/vendor/.vite-deps-react-dom_client.js__v--876284a8.js"; const ReactDOM = __vite__cjsImport4_reactDom_client.__esModule ? __vite__cjsImport4_reactDom_client.default : __vite__cjsImport4_reactDom_client;
import { Layers, SidebarOpen, X } from "/vendor/.vite-deps-lucide-react.js__v--2710d507.js";
import styleText from "/src/content/style.css__inline.js";
const ContentApp = () => {
  _s();
  const [tempClips, setTempClips] = useState(() => {
    const savedSessionClips = sessionStorage.getItem("snipalt_workbench_clips");
    return savedSessionClips ? JSON.parse(savedSessionClips) : [];
  });
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [side, setSide] = useState("right");
  const [isSnapped, setIsSnapped] = useState(true);
  const windowRef = useRef(null);
  const timerRef = useRef(null);
  const dragPhysics = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: window.innerWidth - 48,
    currentY: 250,
    animFrameId: 0,
    hasMovedPassedThreshold: false
  });
  const sideRef = useRef(side);
  const isCollapsedRef = useRef(isCollapsed);
  const isSnappedRef = useRef(isSnapped);
  sideRef.current = side;
  isCollapsedRef.current = isCollapsed;
  isSnappedRef.current = isSnapped;
  const currentWidthWidth = isCollapsed ? 48 : 288;
  useEffect(() => {
    sessionStorage.setItem(
      "snipalt_workbench_clips",
      JSON.stringify(tempClips)
    );
  }, [tempClips]);
  const passToBackgroundStorageBridge = (text) => {
    chrome.runtime.sendMessage({
      type: "SAVE_CLIP",
      payload: {
        textContent: text,
        sourceUrl: window.location.href,
        pageTitle: document.title,
        timestamp: Date.now()
      }
    });
  };
  const updateWindowTransformStyles = () => {
    if (!windowRef.current) return;
    windowRef.current.style.transform = `translate3d(${dragPhysics.current.currentX}px, ${dragPhysics.current.currentY}px, 0)`;
  };
  const handleExpansionToggle = (targetCollapseState) => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (isSnappedRef.current && sideRef.current === "right") {
      const startingWidth = isCollapsedRef.current ? 48 : 288;
      const endingWidth = targetCollapseState ? 48 : 288;
      const adaptiveDeltaDiff = endingWidth - startingWidth;
      dragPhysics.current.currentX -= adaptiveDeltaDiff;
    } else if (isSnappedRef.current && sideRef.current === "left") {
      dragPhysics.current.currentX = 0;
    }
    setIsCollapsed(targetCollapseState);
    updateWindowTransformStyles();
    if (!targetCollapseState) {
      scheduleAutoCollapse(6e3);
    }
  };
  const scheduleAutoCollapse = (delayTime) => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      handleExpansionToggle(true);
    }, delayTime);
  };
  const handleDeleteLocalClip = (id) => {
    setTempClips((prev) => prev.filter((item) => item.id !== id));
  };
  useEffect(() => {
    const processLocalShortcutKeys = (e) => {
      if (e.altKey && (e.key === "s" || e.key === "S")) {
        const highlightedSelection = window.getSelection()?.toString()?.trim();
        if (!highlightedSelection) return;
        e.preventDefault();
        const constructedPayload = {
          id: Math.random().toString(36).substring(2, 9),
          text: highlightedSelection,
          timestamp: Date.now()
        };
        setTempClips((prev) => [constructedPayload, ...prev]);
        setIsVisible(true);
        handleExpansionToggle(false);
        passToBackgroundStorageBridge(highlightedSelection);
      }
    };
    window.addEventListener("keydown", processLocalShortcutKeys);
    return () => window.removeEventListener("keydown", processLocalShortcutKeys);
  }, []);
  useEffect(() => {
    const processInboundMessageStreams = (message) => {
      if (message.type === "SNIPPET_CAPTURED" && message.payload?.text) {
        const structuralPayload = {
          id: Math.random().toString(36).substring(2, 9),
          text: message.payload.text,
          timestamp: Date.now()
        };
        setTempClips((prev) => [structuralPayload, ...prev]);
        setIsVisible(true);
        handleExpansionToggle(false);
      } else if (message.type === "TOGGLE_DOCK") {
        setIsVisible((prev) => !prev);
        handleExpansionToggle(false);
      }
    };
    chrome.runtime.onMessage.addListener(processInboundMessageStreams);
    return () => chrome.runtime.onMessage.removeListener(processInboundMessageStreams);
  }, [tempClips]);
  useEffect(() => {
    const monitorOutsideClickLayouts = (e) => {
      const rootHostContainer = document.getElementById("snipalt-root");
      if (rootHostContainer && !rootHostContainer.shadowRoot?.contains(e.target) && !isCollapsedRef.current) {
        handleExpansionToggle(true);
      }
    };
    window.addEventListener("click", monitorOutsideClickLayouts);
    return () => window.removeEventListener("click", monitorOutsideClickLayouts);
  }, []);
  useEffect(() => {
    const handleScreenResizeAdjustment = () => {
      const horizontalLimitWidth = isCollapsedRef.current ? 48 : 288;
      const adaptiveTargetX = sideRef.current === "right" ? window.innerWidth - horizontalLimitWidth : 0;
      dragPhysics.current.currentX = adaptiveTargetX;
      updateWindowTransformStyles();
    };
    window.addEventListener("resize", handleScreenResizeAdjustment);
    return () => window.removeEventListener("resize", handleScreenResizeAdjustment);
  }, []);
  const handlePointerDownEngine = (e) => {
    if (e.target.closest("button") || e.target.closest(".content-box")) {
      return;
    }
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (windowRef.current) {
      windowRef.current.classList.add("is-dragging");
    }
    dragPhysics.current.isDragging = true;
    dragPhysics.current.startX = e.clientX - dragPhysics.current.currentX;
    dragPhysics.current.startY = e.clientY - dragPhysics.current.currentY;
    dragPhysics.current.hasMovedPassedThreshold = false;
    document.addEventListener("pointermove", handlePointerMoveEngine);
    document.addEventListener("pointerup", handlePointerUpEngine);
    e.target.setPointerCapture(e.pointerId);
    e.preventDefault();
  };
  const handlePointerMoveEngine = (e) => {
    if (!dragPhysics.current.isDragging) return;
    let deltaCalculatedX = e.clientX - dragPhysics.current.startX;
    let deltaCalculatedY = e.clientY - dragPhysics.current.startY;
    const constraintWidth = isCollapsedRef.current ? 48 : 288;
    const constraintHeight = isCollapsedRef.current ? 176 : 288;
    deltaCalculatedX = Math.max(
      0,
      Math.min(window.innerWidth - constraintWidth, deltaCalculatedX)
    );
    deltaCalculatedY = Math.max(
      16,
      Math.min(window.innerHeight - constraintHeight - 16, deltaCalculatedY)
    );
    if (!dragPhysics.current.hasMovedPassedThreshold) {
      dragPhysics.current.hasMovedPassedThreshold = true;
      setIsSnapped(false);
    }
    dragPhysics.current.currentX = deltaCalculatedX;
    dragPhysics.current.currentY = deltaCalculatedY;
    if (dragPhysics.current.animFrameId)
      cancelAnimationFrame(dragPhysics.current.animFrameId);
    dragPhysics.current.animFrameId = requestAnimationFrame(
      updateWindowTransformStyles
    );
  };
  const handlePointerUpEngine = (e) => {
    dragPhysics.current.isDragging = false;
    document.removeEventListener("pointermove", handlePointerMoveEngine);
    document.removeEventListener("pointerup", handlePointerUpEngine);
    if (windowRef.current) {
      windowRef.current.classList.remove("is-dragging");
    }
    const screenHorizontalMidpoint = window.innerWidth / 2;
    const terminalReleasePointX = e.clientX;
    const panelCurrentWidth = isCollapsedRef.current ? 48 : 288;
    let computedFinalTargetSide = "right";
    let automatedSnapLockCoordinateX = window.innerWidth - panelCurrentWidth;
    if (terminalReleasePointX < screenHorizontalMidpoint) {
      computedFinalTargetSide = "left";
      automatedSnapLockCoordinateX = 0;
    }
    setSide(computedFinalTargetSide);
    setIsSnapped(true);
    dragPhysics.current.currentX = automatedSnapLockCoordinateX;
    requestAnimationFrame(() => {
      updateWindowTransformStyles();
      if (!isCollapsedRef.current) {
        scheduleAutoCollapse(5e3);
      }
    });
  };
  const routeSidepanelActivation = () => {
    chrome.runtime.sendMessage({ type: "OPEN_SIDEPANEL" });
  };
  if (!isVisible) return null;
  return /* @__PURE__ */ jsxDEV(
    "div",
    {
      ref: windowRef,
      onPointerDown: handlePointerDownEngine,
      style: {
        width: `${currentWidthWidth}px`,
        transform: `translate3d(${dragPhysics.current.currentX}px, ${dragPhysics.current.currentY}px, 0)`
      },
      className: `fixed top-0 left-0 z-[2147483647] select-none text-slate-200 cursor-grab active:cursor-grabbing snipalt-window-container ${isSnapped ? "is-snapped" : "is-floating"} ${side === "right" ? "side-right" : "side-left"} ${isCollapsed ? "is-collapsed h-44" : "is-expanded h-72"}`,
      children: isCollapsed ? /* @__PURE__ */ jsxDEV(
        "div",
        {
          onClick: () => handleExpansionToggle(false),
          onMouseEnter: () => handleExpansionToggle(false),
          className: `w-full h-full flex flex-col items-center justify-center transition-colors hover:bg-zinc-950/40 ${side === "right" ? "rounded-l-2xl" : "rounded-r-2xl"}`,
          children: /* @__PURE__ */ jsxDEV("div", { className: "w-7 h-[148px] border border-white/5 rounded-xl flex flex-col items-center justify-center bg-zinc-900/40", children: [
            /* @__PURE__ */ jsxDEV(Layers, { size: 13, className: "text-blue-400 animate-pulse" }, void 0, false, {
              fileName: "C:/Users/User/Desktop/NgodingVScode/Chrome EXT/snipalt/src/content/index.tsx",
              lineNumber: 328,
              columnNumber: 13
            }, this),
            /* @__PURE__ */ jsxDEV("span", { className: "text-[10px] font-black text-white mt-1.5 tracking-tighter", children: tempClips.length }, void 0, false, {
              fileName: "C:/Users/User/Desktop/NgodingVScode/Chrome EXT/snipalt/src/content/index.tsx",
              lineNumber: 329,
              columnNumber: 13
            }, this)
          ] }, void 0, true, {
            fileName: "C:/Users/User/Desktop/NgodingVScode/Chrome EXT/snipalt/src/content/index.tsx",
            lineNumber: 327,
            columnNumber: 11
          }, this)
        },
        void 0,
        false,
        {
          fileName: "C:/Users/User/Desktop/NgodingVScode/Chrome EXT/snipalt/src/content/index.tsx",
          lineNumber: 320,
          columnNumber: 7
        },
        this
      ) : /* @__PURE__ */ jsxDEV("div", { className: "w-full h-full flex flex-col p-3 box-border", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between mb-2.5 overflow-visible", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-1.5 pl-0.5 pointer-events-none", children: [
            /* @__PURE__ */ jsxDEV(Layers, { size: 12, className: "text-blue-400" }, void 0, false, {
              fileName: "C:/Users/User/Desktop/NgodingVScode/Chrome EXT/snipalt/src/content/index.tsx",
              lineNumber: 338,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("span", { className: "text-[10px] font-bold uppercase tracking-wider text-zinc-400", children: "SnipAlt Workbench" }, void 0, false, {
              fileName: "C:/Users/User/Desktop/NgodingVScode/Chrome EXT/snipalt/src/content/index.tsx",
              lineNumber: 339,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "C:/Users/User/Desktop/NgodingVScode/Chrome EXT/snipalt/src/content/index.tsx",
            lineNumber: 337,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "snipalt-tooltip-trigger", children: [
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                onClick: routeSidepanelActivation,
                className: "p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md border border-white/10 flex items-center justify-center shadow-sm transition-all",
                children: /* @__PURE__ */ jsxDEV(SidebarOpen, { size: 13 }, void 0, false, {
                  fileName: "C:/Users/User/Desktop/NgodingVScode/Chrome EXT/snipalt/src/content/index.tsx",
                  lineNumber: 349,
                  columnNumber: 17
                }, this)
              },
              void 0,
              false,
              {
                fileName: "C:/Users/User/Desktop/NgodingVScode/Chrome EXT/snipalt/src/content/index.tsx",
                lineNumber: 345,
                columnNumber: 15
              },
              this
            ),
            /* @__PURE__ */ jsxDEV("div", { className: "snipalt-tooltip-card", children: "Open Permanent Vault Sidepanel" }, void 0, false, {
              fileName: "C:/Users/User/Desktop/NgodingVScode/Chrome EXT/snipalt/src/content/index.tsx",
              lineNumber: 351,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "C:/Users/User/Desktop/NgodingVScode/Chrome EXT/snipalt/src/content/index.tsx",
            lineNumber: 344,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Users/User/Desktop/NgodingVScode/Chrome EXT/snipalt/src/content/index.tsx",
          lineNumber: 336,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "content-box flex-1 border border-white/5 rounded-xl bg-zinc-950/90 overflow-y-auto p-2.5 space-y-2 select-text cursor-auto", children: tempClips.length === 0 ? /* @__PURE__ */ jsxDEV("div", { className: "text-[10px] text-zinc-500 text-center pt-8 italic", children: "No active clips in this session." }, void 0, false, {
          fileName: "C:/Users/User/Desktop/NgodingVScode/Chrome EXT/snipalt/src/content/index.tsx",
          lineNumber: 360,
          columnNumber: 11
        }, this) : tempClips.map(
          (clipItem) => /* @__PURE__ */ jsxDEV(
            "div",
            {
              className: "group relative bg-zinc-900/40 border border-white/5 p-2 rounded-lg text-[11px] text-zinc-300 leading-relaxed select-text",
              children: [
                /* @__PURE__ */ jsxDEV("div", { className: "pr-4", children: [
                  '"',
                  clipItem.text,
                  '"'
                ] }, void 0, true, {
                  fileName: "C:/Users/User/Desktop/NgodingVScode/Chrome EXT/snipalt/src/content/index.tsx",
                  lineNumber: 369,
                  columnNumber: 19
                }, this),
                /* @__PURE__ */ jsxDEV(
                  "button",
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      handleDeleteLocalClip(clipItem.id);
                    },
                    className: "absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 p-0.5 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-all cursor-pointer border-none bg-transparent flex items-center justify-center",
                    title: "Delete session clip",
                    children: /* @__PURE__ */ jsxDEV(X, { size: 15 }, void 0, false, {
                      fileName: "C:/Users/User/Desktop/NgodingVScode/Chrome EXT/snipalt/src/content/index.tsx",
                      lineNumber: 378,
                      columnNumber: 21
                    }, this)
                  },
                  void 0,
                  false,
                  {
                    fileName: "C:/Users/User/Desktop/NgodingVScode/Chrome EXT/snipalt/src/content/index.tsx",
                    lineNumber: 370,
                    columnNumber: 19
                  },
                  this
                )
              ]
            },
            clipItem.id,
            true,
            {
              fileName: "C:/Users/User/Desktop/NgodingVScode/Chrome EXT/snipalt/src/content/index.tsx",
              lineNumber: 365,
              columnNumber: 11
            },
            this
          )
        ) }, void 0, false, {
          fileName: "C:/Users/User/Desktop/NgodingVScode/Chrome EXT/snipalt/src/content/index.tsx",
          lineNumber: 358,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Users/User/Desktop/NgodingVScode/Chrome EXT/snipalt/src/content/index.tsx",
        lineNumber: 335,
        columnNumber: 7
      }, this)
    },
    void 0,
    false,
    {
      fileName: "C:/Users/User/Desktop/NgodingVScode/Chrome EXT/snipalt/src/content/index.tsx",
      lineNumber: 306,
      columnNumber: 5
    },
    this
  );
};
_s(ContentApp, "6Y444ELCShiOiBh1uVMgTywHDGk=");
_c = ContentApp;
const initSnipAltDock = () => {
  if (document.getElementById("snipalt-root")) return;
  const nativeHostNode = document.createElement("div");
  nativeHostNode.id = "snipalt-root";
  if (!document.body) {
    document.documentElement.appendChild(nativeHostNode);
  } else {
    document.body.appendChild(nativeHostNode);
  }
  const virtualShadowRoot = nativeHostNode.attachShadow({ mode: "open" });
  const appContainerMount = document.createElement("div");
  virtualShadowRoot.appendChild(appContainerMount);
  const runtimeEmbeddedStyle = document.createElement("style");
  runtimeEmbeddedStyle.textContent = styleText;
  virtualShadowRoot.appendChild(runtimeEmbeddedStyle);
  ReactDOM.createRoot(appContainerMount).render(
    /* @__PURE__ */ jsxDEV(React.StrictMode, { children: /* @__PURE__ */ jsxDEV(ContentApp, {}, void 0, false, {
      fileName: "C:/Users/User/Desktop/NgodingVScode/Chrome EXT/snipalt/src/content/index.tsx",
      lineNumber: 412,
      columnNumber: 7
    }, this) }, void 0, false, {
      fileName: "C:/Users/User/Desktop/NgodingVScode/Chrome EXT/snipalt/src/content/index.tsx",
      lineNumber: 411,
      columnNumber: 5
    }, this)
  );
};
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSnipAltDock);
} else {
  initSnipAltDock();
}
var _c;
$RefreshReg$(_c, "ContentApp");
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
