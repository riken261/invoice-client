import { DesktopTowerIcon, MoonIcon, SunIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import {
  setTheme,
  type ThemeMode,
} from "@/features/app-preferences/app-preferences-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useTranslation } from "react-i18next";

type ThemeLabelKey = "actions.light" | "actions.dark" | "actions.system";

const themes: Array<{
  icon: typeof SunIcon;
  labelKey: ThemeLabelKey;
  value: ThemeMode;
}> = [
  { icon: SunIcon, labelKey: "actions.light", value: "light" },
  { icon: MoonIcon, labelKey: "actions.dark", value: "dark" },
  { icon: DesktopTowerIcon, labelKey: "actions.system", value: "system" },
];

export function ThemeToggle() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.appPreferences.theme);
  const { t } = useTranslation();

  return (
    <div className="inline-flex border border-border bg-background">
      {themes.map((item) => {
        const Icon = item.icon;

        return (
          <Button
            key={item.value}
            aria-label={t(item.labelKey)}
            size="icon-sm"
            title={t(item.labelKey)}
            type="button"
            variant={theme === item.value ? "default" : "ghost"}
            onClick={() => dispatch(setTheme(item.value))}
          >
            <Icon />
          </Button>
        );
      })}
    </div>
  );
}
