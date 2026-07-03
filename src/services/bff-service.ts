import { ApiError, httpClient, request } from "@/hooks/http";

type ResourceType =
  | "EXPENSE_CLAIM"
  | "INVOICE"
  | "OCR_TASK"
  | "OUTBOX_EVENT"
  | "STORAGE_FAILURE"
  | "SYSTEM_SETTING";

type InvoiceStatus = "submitted" | "confirmed" | "archived" | "rejected";
type InvoiceSource = "ocr" | "manual";
type ClaimStatus = "archived" | "draft" | "submitted" | "rejected" | "paid";
type ClaimCategory = "travel" | "office" | "meal" | "service";
type ReviewQueueStatus =
  | "approved"
  | "duplicate"
  | "escalated"
  | "pending"
  | "rejected";
type ProcessStatus = "deadLetter" | "retrying" | "resolved";
type StorageFailureStatus = "failed" | "retrying" | "ignored";
type OcrTaskStatus = "dead" | "failed" | "ignored" | "retrying";
type AuditRisk = "high" | "low" | "medium";
type AuditResult = "blocked" | "failed" | "success";
type ConfigValue = boolean | number | string;

interface ApiPage<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface BffInvoiceItem {
  amount: number;
  canDownload: boolean;
  fileId?: string;
  fileName: string;
  id: string;
  invoiceCode: string;
  invoiceDate: string;
  invoiceNumber: string;
  invoiceTitle: string;
  photos: number;
  seller: string;
  source: InvoiceSource;
  status: InvoiceStatus;
  submittedAt: string;
}

export interface BffInvoiceDetail extends BffInvoiceItem {
  amountWithoutTax: number;
  buyerName: string;
  currency: string;
  confirmedFields: Record<string, unknown>;
  duplicateHits: string[];
  duplicateRisk: "high" | "low" | "medium";
  duplicateStatus: string;
  invoiceType: string;
  latestReviewOpinion: string;
  manualFields: Record<string, unknown>;
  manualInput: boolean;
  ocrConfidence: number;
  ocrFields: Array<{
    confidence: number;
    label: string;
    userValue?: string;
    value: string;
  }>;
  ocrRawFields: Record<string, unknown>;
  ocrStatus: string;
  reviewRecords: BffReviewRecord[];
  taxAmount: number;
  updatedAt: string;
}

export interface BffInvoicePreview {
  contentType: string;
  expiresAt: string;
  expiresInSeconds: number;
  fileId: string;
  filename: string;
  imageUrl: string;
  invoiceId: string;
  method: string;
}

export interface BffInvoiceDownloadItem {
  contentType: string;
  downloadUrl: string;
  expiresAt: string;
  expiresInSeconds: number;
  fileId: string;
  filename: string;
  invoiceId: string;
  method: string;
}

export interface BffClaimInvoice {
  amount: number;
  expenseCategory: ClaimCategory;
  fileName: string;
  id: string;
  invoiceNumber: string;
  seller: string;
  submittedAt: string;
}

export interface BffClaimItem {
  amount: number;
  applicant: string;
  category: ClaimCategory;
  description: string;
  id: string;
  invoices: BffClaimInvoice[];
  rejectedReason?: string;
  status: ClaimStatus;
  submittedAt: string;
  title: string;
  timeline: BffReviewStep[];
}

export interface BffReviewRecord {
  action: BffReviewStep["action"];
  actor: string;
  comment: string;
  occurredAt: string;
  reviewId?: string;
}

export interface BffReviewStep {
  action:
    | "approved"
    | "created"
    | "duplicateChecked"
    | "ocrConfirmed"
    | "paid"
    | "rejected"
    | "reviewing"
    | "submitted";
  actor: string;
  comment: string;
  occurredAt: string;
}

export interface BffInvoiceReviewItem extends Omit<BffInvoiceDetail, "status"> {
  applicant: string;
  status: ReviewQueueStatus;
}

export interface BffClaimReviewItem extends Omit<BffClaimItem, "status"> {
  status: ReviewQueueStatus;
}

export interface BffFinanceSummary {
  duplicateRisk: number;
  pendingClaimAmount: number;
  pendingClaims: number;
  pendingInvoiceAmount: number;
  pendingInvoices: number;
}

export interface BffOutboxItem {
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  failedAt: string;
  id: string;
  lastError: string;
  retryCount: number;
  routingKey: string;
  status: ProcessStatus;
}

export interface BffStorageFailureItem {
  bucket: string;
  failedAt: string;
  fileId: string;
  id: string;
  invoiceId: string;
  lastError: string;
  objectKey: string;
  provider: string;
  retryCount: number;
  status: StorageFailureStatus;
}

export interface BffOcrTaskItem {
  failedAt: string;
  failureCode: string;
  fileId: string;
  id: string;
  invoiceId: string;
  lastError: string;
  owner: string;
  provider: string;
  retryCount: number;
  status: OcrTaskStatus;
}

export interface BffSecurityAuditItem {
  action: string;
  actor: string;
  occurredAt: string;
  resource: string;
  result: AuditResult;
  risk: AuditRisk;
  sourceIp: string;
  traceId: string;
}

export interface BffSystemConfigField {
  code: string;
  masked?: boolean;
  value: ConfigValue;
}

export interface BffSystemConfigSection {
  code: "mq" | "ocr" | "security" | "storage";
  fields: BffSystemConfigField[];
}

interface NonceResponse {
  nonce: string;
}

const BFF = "/api/bff/v1";
const CLAIM_BFF = "/invoice-claim-service/bff/v1";
const COMMON_BFF = "/invoice-common-service/bff/v1";
const CORE_BFF = "/invoice-core-service/bff/v1";
const REVIEW_BFF = "/invoice-review-service/bff/v1";

export const uploadDraftStorageKey = "invoice.upload.draft";

