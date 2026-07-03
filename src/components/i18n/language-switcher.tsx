import { TranslateIcon } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  setLanguage,
  type SupportedLanguage,
} from "@/features/app-preferences/app-preferences-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

type LanguageLabelKey =
  | "language.chinese"
  | "language.english"
  | "language.japanese";

const languages: Array<{
  labelKey: LanguageLabelKey;
  value: SupportedLanguage;
}> = [
  { labelKey: "language.chinese", value: "zh-CN" },
  { labelKey: "language.english", value: "en" },
  { labelKey: "language.japanese", value: "ja" },
];

export function LanguageSwitcher() {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.appPreferences.language);
  const { i18n, t } = useTranslation();

  const changeLanguage = (value: SupportedLanguage) => {
    dispatch(setLanguage(value));
    void i18n.changeLanguage(value);
  };

  return (
    <div className="inline-flex items-center border border-border bg-background">
      <span className="flex size-7 items-center justify-center border-r border-border text-muted-foreground">
        <TranslateIcon className="size-3.5" />
      </span>
      {languages.map((item) => (
        <Button
          key={item.value}
          size="sm"
          type="button"
          variant={language === item.value ? "secondary" : "ghost"}
          onClick={() => changeLanguage(item.value)}
        >
          {t(item.labelKey)}
        </Button>
      ))}
    </div>
  );
}
