import { CheckCircleIcon, HouseIcon } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";

import "./invoice-upload.css";

const InvoiceUploadComplatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const invoiceId = searchParams.get("invoiceId") || "-";

  return (
    <main className="invoice-upload-page">
      <section className="invoice-upload-page__content">
        <section className="invoice-upload-page__flow-panel invoice-upload-page__flow-panel--center">
          <CheckCircleIcon className="invoice-upload-page__complete-icon" />
          <h1 className="invoice-upload-page__title">
            {t("invoiceUpload.complete.title")}
          </h1>
          <p className="invoice-upload-page__subtitle">
            {t("invoiceUpload.complete.subtitle")}
          </p>

          <div className="invoice-upload-page__metric-grid">
            <div className="invoice-upload-page__metric">
              <span>{t("invoiceUpload.complete.metrics.status")}</span>
              <strong>{t("invoiceUpload.complete.metrics.saved")}</strong>
            </div>
            <div className="invoice-upload-page__metric">
              <span>{t("invoiceUpload.complete.metrics.invoiceId")}</span>
              <strong>{invoiceId}</strong>
            </div>
            <div className="invoice-upload-page__metric">
              <span>{t("invoiceUpload.complete.metrics.next")}</span>
              <strong>{t("invoiceUpload.complete.metrics.archive")}</strong>
            </div>
          </div>
        </section>

        <footer className="invoice-upload-page__footer">
          <div className="invoice-upload-page__footer-center">
            <Button onClick={() => navigate("/dashboard")} type="button">
              <HouseIcon />
              {t("invoiceUpload.complete.actions.dashboard")}
            </Button>
          </div>
        </footer>
      </section>
    </main>
  );
};

export { InvoiceUploadComplatePage };
