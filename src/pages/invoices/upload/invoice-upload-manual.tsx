import * as React from "react";
import {
  ArrowRightIcon,
  CalendarBlankIcon,
  PencilSimpleLineIcon,
} from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";

import { PageBackButton } from "@/components/navigation/page-back-button";
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
  setOcrSessionDraft,
  type InvoiceOcrSessionDraft,
} from "@/features/invoice/invoice-slice";
import { bffService, uploadDraftStorageKey } from "@/services/bff-service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import "./invoice-upload.css";

type ManualFields = {
  amountWithoutTax: string;
  buyerName: string;
  buyerTaxId: string;
  invoiceCode: string;
  invoiceDate: string;
  invoiceNumber: string;
  sellerName: string;
  sellerTaxId: string;
  taxAmount: string;
  totalAmount: string;
};

type ManualFieldKey = keyof ManualFields;
type ManualFieldErrors = Partial<Record<ManualFieldKey, string>>;

const requiredManualFields: ManualFieldKey[] = [
  "invoiceNumber",
  "invoiceDate",
  "sellerName",
  "totalAmount",
];

const numericManualFields: ManualFieldKey[] = [
  "amountWithoutTax",
  "taxAmount",
  "totalAmount",
];

const InvoiceUploadManualPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const recognitionSessionId = readRecognitionSessionId(searchParams);
  const sessionDraft = useAppSelector((state) =>
    recognitionSessionId
      ? state.invoice.ocrSessionDrafts[recognitionSessionId]
      : undefined,
  );
  const manualIndex = readManualIndex(searchParams);
  const [fields, setFields] = React.useState<ManualFields>({
    amountWithoutTax: "",
    buyerName: "",
    buyerTaxId: "",
    invoiceCode: "",
    invoiceDate: "",
    invoiceNumber: "",
    sellerName: "",
    sellerTaxId: "",
    taxAmount: "",
    totalAmount: "",
  });
  const [fieldErrors, setFieldErrors] = React.useState<ManualFieldErrors>({});
  const [error, setError] = React.useState("");
  const [previewImageUrl, setPreviewImageUrl] = React.useState(
    sessionDraft?.preview?.imageUrl ?? "",
  );
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);
  const [isPreviewing, setIsPreviewing] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const sessionDraftRef = React.useRef(sessionDraft);

  React.useEffect(() => {
    queueMicrotask(() =>
      setFields((current) => ({
        ...current,
        ...fieldsFromDraft(recognitionSessionId, sessionDraft),
      })),
    );
  }, [recognitionSessionId, sessionDraft]);

  React.useEffect(() => {
    sessionDraftRef.current = sessionDraft;
  }, [sessionDraft]);

  React.useEffect(() => {
    queueMicrotask(() =>
      setPreviewImageUrl(sessionDraft?.preview?.imageUrl ?? ""),
    );
  }, [recognitionSessionId, sessionDraft?.preview?.imageUrl]);

  React.useEffect(() => {
    if (!recognitionSessionId) {
      return;
    }

    let ignore = false;
    queueMicrotask(() => {
      if (!ignore) {
        setIsPreviewing(true);
        setError("");
      }
    });

    void bffService.invoices
      .previewOcrSession(recognitionSessionId)
      .then((preview) => {
        if (ignore) {
          return;
        }
        setPreviewImageUrl(preview.imageUrl);
        const currentDraft = sessionDraftRef.current;
        const previewInvoiceId =
          preview.invoiceId && preview.invoiceId !== "-"
            ? preview.invoiceId
            : undefined;
        dispatch(
          setOcrSessionDraft({
            fileId: currentDraft?.fileId ?? preview.fileId,
            fields: currentDraft?.fields ?? {},
            invoiceId: currentDraft?.invoiceId ?? previewInvoiceId,
            preview,
            raw: currentDraft?.raw,
            sessionId: recognitionSessionId,
            status: currentDraft?.status,
          }),
        );
        persistSessionPreview(recognitionSessionId, preview);
      })
      .catch((caught) => {
        if (!ignore) {
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
  }, [dispatch, recognitionSessionId]);

  const updateField = (key: ManualFieldKey, value: string) => {
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setFields((current) => ({ ...current, [key]: value }));
  };

  const submitManualInput = () => {
    if (isSubmitting) {
      return;
    }

    if (!recognitionSessionId) {
      setError(t("invoiceUpload.manual.missingInvoice"));
      return;
    }

    const nextFieldErrors = validateManualFields(fields);
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setError("请补全必填项并检查金额格式。");
      return;
    }

    setIsSubmitting(true);
    setError("");
    const manualFields = {
      amountWithoutTax: numberOrText(fields.amountWithoutTax),
      buyerName: fields.buyerName,
      buyerTaxId: fields.buyerTaxId,
      invoiceCode: fields.invoiceCode,
      invoiceDate: fields.invoiceDate,
      invoiceNumber: fields.invoiceNumber,
      sellerName: fields.sellerName,
      sellerTaxId: fields.sellerTaxId,
      taxAmount: numberOrText(fields.taxAmount),
      totalAmount: numberOrText(fields.totalAmount),
    };
    const submit = bffService.invoices.submitOcrSessionManualInput(
      recognitionSessionId,
      manualFields,
    );

    void submit
      .then((response) => {
        const invoiceId = readInvoiceIdFromManualSubmitResponse(response);
        if (recognitionSessionId && invoiceId) {
          const currentDraft = sessionDraftRef.current;
          dispatch(
            setOcrSessionDraft({
              fileId: currentDraft?.fileId,
              fields: {
                ...(currentDraft?.fields ?? {}),
                ...manualFields,
              },
              invoiceId,
              preview: currentDraft?.preview,
              raw: currentDraft?.raw,
              sessionId: recognitionSessionId,
              status: currentDraft?.status,
            }),
          );
          persistSessionInvoiceId(recognitionSessionId, invoiceId);
        }

        const nextSessionId = readNextManualSessionId(manualIndex);
        if (nextSessionId) {
          navigate(
            `/invoice/upload/manual?sessionId=${encodeURIComponent(nextSessionId)}&manualIndex=${manualIndex + 1}`,
          );
          return;
        }

        window.localStorage.removeItem(uploadDraftStorageKey);
        navigate(completePath(invoiceId));
      })
      .catch((caught) =>
        setError(caught instanceof Error ? caught.message : String(caught)),
      )
      .finally(() => setIsSubmitting(false));
  };

  return (
    <main className="invoice-upload-page">
      <section className="invoice-upload-page__content">
        <header className="invoice-upload-page__heading">
          <div>
            <h1 className="invoice-upload-page__title">
              {t("invoiceUpload.manual.title")}
            </h1>
            <p className="invoice-upload-page__subtitle">
              {t("invoiceUpload.manual.subtitle")}
            </p>
          </div>
        </header>

        <section className="invoice-upload-page__flow-panel">
          <div className="invoice-upload-page__flow-status">
            <PencilSimpleLineIcon className="invoice-upload-page__flow-icon" />
            <div>
              <h2>{t("invoiceUpload.manual.panelTitle")}</h2>
              <p>{t("invoiceUpload.manual.description")}</p>
            </div>
          </div>

          {previewImageUrl ? (
            <figure className="invoice-upload-page__manual-preview">
              <img
                alt={t("invoiceUpload.manual.previewAlt")}
                src={previewImageUrl}
              />
            </figure>
          ) : isPreviewing ? (
            <div className="invoice-upload-page__manual-preview invoice-upload-page__manual-preview--loading">
              <Spinner />
            </div>
          ) : null}

          <FieldSet className="invoice-upload-page__form-grid">
            <Field data-invalid={Boolean(fieldErrors.invoiceCode)}>
              <FieldLabel htmlFor="invoice-code">
                <FieldContent>
                  <FieldTitle>
                    {t("invoiceUpload.manual.fields.invoiceCode")}
                  </FieldTitle>
                </FieldContent>
              </FieldLabel>
              <Input
                aria-invalid={Boolean(fieldErrors.invoiceCode)}
                disabled={isSubmitting}
                id="invoice-code"
                onChange={(event) =>
                  updateField("invoiceCode", event.target.value)
                }
                value={fields.invoiceCode}
              />
              <FieldError>{fieldErrors.invoiceCode}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.invoiceNumber)}>
              <FieldLabel htmlFor="invoice-number">
                <FieldContent>
                  <FieldTitle>
                    {t("invoiceUpload.manual.fields.invoiceNumber")}
                    <span
                      aria-hidden="true"
                      className="invoice-upload-page__required-mark"
                    >
                      *
                    </span>
                  </FieldTitle>
                </FieldContent>
              </FieldLabel>
              <Input
                aria-invalid={Boolean(fieldErrors.invoiceNumber)}
                disabled={isSubmitting}
                id="invoice-number"
                required
                onChange={(event) =>
                  updateField("invoiceNumber", event.target.value)
                }
                value={fields.invoiceNumber}
              />
              <FieldError>{fieldErrors.invoiceNumber}</FieldError>
            </Field>
            <Field data-invalid={Boolean(fieldErrors.invoiceDate)}>
              <FieldLabel htmlFor="invoice-date">
                <FieldContent>
                  <FieldTitle>
                    {t("invoiceUpload.manual.fields.invoiceDate")}
                    <span
                      aria-hidden="true"
                      className="invoice-upload-page__required-mark"
                    >
                      *
                    </span>
                  </FieldTitle>
                </FieldContent>
              </FieldLabel>
              <Popover
                open={isDatePickerOpen}
                onOpenChange={setIsDatePickerOpen}
              >
                <div className="invoice-upload-page__date-control">
                  <Input
                    aria-invalid={Boolean(fieldErrors.invoiceDate)}
                    disabled={isSubmitting}
                    id="invoice-date"
                    readOnly
                    required
                    value={fields.invoiceDate}
                  />
                  <PopoverTrigger asChild>
                    <Button
                      aria-label="Select invoice date"
                      className="invoice-upload-page__date-button"
                      disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
              <FieldError>{fieldErrors.invoiceDate}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="buyer-name">
                <FieldContent>
                  <FieldTitle>购买方</FieldTitle>
                </FieldContent>
              </FieldLabel>
              <Input
                aria-invalid={Boolean(fieldErrors.buyerName)}
                disabled={isSubmitting}
                id="buyer-name"
                onChange={(event) =>
                  updateField("buyerName", event.target.value)
                }
                value={fields.buyerName}
              />
              <FieldError>{fieldErrors.buyerName}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="buyer-tax-id">
                <FieldContent>
                  <FieldTitle>购买方税号</FieldTitle>
                </FieldContent>
              </FieldLabel>
              <Input
                aria-invalid={Boolean(fieldErrors.buyerTaxId)}
                disabled={isSubmitting}
                id="buyer-tax-id"
                onChange={(event) =>
                  updateField("buyerTaxId", event.target.value)
                }
                value={fields.buyerTaxId}
              />
              <FieldError>{fieldErrors.buyerTaxId}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="seller-name">
                <FieldContent>
                  <FieldTitle>销售方</FieldTitle>
                </FieldContent>
              </FieldLabel>
              <Input
                aria-invalid={Boolean(fieldErrors.sellerName)}
                disabled={isSubmitting}
                id="seller-name"
                onChange={(event) =>
                  updateField("sellerName", event.target.value)
                }
                required
                value={fields.sellerName}
              />
              <FieldError>{fieldErrors.sellerName}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="seller-tax-id">
                <FieldContent>
                  <FieldTitle>销售方税号</FieldTitle>
                </FieldContent>
              </FieldLabel>
              <Input
                aria-invalid={Boolean(fieldErrors.sellerTaxId)}
                disabled={isSubmitting}
                id="seller-tax-id"
                onChange={(event) =>
                  updateField("sellerTaxId", event.target.value)
                }
                value={fields.sellerTaxId}
              />
              <FieldError>{fieldErrors.sellerTaxId}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="amount-without-tax">
                <FieldContent>
                  <FieldTitle>不含税金额</FieldTitle>
                </FieldContent>
              </FieldLabel>
              <Input
                aria-invalid={Boolean(fieldErrors.amountWithoutTax)}
                disabled={isSubmitting}
                id="amount-without-tax"
                inputMode="decimal"
                onChange={(event) =>
                  updateField("amountWithoutTax", event.target.value)
                }
                value={fields.amountWithoutTax}
              />
              <FieldError>{fieldErrors.amountWithoutTax}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="tax-amount">
                <FieldContent>
                  <FieldTitle>
                    {t("invoiceUpload.confirm.fields.tax")}
                  </FieldTitle>
                </FieldContent>
              </FieldLabel>
              <Input
                aria-invalid={Boolean(fieldErrors.taxAmount)}
                disabled={isSubmitting}
                id="tax-amount"
                inputMode="decimal"
                onChange={(event) =>
                  updateField("taxAmount", event.target.value)
                }
                value={fields.taxAmount}
              />
              <FieldError>{fieldErrors.taxAmount}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="invoice-amount">
                <FieldContent>
                  <FieldTitle>
                    {t("invoiceUpload.manual.fields.amount")}
                  </FieldTitle>
                </FieldContent>
              </FieldLabel>
              <Input
                aria-invalid={Boolean(fieldErrors.totalAmount)}
                disabled={isSubmitting}
                id="invoice-amount"
                inputMode="decimal"
                onChange={(event) =>
                  updateField("totalAmount", event.target.value)
                }
                required
                value={fields.totalAmount}
              />
              <FieldError>{fieldErrors.totalAmount}</FieldError>
            </Field>
          </FieldSet>
        </section>

        {error ? <p className="invoice-upload-page__error">{error}</p> : null}

        <footer className="invoice-upload-page__footer">
          <div className="invoice-upload-page__footer-back">
            <PageBackButton disabled={isSubmitting} />
          </div>

          <div className="invoice-upload-page__footer-center">
            <Button
              disabled={isSubmitting}
              onClick={submitManualInput}
              type="button"
            >
              {isSubmitting ? <Spinner /> : <ArrowRightIcon />}
              {t("invoiceUpload.manual.actions.confirm")}
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

function readManualIndex(searchParams: URLSearchParams) {
  const value = Number(searchParams.get("manualIndex") ?? 0);
  return Number.isInteger(value) && value >= 0 ? value : 0;
}

function fieldsFromDraft(
  recognitionSessionId: string | undefined,
  sessionDraft?: InvoiceOcrSessionDraft,
) {
  try {
    const draft = JSON.parse(
      window.localStorage.getItem(uploadDraftStorageKey) ?? "{}",
    ) as {
      ocrSessionDrafts?: Record<string, InvoiceOcrSessionDraft>;
      recognizedFields?: Record<string, unknown>;
      recognizedFieldsBySession?: Record<string, Record<string, unknown>>;
    };
    const source = normalizeRecognizedFields(
      sessionDraft?.fields ||
        (recognitionSessionId &&
          draft.ocrSessionDrafts?.[recognitionSessionId]?.fields) ||
        (recognitionSessionId &&
          draft.recognizedFieldsBySession?.[recognitionSessionId]) ||
        draft.recognizedFields,
    );
    return fieldsFromRecord(source);
  } catch {
    return {};
  }
}

function fieldsFromRecord(
  source: Record<string, unknown>,
): Partial<ManualFields> {
  return {
    amountWithoutTax: stringField(source.amountWithoutTax),
    buyerName: stringField(source.buyerName),
    buyerTaxId: stringField(source.buyerTaxId),
    invoiceCode: stringField(source.invoiceCode),
    invoiceDate: dateField(source.invoiceDate ?? source.issueDate),
    invoiceNumber: stringField(
      source.invoiceNo ?? source.invoiceNumber ?? source.invoice_number,
    ),
    sellerName: stringField(source.sellerName ?? source.seller),
    sellerTaxId: stringField(source.sellerTaxId),
    taxAmount: stringField(source.taxAmount),
    totalAmount: stringField(source.totalAmount ?? source.amount),
  };
}

function readInvoiceIdFromManualSubmitResponse(response: unknown) {
  const root = asRecord(response);
  const data = asRecord(root.data);
  const summary = asRecord(root.summary ?? data.summary);
  const value =
    summary.id ??
    summary.invoiceId ??
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

function persistSessionInvoiceId(sessionId: string, invoiceId: string) {
  try {
    const draft = JSON.parse(
      window.localStorage.getItem(uploadDraftStorageKey) ?? "{}",
    ) as Record<string, unknown>;
    window.localStorage.setItem(
      uploadDraftStorageKey,
      JSON.stringify({
        ...draft,
        invoiceIdsBySession: {
          ...asRecord(draft.invoiceIdsBySession),
          [sessionId]: invoiceId,
        },
        ocrSessionDrafts: {
          ...asRecord(draft.ocrSessionDrafts),
          [sessionId]: {
            ...asRecord(asRecord(draft.ocrSessionDrafts)[sessionId]),
            invoiceId,
            sessionId,
          },
        },
      }),
    );
  } catch {
    window.localStorage.setItem(
      uploadDraftStorageKey,
      JSON.stringify({
        invoiceIdsBySession: { [sessionId]: invoiceId },
        ocrSessionDrafts: { [sessionId]: { invoiceId, sessionId } },
      }),
    );
  }
}

function persistSessionPreview(sessionId: string, preview: unknown) {
  try {
    const draft = JSON.parse(
      window.localStorage.getItem(uploadDraftStorageKey) ?? "{}",
    ) as Record<string, unknown>;
    window.localStorage.setItem(
      uploadDraftStorageKey,
      JSON.stringify({
        ...draft,
        ocrSessionDrafts: {
          ...asRecord(draft.ocrSessionDrafts),
          [sessionId]: {
            ...asRecord(asRecord(draft.ocrSessionDrafts)[sessionId]),
            preview,
            sessionId,
          },
        },
      }),
    );
  } catch {
    window.localStorage.setItem(
      uploadDraftStorageKey,
      JSON.stringify({
        ocrSessionDrafts: { [sessionId]: { preview, sessionId } },
      }),
    );
  }
}

function readNextManualSessionId(currentManualIndex: number) {
  try {
    const draft = JSON.parse(
      window.localStorage.getItem(uploadDraftStorageKey) ?? "{}",
    ) as { manualSessionIds?: string[] };
    return draft.manualSessionIds?.[currentManualIndex + 1];
  } catch {
    return undefined;
  }
}

function numberOrText(value: string) {
  const text = value.trim();
  return text ? Number(text) : "";
}

function validateManualFields(fields: ManualFields): ManualFieldErrors {
  const errors: ManualFieldErrors = {};

  requiredManualFields.forEach((key) => {
    if (!fields[key].trim()) {
      errors[key] = `${labelForManualField(key)}为必填项`;
    }
  });

  numericManualFields.forEach((key) => {
    const text = fields[key].trim();
    if (!text) {
      return;
    }

    const value = Number(text);
    if (!Number.isFinite(value) || value < 0) {
      errors[key] = `${labelForManualField(key)}必须是有效金额`;
    }
  });

  const totalAmountText = fields.totalAmount.trim();
  const totalAmount = Number(totalAmountText);
  if (totalAmountText && (!Number.isFinite(totalAmount) || totalAmount <= 0)) {
    errors.totalAmount = `${labelForManualField("totalAmount")}必须大于 0`;
  }

  return errors;
}

function labelForManualField(key: ManualFieldKey) {
  const labels: Record<ManualFieldKey, string> = {
    amountWithoutTax: "不含税金额",
    buyerName: "购买方",
    buyerTaxId: "购买方税号",
    invoiceCode: "发票代码",
    invoiceDate: "开票日期",
    invoiceNumber: "发票号码",
    sellerName: "销售方",
    sellerTaxId: "销售方税号",
    taxAmount: "税额",
    totalAmount: "含税金额",
  };

  return labels[key];
}

function stringField(value: unknown) {
  if (typeof value === "string") {
    return value === "-" ? "" : value;
  }
  if (typeof value === "number") {
    return String(value);
  }
  return "";
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

function normalizeRecognizedFields(value: unknown) {
  const fields = asRecord(value);
  const normalizedResult = asRecord(fields.normalizedResult ?? fields);
  const firstInvoiceItem = Array.isArray(normalizedResult.invoiceItems)
    ? normalizedResult.invoiceItems[0]
    : undefined;
  const normalizedFields = asRecord(firstInvoiceItem);
  return Object.keys(normalizedFields).length > 0 ? normalizedFields : fields;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export { InvoiceUploadManualPage };
