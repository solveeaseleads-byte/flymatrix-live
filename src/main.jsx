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
      <h1>FLYMATRIX REACT WORKS</h1>
      <p>React module execution is working correctly.</p>
    </div>
  );
}