export const bffService = {
  admin: {
    async getOcrTasks(status?: string) {
      const data = await request<unknown>({
        method: "GET",
        params: { page: 1, pageSize: 50, status },
        url: `${BFF}/admin/ocr-tasks`,
      });
      return pageOf(data, mapOcrTask);
    },
    async getOutboxEvents(status = "DEAD_LETTER") {
      const data = await request<unknown>({
        method: "GET",
        params: { page: 1, pageSize: 50, status },
        url: `${BFF}/admin/outbox-events`,
      });
      return pageOf(data, mapOutboxItem);
    },
    async getSecurityAuditLogs() {
      const data = await request<unknown>({
        method: "GET",
        params: { page: 1, pageSize: 50, type: "security" },
        url: `${BFF}/admin/audit-logs`,
      });
      return pageOf(data, mapSecurityAuditItem);
    },
    async getSettings() {
      const data = await request<unknown>({
        method: "GET",
        url: `${BFF}/admin/settings`,
      });
      return mapSystemConfigSections(data);
    },
    async getStorageFailures() {
      const data = await request<unknown>({
        method: "GET",
        params: { page: 1, pageSize: 50 },
        url: `${BFF}/admin/storage-failures`,
      });
      return pageOf(data, mapStorageFailureItem);
    },
    async ignoreOcrTask(taskId: string) {
      return withNonce("ocr.task.ignore", "OCR_TASK", taskId, (body) =>
        request<unknown>({
          data: body,
          method: "POST",
          url: `${BFF}/admin/ocr-tasks/${taskId}/ignore`,
        }),
      );
    },
    async ignoreStorageFailure(eventId: string) {
      return withNonce(
        "storage.failure.ignore",
        "STORAGE_FAILURE",
        eventId,
        (body) =>
          request<unknown>({
            data: body,
            method: "POST",
            url: `${BFF}/admin/storage-failures/${eventId}/ignore`,
          }),
      );
    },
    async retryOcrTask(taskId: string) {
      return withNonce("ocr.task.retry", "OCR_TASK", taskId, (body) =>
        request<unknown>({
          data: body,
          method: "POST",
          url: `${BFF}/admin/ocr-tasks/${taskId}/retry`,
        }),
      );
    },
    async retryOutboxEvent(eventId: string) {
      return withNonce("outbox.retry", "OUTBOX_EVENT", eventId, (body) =>
        request<unknown>({
          data: body,
          method: "POST",
          url: `${BFF}/admin/outbox-events/${eventId}/retry`,
        }),
      );
    },
    async retryStorageFailure(eventId: string) {
      return withNonce("outbox.retry", "OUTBOX_EVENT", eventId, (body) =>
        request<unknown>({
          data: body,
          method: "POST",
          url: `${BFF}/admin/storage-failures/${eventId}/retry`,
        }),
      );
    },
    async testSettings(category: string, values: Record<string, ConfigValue>) {
      return request<unknown>({
        data: {
          maskedSettings: values,
          providerCode: stringValue(values.provider, category),
          providerType: category,
        },
        method: "POST",
        url: `${BFF}/admin/settings/${category}/test`,
      });
    },
    async updateSettings(
      category: string,
      values: Record<string, ConfigValue>,
    ) {
      return withNonce("system.config", "SYSTEM_SETTING", category, (body) =>
        request<unknown>({
          data: { ...body, settings: values },
          method: "PUT",
          url: `${BFF}/admin/settings/${category}`,
        }),
      );
    },
  },
  claims: {
    async createDraft(input: {
      category: ClaimCategory;
      description: string;
      invoiceIds: string[];
      title: string;
    }) {
      return withNonce("claim.save", "EXPENSE_CLAIM", undefined, (body) =>
        request<unknown>({
          data: {
            ...body,
            costCenter: input.description,
            expenseCategory: input.category,
            idempotencyKey: createIdempotencyKey("claim"),
            invoiceIds: input.invoiceIds,
            title: input.title,
          },
          method: "POST",
          url: `${CLAIM_BFF}/claims`,
        }),
      );
    },
    async updateDraft(
      claimId: string,
      input: {
        category: ClaimCategory;
        description: string;
        invoiceIds: string[];
        title: string;
      },
    ) {
      return withNonce("claim.save", "EXPENSE_CLAIM", claimId, (body) =>
        request<unknown>({
          data: {
            ...body,
            costCenter: input.description,
            expenseCategory: input.category,
            idempotencyKey: createIdempotencyKey("claim-update"),
            invoiceIds: input.invoiceIds,
            title: input.title,
          },
          method: "PUT",
          url: `${CLAIM_BFF}/claims/${encodeURIComponent(claimId)}`,
        }),
      );
    },
    async getDetail(claimId: string) {
      const encodedClaimId = encodeURIComponent(claimId);
      const [detail, records] = await Promise.all([
        request<unknown>({
          method: "GET",
          url: `${CLAIM_BFF}/claims/${encodedClaimId}`,
        }),
        request<unknown>({
          method: "GET",
          url: `${CLAIM_BFF}/claims/${encodedClaimId}/review-records`,
        }).catch(() => null),
      ]);
      return mapClaimItem(detail, records);
    },
    async getList() {
      const response = await httpClient.request<unknown>({
        method: "GET",
        params: { page: 1, pageSize: 50 },
        url: `${CLAIM_BFF}/claims`,
      });
      return pageOf(unwrapPagePayload(response.data), mapClaimItem);
    },
    async getSummary() {
      return request<unknown>({ method: "GET", url: `${BFF}/claims/summary` });
    },
    async submit(claimId: string) {
      return withNonce("claim.submit", "EXPENSE_CLAIM", claimId, (body) =>
        request<unknown>({
          data: {
            ...body,
            idempotencyKey: createIdempotencyKey("claim-submit"),
          },
          method: "POST",
          url: `${CLAIM_BFF}/claims/${encodeURIComponent(claimId)}/submit`,
        }),
      );
    },
    async abandon(claimId: string) {
      return withNonce("claim.abandon", "EXPENSE_CLAIM", claimId, (body) =>
        request<unknown>({
          data: {
            ...body,
            idempotencyKey: createIdempotencyKey("claim-abandon"),
          },
          method: "POST",
          url: `${BFF}/claims/${claimId}/abandon`,
        }),
      );
    },
  },
  finance: {
    async decideClaim(
      claimId: string,
      decision: "approve" | "reject",
      comment: string,
    ) {
      return withNonce("claim.review", "EXPENSE_CLAIM", claimId, (body) =>
        request<unknown>({
          data: {
            ...body,
            comment,
            idempotencyKey: createIdempotencyKey("claim-review"),
          },
          method: "POST",
          url: `${REVIEW_BFF}/finance/claims/${encodeURIComponent(claimId)}/${decision}`,
        }),
      );
    },
    async decideInvoice(
      invoiceId: string,
      decision: "approve" | "reject",
      comment: string,
    ) {
      return withNonce("invoice.review", "INVOICE", invoiceId, (body) =>
        request<unknown>({
          data: {
            ...body,
            comment,
            idempotencyKey: createIdempotencyKey("invoice-review"),
          },
          method: "POST",
          url: `${BFF}/finance/invoices/${invoiceId}/${decision}`,
        }),
      );
    },
    async getClaimDetail(claimId: string) {
      const encodedClaimId = encodeURIComponent(claimId);
      const [detail, records] = await Promise.all([
        request<unknown>({
          method: "GET",
          url: `${REVIEW_BFF}/finance/claims/${encodedClaimId}`,
        }),
        request<unknown>({
          method: "GET",
          url: `${REVIEW_BFF}/finance/claims/${encodedClaimId}/review-records`,
        }).catch(() => null),
      ]);
      return mapClaimReviewItem(detail, records);
    },
    async getPendingClaims() {
      const response = await httpClient.request<unknown>({
        method: "GET",
        params: { page: 1, pageSize: 50 },
        url: `${REVIEW_BFF}/finance/claims/pending`,
      });
      return pageOf(unwrapPagePayload(response.data), mapClaimReviewRecord);
    },
    async getPendingInvoices(status?: string) {
      const endpoint =
        status === "duplicate"
          ? `${BFF}/finance/invoices/duplicates`
          : `${BFF}/finance/invoices/pending`;
      const data = await request<unknown>({
        method: "GET",
        params: { page: 1, pageSize: 50 },
        url: endpoint,
      });
      return pageOf(data, (item) =>
        mapInvoiceReviewRecord(
          item,
          status === "duplicate" ? "duplicate" : "pending",
        ),
      );
    },
    async getReviewSummary() {
      const data = await request<unknown>({
        method: "GET",
        url: `${BFF}/finance/reviews/summary`,
      }).catch(() => null);
      return mapFinanceSummary(data);
    },
    async getInvoiceDetail(invoiceId: string) {
      const [detail, duplicateResults, reviewRecords] = await Promise.all([
        request<unknown>({
          method: "GET",
          url: `${BFF}/finance/invoices/${invoiceId}`,
        }),
        request<unknown>({
          method: "GET",
          url: `${BFF}/invoices/${invoiceId}/duplicate-results`,
        }).catch(() => null),
        request<unknown>({
          method: "GET",
          url: `${BFF}/invoices/${invoiceId}/review-records`,
        }).catch(() => null),
      ]);
      return mapInvoiceDetail(detail, duplicateResults, reviewRecords);
    },
  },
  invoices: {
    async confirmSession(
      recognitionSessionId: string,
      fields?: Record<string, unknown>,
    ) {
      return withNonce(
        "invoice.confirm",
        "INVOICE",
        recognitionSessionId,
        (body) =>
          request<unknown>({
            data: {
              nonce: body.nonce,
              confirmedFields: fields ?? {},
            },
            method: "POST",
            url: `${CORE_BFF}/invoices/ocr-sessions/${encodeURIComponent(recognitionSessionId)}/confirm`,
          }),
      );
    },
    async getClaimable() {
      const response = await httpClient.request<unknown>({
        method: "GET",
        params: { page: 1, pageSize: 50 },
        url: `${CLAIM_BFF}/claims/list`,
      });
      return pageOf(unwrapPagePayload(response.data), mapClaimInvoice);
    },
    async getDetail(invoiceId: string) {
      const detail = await request<unknown>({
        method: "GET",
        url: `${CORE_BFF}/invoices/${encodeURIComponent(invoiceId)}`,
      });
      return mapInvoiceDetail(detail);
    },
    async getList() {
      const response = await httpClient.request<unknown>({
        method: "GET",
        params: { page: 1, pageSize: 50 },
        url: `${CORE_BFF}/invoices/list`,
      });
      return pageOf(unwrapPagePayload(response.data), mapInvoiceItem);
    },
    async getOcrStatus(invoiceId: string) {
      return request<unknown>({
        method: "GET",
        url: `${BFF}/invoices/${invoiceId}/ocr-status`,
      });
    },
    async getOcrSessionStatus(recognitionSessionId: string) {
      return request<unknown>({
        method: "GET",
        params: { sessionId: recognitionSessionId },
        url: `${CORE_BFF}/invoices/recognize-result`,
      });
    },
    async getOcrBatchResults(batchId: string) {
      return request<unknown>({
        method: "GET",
        params: { batchId },
        url: `${CORE_BFF}/invoices/recognize-results`,
      });
    },
    async getSummary() {
      return request<unknown>({
        method: "GET",
        url: `${BFF}/invoices/summary`,
      });
    },
    async preview(invoiceId: string) {
      const data = await request<unknown>({
        method: "GET",
        url: `${CORE_BFF}/invoices/${encodeURIComponent(invoiceId)}/preview`,
      });
      return mapInvoicePreview(data);
    },
    async previewOcrSession(recognitionSessionId: string) {
      const data = await request<unknown>({
        method: "GET",
        url: `${CORE_BFF}/invoices/ocr-sessions/${encodeURIComponent(recognitionSessionId)}/preview`,
      });
      return mapInvoicePreview(data);
    },
    async download(invoiceIds: string[]) {
      const data = await request<unknown>({
        data: { invoiceIds },
        method: "POST",
        url: `${CORE_BFF}/invoices/download`,
      });
      const files = arrayValue(asRecord(data).files) ?? [];
      return files.map(mapInvoiceDownloadItem);
    },
    async submitOcrSessionManualInput(
      recognitionSessionId: string,
      fields: Record<string, unknown>,
    ) {
      return withNonce(
        "invoice.manual-input",
        "INVOICE",
        recognitionSessionId,
        (body) =>
          request<unknown>({
            data: {
              ...body,
              fields,
              idempotencyKey: createIdempotencyKey("manual-ocr-session"),
            },
            method: "POST",
            url: `${CORE_BFF}/invoices/ocr-sessions/${encodeURIComponent(recognitionSessionId)}/manual-input/submit`,
          }),
      );
    },
    async upload(input: {
      contentBase64: string;
      fileName: string;
      mimeType: string;
      recognitionSessionId?: string;
      size: number;
    }) {
      return this.recognizeUpload([input]);
    },
    async recognizeUpload(
      inputs: Array<{
        contentBase64: string;
        fileName: string;
        mimeType: string;
        size: number;
      }>,
    ) {
      const files = await Promise.all(
        inputs.map(async (input) => ({
          contentBase64: input.contentBase64,
          fileName: input.fileName,
          mimeType: input.mimeType,
          objectKey: createUploadObjectKey(input.fileName),
          sha256: await sha256Base64(input.contentBase64),
          size: input.size,
        })),
      );

      return withNonce(
        "invoice.recognize-upload",
        "INVOICE",
        undefined,
        (body) =>
          request<unknown>({
            data: {
              nonce: body.nonce,
              files,
            },
            method: "POST",
            url: `${CORE_BFF}/invoices/recognize-upload`,
          }),
      );
    },
  },
};

