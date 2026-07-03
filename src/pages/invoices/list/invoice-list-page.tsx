import * as React from "react";
import {
  ArrowClockwiseIcon,
  DownloadSimpleIcon,
  EyeIcon,
} from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  bffService,
  type BffInvoiceDownloadItem,
  type BffInvoiceItem,
} from "@/services/bff-service";

import "./invoice-list.css";

type InvoiceStatus = "submitted" | "confirmed" | "archived" | "rejected";

const statusVariant: Record<
  InvoiceStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  archived: "secondary",
  confirmed: "default",
  rejected: "destructive",
  submitted: "outline",
};

const InvoiceListPage: React.FC = () => {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadingInvoiceId, setLoadingInvoiceId] = React.useState("");
  const [downloadingInvoiceId, setDownloadingInvoiceId] = React.useState("");
  const [invoices, setInvoices] = React.useState<BffInvoiceItem[]>([]);
  const [query, setQuery] = React.useState("");
  const [selectedDownloadIds, setSelectedDownloadIds] = React.useState<
    Set<string>
  >(() => new Set());
  const [statusFilter, setStatusFilter] = React.useState<InvoiceStatus | "all">(
    () => normalizeStatusFilter(searchParams.get("status")),
  );
  const isDownloadMode = searchParams.get("mode") === "download";

  const loadInvoices = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const page = await bffService.invoices.getList();
      setInvoices(page.items);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    queueMicrotask(() => void loadInvoices());
  }, [loadInvoices]);

  React.useEffect(() => {
    queueMicrotask(() =>
      setStatusFilter(normalizeStatusFilter(searchParams.get("status"))),
    );
  }, [searchParams]);

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
          invoice.invoiceCode,
          invoice.invoiceDate,
          invoice.invoiceNumber,
          invoice.invoiceTitle,
          invoice.seller,
        ].some((value) => value.toLowerCase().includes(normalizedQuery));

      return matchesStatus && matchesQuery;
    });
  }, [invoices, query, statusFilter]);

  const downloadableInvoices = React.useMemo(
    () => filteredInvoices.filter((invoice) => invoice.canDownload),
    [filteredInvoices],
  );

  const selectedDownloadCount = React.useMemo(
    () =>
      Array.from(selectedDownloadIds).filter((invoiceId) =>
        downloadableInvoices.some((invoice) => invoice.id === invoiceId),
      ).length,
    [downloadableInvoices, selectedDownloadIds],
  );

  const refreshInvoices = () => {
    if (isLoading) {
      return;
    }

    void loadInvoices();
  };

  const viewInvoice = (invoice: BffInvoiceItem) => {
    if (loadingInvoiceId) {
      return;
    }

    setLoadingInvoiceId(invoice.id);
    navigate(`/invoices/${encodeURIComponent(invoice.id)}`);
  };

  const setDownloadMode = (enabled: boolean) => {
    const nextParams = new URLSearchParams(searchParams);

    if (enabled) {
      nextParams.set("mode", "download");
    } else {
      nextParams.delete("mode");
      setSelectedDownloadIds(new Set());
    }

    setSearchParams(nextParams, { replace: true });
  };

  const toggleDownloadSelection = (invoiceId: string, checked: boolean) => {
    setSelectedDownloadIds((current) => {
      const next = new Set(current);

      if (checked) {
        next.add(invoiceId);
      } else {
        next.delete(invoiceId);
      }

      return next;
    });
  };

  const downloadInvoice = (invoice: BffInvoiceItem) => {
    if (downloadingInvoiceId) {
      return;
    }

    setDownloadingInvoiceId(invoice.id);
    void bffService.invoices
      .download([invoice.id])
      .then((files) => openDownloadFiles(files))
      .finally(() => setDownloadingInvoiceId(""));
  };

  const downloadSelectedInvoices = () => {
    if (selectedDownloadCount === 0 || downloadingInvoiceId) {
      return;
    }

    setDownloadingInvoiceId("batch");
    void bffService.invoices
      .download(
        downloadableInvoices
          .filter((invoice) => selectedDownloadIds.has(invoice.id))
          .map((invoice) => invoice.id),
      )
      .then((files) => openDownloadFiles(files))
      .finally(() => setDownloadingInvoiceId(""));
  };

  return (
    <main className="invoice-list-page">
      <section className="invoice-list-page__content">
        <header className="invoice-list-page__heading">
          <div>
            <h1 className="invoice-list-page__title">
              {t("invoiceList.title")}
            </h1>
            <p className="invoice-list-page__subtitle">
              {t(
                isDownloadMode
                  ? "invoiceList.downloadSubtitle"
                  : "invoiceList.subtitle",
              )}
            </p>
          </div>
          <div className="invoice-list-page__heading-actions">
            <Button
              disabled={isLoading}
              onClick={refreshInvoices}
              type="button"
              variant="outline"
            >
              {isLoading ? <Spinner /> : <ArrowClockwiseIcon />}
              {t("invoiceList.actions.refresh")}
            </Button>
            {isDownloadMode ? (
              <>
                <Button
                  disabled={
                    selectedDownloadCount === 0 || Boolean(downloadingInvoiceId)
                  }
                  onClick={downloadSelectedInvoices}
                  type="button"
                >
                  {downloadingInvoiceId === "batch" ? (
                    <Spinner />
                  ) : (
                    <DownloadSimpleIcon />
                  )}
                  {t("invoiceList.actions.downloadSelected", {
                    count: selectedDownloadCount,
                  })}
                </Button>
                <Button
                  disabled={Boolean(downloadingInvoiceId)}
                  onClick={() => setDownloadMode(false)}
                  type="button"
                  variant="ghost"
                >
                  {t("invoiceList.actions.exitDownload")}
                </Button>
              </>
            ) : (
              <Button onClick={() => setDownloadMode(true)} type="button">
                <DownloadSimpleIcon />
                {t("invoiceList.actions.downloadMode")}
              </Button>
            )}
          </div>
        </header>

        <section className="invoice-list-page__summary">
          <div className="invoice-list-page__metric">
            <span>{t("invoiceList.metrics.total")}</span>
            <strong>{invoices.length}</strong>
          </div>
          <div className="invoice-list-page__metric">
            <span>{t("invoiceList.metrics.pending")}</span>
            <strong>
              {
                invoices.filter((invoice) => invoice.status === "submitted")
                  .length
              }
            </strong>
          </div>
          <div className="invoice-list-page__metric">
            <span>{t("invoiceList.metrics.amount")}</span>
            <strong>
              {currencyFormatter.format(
                invoices.reduce((total, invoice) => total + invoice.amount, 0),
              )}
            </strong>
          </div>
          <div className="invoice-list-page__metric">
            <span>{t("invoiceList.metrics.downloadable")}</span>
            <strong>
              {invoices.filter((invoice) => invoice.canDownload).length}
            </strong>
          </div>
        </section>

        <section className="invoice-list-page__toolbar">
          <Input
            aria-label={t("invoiceList.filters.search")}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("invoiceList.filters.searchPlaceholder")}
            value={query}
          />
          <Select
            onValueChange={(value) =>
              setStatusFilter(value as InvoiceStatus | "all")
            }
            value={statusFilter}
          >
            <SelectTrigger className="invoice-list-page__status-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("invoiceList.filters.all")}
              </SelectItem>
              <SelectItem value="submitted">
                {t("invoiceList.status.submitted")}
              </SelectItem>
              <SelectItem value="confirmed">
                {t("invoiceList.status.confirmed")}
              </SelectItem>
              <SelectItem value="archived">
                {t("invoiceList.status.archived")}
              </SelectItem>
              <SelectItem value="rejected">
                {t("invoiceList.status.rejected")}
              </SelectItem>
            </SelectContent>
          </Select>
        </section>

        <section className="invoice-list-page__table-panel">
          {isLoading ? (
            <div className="invoice-list-page__state">
              <Spinner />
              {t("invoiceList.state.loading")}
            </div>
          ) : null}

          {!isLoading && filteredInvoices.length === 0 ? (
            <div className="invoice-list-page__state">
              {t("invoiceList.state.empty")}
            </div>
          ) : null}

          {!isLoading && filteredInvoices.length > 0 ? (
            <div className="invoice-list-page__table-scroll">
              <table className="invoice-list-page__table">
                <thead>
                  <tr>
                    {isDownloadMode ? (
                      <th>{t("invoiceList.columns.select")}</th>
                    ) : null}
                    <th>{t("invoiceList.columns.invoice")}</th>
                    <th>{t("invoiceList.columns.seller")}</th>
                    <th>{t("invoiceList.columns.amount")}</th>
                    <th>{t("invoiceList.columns.submittedAt")}</th>
                    <th>{t("invoiceList.columns.source")}</th>
                    <th>{t("invoiceList.columns.status")}</th>
                    <th>{t("invoiceList.columns.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      {isDownloadMode ? (
                        <td>
                          <Checkbox
                            checked={selectedDownloadIds.has(invoice.id)}
                            disabled={!invoice.canDownload}
                            onCheckedChange={(checked) =>
                              toggleDownloadSelection(
                                invoice.id,
                                checked === true,
                              )
                            }
                          />
                        </td>
                      ) : null}
                      <td>
                        <strong>{invoice.invoiceNumber}</strong>
                        {isDownloadMode ? (
                          <span>{invoice.fileName}</span>
                        ) : null}
                      </td>
                      <td>{invoice.seller}</td>
                      <td>{currencyFormatter.format(invoice.amount)}</td>
                      <td>{invoice.submittedAt}</td>
                      <td>{t(`invoiceList.source.${invoice.source}`)}</td>
                      <td>
                        <Badge variant={statusVariant[invoice.status]}>
                          {t(`invoiceList.status.${invoice.status}`)}
                        </Badge>
                      </td>
                      <td>
                        <div className="invoice-list-page__row-actions">
                          <Button
                            disabled={Boolean(loadingInvoiceId)}
                            onClick={() => viewInvoice(invoice)}
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            {loadingInvoiceId === invoice.id ? (
                              <Spinner />
                            ) : (
                              <EyeIcon />
                            )}
                            {t("invoiceList.actions.preview")}
                          </Button>
                          <Button
                            disabled={
                              !invoice.canDownload ||
                              Boolean(downloadingInvoiceId)
                            }
                            onClick={() => downloadInvoice(invoice)}
                            size="sm"
                            type="button"
                            variant={isDownloadMode ? "default" : "ghost"}
                          >
                            {downloadingInvoiceId === invoice.id ? (
                              <Spinner />
                            ) : (
                              <DownloadSimpleIcon />
                            )}
                            {t("invoiceList.actions.download")}
                          </Button>
                        </div>
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

export { InvoiceListPage };

function openDownloadFiles(files: BffInvoiceDownloadItem[]) {
  files
    .map((file) => file.downloadUrl)
    .filter(Boolean)
    .forEach((downloadUrl) => window.open(downloadUrl, "_blank"));
}

function normalizeStatusFilter(value: string | null): InvoiceStatus | "all" {
  return value === "submitted" ||
    value === "confirmed" ||
    value === "archived" ||
    value === "rejected"
    ? value
    : "all";
}
