export type AdminProcessStatus = "deadLetter" | "retrying" | "resolved";
export type OcrTaskStatus = "dead" | "failed" | "ignored" | "retrying";
export type StorageFailureStatus = "failed" | "retrying" | "ignored";
export type SecurityAuditRisk = "low" | "medium" | "high";
export type SecurityAuditResult = "success" | "blocked" | "failed";

export interface OutboxDeadLetterItem {
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  failedAt: string;
  id: string;
  lastError: string;
  retryCount: number;
  routingKey: string;
  status: AdminProcessStatus;
}

export interface StorageFailureItem {
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

export interface OcrTaskItem {
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

export interface SecurityAuditItem {
  action: string;
  actor: string;
  occurredAt: string;
  resource: string;
  result: SecurityAuditResult;
  risk: SecurityAuditRisk;
  sourceIp: string;
  traceId: string;
}

export interface SystemConfigSection {
  code: "ocr" | "storage" | "mq" | "security";
  fields: SystemConfigField[];
}

export interface SystemConfigField {
  code: string;
  masked?: boolean;
  value: string;
}

export const outboxDeadLetterItems: OutboxDeadLetterItem[] = [
  {
    aggregateId: "INV-20260629-0002",
    aggregateType: "Invoice",
    eventType: "InvoiceConfirmedEvent",
    failedAt: "2026-06-29 16:28",
    id: "OUTBOX-20260629-0008",
    lastError: "RabbitMQ returned NO_ROUTE for invoice.confirmed",
    retryCount: 4,
    routingKey: "invoice.confirmed",
    status: "deadLetter",
  },
  {
    aggregateId: "CLM-20260629-0001",
    aggregateType: "Claim",
    eventType: "ClaimSubmittedEvent",
    failedAt: "2026-06-29 15:12",
    id: "OUTBOX-20260629-0006",
    lastError: "Connection timeout while publishing to invoice.exchange",
    retryCount: 3,
    routingKey: "claim.submitted",
    status: "retrying",
  },
  {
    aggregateId: "FILE-20260628-0042",
    aggregateType: "FileObject",
    eventType: "FileArchivedEvent",
    failedAt: "2026-06-28 22:40",
    id: "OUTBOX-20260628-0017",
    lastError: "Message body exceeded configured payload threshold",
    retryCount: 5,
    routingKey: "file.archived",
    status: "resolved",
  },
];

export const storageFailureItems: StorageFailureItem[] = [
  {
    bucket: "invoice-dev",
    failedAt: "2026-06-29 17:06",
    fileId: "FILE-20260629-0119",
    id: "STORAGE-20260629-0005",
    invoiceId: "INV-20260629-0003",
    lastError: "Object storage returned 403 for presigned upload",
    objectKey: "tenant-1/invoices/2026/06/29/FILE-20260629-0119.pdf",
    provider: "MinIO",
    retryCount: 2,
    status: "failed",
  },
  {
    bucket: "invoice-dev",
    failedAt: "2026-06-29 14:58",
    fileId: "FILE-20260629-0106",
    id: "STORAGE-20260629-0003",
    invoiceId: "INV-20260629-0002",
    lastError: "Checksum mismatch after object upload",
    objectKey: "tenant-1/invoices/2026/06/29/FILE-20260629-0106.jpg",
    provider: "MinIO",
    retryCount: 1,
    status: "retrying",
  },
  {
    bucket: "invoice-prod",
    failedAt: "2026-06-28 19:22",
    fileId: "FILE-20260628-0091",
    id: "STORAGE-20260628-0014",
    invoiceId: "INV-20260628-0017",
    lastError: "Archive callback returned duplicated file status",
    objectKey: "tenant-1/invoices/2026/06/28/FILE-20260628-0091.png",
    provider: "S3",
    retryCount: 0,
    status: "ignored",
  },
];

export const ocrTaskItems: OcrTaskItem[] = [
  {
    failedAt: "2026-06-29 17:18",
    failureCode: "OCR_PROVIDER_FAILED",
    fileId: "FILE-20260629-0126",
    id: "OCR-20260629-0011",
    invoiceId: "INV-20260629-0006",
    lastError: "Tencent OCR returned invalid VAT invoice payload",
    owner: "li.ming@techotakus.cloud",
    provider: "TencentCloud",
    retryCount: 3,
    status: "failed",
  },
  {
    failedAt: "2026-06-29 16:05",
    failureCode: "EXTERNAL_SERVICE_UNAVAILABLE",
    fileId: "FILE-20260629-0114",
    id: "OCR-20260629-0009",
    invoiceId: "INV-20260629-0004",
    lastError: "OCR provider request timed out after 10s",
    owner: "chen.yu@techotakus.cloud",
    provider: "TencentCloud",
    retryCount: 2,
    status: "retrying",
  },
  {
    failedAt: "2026-06-28 23:41",
    failureCode: "OCR_LOW_QUALITY_IMAGE",
    fileId: "FILE-20260628-0103",
    id: "OCR-20260628-0027",
    invoiceId: "INV-20260628-0021",
    lastError: "Image is too blurred for stable field extraction",
    owner: "wang.lei@techotakus.cloud",
    provider: "MockOcr",
    retryCount: 1,
    status: "ignored",
  },
  {
    failedAt: "2026-06-28 19:09",
    failureCode: "OCR_TASK_EXPIRED",
    fileId: "FILE-20260628-0088",
    id: "OCR-20260628-0019",
    invoiceId: "INV-20260628-0014",
    lastError: "Recognition session expired before confirmation",
    owner: "finance.ops@techotakus.cloud",
    provider: "TencentCloud",
    retryCount: 5,
    status: "dead",
  },
];

export const securityAuditItems: SecurityAuditItem[] = [
  {
    action: "SYSTEM_CONFIG_UPDATE",
    actor: "admin@techotakus.cloud",
    occurredAt: "2026-06-29 17:22",
    resource: "tenant-config/invoice-dev",
    result: "success",
    risk: "medium",
    sourceIp: "192.168.3.18",
    traceId: "trc-20260629-7af2",
  },
  {
    action: "AUTH_LOGIN_BLOCKED",
    actor: "unknown",
    occurredAt: "2026-06-29 16:44",
    resource: "keycloak/invoice",
    result: "blocked",
    risk: "high",
    sourceIp: "203.0.113.46",
    traceId: "trc-20260629-9cd1",
  },
  {
    action: "OUTBOX_REPLAY",
    actor: "finance-admin",
    occurredAt: "2026-06-29 15:36",
    resource: "OUTBOX-20260629-0006",
    result: "success",
    risk: "low",
    sourceIp: "192.168.3.21",
    traceId: "trc-20260629-3b21",
  },
  {
    action: "FILE_DOWNLOAD_DENIED",
    actor: "employee-17",
    occurredAt: "2026-06-28 21:09",
    resource: "FILE-20260628-0091",
    result: "failed",
    risk: "high",
    sourceIp: "198.51.100.12",
    traceId: "trc-20260628-17e8",
  },
];

export const systemConfigSections: SystemConfigSection[] = [
  {
    code: "ocr",
    fields: [
      { code: "provider", value: "tencent-cloud" },
      { code: "region", value: "ap-shanghai" },
      { code: "timeout", value: "10s" },
      { code: "secretId", masked: true, value: "AKID***********DEV" },
    ],
  },
  {
    code: "storage",
    fields: [
      { code: "provider", value: "minio" },
      { code: "endpoint", value: "http://192.168.3.22:9000" },
      { code: "bucket", value: "invoice-dev" },
      { code: "retentionDays", value: "3650" },
    ],
  },
  {
    code: "mq",
    fields: [
      { code: "provider", value: "rabbitmq" },
      { code: "host", value: "192.168.3.22:5672" },
      { code: "vhost", value: "invoice" },
      { code: "username", value: "admin" },
    ],
  },
  {
    code: "security",
    fields: [
      { code: "issuer", value: "http://192.168.3.22:8080/realms/invoice" },
      { code: "sessionTtl", value: "8h" },
      { code: "csrf", value: "enabled" },
      { code: "auditLevel", value: "sensitive" },
    ],
  },
];
