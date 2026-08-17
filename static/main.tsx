import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SpendVeilDemo } from "../app/SpendVeilDemo";
import "../app/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SpendVeilDemo />
  </StrictMode>,
);
