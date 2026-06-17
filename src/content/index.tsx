// [INIT]: Import layout rendering dependencies and asset style modules
import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom/client";
import { Layers, SidebarOpen } from "lucide-react";
import styleText from "./style.css?inline";

// [INIT]: Define interface schemas for captured text clips
interface TemporaryClip {
  id: string;
  text: string;
}

const ContentApp = () => {
  // [STATE]: Structural state definitions designed for structural view toggles
  const [tempClips, setTempClips] = useState<TemporaryClip[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [side, setSide] = useState<"left" | "right">("right");
  const [isSnapped, setIsSnapped] = useState(true);

  // [INIT]: Component DOM and scheduling reference nodes configuration
  const windowRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);

  // High fidelity interaction physics memory bypass registry
  const dragPhysics = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: window.innerWidth - 48,
    currentY: 250,
    animFrameId: 0,
    hasMovedPassedThreshold: false,
  });

  const sideRef = useRef(side);
  const isCollapsedRef = useRef(isCollapsed);
  const isSnappedRef = useRef(isSnapped);

  // Keep references synced directly to eliminate async state stale reads
  sideRef.current = side;
  isCollapsedRef.current = isCollapsed;
  isSnappedRef.current = isSnapped;

  const currentWidthWidth = isCollapsed ? 48 : 288;

  // [HANDLER]: Global duration auto-collapse orchestration routine
  const scheduleAutoCollapse = (delayTime: number) => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setIsCollapsed(true);
    }, delayTime);
  };

  // [HANDLER]: Hardware-accelerated position frame flush pipeline
  const updateWindowTransformStyles = () => {
    if (!windowRef.current) return;
    windowRef.current.style.transform = `translate3d(${dragPhysics.current.currentX}px, ${dragPhysics.current.currentY}px, 0)`;
  };

  // [HANDLER]: High-performance adaptive layout dimension toggle sync engine
  const handleExpansionToggle = (targetCollapseState: boolean) => {
    if (timerRef.current) window.clearTimeout(timerRef.current);

    // [CALC]: Recalculate horizontal vector arrays matching expansion source directions
    if (isSnappedRef.current && sideRef.current === "right") {
      const startingWidth = isCollapsedRef.current ? 48 : 288;
      const endingWidth = targetCollapseState ? 48 : 288;
      const adaptiveDeltaDiff = endingWidth - startingWidth;

      // Shift leftwards when expanding from right side edge to preserve look bounds
      dragPhysics.current.currentX -= adaptiveDeltaDiff;
    } else if (isSnappedRef.current && sideRef.current === "left") {
      dragPhysics.current.currentX = 0; // Lock perfectly flush down to zero pixels margin
    }

    setIsCollapsed(targetCollapseState);
    updateWindowTransformStyles();

    if (!targetCollapseState) {
      scheduleAutoCollapse(6000);
    }
  };

  // [HANDLER]: Core Engine Shortcut listener processing Alt+S text inputs
  useEffect(() => {
    const processLocalShortcutKeys = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "s" || e.key === "S")) {
        const highlightedSelection = window.getSelection()?.toString()?.trim();
        if (!highlightedSelection) return;

        e.preventDefault();
        const constructedPayload: TemporaryClip = {
          id: Math.random().toString(36).substring(2, 9),
          text: highlightedSelection,
        };

        setTempClips((prev) => [...prev, constructedPayload]);
        setIsVisible(true);
        handleExpansionToggle(false);
      }
    };
    window.addEventListener("keydown", processLocalShortcutKeys);
    return () =>
      window.removeEventListener("keydown", processLocalShortcutKeys);
  }, []);

  // [HANDLER]: Handle runtime message delivery originating from Background processes
  useEffect(() => {
    const processInboundMessageStreams = (message: any) => {
      if (message.type === "SNIPPET_CAPTURED" && message.payload?.text) {
        const structuralPayload: TemporaryClip = {
          id: Math.random().toString(36).substring(2, 9),
          text: message.payload.text,
        };
        setTempClips((prev) => [...prev, structuralPayload]);
        setIsVisible(true);
        handleExpansionToggle(false);
      } else if (message.type === "TOGGLE_DOCK") {
        if (tempClips.length === 0) {
          setTempClips([
            {
              id: "placeholder",
              text: "Highlight text on any website and press Alt+S to clip insights!",
            },
          ]);
        }
        setIsVisible((prev) => !prev);
        handleExpansionToggle(false);
      }
    };

    chrome.runtime.onMessage.addListener(processInboundMessageStreams);
    return () =>
      chrome.runtime.onMessage.removeListener(processInboundMessageStreams);
  }, [tempClips]);

  // [HANDLER]: Outside viewport click listener designed to auto-collapse workbench
  useEffect(() => {
    const monitorOutsideClickLayouts = (e: MouseEvent) => {
      const rootHostContainer = document.getElementById("snipalt-root");
      if (
        rootHostContainer &&
        !rootHostContainer.shadowRoot?.contains(e.target as Node) &&
        !isCollapsedRef.current
      ) {
        handleExpansionToggle(true);
      }
    };
    window.addEventListener("click", monitorOutsideClickLayouts);
    return () =>
      window.removeEventListener("click", monitorOutsideClickLayouts);
  }, []);

  // [HANDLER]: Responsive browser window adjustments pipeline lock
  useEffect(() => {
    const handleScreenResizeAdjustment = () => {
      const horizontalLimitWidth = isCollapsedRef.current ? 48 : 288;
      const adaptiveTargetX =
        sideRef.current === "right"
          ? window.innerWidth - horizontalLimitWidth
          : 0;

      dragPhysics.current.currentX = adaptiveTargetX;
      updateWindowTransformStyles();
    };
    window.addEventListener("resize", handleScreenResizeAdjustment);
    return () =>
      window.removeEventListener("resize", handleScreenResizeAdjustment);
  }, []);

  // [HANDLER]: Multi-device hardware pointer capture sequence triggers
  const handlePointerDownEngine = (e: React.PointerEvent) => {
    if (
      (e.target as HTMLElement).closest("button") ||
      (e.target as HTMLElement).closest(".content-box")
    ) {
      return;
    }

    if (timerRef.current) window.clearTimeout(timerRef.current);

    dragPhysics.current.isDragging = true;
    dragPhysics.current.startX = e.clientX - dragPhysics.current.currentX;
    dragPhysics.current.startY = e.clientY - dragPhysics.current.currentY;
    dragPhysics.current.hasMovedPassedThreshold = false;

    document.addEventListener("pointermove", handlePointerMoveEngine);
    document.addEventListener("pointerup", handlePointerUpEngine);

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const handlePointerMoveEngine = (e: PointerEvent) => {
    if (!dragPhysics.current.isDragging) return;

    let deltaCalculatedX = e.clientX - dragPhysics.current.startX;
    let deltaCalculatedY = e.clientY - dragPhysics.current.startY;

    const constraintWidth = isCollapsedRef.current ? 48 : 288;
    const constraintHeight = isCollapsedRef.current ? 176 : 288;

    deltaCalculatedX = Math.max(
      0,
      Math.min(window.innerWidth - constraintWidth, deltaCalculatedX),
    );
    deltaCalculatedY = Math.max(
      16,
      Math.min(window.innerHeight - constraintHeight - 16, deltaCalculatedY),
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
      updateWindowTransformStyles,
    );
  };

  const handlePointerUpEngine = (e: PointerEvent) => {
    dragPhysics.current.isDragging = false;
    document.removeEventListener("pointermove", handlePointerMoveEngine);
    document.removeEventListener("pointerup", handlePointerUpEngine);

    const screenHorizontalMidpoint = window.innerWidth / 2;
    const terminalReleasePointX = e.clientX;
    const panelCurrentWidth = isCollapsedRef.current ? 48 : 288;

    let computedFinalTargetSide: "left" | "right" = "right";
    let automatedSnapLockCoordinateX = window.innerWidth - panelCurrentWidth;

    if (terminalReleasePointX < screenHorizontalMidpoint) {
      computedFinalTargetSide = "left";
      automatedSnapLockCoordinateX = 0; // Absolute 0px gap lock
    }

    setSide(computedFinalTargetSide);
    setIsSnapped(true);

    dragPhysics.current.currentX = automatedSnapLockCoordinateX;

    requestAnimationFrame(() => {
      updateWindowTransformStyles();
      if (!isCollapsedRef.current) {
        scheduleAutoCollapse(5000);
      }
    });
  };

  const routeSidepanelActivation = () => {
    chrome.runtime.sendMessage({ type: "OPEN_SIDEPANEL" });
  };

  if (!isVisible || tempClips.length === 0) return null;

  return (
    <div
      ref={windowRef}
      onPointerDown={handlePointerDownEngine}
      style={{
        width: `${currentWidthWidth}px`,
        transform: `translate3d(${dragPhysics.current.currentX}px, ${dragPhysics.current.currentY}px, 0)`,
      }}
      className={`fixed top-0 left-0 z-[2147483647] select-none font-sans text-slate-200 cursor-grab active:cursor-grabbing snipalt-window-container ${
        isSnapped ? "is-snapped" : "is-floating"
      } ${side === "right" ? "side-right" : "side-left"} ${
        isCollapsed ? "is-collapsed h-44" : "is-expanded h-72"
      }`}
    >
      {isCollapsed ? (
        /* ========================================================
           COMPACT VIEW WORKBENCH NODE (TRUE PITCH BLACK)
           ======================================================== */
        <div
          onClick={() => handleExpansionToggle(false)}
          onMouseEnter={() => handleExpansionToggle(false)}
          className={`w-full h-full flex flex-col items-center justify-center transition-colors hover:bg-zinc-950/40 ${
            side === "right" ? "rounded-l-2xl" : "rounded-r-2xl"
          }`}
        >
          <div className="w-7 h-[148px] border border-white/5 rounded-xl flex flex-col items-center justify-center bg-zinc-900/40">
            <Layers size={13} className="text-blue-400 animate-pulse" />
            <span className="text-[10px] font-black text-white mt-1.5 tracking-tighter">
              {tempClips.length}
            </span>
          </div>
        </div>
      ) : (
        /* ========================================================
           EXPANDED VIEW PANEL SCREEN INTERFACE 
           ======================================================== */
        <div className="w-full h-full flex flex-col p-3 box-border">
          {/* HEADER HEADER CAPTURE CONTROLS ROW */}
          <div className="flex items-center justify-between mb-2.5 overflow-visible">
            <div className="flex items-center gap-1.5 pl-0.5 pointer-events-none">
              <Layers size={12} className="text-blue-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                SnipAlt Workbench
              </span>
            </div>

            {/* NAKED ICON ONLY BUTTON + PREMIUM TOOLTIP */}
            <div className="snipalt-tooltip-trigger">
              <button
                onClick={routeSidepanelActivation}
                className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md border border-white/10 flex items-center justify-center shadow-sm transition-all"
              >
                <SidebarOpen size={13} />
              </button>
              <div className="snipalt-tooltip-card">
                Open Permanent Vault Sidepanel
              </div>
            </div>
          </div>

          {/* ACTIVE CONTENT SELECTION SCROLL BOX */}
          <div className="content-box flex-1 border border-white/5 rounded-xl bg-zinc-950/90 overflow-y-auto p-2.5 space-y-2 select-text cursor-auto">
            {tempClips.map((clipItem) => (
              <div
                key={clipItem.id}
                className="bg-zinc-900/40 border border-white/5 p-2 rounded-lg text-[11px] text-zinc-300 leading-relaxed select-text"
              >
                "{clipItem.text}"
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// [INIT]: Safe DOM Mounting Entrypoint with defensive checks to prevent null body crashes
const initSnipAltDock = () => {
  // Prevent duplicate injection if hot reload triggers multiple times
  if (document.getElementById("snipalt-root")) return;

  const nativeHostNode = document.createElement("div");
  nativeHostNode.id = "snipalt-root";

  // Defensive fallback: if body is not ready, append to documentElement safely
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

  // [RENDER]: Mount full architecture engines safely inside verified virtual roots
  ReactDOM.createRoot(appContainerMount).render(
    <React.StrictMode>
      <ContentApp />
    </React.StrictMode>,
  );
};

// [UTIL]: Orchestrate loading states to survive early execution phases
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSnipAltDock);
} else {
  initSnipAltDock();
}
