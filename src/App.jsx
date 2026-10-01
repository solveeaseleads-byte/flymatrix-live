import React, {
  useEffect,
  useState,
} from "react";

import AppRouter, {
  usePath,
} from "./router/AppRouter.jsx";

import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import MobileNavigation from "./components/MobileNavigation.jsx";

/* =========================================================
   DARK MODE
========================================================= */

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    if (
      typeof window === "undefined"
    ) {
      return false;
    }

    try {
      const stored =
        window.localStorage.getItem(
          "flymatrix-dark-mode"
        );

      if (stored === "true") {
        return true;
      }

      if (stored === "false") {
        return false;
      }
    } catch {
      // localStorage may be unavailable.
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
      // Ignore unavailable localStorage.
    }
  }, [dark]);

  return [dark, setDark];
}

/* =========================================================
   APP
========================================================= */

export default function App() {
  const {
    pathname,
    search,
  } = usePath();

  const [dark, setDark] =
    useDarkMode();

  return (
    <div className="fm-app">
      <Header
        pathname={pathname}
        dark={dark}
        onToggleDark={() =>
          setDark(
            (current) => !current
          )
        }
      />

      <main>
        <AppRouter />
      </main>

      <Footer />

      <MobileNavigation
        pathname={pathname}
      />
    </div>
  );
}
