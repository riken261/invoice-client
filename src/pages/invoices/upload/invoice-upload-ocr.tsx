import * as React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Spinner } from "@/components/ui/spinner";
import {
  setOcrSessionDrafts,
  type InvoiceOcrSessionDraft,
} from "@/features/invoice/invoice-slice";
import { bffService, uploadDraftStorageKey } from "@/services/bff-service";
import { useAppDispatch } from "@/store/hooks";

import "./invoice-upload.css";

const fallbackPollingIntervalMs = 2000;
const pollingTimeoutMs = 30_000;

type OcrSessionResult = Record<string, unknown> & {
  sessionId?: string;
  status?: string;
};

const InvoiceUploadOcrPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [error, setError] = React.useState("");
  const [lastCheckedAt, setLastCheckedAt] = React.useState("");

  const batchId = readBatchId(searchParams);

  React.useEffect(() => {
    if (!batchId) {
      queueMicrotask(() => setError(t("invoiceUpload.ocr.missingInvoice")));
      return;
    }

    const currentBatchId = batchId;
    let ignore = false;
    let timeoutId: number | undefined;
    const deadlineAt = Date.now() + pollingTimeoutMs;

    const finishBatch = (response: unknown) => {
      const sessions = readSessions(response);
      const drafts = sessions.map((session) => createOcrSessionDraft(session));
      const draftsBySessionId = drafts.reduce<
        Record<string, InvoiceOcrSessionDraft>
      >((result, draft) => {
        if (draft.sessionId) {
          result[draft.sessionId] = draft;
        }
        return result;
      }, {});
      dispatch(setOcrSessionDrafts(draftsBySessionId));
      persistOcrSessionDrafts(draftsBySessionId);

      const manualSessionIds = sessions
        .filter((session) => shouldManualInput(session))
        .map((session) => readSessionId(session))
        .filter(Boolean);
      const confirmSessionIds = sessions
        .filter((session) => !shouldManualInput(session))
        .map((session) => readSessionId(session))
        .filter(Boolean);

      persistBatchResult(
        currentBatchId,
        sessions,
        manualSessionIds,
        confirmSessionIds,
      );

      if (confirmSessionIds.length > 0) {
        navigate(
          `/invoice/upload/confirm?sessionId=${encodeURIComponent(confirmSessionIds[0])}&confirmIndex=0`,
          { replace: true },
        );
        return;
      }

      if (manualSessionIds.length > 0) {
        navigate(
          `/invoice/upload/manual?sessionId=${encodeURIComponent(manualSessionIds[0])}&manualIndex=0`,
          { replace: true },
        );
        return;
      }

      navigate("/invoice/upload/complate", { replace: true });
    };

    async function pollOcrBatch() {
      try {
        const response =
          await bffService.invoices.getOcrBatchResults(currentBatchId);
        if (ignore) {
          return;
        }

        const sessions = readSessions(response);
        setError("");
        setLastCheckedAt(new Date().toLocaleTimeString());

        if (
          readCompleted(response) ||
          (sessions.length > 0 &&
            sessions.every((session) => !isProcessing(session)))
        ) {
          finishBatch(response);
          return;
        }

        if (Date.now() >= deadlineAt) {
          finishBatch(response);
          return;
        }

        const nextDelayMs = Math.max(
          250,
          Math.min(readNextPollAfterMs(response), deadlineAt - Date.now()),
        );
        timeoutId = window.setTimeout(pollOcrBatch, nextDelayMs);
      } catch (caught) {
        if (!ignore) {
          setError(caught instanceof Error ? caught.message : String(caught));
        }

        if (Date.now() >= deadlineAt || ignore) {
          return;
        }

        timeoutId = window.setTimeout(pollOcrBatch, fallbackPollingIntervalMs);
      }
    }

    queueMicrotask(() => void pollOcrBatch());

    return () => {
      ignore = true;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [batchId, dispatch, navigate, t]);

  return (
    <main className="invoice-upload-page">
      <section className="invoice-upload-page__content">
        <header className="invoice-upload-page__heading">
          <div>
            <h1 className="invoice-upload-page__title">
              {t("invoiceUpload.ocr.title")}
            </h1>
            <p className="invoice-upload-page__subtitle">
              {t("invoiceUpload.ocr.subtitle")}
            </p>
          </div>
        </header>

        <section className="invoice-upload-page__flow-panel">
          <div className="invoice-upload-page__flow-status">
            <Spinner className="invoice-upload-page__flow-icon" />
            <div>
              <h2>{t("invoiceUpload.ocr.panelTitle")}</h2>
              <p>{t("invoiceUpload.ocr.polling")}</p>
            </div>
          </div>

          <div className="invoice-upload-page__metric-grid">
            <div className="invoice-upload-page__metric">
              <span>{t("invoiceUpload.ocr.metrics.photos")}</span>
              <strong>{readPhotoCount()}</strong>
            </div>
            <div className="invoice-upload-page__metric">
              <span>{t("invoiceUpload.ocr.metrics.engine")}</span>
              <strong>BFF OCR</strong>
            </div>
            <div className="invoice-upload-page__metric">
              <span>{t("invoiceUpload.ocr.metrics.queue")}</span>
              <strong>{batchId ?? "-"}</strong>
            </div>
            <div className="invoice-upload-page__metric">
              <span>{t("invoiceUpload.ocr.metrics.lastCheckedAt")}</span>
              <strong>{lastCheckedAt || "-"}</strong>
            </div>
          </div>
        </section>

        {error ? <p className="invoice-upload-page__error">{error}</p> : null}
      </section>
    </main>
  );
};

function readBatchId(searchParams: URLSearchParams) {
  const queryBatchId = searchParams.get("batchId");
  if (queryBatchId) {
    return queryBatchId;
  }

  try {
    const draft = JSON.parse(
      window.localStorage.getItem(uploadDraftStorageKey) ?? "{}",
    ) as { batchId?: string };
    return draft.batchId;
  } catch {
    return undefined;
  }
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

function readSessions(response: unknown): OcrSessionResult[] {
  const root = asRecord(response);
  const data = asRecord(root.data);
  const sessions =
    (Array.isArray(root.sessions) ? root.sessions : undefined) ??
    (Array.isArray(data.sessions) ? data.sessions : undefined);
  return (sessions ?? []).map(asRecord) as OcrSessionResult[];
}

function readCompleted(response: unknown) {
  const root = asRecord(response);
  const data = asRecord(root.data);
  return Boolean(root.completed ?? data.completed);
}

function readNextPollAfterMs(response: unknown) {
  const root = asRecord(response);
  const data = asRecord(root.data);
  const value = root.nextPollAfterMs ?? data.nextPollAfterMs;
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : fallbackPollingIntervalMs;
}

function createOcrSessionDraft(session: OcrSessionResult) {
  const sessionId = readSessionId(session);
  const fields = readInvoiceFieldsFromSession(session);
  return {
    fileId: stringField(session.fileId),
    fields,
    invoiceId: readInvoiceIdFromSession(session),
    preview: readSessionPreview(session),
    raw: session,
    sessionId,
    status: stringField(session.status),
  };
}

function persistOcrSessionDrafts(
  draftsBySessionId: Record<string, InvoiceOcrSessionDraft>,
) {
  const firstDraft = Object.values(draftsBySessionId)[0];
  try {
    const uploadDraft = JSON.parse(
      window.localStorage.getItem(uploadDraftStorageKey) ?? "{}",
    ) as Record<string, unknown>;
    window.localStorage.setItem(
      uploadDraftStorageKey,
      JSON.stringify({
        ...uploadDraft,
        recognizedFields: firstDraft?.fields ?? {},
        recognizedFieldsBySession: Object.fromEntries(
          Object.entries(draftsBySessionId).map(([sessionId, draft]) => [
            sessionId,
            draft.fields,
          ]),
        ),
        ocrSessionDrafts: draftsBySessionId,
      }),
    );
  } catch {
    window.localStorage.setItem(
      uploadDraftStorageKey,
      JSON.stringify({
        recognizedFields: firstDraft?.fields ?? {},
        recognizedFieldsBySession: Object.fromEntries(
          Object.entries(draftsBySessionId).map(([sessionId, draft]) => [
            sessionId,
            draft.fields,
          ]),
        ),
        ocrSessionDrafts: draftsBySessionId,
      }),
    );
  }
}

function persistBatchResult(
  batchId: string,
  sessions: OcrSessionResult[],
  manualSessionIds: string[],
  confirmSessionIds: string[],
) {
  try {
    const uploadDraft = JSON.parse(
      window.localStorage.getItem(uploadDraftStorageKey) ?? "{}",
    ) as Record<string, unknown>;
    const invoiceIdsBySession = asRecord(uploadDraft.invoiceIdsBySession);
    window.localStorage.setItem(
      uploadDraftStorageKey,
      JSON.stringify({
        ...uploadDraft,
        batchId,
        confirmSessionIds,
        invoiceIdsBySession,
        manualSessionIds,
        recognitionSessionId:
          manualSessionIds[0] ??
          confirmSessionIds[0] ??
          readSessionId(sessions[0]),
        sessions: sessions.map((session) => ({
          fileId: stringField(session.fileId),
          recognitionSessionId: readSessionId(session),
          status: stringField(session.status),
        })),
      }),
    );
  } catch {
    window.localStorage.setItem(
      uploadDraftStorageKey,
      JSON.stringify({ batchId, confirmSessionIds, manualSessionIds }),
    );
  }
}

function shouldManualInput(session: OcrSessionResult) {
  const status = stringField(session.status).toUpperCase();
  if (
    status === "LOW_CONFIDENCE" ||
    status === "OCR_FAILED" ||
    status === "FAILED" ||
    status === "ERROR" ||
    status === "TIMEOUT" ||
    status === "PROCESSING"
  ) {
    return true;
  }

  return readInvoiceItems(session).some((item) =>
    Boolean(item.lowConfidence ?? item.manualInputRequired),
  );
}

function isProcessing(session: OcrSessionResult) {
  return stringField(session.status).toUpperCase() === "PROCESSING";
}

function readInvoiceFieldsFromSession(session: OcrSessionResult) {
  const normalizedResult = asRecord(session.normalizedResult);
  const fields = firstArrayRecord(normalizedResult.invoiceItems);
  return Object.keys(fields).length > 0
    ? fields
    : firstArrayRecord(session.invoiceItems);
}

function readInvoiceItems(session: OcrSessionResult) {
  const normalizedResult = asRecord(session.normalizedResult);
  const items = Array.isArray(normalizedResult.invoiceItems)
    ? normalizedResult.invoiceItems
    : Array.isArray(session.invoiceItems)
      ? session.invoiceItems
      : [];
  return items.map(asRecord);
}

function readInvoiceIdFromSession(session: OcrSessionResult) {
  const value =
    session.invoiceId ??
    session.submittedInvoiceId ??
    asRecord(session.summary).id ??
    asRecord(session.summary).invoiceId;
  return typeof value === "string" && value ? value : undefined;
}

function readSessionPreview(session: OcrSessionResult) {
  const normalizedResult = asRecord(session.normalizedResult);
  const fields = readInvoiceFieldsFromSession(session);
  const rawInvoiceInfo = asRecord(fields.rawInvoiceInfo);
  const imageUrl =
    stringField(session.imageUrl) ||
    stringField(session.previewUrl) ||
    stringField(session.fileUrl) ||
    stringField(normalizedResult.imageUrl) ||
    stringField(fields.imageUrl) ||
    dataUrlFromBase64(
      stringField(fields.cutImageBase64) ||
        stringField(rawInvoiceInfo.cutImageBase64) ||
        stringField(session.cutImageBase64),
    );
  const filename =
    stringField(session.fileName) ||
    stringField(session.filename) ||
    `${readSessionId(session)}.png`;

  return imageUrl ? { filename, imageUrl } : undefined;
}

function dataUrlFromBase64(value: string) {
  return value ? `data:image/png;base64,${value}` : "";
}

function readSessionId(session: unknown) {
  const record = asRecord(session);
  const value =
    record.sessionId ??
    record.recognitionSessionId ??
    record.ocrSessionId ??
    record.id;
  return typeof value === "string" ? value : "";
}

function firstArrayRecord(value: unknown) {
  return Array.isArray(value) ? asRecord(value[0]) : {};
}

function stringField(value: unknown) {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return String(value);
  }
  return "";
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export { InvoiceUploadOcrPage };
