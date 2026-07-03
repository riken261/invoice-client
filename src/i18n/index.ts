import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import { resources } from "./resources";

export const supportedLanguages = ["zh-CN", "en", "ja"] as const;

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "zh-CN",
    interpolation: {
      escapeValue: false,
    },
    resources,
    supportedLngs: supportedLanguages,
  });

export default i18n;
