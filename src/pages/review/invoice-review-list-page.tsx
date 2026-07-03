import * as React from "react";
import { ArrowClockwiseIcon, EyeIcon } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { bffService, type BffInvoiceReviewItem } from "@/services/bff-service";

import "./review.css";

type ReviewQueueStatus = BffInvoiceReviewItem["status"];

const statusVariant: Record<
  ReviewQueueStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  approved: "default",
  duplicate: "destructive",
  escalated: "secondary",
  pending: "outline",
  rejected: "destructive",
};

const InvoiceReviewListPage: React.FC = () => {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get("status");
  const [isLoading, setIsLoading] = React.useState(true);
  const [invoices, setInvoices] = React.useState<BffInvoiceReviewItem[]>([]);
  const [openingId, setOpeningId] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<
    ReviewQueueStatus | "all"
  >(isReviewStatus(initialStatus) ? initialStatus : "all");

  const loadInvoices = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const page = await bffService.finance.getPendingInvoices(
        statusFilter === "duplicate" ? "duplicate" : undefined,
      );
      setInvoices(page.items);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  React.useEffect(() => {
    queueMicrotask(() => void loadInvoices());
  }, [loadInvoices]);

  const currencyFormatter = React.useMemo(
    () =>
      new Intl.NumberFormat(i18n.language, {
        currency: "CNY",
        style: "currency",
      }),
    [i18n.language],
  );

  const filteredInvoices = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return invoices.filter((invoice) => {
      const matchesStatus =
        statusFilter === "all" || invoice.status === statusFilter;
      const matchesQuery =
        !normalizedQuery ||
        [
          invoice.id,
          invoice.invoiceNumber,
          invoice.seller,
          invoice.applicant,
        ].some((value) => value.toLowerCase().includes(normalizedQuery));
      return matchesStatus && matchesQuery;
    });
  }, [invoices, query, statusFilter]);

  const refresh = () => {
    if (isLoading) {
      return;
    }
    void loadInvoices();
  };

  const openReview = (invoiceId: string) => {
    if (openingId) {
      return;
    }
    setOpeningId(invoiceId);
    navigate(`/finance/invoices/${invoiceId}/review`);
  };

  return (
    <main className="review-page">
      <section className="review-page__content">
        <header className="review-page__heading">
          <div>
            <h1 className="review-page__title">
              {t("invoiceReviewList.title")}
            </h1>
            <p className="review-page__subtitle">
              {t("invoiceReviewList.subtitle")}
            </p>
          </div>
          <div className="review-page__heading-actions">
            <Button
              onClick={() => navigate("/finance/reviews")}
              variant="outline"
            >
              {t("invoiceReviewList.actions.workbench")}
            </Button>
            <Button disabled={isLoading} onClick={refresh} variant="outline">
              {isLoading ? <Spinner /> : <ArrowClockwiseIcon />}
              {t("invoiceReviewList.actions.refresh")}
            </Button>
          </div>
        </header>

        <section className="review-page__toolbar">
          <Input
            aria-label={t("invoiceReviewList.filters.search")}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("invoiceReviewList.filters.searchPlaceholder")}
            value={query}
          />
          <Select
            onValueChange={(value) =>
              setStatusFilter(value as ReviewQueueStatus | "all")
            }
            value={statusFilter}
          >
            <SelectTrigger className="review-page__status-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("invoiceReviewList.filters.all")}
              </SelectItem>
              <SelectItem value="pending">
                {t("reviewStatus.pending")}
              </SelectItem>
              <SelectItem value="duplicate">
                {t("reviewStatus.duplicate")}
              </SelectItem>
              <SelectItem value="escalated">
                {t("reviewStatus.escalated")}
              </SelectItem>
            </SelectContent>
          </Select>
        </section>

        <section className="review-page__table-panel">
          {isLoading ? (
            <div className="review-page__state">
              <Spinner />
              {t("invoiceReviewList.state.loading")}
            </div>
          ) : null}

          {!isLoading && filteredInvoices.length === 0 ? (
            <div className="review-page__state">
              {t("invoiceReviewList.state.empty")}
            </div>
          ) : null}

          {!isLoading && filteredInvoices.length > 0 ? (
            <div className="review-page__table-scroll">
              <table className="review-page__table">
                <thead>
                  <tr>
                    <th>{t("invoiceReviewList.columns.invoice")}</th>
                    <th>{t("invoiceReviewList.columns.seller")}</th>
                    <th>{t("invoiceReviewList.columns.amount")}</th>
                    <th>{t("invoiceReviewList.columns.confidence")}</th>
                    <th>{t("invoiceReviewList.columns.risk")}</th>
                    <th>{t("invoiceReviewList.columns.status")}</th>
                    <th>{t("invoiceReviewList.columns.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td>
                        <strong>{invoice.id}</strong>
                        <span>
                          {invoice.invoiceCode} / {invoice.invoiceNumber}
                        </span>
                      </td>
                      <td>{invoice.seller}</td>
                      <td>{currencyFormatter.format(invoice.amount)}</td>
                      <td>{formatPercent(invoice.ocrConfidence)}</td>
                      <td>{t(`reviewRisk.${invoice.duplicateRisk}`)}</td>
                      <td>
                        <Badge variant={statusVariant[invoice.status]}>
                          {t(statusKey(invoice.status))}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          disabled={Boolean(openingId)}
                          onClick={() => openReview(invoice.id)}
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          {openingId === invoice.id ? <Spinner /> : <EyeIcon />}
                          {t("invoiceReviewList.actions.review")}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      </section>
    </main>
  );
};

function isReviewStatus(value: string | null): value is ReviewQueueStatus {
  return value === "pending" || value === "duplicate" || value === "escalated";
}

function statusKey(status: ReviewQueueStatus) {
  return `reviewStatus.${status}` as const;
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export { InvoiceReviewListPage };
