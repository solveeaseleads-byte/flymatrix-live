import React, { useEffect, useState } from "react";

import AppRouter, {
  usePath,
} from "./router/AppRouter.jsx";

import Header from "./components/layout/header.jsx";

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    try {
      const stored = window.localStorage.getItem(
        "flymatrix-dark-mode"
      );

      if (stored === "true") {
        return true;
      }

      if (stored === "false") {
        return false;
      }
    } catch {
      // Ignore localStorage errors.
    }

    return (
      window.matchMedia?.(
        "(prefers-color-scheme: dark)"
      ).matches || false
    );
  });

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      dark
    );

    try {
      window.localStorage.setItem(
        "flymatrix-dark-mode",
        String(dark)
      );
    } catch {
      // Ignore localStorage errors.
    }
  }, [dark]);

  return [dark, setDark];
}

export default function App() {
  const { pathname } = usePath();

  const [dark, setDark] = useDarkMode();

  return (
    <div className="fm-app">
      <Header
        pathname={pathname}
        dark={dark}
        onToggleDark={() =>
          setDark((current) => !current)
        }
      />

      <main>
        <AppRouter />
      </main>
    </div>
  );
}
