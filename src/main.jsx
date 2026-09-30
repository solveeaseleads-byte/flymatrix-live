import React from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";
import "./globals.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error(
    "FlyMatrix: the React root element (#root) was not found."
  );
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
