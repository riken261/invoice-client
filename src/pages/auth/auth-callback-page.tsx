import * as React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, setAuthUser } from "@/features/auth/auth-slice";
import {
  clearSession,
  setCurrentUser,
} from "@/features/identity/identity-slice";
import {
  getCurrentUser,
  toAuthUser,
  toCurrentUser,
} from "@/services/auth-service";
import { useAppDispatch } from "@/store/hooks";

import "./login-page.css";

const AuthCallbackPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    const completeLogin = async () => {
      try {
        const user = await getCurrentUser();

        if (!isMounted) {
          return;
        }

        dispatch(setAuthUser(toAuthUser(user)));
        dispatch(setCurrentUser(toCurrentUser(user)));
        navigate("/dashboard", { replace: true });
      } catch {
        if (!isMounted) {
          return;
        }

        dispatch(clearAuthSession());
        dispatch(clearSession());
        setErrorMessage(t("auth.login.ssoCallbackFailed"));
      }
    };

    void completeLogin();

    return () => {
      isMounted = false;
    };
  }, [dispatch, navigate, t]);

  return (
    <main className="login-page">
      <section className="login-page__main">
        <h1 className="login-page__brand">{t("auth.login.brand")}</h1>
        <div className="login-page__form">
          <p className="login-page__callback-message">
            {errorMessage ?? t("auth.login.ssoCallbackProcessing")}
          </p>
        </div>
      </section>
    </main>
  );
};

export { AuthCallbackPage };
