import { type PropsWithChildren, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Provider } from "react-redux";

import { ThemeProvider } from "@/components/theme/theme-provider";
import {
  setLanguage,
  type SupportedLanguage,
} from "@/features/app-preferences/app-preferences-slice";
import { clearAuthSession, setAuthUser } from "@/features/auth/auth-slice";
import {
  clearSession,
  setCurrentUser,
} from "@/features/identity/identity-slice";
import "@/i18n";
import {
  getCurrentUser,
  toAuthUser,
  toCurrentUser,
} from "@/services/auth-service";
import { store } from "@/store/store";

function LanguageBootstrap({ children }: PropsWithChildren) {
  const { i18n } = useTranslation();

  useEffect(() => {
    const language = i18n.resolvedLanguage as SupportedLanguage | undefined;

    if (language) {
      store.dispatch(setLanguage(language));
      document.documentElement.lang = language;
    }
  }, [i18n.resolvedLanguage]);

  return children;
}

function AuthSessionBootstrap({ children }: PropsWithChildren) {
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const user = await getCurrentUser();

        if (!isMounted) {
          return;
        }

        store.dispatch(setAuthUser(toAuthUser(user)));
        store.dispatch(setCurrentUser(toCurrentUser(user)));
      } catch {
        if (!isMounted) {
          return;
        }

        store.dispatch(clearAuthSession());
        store.dispatch(clearSession());
      }
    };

    void restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  return children;
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <Provider store={store}>
      <LanguageBootstrap>
        <AuthSessionBootstrap>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthSessionBootstrap>
      </LanguageBootstrap>
    </Provider>
  );
}
