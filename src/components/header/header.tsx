import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import {
  setLanguage,
  type SupportedLanguage,
} from "@/features/app-preferences/app-preferences-slice.ts";
import { GlobeIcon, SignOutIcon } from "@phosphor-icons/react";
import { useAppDispatch, useAppSelector } from "@/store/hooks.ts";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/theme/theme-toggle";

import "./header.css";
import { clearAuthSession, type AuthUser } from "@/features/auth/auth-slice.ts";
import { clearSession } from "@/features/identity/identity-slice.ts";
import { Button } from "@/components/ui/button";
import { logout as logoutSession } from "@/services/auth-service";

const Header: React.FC = () => {
  const language = useAppSelector((state) => state.appPreferences.language);
  const currentUser: AuthUser | null = useAppSelector(
    (state) => state.auth.currentUser,
  );
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const { i18n, t } = useTranslation();

  const supportedLanguages: SupportedLanguage[] = ["zh-CN", "en", "ja"];

  type LanguageLabelKey =
    | "language.chinese"
    | "language.english"
    | "language.japanese";
  const changeLanguage = (value: SupportedLanguage) => {
    dispatch(setLanguage(value));
    void i18n.changeLanguage(value);
  };

  const languageLabelKeys: Record<SupportedLanguage, LanguageLabelKey> = {
    "zh-CN": "language.chinese",
    en: "language.english",
    ja: "language.japanese",
  };

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await logoutSession();
    } finally {
      dispatch(clearAuthSession());
      dispatch(clearSession());
      navigate("/auth", { replace: true });
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="header">
      {(() => {
        if (!currentUser) {
          return <div className="header-area" />;
        }

        return (
          <div className="header-area">
            <div className="header-title">Invoice Flow System</div>
            <div className="header-userinfo">
              <span>
                {currentUser.displayName}@{currentUser.tenantCode}
              </span>
              <Button
                className="header-logout"
                disabled={isLoggingOut}
                onClick={handleLogout}
                size="xs"
                variant="link"
              >
                {t("auth.logout.logoutTxt")}
                <SignOutIcon size={30} />
              </Button>
            </div>
          </div>
        );
      })()}

      <div className="header-inner">
        <ThemeToggle />
        <Select
          value={language}
          onValueChange={(value) => changeLanguage(value as SupportedLanguage)}
        >
          <SelectTrigger className="language">
            <GlobeIcon size={20} />
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start" position="popper">
            <SelectGroup>
              {supportedLanguages.map((item) => (
                <SelectItem key={item} value={item}>
                  {t(languageLabelKeys[item])}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </header>
  );
};

export { Header };
