import * as React from "react";
import { ArrowClockwiseIcon, RowsIcon } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { bffService, type BffFinanceSummary } from "@/services/bff-service";

import "./review.css";

const FinanceReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const [summary, setSummary] = React.useState<BffFinanceSummary>({
    duplicateRisk: 0,
    pendingClaimAmount: 0,
    pendingClaims: 0,
    pendingInvoiceAmount: 0,
    pendingInvoices: 0,
  });
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const currencyFormatter = React.useMemo(
    () =>
      new Intl.NumberFormat(i18n.language, {
        currency: "CNY",
        style: "currency",
      }),
    [i18n.language],
  );

  const loadSummary = React.useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [nextSummary, claims] = await Promise.all([
        bffService.finance.getReviewSummary(),
        bffService.finance.getPendingClaims(),
      ]);
      setSummary({
        duplicateRisk: 0,
        pendingClaimAmount:
          nextSummary.pendingClaimAmount ||
          claims.items.reduce((total, claim) => total + claim.amount, 0),
        pendingClaims: nextSummary.pendingClaims || claims.items.length,
        pendingInvoiceAmount: 0,
        pendingInvoices: 0,
      });
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    queueMicrotask(() => void loadSummary());
  }, [loadSummary]);

  const refresh = () => {
    if (isRefreshing) {
      return;
    }

    void loadSummary();
  };

  return (
    <main className="review-page">
      <section className="review-page__content">
        <header className="review-page__heading">
          <div>
            <h1 className="review-page__title">{t("financeReview.title")}</h1>
            <p className="review-page__subtitle">
              {t("financeReview.subtitle")}
            </p>
          </div>
          <div className="review-page__heading-actions">
            <Button disabled={isRefreshing} onClick={refresh} variant="outline">
              {isRefreshing ? <Spinner /> : <ArrowClockwiseIcon />}
              {t("financeReview.actions.refresh")}
            </Button>
          </div>
        </header>

        <section className="review-page__summary">
          <Metric
            label={t("financeReview.metrics.pendingClaims")}
            value={summary.pendingClaims}
          />
          <Metric
            label={t("financeReview.metrics.amount")}
            value={currencyFormatter.format(summary.pendingClaimAmount)}
          />
        </section>

        <section className="review-page__queue-grid">
          <button
            className="review-page__queue-card"
            onClick={() => navigate("/finance/claims")}
            type="button"
          >
            <RowsIcon />
            <strong>{t("financeReview.queues.claims.title")}</strong>
            <span>{t("financeReview.queues.claims.description")}</span>
          </button>
        </section>
      </section>
    </main>
  );
};

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="review-page__metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export { FinanceReviewPage };
