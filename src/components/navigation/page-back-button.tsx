import type { FC } from "react";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

type PageBackButtonProps = {
  className?: string;
  disabled?: boolean;
};

const PageBackButton: FC<PageBackButtonProps> = ({ className, disabled }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Button
      className={className}
      disabled={disabled}
      onClick={() => navigate(-1)}
      type="button"
      variant="outline"
    >
      <ArrowLeftIcon />
      {t("app.navigation.back")}
    </Button>
  );
};

export { PageBackButton };
