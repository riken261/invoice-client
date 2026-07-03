import { type PropsWithChildren, useEffect } from "react";

import {
  setTheme,
  type ThemeMode,
} from "@/features/app-preferences/app-preferences-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const STORAGE_KEY = "invoice-ui-theme";

export function ThemeProvider({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.appPreferences.theme);

  useEffect(() => {
    const storedTheme = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;

    if (storedTheme) {
      dispatch(setTheme(storedTheme));
    }
  }, [dispatch]);

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      root.classList.toggle(
        "dark",
        theme === "dark" || (theme === "system" && mediaQuery.matches),
      );
    };

    applyTheme();
    localStorage.setItem(STORAGE_KEY, theme);
    mediaQuery.addEventListener("change", applyTheme);

    return () => mediaQuery.removeEventListener("change", applyTheme);
  }, [theme]);

  return children;
}
