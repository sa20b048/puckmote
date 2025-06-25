import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

// Sicherstellen, dass ein Element mit ID 'root' existiert
const container = document.getElementById("root");

if (!container) {
  throw new Error("Root container missing in index.html");
}

const root = createRoot(container); // 💡 React 18 API
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
