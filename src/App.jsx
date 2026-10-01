import React from "react";

import AppRouter from "./router/AppRouter.jsx";
import Header from "./components/layout/header.jsx";

export default function App() {
  return (
    <div className="fm-app">
      <Header />

      <main>
        <AppRouter />
      </main>
    </div>
  );
}
