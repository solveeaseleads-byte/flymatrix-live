import React from "react";
import { createRoot } from "react-dom/client";

const rootElement = document.getElementById("root");

if (!rootElement) {
  document.body.innerHTML = "<h1>ERROR: #root was not found</h1>";
} else {
  createRoot(rootElement).render(
    <div
      style={{
        minHeight: "100vh",
        padding: "40px",
        background: "#f8fafc",
        color: "#111827",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <h1>FlyMatrix React Test</h1>
      <p>React mounted successfully.</p>
    </div>
  );
}
