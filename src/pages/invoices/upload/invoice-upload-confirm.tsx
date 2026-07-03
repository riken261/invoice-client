import * as React from "react";
import {
  CalendarBlankIcon,
  CheckCircleIcon,
  PaperPlaneTiltIcon,
} from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import {
  bffService,
  type BffInvoiceDetail,
  uploadDraftStorageKey,
} from "@/services/bff-service";
import type { InvoiceOcrSessionDraft } from "@/features/invoice/invoice-slice";
import { useAppSelector } from "@/store/hooks";

import "./invoice-upload.css";

type ConfirmFieldKey =
  | "amountWithoutTax"
  | "buyerName"
  | "buyerTaxId"
  | "invoiceCode"
  | "invoiceDate"
  | "invoiceNo"
  | "sellerName"
  | "sellerTaxId"
  | "taxAmount"
  | "totalAmount";

type ConfirmFields = Record<ConfirmFieldKey, string>;
type ConfirmFieldErrors = Partial<Record<ConfirmFieldKey, string>>;

const confirmFieldLabels: Array<{
  key: ConfirmFieldKey;
  label: string;
  type?: string;
}> = [
  { key: "invoiceCode", label: "发票代码" },
  { key: "invoiceNo", label: "发票号码" },
  { key: "invoiceDate", label: "开票日期" },
  { key: "buyerName", label: "购买方" },
  { key: "buyerTaxId", label: "购买方税号" },
  { key: "sellerName", label: "销售方" },
  { key: "sellerTaxId", label: "销售方税号" },
  { key: "amountWithoutTax", label: "不含税金额" },
  { key: "taxAmount", label: "税额" },
  { key: "totalAmount", label: "含税金额" },
];

const emptyConfirmFields: ConfirmFields = {
  amountWithoutTax: "",
  buyerName: "",
  buyerTaxId: "",
  invoiceCode: "",
  invoiceDate: "",
  invoiceNo: "",
  sellerName: "",
  sellerTaxId: "",
  taxAmount: "",
  totalAmount: "",
};

const requiredConfirmFields: ConfirmFieldKey[] = [
  "invoiceNo",
  "invoiceDate",
  "sellerName",
  "totalAmount",
];

const numericConfirmFields: ConfirmFieldKey[] = [
  "amountWithoutTax",
  "taxAmount",
  "totalAmount",
];

const InvoiceUploadConfirmPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const recognitionSessionId = readRecognitionSessionId(searchParams);
  const confirmIndex = readConfirmIndex(searchParams);
  const sessionDrafts = useAppSelector(
    (state) => state.invoice.ocrSessionDrafts,
  );
  const currentSessionDraft = React.useMemo(
    () =>
      recognitionSessionId
        ? (sessionDrafts[recognitionSessionId] ??
          readStoredSessionDraft(recognitionSessionId))
        : undefined,
    [recognitionSessionId, sessionDrafts],
  );
  const [error, setError] = React.useState("");
  const [invoice, setInvoice] = React.useState<BffInvoiceDetail | null>(null);
  const [fields, setFields] = React.useState<ConfirmFields>(emptyConfirmFields);
  const [fieldErrors, setFieldErrors] = React.useState<ConfirmFieldErrors>({});
  const [previewImageUrl, setPreviewImageUrl] = React.useState(
    currentSessionDraft?.preview?.imageUrl ?? "",
  );
  const [isConfirming, setIsConfirming] = React.useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isPreviewing, setIsPreviewing] = React.useState(false);

  React.useEffect(() => {
    let ignore = false;

    async function loadInvoice() {
      try {
        if (!recognitionSessionId) {
          return;
        }

        if (!ignore) {
          const detail = detailFromSessionDraft(
            recognitionSessionId,
            currentSessionDraft,
          );
          setInvoice(detail);
          setFields(fieldsFromRecord(detail.confirmedFields));
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
  }, [currentSessionDraft, recognitionSessionId]);

  React.useEffect(() => {
    queueMicrotask(() =>
      setPreviewImageUrl(currentSessionDraft?.preview?.imageUrl ?? ""),
    );
  }, [currentSessionDraft?.preview?.imageUrl, recognitionSessionId]);

  React.useEffect(() => {
    if (!recognitionSessionId) {
      return;
    }

    let ignore = false;
    queueMicrotask(() => {
      if (!ignore) {
        setIsPreviewing(true);
      }
    });

    void bffService.invoices
      .previewOcrSession(recognitionSessionId)
      .then((preview) => {
        if (!ignore) {
          setPreviewImageUrl(preview.imageUrl);
        }
      })
      .catch((caught) => {
        if (!ignore && !currentSessionDraft?.preview?.imageUrl) {
          setError(caught instanceof Error ? caught.message : String(caught));
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsPreviewing(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [currentSessionDraft?.preview?.imageUrl, recognitionSessionId]);

  const confirmInvoice = () => {
    if (isConfirming) {
      return;
    }

    if (!recognitionSessionId) {
      setError(t("invoiceUpload.confirm.missingSession"));
      return;
    }

    const nextFieldErrors = validateConfirmFields(fields);
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setError("请补全必填项并检查金额格式。");
      return;
    }

    const confirmedFields = toConfirmedFields(fields, invoice?.confirmedFields);
    setIsConfirming(true);
    setError("");
    const confirm = bffService.invoices.confirmSession(
      recognitionSessionId,
      confirmedFields,
    );

    void confirm
      .then((response) => {
        const invoiceId = readInvoiceIdFromConfirmResponse(response);
        const nextConfirmSessionId = readNextConfirmSessionId(confirmIndex);
        if (nextConfirmSessionId) {
          navigate(
            `/invoice/upload/confirm?sessionId=${encodeURIComponent(nextConfirmSessionId)}&confirmIndex=${confirmIndex + 1}`,
          );
          return;
        }

        const firstManualSessionId = readFirstManualSessionId();
        if (firstManualSessionId) {
          navigate(
            `/invoice/upload/manual?sessionId=${encodeURIComponent(firstManualSessionId)}&manualIndex=0`,
          );
          return;
        }

        window.localStorage.removeItem(uploadDraftStorageKey);
        navigate(completePath(invoiceId));
      })
      .catch((caught) =>
        setError(caught instanceof Error ? caught.message : String(caught)),
      )
      .finally(() => setIsConfirming(false));
  };

  const returnToUpload = () => {
    if (!recognitionSessionId) {
      navigate(-1);
      return;
    }

    window.localStorage.removeItem(uploadDraftStorageKey);
    navigate("/invoice/upload", { replace: true });
  };

  return (
    <main className="invoice-upload-page">
      <section className="invoice-upload-page__content">
        <header className="invoice-upload-page__heading">
          <div>
            <h1 className="invoice-upload-page__title">
              {t("invoiceUpload.confirm.title")}
            </h1>
            <p className="invoice-upload-page__subtitle">
              {t("invoiceUpload.confirm.subtitle")}
            </p>
          </div>
        </header>

        <section className="invoice-upload-page__flow-panel">
          <div className="invoice-upload-page__flow-status">
            <CheckCircleIcon className="invoice-upload-page__flow-icon" />
            <div>
              <h2>{t("invoiceUpload.confirm.panelTitle")}</h2>
              <p>{t("invoiceUpload.confirm.description")}</p>
            </div>
          </div>

          {isLoading ? (
            <div className="invoice-upload-page__flow-status">
              <Spinner className="invoice-upload-page__flow-icon" />
              <div>
                <h2>{t("invoiceUpload.confirm.panelTitle")}</h2>
                <p>{t("invoiceUpload.ocr.processing")}</p>
              </div>
            </div>
          ) : null}

          {!isLoading ? (
            <>
              {previewImageUrl ? (
                <figure className="invoice-upload-page__confirm-preview">
                  <img
                    alt={
                      currentSessionDraft?.preview?.filename ??
                      recognitionSessionId
                    }
                    src={previewImageUrl}
                  />
                </figure>
              ) : isPreviewing ? (
                <div className="invoice-upload-page__confirm-preview invoice-upload-page__manual-preview--loading">
                  <Spinner />
                </div>
              ) : null}
              <FieldSet className="invoice-upload-page__form-grid">
                {confirmFieldLabels.map((field) => (
                  <Field
                    data-invalid={Boolean(fieldErrors[field.key])}
                    key={field.key}
                  >
                    <FieldLabel htmlFor={`confirm-${field.key}`}>
                      <FieldContent>
                        <FieldTitle>
                          {field.label}
                          {isRequiredConfirmField(field.key) ? (
                            <span
                              aria-hidden="true"
                              className="invoice-upload-page__required-mark"
                            >
                              *
                            </span>
                          ) : null}
                        </FieldTitle>
                      </FieldContent>
                    </FieldLabel>
                    {field.key === "invoiceDate" ? (
                      <Popover
                        open={isDatePickerOpen}
                        onOpenChange={setIsDatePickerOpen}
                      >
                        <div className="invoice-upload-page__date-control">
                          <Input
                            aria-invalid={Boolean(fieldErrors[field.key])}
                            disabled={isConfirming}
                            id={`confirm-${field.key}`}
                            readOnly
                            required={isRequiredConfirmField(field.key)}
                            value={fields[field.key]}
                          />
                          <PopoverTrigger asChild>
                            <Button
                              aria-label="Select invoice date"
                              className="invoice-upload-page__date-button"
                              disabled={isConfirming}
                              size="icon"
                              type="button"
                              variant="outline"
                            >
                              <CalendarBlankIcon />
                            </Button>
                          </PopoverTrigger>
                        </div>
                        <PopoverContent
                          align="end"
                          className="invoice-upload-page__calendar-popover"
                        >
                          <Calendar
                            className="invoice-upload-page__calendar"
                            defaultMonth={dateFromField(fields.invoiceDate)}
                            disabled={isConfirming}
                            mode="single"
                            onSelect={(date) => {
                              setFieldErrors((current) => ({
                                ...current,
                                invoiceDate: undefined,
                              }));
                              setFields((current) => ({
                                ...current,
                                invoiceDate: date ? formatDateField(date) : "",
                              }));
                              setIsDatePickerOpen(false);
                            }}
                            selected={dateFromField(fields.invoiceDate)}
                          />
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <Input
                        aria-invalid={Boolean(fieldErrors[field.key])}
                        disabled={isConfirming}
                        id={`confirm-${field.key}`}
                        inputMode={
                          moneyField(field.key) ? "decimal" : undefined
                        }
                        onChange={(event) => {
                          setFieldErrors((current) => ({
                            ...current,
                            [field.key]: undefined,
                          }));
                          setFields((current) => ({
                            ...current,
                            [field.key]: event.target.value,
                          }));
                        }}
                        required={isRequiredConfirmField(field.key)}
                        type="text"
                        value={fields[field.key]}
                      />
                    )}
                    <FieldError>{fieldErrors[field.key]}</FieldError>
                  </Field>
                ))}
              </FieldSet>
            </>
          ) : null}
        </section>

        {error ? <p className="invoice-upload-page__error">{error}</p> : null}

        <footer className="invoice-upload-page__footer">
          <div className="invoice-upload-page__footer-back">
            <Button
              disabled={isConfirming}
              onClick={returnToUpload}
              type="button"
              variant="outline"
            >
              {t("invoiceUpload.confirm.actions.back")}
            </Button>
          </div>

          <div className="invoice-upload-page__footer-center">
            <Button
              disabled={isConfirming}
              onClick={confirmInvoice}
              type="button"
            >
              {isConfirming ? <Spinner /> : <PaperPlaneTiltIcon />}
              {t("invoiceUpload.confirm.actions.complete")}
            </Button>
          </div>
        </footer>
      </section>
    </main>
  );
};

function readRecognitionSessionId(searchParams: URLSearchParams) {
  const querySessionId = searchParams.get("sessionId");
  if (querySessionId) {
    return querySessionId;
  }
  const legacyQueryInvoiceId = searchParams.get("invoiceId");
  if (legacyQueryInvoiceId?.startsWith("ocr-session-")) {
    return legacyQueryInvoiceId;
  }

  try {
    const draft = JSON.parse(
      window.localStorage.getItem(uploadDraftStorageKey) ?? "{}",
    ) as { recognitionSessionId?: string };
    return draft.recognitionSessionId;
  } catch {
    return undefined;
  }
}

function readConfirmIndex(searchParams: URLSearchParams) {
  const value = Number(searchParams.get("confirmIndex") ?? 0);
  return Number.isInteger(value) && value >= 0 ? value : 0;
}

function readNextConfirmSessionId(currentConfirmIndex: number) {
  try {
    const draft = JSON.parse(
      window.localStorage.getItem(uploadDraftStorageKey) ?? "{}",
    ) as { confirmSessionIds?: string[] };
    return draft.confirmSessionIds?.[currentConfirmIndex + 1];
  } catch {
    return undefined;
  }
}

function readFirstManualSessionId() {
  try {
    const draft = JSON.parse(
      window.localStorage.getItem(uploadDraftStorageKey) ?? "{}",
    ) as { manualSessionIds?: string[] };
    return draft.manualSessionIds?.[0];
  } catch {
    return undefined;
  }
}

function readInvoiceIdFromConfirmResponse(response: unknown) {
  const root = asRecord(response);
  const data = asRecord(root.data);
  const summary = asRecord(root.summary ?? data.summary);
  const value =
    summary.invoiceId ??
    summary.id ??
    root.invoiceId ??
    root.id ??
    data.invoiceId ??
    data.id;
  return typeof value === "string" && value ? value : undefined;
}

function completePath(invoiceId: string | undefined) {
  return invoiceId
    ? `/invoice/upload/complate?invoiceId=${encodeURIComponent(invoiceId)}`
    : "/invoice/upload/complate";
}

function readStoredSessionDraft(sessionId: string) {
  try {
    const draft = JSON.parse(
      window.localStorage.getItem(uploadDraftStorageKey) ?? "{}",
    ) as { ocrSessionDrafts?: Record<string, InvoiceOcrSessionDraft> };
    return draft.ocrSessionDrafts?.[sessionId];
  } catch {
    return undefined;
  }
}

function detailFromSessionDraft(
  recognitionSessionId: string,
  draft: InvoiceOcrSessionDraft | undefined,
): BffInvoiceDetail {
  const fields = draft?.fields ?? {};
  const id = draft?.invoiceId ?? recognitionSessionId;
  const fileId = draft?.fileId ?? "";
  const amount = Number(fields.totalAmount ?? fields.amount ?? 0);
  const invoiceNumber = String(
    fields.invoiceNo ?? fields.invoiceNumber ?? fields.invoice_number ?? "-",
  );
  const invoiceDate = String(fields.invoiceDate ?? fields.issueDate ?? "-");
  const invoiceCode = String(fields.invoiceCode ?? fields.invoice_code ?? "-");
  const seller = String(fields.sellerName ?? fields.seller ?? "-");

  return {
    amount: Number.isFinite(amount) ? amount : 0,
    amountWithoutTax: Number(fields.amountWithoutTax ?? 0),
    buyerName: String(fields.buyerName ?? "-"),
    canDownload: false,
    confirmedFields: fields,
    currency: stringField(fields.currency, "CNY"),
    duplicateHits: [],
    duplicateRisk: "low",
    duplicateStatus: "-",
    fileId: fileId || undefined,
    fileName: fileId ? `${fileId}.jpg` : `${id}.jpg`,
    id,
    invoiceCode,
    invoiceDate,
    invoiceType: String(fields.invoiceType ?? "-"),
    invoiceTitle: String(fields.title ?? "-"),
    latestReviewOpinion: "",
    manualFields: {},
    manualInput: false,
    invoiceNumber,
    ocrConfidence: Number(fields.confidence ?? 0),
    ocrFields: Object.entries(fields).map(([label, value]) => ({
      confidence: Number(fields.confidence ?? 0),
      label,
      value: String(value ?? "-"),
    })),
    ocrRawFields: fields,
    ocrStatus: draft?.status ?? "OCR_SUCCESS",
    photos: readPhotoCount(),
    reviewRecords: [],
    seller,
    source: "ocr",
    status: "submitted",
    submittedAt: invoiceDate,
    taxAmount: Number(fields.taxAmount ?? 0),
    updatedAt: "-",
  };
}

function fieldsFromRecord(source: Record<string, unknown>): ConfirmFields {
  return {
    amountWithoutTax: stringField(source.amountWithoutTax),
    buyerName: stringField(source.buyerName),
    buyerTaxId: stringField(source.buyerTaxId),
    invoiceCode: stringField(source.invoiceCode),
    invoiceDate: dateField(source.invoiceDate ?? source.issueDate),
    invoiceNo: stringField(
      source.invoiceNo ?? source.invoiceNumber ?? source.invoice_number,
    ),
    sellerName: stringField(source.sellerName ?? source.seller),
    sellerTaxId: stringField(source.sellerTaxId),
    taxAmount: stringField(source.taxAmount),
    totalAmount: stringField(source.totalAmount ?? source.amount),
  };
}

function toConfirmedFields(
  fields: ConfirmFields,
  original: Record<string, unknown> | undefined,
) {
  const result: Record<string, unknown> = {
    ...(original ?? {}),
    currency: stringField(original?.currency, "CNY"),
  };
  Object.entries(fields).forEach(([key, value]) => {
    const text = value.trim();
    result[key] = moneyField(key) && text ? Number(text) : text;
  });
  return result;
}

function moneyField(key: string) {
  return (
    key === "amountWithoutTax" || key === "taxAmount" || key === "totalAmount"
  );
}

function isRequiredConfirmField(key: ConfirmFieldKey) {
  return requiredConfirmFields.includes(key);
}

function validateConfirmFields(fields: ConfirmFields): ConfirmFieldErrors {
  const errors: ConfirmFieldErrors = {};

  requiredConfirmFields.forEach((key) => {
    if (!fields[key].trim()) {
      errors[key] = `${labelForConfirmField(key)}为必填项`;
    }
  });

  numericConfirmFields.forEach((key) => {
    const text = fields[key].trim();
    if (!text) {
      return;
    }

    const value = Number(text);
    if (!Number.isFinite(value) || value < 0) {
      errors[key] = `${labelForConfirmField(key)}必须是有效金额`;
    }
  });

  const totalAmountText = fields.totalAmount.trim();
  const totalAmount = Number(totalAmountText);
  if (totalAmountText && (!Number.isFinite(totalAmount) || totalAmount <= 0)) {
    errors.totalAmount = `${labelForConfirmField("totalAmount")}必须大于 0`;
  }

  return errors;
}

function labelForConfirmField(key: ConfirmFieldKey) {
  return confirmFieldLabels.find((field) => field.key === key)?.label ?? key;
}

function stringField(value: unknown, fallback = "") {
  if (typeof value === "string") {
    return value === "-" ? "" : value;
  }
  if (typeof value === "number") {
    return String(value);
  }
  return fallback;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function dateField(value: unknown) {
  const text = stringField(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }
  const parts = text.match(/\d+/g);
  if (parts && parts.length >= 3) {
    const [year, month, day] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  const match = text.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日$/);
  if (!match) {
    return "";
  }
  const [, year, month, day] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function dateFromField(value: string) {
  const parts = value.match(/\d+/g);
  if (!parts || parts.length < 3) {
    return undefined;
  }
  const [year, month, day] = parts.map(Number);
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatDateField(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function readPhotoCount() {
  try {
    const draft = JSON.parse(
      window.localStorage.getItem(uploadDraftStorageKey) ?? "{}",
    ) as { photoCount?: number };
    return draft.photoCount ?? 0;
  } catch {
    return 0;
  }
}

export { InvoiceUploadConfirmPage };