async function createNonce(
  operation: string,
  resourceType: ResourceType,
  resourceId?: string,
) {
  const response = await request<NonceResponse>({
    data: { operation, resourceId, resourceType },
    method: "POST",
    url: `${COMMON_BFF}/nonces`,
  });
  return response.nonce;
}

async function withNonce<T>(
  operation: string,
  resourceType: ResourceType,
  resourceId: string | undefined,
  execute: (body: Record<string, unknown>) => Promise<T>,
) {
  const nonce = await createNonce(operation, resourceType, resourceId);
  return execute({ nonce });
}

async function sha256Base64(contentBase64: string) {
  const bytes = base64ToBytes(contentBase64);
  const digest = globalThis.crypto?.subtle
    ? new Uint8Array(await globalThis.crypto.subtle.digest("SHA-256", bytes))
    : sha256Bytes(bytes);

  return bytesToHex(digest);
}

function base64ToBytes(contentBase64: string) {
  const binary = window.atob(contentBase64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

const sha256K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function sha256Bytes(message: Uint8Array) {
  const hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
    0x1f83d9ab, 0x5be0cd19,
  ];
  const bitLength = message.length * 8;
  const paddedLength = Math.ceil((message.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLength);
  padded.set(message);
  padded[message.length] = 0x80;

  const paddedView = new DataView(padded.buffer);
  paddedView.setUint32(paddedLength - 8, Math.floor(bitLength / 0x100000000));
  paddedView.setUint32(paddedLength - 4, bitLength >>> 0);

  const words = new Uint32Array(64);
  for (let offset = 0; offset < paddedLength; offset += 64) {
    for (let index = 0; index < 16; index += 1) {
      words[index] = paddedView.getUint32(offset + index * 4);
    }

    for (let index = 16; index < 64; index += 1) {
      words[index] =
        (smallSigma1(words[index - 2]) +
          words[index - 7] +
          smallSigma0(words[index - 15]) +
          words[index - 16]) >>>
        0;
    }

    let [a, b, c, d, e, f, g, h] = hash;
    for (let index = 0; index < 64; index += 1) {
      const t1 =
        (h +
          bigSigma1(e) +
          ((e & f) ^ (~e & g)) +
          sha256K[index] +
          words[index]) >>>
        0;
      const t2 = (bigSigma0(a) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + t1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) >>> 0;
    }

    hash[0] = (hash[0] + a) >>> 0;
    hash[1] = (hash[1] + b) >>> 0;
    hash[2] = (hash[2] + c) >>> 0;
    hash[3] = (hash[3] + d) >>> 0;
    hash[4] = (hash[4] + e) >>> 0;
    hash[5] = (hash[5] + f) >>> 0;
    hash[6] = (hash[6] + g) >>> 0;
    hash[7] = (hash[7] + h) >>> 0;
  }

  const output = new Uint8Array(32);
  const outputView = new DataView(output.buffer);
  hash.forEach((value, index) => outputView.setUint32(index * 4, value));
  return output;
}

function rotateRight(value: number, bits: number) {
  return (value >>> bits) | (value << (32 - bits));
}

function bigSigma0(value: number) {
  return (
    rotateRight(value, 2) ^ rotateRight(value, 13) ^ rotateRight(value, 22)
  );
}

function bigSigma1(value: number) {
  return (
    rotateRight(value, 6) ^ rotateRight(value, 11) ^ rotateRight(value, 25)
  );
}

function smallSigma0(value: number) {
  return rotateRight(value, 7) ^ rotateRight(value, 18) ^ (value >>> 3);
}

function smallSigma1(value: number) {
  return rotateRight(value, 17) ^ rotateRight(value, 19) ^ (value >>> 10);
}

function createUploadObjectKey(fileName: string) {
  const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `invoice-recognition/${createIdempotencyKey("file")}-${safeFileName}`;
}

function pageOf<T>(payload: unknown, mapper: (item: unknown) => T): ApiPage<T> {
  const object = asRecord(payload);
  const sourceItems =
    arrayValue(object.items) ??
    arrayValue(object.records) ??
    arrayValue(object.content) ??
    (Array.isArray(payload) ? payload : []);
  return {
    items: sourceItems.map(mapper),
    page: numberValue(object.page, 1),
    pageSize: numberValue(object.pageSize ?? object.size, sourceItems.length),
    total: numberValue(object.total, sourceItems.length),
  };
}

function unwrapPagePayload(payload: unknown): unknown {
  const object = asRecord(payload);
  if (!("success" in object)) {
    return payload;
  }

  if (object.success === false) {
    const error = asRecord(object.error);
    throw new ApiError({
      code: stringValue(error.code, "API_ERROR"),
      details: object.error,
      message: stringValue(
        error.message ?? object.message,
        "Unexpected API error",
      ),
      traceId: stringValue(object.traceId) || undefined,
    });
  }

  if (arrayValue(object.items)) {
    return payload;
  }

  return object.data ?? payload;
}

function mapInvoiceItem(payload: unknown): BffInvoiceItem {
  const item = summaryOf(payload);
  const id = stringValue(item.invoiceId ?? item.id, "INV-UNKNOWN");
  const invoiceNumber = stringValue(item.invoiceNo ?? item.invoiceNumber, id);
  const fields = asRecord(asRecord(payload).confirmedFields);
  const fileId = stringValue(
    item.fileId ?? fields.fileId ?? asRecord(payload).fileId,
    "",
  );

  return {
    amount: numberValue(item.totalAmount ?? item.amount, 0),
    canDownload: item.canDownload === false ? false : id !== "INV-UNKNOWN",
    fileId: fileId || undefined,
    fileName: stringValue(item.fileName, `${id}.pdf`),
    id,
    invoiceCode: stringValue(
      fields.invoiceCode ?? item.invoiceCode ?? item.invoiceType,
      "-",
    ),
    invoiceDate: dateValue(fields.invoiceDate ?? item.invoiceDate),
    invoiceNumber,
    invoiceTitle: stringValue(
      fields.title ?? item.title ?? item.invoiceTitle ?? item.fileName,
      "-",
    ),
    photos: numberValue(item.photos, fileId ? 1 : 0),
    seller: stringValue(fields.seller ?? item.sellerName ?? item.seller, "-"),
    source: normalizeSource(item.source),
    status: normalizeInvoiceStatus(item.status),
    submittedAt: dateValue(
      item.createdAt ?? item.submittedAt ?? item.invoiceDate,
    ),
  };
}

function mapInvoiceDetail(
  payload: unknown,
  duplicateResults?: unknown,
  reviewRecords?: unknown,
): BffInvoiceDetail {
  const invoice = mapInvoiceItem(payload);
  const root = asRecord(payload);
  const fields = asRecord(root.confirmedFields);
  const manualFields = asRecord(root.manualFields);
  const ocrRawFields = asRecord(root.ocrFields);
  const raw = asRecord(root.ocrRawResultSummary);
  const duplicates = pageOf(duplicateResults, (item) => item).items;
  const duplicateHits = duplicates
    .map((item) =>
      stringValue(asRecord(item).duplicateInvoiceId ?? asRecord(item).targetId),
    )
    .filter(Boolean);

  return {
    ...invoice,
    amountWithoutTax: numberValue(
      root.amountWithoutTax ?? fields.amountWithoutTax,
      0,
    ),
    buyerName: stringValue(root.buyerName ?? fields.buyerName, "-"),
    confirmedFields: fields,
    currency: stringValue(root.currency ?? fields.currency, "CNY"),
    duplicateHits,
    duplicateRisk:
      duplicateHits.length > 0
        ? "high"
        : normalizeRisk(root.duplicateStatus ?? raw.duplicateRisk),
    duplicateStatus: stringValue(root.duplicateStatus, "-"),
    invoiceType: stringValue(root.invoiceType, "-"),
    latestReviewOpinion: stringValue(root.latestReviewOpinion, ""),
    manualFields,
    manualInput: Boolean(root.manualInput),
    ocrConfidence: numberValue(raw.confidence ?? fields.confidence, 0.92),
    ocrFields: buildOcrFields(
      Object.keys(fields).length > 0 ? fields : ocrRawFields,
      invoice,
    ),
    ocrRawFields,
    ocrStatus: stringValue(root.ocrStatus, "-"),
    reviewRecords: mapReviewRecords(reviewRecords),
    taxAmount: numberValue(root.taxAmount ?? fields.taxAmount, 0),
    updatedAt: dateValue(root.updatedAt),
  };
}

function mapInvoicePreview(payload: unknown): BffInvoicePreview {
  const item = asRecord(payload);
  const invoiceId = stringValue(item.invoiceId, "-");
  return {
    contentType: stringValue(item.contentType, ""),
    expiresAt: dateValue(item.expiresAt),
    expiresInSeconds: numberValue(item.expiresInSeconds, 0),
    fileId: stringValue(item.fileId, ""),
    filename: stringValue(item.filename, `${invoiceId}.jpg`),
    imageUrl: stringValue(item.imageUrl, ""),
    invoiceId,
    method: stringValue(item.method, "GET"),
  };
}

function mapInvoiceDownloadItem(payload: unknown): BffInvoiceDownloadItem {
  const item = asRecord(payload);
  const invoiceId = stringValue(item.invoiceId, "-");
  return {
    contentType: stringValue(item.contentType, ""),
    downloadUrl: stringValue(item.downloadUrl, ""),
    expiresAt: dateValue(item.expiresAt),
    expiresInSeconds: numberValue(item.expiresInSeconds, 0),
    fileId: stringValue(item.fileId, ""),
    filename: stringValue(item.filename, `${invoiceId}.pdf`),
    invoiceId,
    method: stringValue(item.method, "GET"),
  };
}

function mapClaimInvoice(payload: unknown): BffClaimInvoice {
  const invoice = mapInvoiceItem(payload);
  const item = asRecord(payload);
  const id = stringValue(item.invoiceId ?? item.id, invoice.id);
  return {
    amount: numberValue(item.amount ?? item.totalAmount, invoice.amount),
    expenseCategory: normalizeCategory(item.expenseCategory),
    fileName: invoice.fileName,
    id,
    invoiceNumber: stringValue(
      item.invoiceNumber ?? item.invoiceNo,
      invoice.invoiceNumber || id,
    ),
    seller: stringValue(item.seller ?? item.sellerName, invoice.seller),
    submittedAt: dateValue(
      item.submittedAt ?? item.createdAt ?? invoice.submittedAt,
    ),
  };
}

function mapClaimItem(payload: unknown, reviewRecords?: unknown): BffClaimItem {
  const item = summaryOf(payload);
  const root = asRecord(payload);
  const invoiceDetails = arrayValue(root.invoices)?.map(mapClaimInvoice) ?? [];
  const invoiceIds =
    arrayValue(root.invoiceIds) ??
    arrayValue(item.invoiceIds) ??
    invoiceDetails.map((invoice) => invoice.id) ??
    [];
  const id = stringValue(item.claimId ?? item.id, "CLM-UNKNOWN");
  const status = normalizeClaimStatus(item.status ?? root.reviewStatus);
  const timeline = mapReviewRecords(reviewRecords ?? root.timeline);
  const rejectedReason = latestRejectedReason(timeline);

  return {
    amount: numberValue(item.totalAmount ?? item.amount, 0),
    applicant: displayNameValue(
      item.applicantDisplayName,
      item.displayName,
      item.applicantName,
      root.applicantDisplayName,
      root.displayName,
      root.applicantName,
      item.applicant,
      root.applicant,
    ),
    category: normalizeCategory(item.expenseCategory ?? root.expenseCategory),
    description: stringValue(item.costCenter ?? root.description, "-"),
    id,
    invoices:
      invoiceDetails.length > 0
        ? invoiceDetails
        : invoiceIds.map((invoiceId) => ({
            amount: 0,
            expenseCategory: normalizeCategory(item.expenseCategory),
            fileName: `${String(invoiceId)}.pdf`,
            id: String(invoiceId),
            invoiceNumber: String(invoiceId),
            seller: "-",
            submittedAt: "-",
          })),
    rejectedReason:
      status === "rejected"
        ? stringValue(
            root.rejectedReason ?? root.reviewComment,
            rejectedReason || "-",
          )
        : undefined,
    status,
    submittedAt: dateValue(root.submittedAt ?? item.createdAt),
    title: stringValue(item.title, id),
    timeline: timeline.length > 0 ? timeline : defaultTimeline(status),
  };
}

function mapInvoiceReviewRecord(
  payload: unknown,
  fallbackStatus: ReviewQueueStatus,
): BffInvoiceReviewItem {
  const record = asRecord(payload);
  const targetId = stringValue(
    record.targetId ?? record.invoiceId,
    "INV-UNKNOWN",
  );
  return {
    ...mapInvoiceDetail({ invoiceId: targetId, status: fallbackStatus }),
    applicant: stringValue(
      record.applicant ?? record.owner ?? record.reviewerId,
      "-",
    ),
    id: targetId,
    status: normalizeReviewStatus(
      record.action ?? record.status,
      fallbackStatus,
    ),
    submittedAt: dateValue(record.createdAt ?? record.occurredAt),
  };
}

function mapClaimReviewRecord(payload: unknown): BffClaimReviewItem {
  const record = asRecord(payload);
  const targetId = stringValue(
    record.targetId ?? record.claimId,
    "CLM-UNKNOWN",
  );
  const invoiceCount = numberValue(record.invoiceCount, 0);
  return {
    ...mapClaimItem({
      amount: record.amount,
      applicant: record.applicant,
      claimId: targetId,
      invoiceIds: Array.from(
        { length: invoiceCount },
        (_, index) => `${targetId}-${index + 1}`,
      ),
      status: record.action ?? "SUBMITTED",
      submittedAt: record.submittedAt,
      title: record.title,
      totalAmount: record.amount,
    }),
    applicant: stringValue(record.applicant ?? record.reviewerId, "-"),
    id: targetId,
    status: normalizeReviewStatus(record.action ?? record.status, "pending"),
    submittedAt: dateValue(
      record.submittedAt ?? record.createdAt ?? record.occurredAt,
    ),
  };
}

function mapClaimReviewItem(
  payload: unknown,
  reviewRecords?: unknown,
): BffClaimReviewItem {
  const claim = mapClaimItem(payload, reviewRecords);
  return {
    ...claim,
    status: normalizeReviewStatus(
      asRecord(summaryOf(payload)).status,
      "pending",
    ),
  };
}

function mapFinanceSummary(payload: unknown): BffFinanceSummary {
  const item = asRecord(payload);
  return {
    duplicateRisk: numberValue(item.duplicateRisk ?? item.duplicateCount, 0),
    pendingClaimAmount: numberValue(item.pendingClaimAmount, 0),
    pendingClaims: numberValue(item.pendingClaims ?? item.pendingClaimCount, 0),
    pendingInvoiceAmount: numberValue(item.pendingInvoiceAmount, 0),
    pendingInvoices: numberValue(
      item.pendingInvoices ?? item.pendingInvoiceCount,
      0,
    ),
  };
}

function mapOutboxItem(payload: unknown): BffOutboxItem {
  const item = asRecord(payload);
  const id = stringValue(item.outboxEventId ?? item.id, "OUTBOX-UNKNOWN");
  return {
    aggregateId: stringValue(item.aggregateId, "-"),
    aggregateType: stringValue(item.aggregateType, "-"),
    eventType: stringValue(item.eventType, "-"),
    failedAt: dateValue(item.createdAt ?? item.failedAt),
    id,
    lastError: stringValue(item.lastError, "-"),
    retryCount: numberValue(item.retryCount, 0),
    routingKey: stringValue(item.routingKey ?? item.eventType, "-"),
    status: normalizeProcessStatus(item.status),
  };
}

function mapStorageFailureItem(payload: unknown): BffStorageFailureItem {
  const outbox = mapOutboxItem(payload);
  const item = asRecord(payload);
  const payloadObject = asRecord(item.payload);
  return {
    bucket: stringValue(payloadObject.bucket, "-"),
    failedAt: outbox.failedAt,
    fileId: stringValue(
      payloadObject.fileId ?? item.fileId,
      outbox.aggregateId,
    ),
    id: outbox.id,
    invoiceId: stringValue(payloadObject.invoiceId ?? item.invoiceId, "-"),
    lastError: outbox.lastError,
    objectKey: stringValue(payloadObject.objectKey, "-"),
    provider: stringValue(payloadObject.provider, "Object Storage"),
    retryCount: outbox.retryCount,
    status:
      outbox.status === "retrying"
        ? "retrying"
        : outbox.status === "resolved"
          ? "ignored"
          : "failed",
  };
}

function mapOcrTask(payload: unknown): BffOcrTaskItem {
  const item = asRecord(payload);
  return {
    failedAt: dateValue(item.updated_at ?? item.updatedAt ?? item.failedAt),
    failureCode: stringValue(item.failure_code ?? item.failureCode, "-"),
    fileId: stringValue(item.file_id ?? item.fileId, "-"),
    id: stringValue(item.id ?? item.taskId, "OCR-UNKNOWN"),
    invoiceId: stringValue(item.invoice_id ?? item.invoiceId, "-"),
    lastError: stringValue(item.last_error ?? item.lastError, "-"),
    owner: stringValue(item.updated_by ?? item.owner, "-"),
    provider: stringValue(item.provider, "OCR"),
    retryCount: numberValue(item.retry_count ?? item.retryCount, 0),
    status: normalizeOcrTaskStatus(item.status),
  };
}

function mapSecurityAuditItem(payload: unknown): BffSecurityAuditItem {
  const item = asRecord(payload);
  const details = asRecord(item.details);
  const action = stringValue(item.action ?? item.operation, "-");
  const result = normalizeAuditResult(item.result ?? item.status);
  const resource = [
    stringValue(item.resourceType),
    stringValue(item.resourceId ?? item.resource ?? item.targetId),
  ]
    .filter(Boolean)
    .join(": ");

  return {
    action,
    actor: stringValue(
      item.actor ?? item.actorUserId ?? item.userId ?? item.createdBy,
      "-",
    ),
    occurredAt: dateValue(item.createdAt ?? item.occurredAt),
    resource: resource || "-",
    result,
    risk: normalizeRisk(item.risk ?? (result === "blocked" ? "high" : "low")),
    sourceIp: stringValue(item.sourceIp ?? item.ipAddress ?? item.ip, "-"),
    traceId: stringValue(
      details.traceId ?? item.traceId ?? item.auditLogId ?? item.id,
      "-",
    ),
  };
}

function mapSystemConfigSections(payload: unknown): BffSystemConfigSection[] {
  const root = asRecord(payload);
  const categories = ["ocr", "storage", "mq", "security"] as const;
  return categories.map((code) => {
    const categoryPayload = unwrapRest(root[code]);
    const categoryObject = asRecord(categoryPayload);
    const values = asRecord(categoryObject.maskedSettings ?? categoryPayload);
    const fields = Object.entries(flattenObject(values))
      .filter(([key]) => key !== "tenantId" && key !== "category")
      .map(([key, value]) => ({
        code: key,
        masked: /secret|password|token|key/i.test(key),
        value: configValue(value),
      }));
    return {
      code,
      fields: fields.length > 0 ? fields : defaultConfigFields(code),
    };
  });
}

function buildOcrFields(
  fields: Record<string, unknown>,
  invoice: BffInvoiceItem,
) {
  const values = {
    amount: fields.amount ?? invoice.amount,
    invoiceCode: fields.invoiceCode ?? invoice.invoiceCode,
    invoiceNumber: fields.invoiceNumber ?? invoice.invoiceNumber,
    seller: fields.seller ?? invoice.seller,
  };
  return Object.entries(values).map(([label, value]) => ({
    confidence: 0.92,
    label,
    value: stringValue(value, "-"),
  }));
}

function mapReviewRecords(payload: unknown): BffReviewStep[] {
  return pageOf(payload, (item) => {
    const record = asRecord(item);
    return {
      action: normalizeTimelineAction(record.action),
      actor: stringValue(record.reviewerId ?? record.actor, "-"),
      comment: stringValue(record.comment, "-"),
      occurredAt: dateValue(record.createdAt ?? record.occurredAt),
    };
  }).items.sort(compareTimelineSteps);
}

function defaultTimeline(status: ClaimStatus): BffReviewStep[] {
  return [
    {
      action: status === "draft" ? "created" : "submitted",
      actor: "-",
      comment: "-",
      occurredAt: "-",
    },
  ];
}

function latestRejectedReason(timeline: BffReviewStep[]) {
  return [...timeline]
    .reverse()
    .find((step) => step.action === "rejected" && step.comment !== "-")
    ?.comment;
}

function compareTimelineSteps(left: BffReviewStep, right: BffReviewStep) {
  if (left.occurredAt === "-") {
    return 1;
  }
  if (right.occurredAt === "-") {
    return -1;
  }
  return left.occurredAt.localeCompare(right.occurredAt);
}

function defaultConfigFields(
  code: BffSystemConfigSection["code"],
): BffSystemConfigField[] {
  const defaults: Record<
    BffSystemConfigSection["code"],
    BffSystemConfigField[]
  > = {
    mq: [
      { code: "provider", value: "" },
      { code: "host", value: "" },
      { code: "port", value: 5672 },
      { code: "virtualHost", value: "/" },
      { code: "password", masked: true, value: "" },
    ],
    ocr: [
      { code: "provider", value: "TENCENT_CLOUD" },
      { code: "mockEnabled", value: false },
      { code: "region", value: "ap-beijing" },
      { code: "secretKey", masked: true, value: "" },
      { code: "timeoutSeconds", value: 30 },
    ],
    security: [
      { code: "issuer", value: "" },
      { code: "clientSecret", masked: true, value: "" },
      { code: "sessionTtlMinutes", value: 120 },
      { code: "nonceTtlSeconds", value: 300 },
      { code: "auditLevel", value: "SECURITY" },
    ],
    storage: [
      { code: "provider", value: "LOCAL" },
      { code: "endpoint", value: "" },
      { code: "bucket", value: "" },
      { code: "secretAccessKey", masked: true, value: "" },
      { code: "maxSizeMb", value: 20 },
    ],
  };
  return defaults[code];
}

function flattenObject(
  value: Record<string, unknown>,
  prefix = "",
): Record<string, unknown> {
  return Object.entries(value).reduce<Record<string, unknown>>(
    (result, [key, entry]) => {
      const nextKey = prefix ? `${prefix}.${key}` : key;
      if (entry && typeof entry === "object" && !Array.isArray(entry)) {
        return { ...result, ...flattenObject(asRecord(entry), nextKey) };
      }
      result[nextKey] = entry;
      return result;
    },
    {},
  );
}

function summaryOf(payload: unknown) {
  const root = asRecord(payload);
  return asRecord(root.summary ?? payload);
}

function unwrapRest(payload: unknown): unknown {
  const object = asRecord(payload);
  if ("success" in object && "data" in object) {
    return object.data;
  }
  return payload;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function arrayValue(value: unknown): unknown[] | undefined {
  return Array.isArray(value) ? value : undefined;
}

function stringValue(value: unknown, fallback = "") {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return fallback;
}

function configValue(value: unknown): ConfigValue {
  if (typeof value === "boolean" || typeof value === "number") {
    return value;
  }
  return stringValue(value);
}

function numberValue(value: unknown, fallback = 0) {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

function dateValue(value: unknown) {
  const text = stringValue(value, "-");
  return text === "-" ? text : text.replace("T", " ").slice(0, 16);
}

function createIdempotencyKey(prefix: string) {
  if (crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function normalizeInvoiceStatus(value: unknown): InvoiceStatus {
  const status = stringValue(value).toLowerCase();
  if (status.includes("reject")) {
    return "rejected";
  }
  if (
    ["approved", "claimable", "confirmed", "ocr_confirmed"].includes(status)
  ) {
    return "confirmed";
  }
  if (["archived", "paid", "reimbursed"].includes(status)) {
    return "archived";
  }
  return "submitted";
}

function normalizeClaimStatus(value: unknown): ClaimStatus {
  const status = stringValue(value).toLowerCase();
  if (["approved", "paid", "reimbursed"].includes(status)) {
    return "paid";
  }
  if (["abandoned", "archived", "cancelled", "canceled"].includes(status)) {
    return "archived";
  }
  if (["draft", "created"].includes(status)) {
    return "draft";
  }
  if (["rejected", "reject"].includes(status)) {
    return "rejected";
  }
  return "submitted";
}

function normalizeReviewStatus(
  value: unknown,
  fallback: ReviewQueueStatus,
): ReviewQueueStatus {
  const status = stringValue(value).toLowerCase();
  if (status.includes("approved") || status.includes("approve")) {
    return "approved";
  }
  if (status.includes("rejected") || status.includes("reject")) {
    return "rejected";
  }
  if (status.includes("duplicate")) {
    return "duplicate";
  }
  if (status.includes("escalat") || status.includes("reviewing")) {
    return "escalated";
  }
  return fallback;
}

function displayNameValue(...values: unknown[]) {
  const displayName = values
    .map((value) => stringValue(value))
    .find((value) => value && !value.startsWith("usr_"));
  return displayName ?? "-";
}

function normalizeProcessStatus(value: unknown): ProcessStatus {
  const status = stringValue(value).toLowerCase();
  if (status.includes("dead")) {
    return "deadLetter";
  }
  if (status.includes("retry") || status.includes("pending")) {
    return "retrying";
  }
  return "resolved";
}

function normalizeOcrTaskStatus(value: unknown): OcrTaskStatus {
  const status = stringValue(value).toLowerCase();
  if (status.includes("dead")) {
    return "dead";
  }
  if (status.includes("ignore")) {
    return "ignored";
  }
  if (status.includes("pending") || status.includes("retry")) {
    return "retrying";
  }
  return "failed";
}

function normalizeSource(value: unknown): InvoiceSource {
  return stringValue(value).toLowerCase().includes("manual") ? "manual" : "ocr";
}

function normalizeCategory(value: unknown): ClaimCategory {
  const category = stringValue(value).toLowerCase();
  if (["meal", "office", "service", "travel"].includes(category)) {
    return category as ClaimCategory;
  }
  return "office";
}

function normalizeRisk(value: unknown): AuditRisk {
  const risk = stringValue(value).toLowerCase();
  if (risk === "high" || risk === "medium") {
    return risk;
  }
  return "low";
}

function normalizeAuditResult(value: unknown): AuditResult {
  const result = stringValue(value).toLowerCase();
  if (result.includes("block")) {
    return "blocked";
  }
  if (result.includes("fail") || result.includes("denied")) {
    return "failed";
  }
  return "success";
}

function normalizeTimelineAction(value: unknown): BffReviewStep["action"] {
  const action = stringValue(value).toLowerCase();
  if (action.includes("approve")) {
    return "approved";
  }
  if (action.includes("duplicate")) {
    return "duplicateChecked";
  }
  if (action.includes("ocr")) {
    return "ocrConfirmed";
  }
  if (action.includes("paid")) {
    return "paid";
  }
  if (action.includes("reject")) {
    return "rejected";
  }
  if (action.includes("review")) {
    return "reviewing";
  }
  if (action.includes("submit")) {
    return "submitted";
  }
  return "created";
}
