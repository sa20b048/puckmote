import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App"; // ✅ match export style

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App />);
