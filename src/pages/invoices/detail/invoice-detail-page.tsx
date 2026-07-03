import * as React from "react";
import {
  ArrowLeftIcon,
  DownloadSimpleIcon,
  EyeIcon,
  ImageIcon,
} from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  bffService,
  type BffInvoiceDetail,
  type BffInvoiceDownloadItem,
  type BffInvoicePreview,
} from "@/services/bff-service";

import "./invoice-detail.css";

type InvoiceStatus = BffInvoiceDetail["status"];

const statusVariant: Record<
  InvoiceStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  archived: "secondary",
  confirmed: "default",
  rejected: "destructive",
  submitted: "outline",
};

const InvoiceDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { invoiceId } = useParams();
  const { i18n, t } = useTranslation();
  const [invoice, setInvoice] = React.useState<BffInvoiceDetail | null>(null);
  const [preview, setPreview] = React.useState<BffInvoicePreview | null>(null);
  const [error, setError] = React.useState("");
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [isPreviewing, setIsPreviewing] = React.useState(false);
  const [rawJsonPreview, setRawJsonPreview] = React.useState<{
    label: string;
    value: string;
  } | null>(null);
  const recognizedFieldLabels = React.useMemo<Record<string, string>>(
    () => ({
      amount: t("invoiceDetail.fieldLabels.amount"),
      amountWithoutTax: t("invoiceDetail.fieldLabels.amountWithoutTax"),
      angle: t("invoiceDetail.fieldLabels.angle"),
      buyerName: t("invoiceDetail.fieldLabels.buyerName"),
      buyerTaxId: t("invoiceDetail.fieldLabels.buyerTaxId"),
      checkCode: t("invoiceDetail.fieldLabels.checkCode"),
      code: t("invoiceDetail.fieldLabels.code"),
      confidence: t("invoiceDetail.fieldLabels.confidence"),
      currency: t("invoiceDetail.fieldLabels.currency"),
      cutImageBase64: t("invoiceDetail.fieldLabels.cutImageBase64"),
      invoiceCode: t("invoiceDetail.fieldLabels.invoiceCode"),
      invoiceDate: t("invoiceDetail.fieldLabels.invoiceDate"),
      invoiceNo: t("invoiceDetail.fieldLabels.invoiceNo"),
      invoiceNumber: t("invoiceDetail.fieldLabels.invoiceNumber"),
      invoiceType: t("invoiceDetail.fieldLabels.invoiceType"),
      lowConfidence: t("invoiceDetail.fieldLabels.lowConfidence"),
      page: t("invoiceDetail.fieldLabels.page"),
      providerCode: t("invoiceDetail.fieldLabels.providerCode"),
      providerSubType: t("invoiceDetail.fieldLabels.providerSubType"),
      providerSubTypeDescription: t(
        "invoiceDetail.fieldLabels.providerSubTypeDescription",
      ),
      providerType: t("invoiceDetail.fieldLabels.providerType"),
      providerTypeDescription: t(
        "invoiceDetail.fieldLabels.providerTypeDescription",
      ),
      qrCode: t("invoiceDetail.fieldLabels.qrCode"),
      rawInvoiceInfo: t("invoiceDetail.fieldLabels.rawInvoiceInfo"),
      seller: t("invoiceDetail.fieldLabels.seller"),
      sellerName: t("invoiceDetail.fieldLabels.sellerName"),
      sellerTaxId: t("invoiceDetail.fieldLabels.sellerTaxId"),
      taxAmount: t("invoiceDetail.fieldLabels.taxAmount"),
      title: t("invoiceDetail.fieldLabels.title"),
      totalAmount: t("invoiceDetail.fieldLabels.totalAmount"),
    }),
    [t],
  );

  React.useEffect(() => {
    let ignore = false;

    async function loadInvoice() {
      if (!invoiceId) {
        setIsLoading(false);
        return;
      }

      try {
        const detail = await bffService.invoices.getDetail(invoiceId);
        if (!ignore) {
          setInvoice(detail);
        }
      } catch (caught) {
        if (!ignore) {
          setError(caught instanceof Error ? caught.message : String(caught));
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    queueMicrotask(() => void loadInvoice());

    return () => {
      ignore = true;
    };
  }, [invoiceId]);

  const currencyFormatter = React.useMemo(
    () =>
      new Intl.NumberFormat(i18n.language, {
        currency: invoice?.currency || "CNY",
        style: "currency",
      }),
    [i18n.language, invoice?.currency],
  );

  const previewInvoice = () => {
    if (!invoice || isPreviewing) {
      return;
    }

    setIsPreviewing(true);
    setError("");
    void bffService.invoices
      .preview(invoice.id)
      .then((nextPreview) => {
        setPreview(nextPreview);
        setIsPreviewOpen(true);
      })
      .catch((caught) =>
        setError(caught instanceof Error ? caught.message : String(caught)),
      )
      .finally(() => setIsPreviewing(false));
  };

  const downloadInvoice = () => {
    if (!invoice || isDownloading) {
      return;
    }

    setIsDownloading(true);
    setError("");
    void bffService.invoices
      .download([invoice.id])
      .then(openDownloadFiles)
      .catch((caught) =>
        setError(caught instanceof Error ? caught.message : String(caught)),
      )
      .finally(() => setIsDownloading(false));
  };

  return (
    <main className="invoice-detail-page">
      <section className="invoice-detail-page__content">
        {isLoading ? (
          <div className="invoice-detail-page__state">
            <Spinner />
            {t("invoiceDetail.state.loading")}
          </div>
        ) : null}

        {error ? <p className="invoice-detail-page__error">{error}</p> : null}

        {!isLoading && invoice ? (
          <>
            <header className="invoice-detail-page__heading">
              <div>
                <h1 className="invoice-detail-page__title">
                  {t("invoiceDetail.title")}
                </h1>
                <p className="invoice-detail-page__subtitle">{invoice.id}</p>
              </div>
              <div className="invoice-detail-page__heading-actions">
                <Button
                  onClick={() => navigate("/invoices")}
                  type="button"
                  variant="outline"
                >
                  <ArrowLeftIcon />
                  {t("invoiceDetail.actions.back")}
                </Button>
                <Button
                  disabled={isPreviewing}
                  onClick={previewInvoice}
                  type="button"
                  variant="outline"
                >
                  {isPreviewing ? <Spinner /> : <EyeIcon />}
                  {t("invoiceDetail.actions.preview")}
                </Button>
                <Button
                  disabled={isDownloading}
                  onClick={downloadInvoice}
                  type="button"
                >
                  {isDownloading ? <Spinner /> : <DownloadSimpleIcon />}
                  {t("invoiceDetail.actions.download")}
                </Button>
              </div>
            </header>

            <section className="invoice-detail-page__layout">
              <section className="invoice-detail-page__panel">
                <div className="invoice-detail-page__section-title">
                  {t("invoiceDetail.basic.title")}
                </div>
                <dl className="invoice-detail-page__details">
                  <DetailRow label={t("invoiceDetail.basic.status")}>
                    <Badge variant={statusVariant[invoice.status]}>
                      {t(`invoiceList.status.${invoice.status}`)}
                    </Badge>
                  </DetailRow>
                  <DetailRow
                    label={t("invoiceDetail.basic.invoiceNo")}
                    value={invoice.invoiceNumber}
                  />
                  <DetailRow
                    label={t("invoiceDetail.basic.invoiceCode")}
                    value={invoice.invoiceCode}
                  />
                  <DetailRow
                    label={t("invoiceDetail.basic.invoiceType")}
                    value={invoice.invoiceType}
                  />
                  <DetailRow
                    label={t("invoiceDetail.basic.invoiceDate")}
                    value={invoice.submittedAt}
                  />
                  <DetailRow
                    label={t("invoiceDetail.basic.seller")}
                    value={invoice.seller}
                  />
                  <DetailRow
                    label={t("invoiceDetail.basic.buyer")}
                    value={invoice.buyerName}
                  />
                  <DetailRow
                    label={t("invoiceDetail.basic.ocrStatus")}
                    value={invoice.ocrStatus}
                  />
                  <DetailRow
                    label={t("invoiceDetail.basic.duplicateStatus")}
                    value={invoice.duplicateStatus}
                  />
                </dl>
              </section>

              <section className="invoice-detail-page__panel invoice-detail-page__amount-panel">
                <div className="invoice-detail-page__section-title">
                  {t("invoiceDetail.amount.title")}
                </div>
                <dl className="invoice-detail-page__details">
                  <DetailRow
                    label={t("invoiceDetail.amount.withoutTax")}
                    value={currencyFormatter.format(invoice.amountWithoutTax)}
                  />
                  <DetailRow
                    label={t("invoiceDetail.amount.tax")}
                    value={currencyFormatter.format(invoice.taxAmount)}
                  />
                  <DetailRow
                    label={t("invoiceDetail.amount.total")}
                    value={currencyFormatter.format(invoice.amount)}
                  />
                  <DetailRow
                    label={t("invoiceDetail.amount.currency")}
                    value={invoice.currency}
                  />
                  <DetailRow
                    label={t("invoiceDetail.basic.manualInput")}
                    value={
                      invoice.manualInput
                        ? t("invoiceDetail.boolean.yes")
                        : t("invoiceDetail.boolean.no")
                    }
                  />
                  <DetailRow
                    label={t("invoiceDetail.basic.updatedAt")}
                    value={invoice.updatedAt}
                  />
                </dl>
              </section>

              <section className="invoice-detail-page__panel invoice-detail-page__fields-panel">
                <div className="invoice-detail-page__section-title">
                  {t("invoiceDetail.fields.title")}
                </div>
                <div className="invoice-detail-page__field-grid">
                  {fieldEntries(invoice).map(([key, value]) => (
                    <div className="invoice-detail-page__field" key={key}>
                      <span>{recognizedFieldLabels[key] ?? key}</span>
                      {isDialogJsonField(key) ? (
                        <Button
                          className="invoice-detail-page__field-action"
                          onClick={() =>
                            setRawJsonPreview({
                              label: recognizedFieldLabels[key] ?? key,
                              value: formatJsonFieldValue(value),
                            })
                          }
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          <EyeIcon />
                          {t("invoiceDetail.actions.viewJson")}
                        </Button>
                      ) : (
                        <strong>
                          {formatFieldValue(
                            value,
                            t("invoiceDetail.boolean.yes"),
                            t("invoiceDetail.boolean.no"),
                          )}
                        </strong>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </section>

            <AlertDialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
              <AlertDialogContent className="invoice-detail-page__preview-dialog">
                <AlertDialogHeader>
                  <AlertDialogMedia>
                    <ImageIcon />
                  </AlertDialogMedia>
                  <AlertDialogTitle>
                    {t("invoiceDetail.preview.title")}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {preview?.filename ?? invoice.fileName}
                    {preview?.expiresAt && preview.expiresAt !== "-"
                      ? ` - ${t("invoiceDetail.preview.expiresAt")} ${preview.expiresAt}`
                      : ""}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                {preview?.imageUrl ? (
                  <figure className="invoice-detail-page__image-frame">
                    <img alt={preview.filename} src={preview.imageUrl} />
                  </figure>
                ) : null}
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    {t("invoiceDetail.actions.close")}
                  </AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
              open={Boolean(rawJsonPreview)}
              onOpenChange={(open) => {
                if (!open) {
                  setRawJsonPreview(null);
                }
              }}
            >
              <AlertDialogContent className="invoice-detail-page__json-dialog">
                <AlertDialogHeader>
                  <AlertDialogMedia>
                    <EyeIcon />
                  </AlertDialogMedia>
                  <AlertDialogTitle>
                    {rawJsonPreview?.label ?? t("invoiceDetail.rawJson.title")}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("invoiceDetail.rawJson.description")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <pre className="invoice-detail-page__json-view">
                  {rawJsonPreview?.value ?? ""}
                </pre>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    {t("invoiceDetail.actions.close")}
                  </AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ) : null}
      </section>
    </main>
  );
};

function DetailRow({
  children,
  label,
  value,
}: {
  children?: React.ReactNode;
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{children ?? value ?? "-"}</dd>
    </div>
  );
}

function fieldEntries(invoice: BffInvoiceDetail) {
  const fields =
    Object.keys(invoice.confirmedFields).length > 0
      ? invoice.confirmedFields
      : invoice.ocrRawFields;
  return Object.entries(fields).filter(([, value]) => value !== undefined);
}

function isDialogJsonField(key: string) {
  return key === "rawInvoiceInfo";
}

function formatFieldValue(value: unknown, yes: string, no: string) {
  if (value === undefined || value === null || value === "") {
    return "-";
  }
  if (typeof value === "boolean") {
    return value ? yes : no;
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "-";
    }
  }
  return String(value);
}

function formatJsonFieldValue(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return "-";
  }
  if (typeof value === "string") {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function openDownloadFiles(files: BffInvoiceDownloadItem[]) {
  files
    .map((file) => file.downloadUrl)
    .filter(Boolean)
    .forEach((downloadUrl) => window.open(downloadUrl, "_blank"));
}

export { InvoiceDetailPage };
