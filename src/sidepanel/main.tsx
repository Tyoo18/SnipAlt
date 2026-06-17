// [INIT]: Import React core and SidePanel root view
import React from "react";
import ReactDOM from "react-dom/client";
import SidePanel from "./components/SidePanel";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SidePanel />
  </React.StrictMode>,
);
