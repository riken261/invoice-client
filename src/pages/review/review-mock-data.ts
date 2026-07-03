export type ReviewQueueStatus = "pending" | "duplicate" | "escalated";
export type ReviewTimelineAction =
  | "created"
  | "submitted"
  | "ocrConfirmed"
  | "duplicateChecked"
  | "reviewing"
  | "approved"
  | "rejected";

export interface ReviewTimelineStep {
  action: ReviewTimelineAction;
  actor: string;
  comment: string;
  occurredAt: string;
}

export interface InvoiceReviewField {
  confidence: number;
  label: string;
  userValue?: string;
  value: string;
}

export interface InvoiceReviewItem {
  amount: number;
  applicant: string;
  duplicateHits: string[];
  duplicateRisk: "low" | "medium" | "high";
  fileName: string;
  id: string;
  invoiceCode: string;
  invoiceNumber: string;
  ocrConfidence: number;
  ocrFields: InvoiceReviewField[];
  seller: string;
  status: ReviewQueueStatus;
  submittedAt: string;
  timeline: ReviewTimelineStep[];
}

export interface ClaimReviewInvoice {
  amount: number;
  id: string;
  seller: string;
}

export interface ClaimReviewItem {
  amount: number;
  applicant: string;
  category: "travel" | "office" | "meal" | "service";
  description: string;
  id: string;
  invoices: ClaimReviewInvoice[];
  status: ReviewQueueStatus;
  submittedAt: string;
  title: string;
  timeline: ReviewTimelineStep[];
}

export const invoiceReviewItems: InvoiceReviewItem[] = [
  {
    amount: 368,
    applicant: "Riken",
    duplicateHits: [],
    duplicateRisk: "low",
    fileName: "INV-20260629-0001.pdf",
    id: "INV-20260629-0001",
    invoiceCode: "044002300111",
    invoiceNumber: "89342716",
    ocrConfidence: 0.98,
    ocrFields: [
      {
        confidence: 0.99,
        label: "Invoice code",
        value: "044002300111",
      },
      {
        confidence: 0.98,
        label: "Invoice number",
        value: "89342716",
      },
      {
        confidence: 0.97,
        label: "Seller",
        value: "Shanghai Demo Technology Co., Ltd.",
      },
      {
        confidence: 0.96,
        label: "Amount",
        value: "368.00",
      },
    ],
    seller: "Shanghai Demo Technology Co., Ltd.",
    status: "pending",
    submittedAt: "2026-06-29 11:40",
    timeline: [
      {
        action: "created",
        actor: "Riken",
        comment: "Invoice uploaded from mobile capture.",
        occurredAt: "2026-06-29 09:42",
      },
      {
        action: "ocrConfirmed",
        actor: "Riken",
        comment: "OCR result confirmed by applicant.",
        occurredAt: "2026-06-29 10:02",
      },
      {
        action: "duplicateChecked",
        actor: "System",
        comment: "No duplicate risk detected.",
        occurredAt: "2026-06-29 10:03",
      },
    ],
  },
  {
    amount: 126.8,
    applicant: "Riken",
    duplicateHits: ["INV-20260620-0031"],
    duplicateRisk: "high",
    fileName: "INV-20260629-0002.pdf",
    id: "INV-20260629-0002",
    invoiceCode: "031002400220",
    invoiceNumber: "56421908",
    ocrConfidence: 0.91,
    ocrFields: [
      {
        confidence: 0.95,
        label: "Invoice code",
        value: "031002400220",
      },
      {
        confidence: 0.94,
        label: "Invoice number",
        value: "56421908",
      },
      {
        confidence: 0.88,
        label: "Seller",
        userValue: "Hangzhou Cloud Bridge Trading Co., Ltd.",
        value: "Hangzhou Cloud Bridge Trading",
      },
      {
        confidence: 0.9,
        label: "Amount",
        value: "126.80",
      },
    ],
    seller: "Hangzhou Cloud Bridge Trading Co., Ltd.",
    status: "duplicate",
    submittedAt: "2026-06-29 11:48",
    timeline: [
      {
        action: "created",
        actor: "Riken",
        comment: "Invoice uploaded from file.",
        occurredAt: "2026-06-29 10:18",
      },
      {
        action: "ocrConfirmed",
        actor: "Riken",
        comment: "Seller name corrected before submission.",
        occurredAt: "2026-06-29 10:28",
      },
      {
        action: "duplicateChecked",
        actor: "System",
        comment: "Possible duplicate invoice found.",
        occurredAt: "2026-06-29 10:29",
      },
    ],
  },
  {
    amount: 980,
    applicant: "Finance Bot",
    duplicateHits: [],
    duplicateRisk: "medium",
    fileName: "INV-20260628-0017.pdf",
    id: "INV-20260628-0017",
    invoiceCode: "011002300891",
    invoiceNumber: "12093476",
    ocrConfidence: 0.86,
    ocrFields: [
      {
        confidence: 0.9,
        label: "Invoice code",
        value: "011002300891",
      },
      {
        confidence: 0.88,
        label: "Invoice number",
        value: "12093476",
      },
      {
        confidence: 0.82,
        label: "Seller",
        value: "Beijing North Star Service Co., Ltd.",
      },
      {
        confidence: 0.84,
        label: "Amount",
        value: "980.00",
      },
    ],
    seller: "Beijing North Star Service Co., Ltd.",
    status: "escalated",
    submittedAt: "2026-06-28 18:00",
    timeline: [
      {
        action: "created",
        actor: "Riken",
        comment: "Invoice uploaded from PDF.",
        occurredAt: "2026-06-28 17:06",
      },
      {
        action: "duplicateChecked",
        actor: "System",
        comment: "Medium risk due to similar seller and amount.",
        occurredAt: "2026-06-28 17:07",
      },
    ],
  },
];

export const claimReviewItems: ClaimReviewItem[] = [
  {
    amount: 494.8,
    applicant: "Riken",
    category: "travel",
    description: "Customer visit transportation reimbursement.",
    id: "CLM-20260629-0001",
    invoices: [
      {
        amount: 368,
        id: "INV-20260629-0001",
        seller: "Shanghai Demo Technology Co., Ltd.",
      },
      {
        amount: 126.8,
        id: "INV-20260629-0002",
        seller: "Hangzhou Cloud Bridge Trading Co., Ltd.",
      },
    ],
    status: "pending",
    submittedAt: "2026-06-29 11:30",
    title: "June customer visit reimbursement",
    timeline: [
      {
        action: "created",
        actor: "Riken",
        comment: "Claim created from selected invoices.",
        occurredAt: "2026-06-29 11:12",
      },
      {
        action: "submitted",
        actor: "Riken",
        comment: "Submitted for finance review.",
        occurredAt: "2026-06-29 11:30",
      },
    ],
  },
  {
    amount: 368,
    applicant: "Riken",
    category: "office",
    description: "Project material purchase reimbursement.",
    id: "CLM-20260628-0007",
    invoices: [
      {
        amount: 368,
        id: "INV-20260629-0001",
        seller: "Shanghai Demo Technology Co., Ltd.",
      },
    ],
    status: "escalated",
    submittedAt: "2026-06-28 16:10",
    title: "Project material reimbursement",
    timeline: [
      {
        action: "created",
        actor: "Riken",
        comment: "Claim draft created.",
        occurredAt: "2026-06-28 15:45",
      },
      {
        action: "submitted",
        actor: "Riken",
        comment: "Submitted for review.",
        occurredAt: "2026-06-28 16:10",
      },
      {
        action: "reviewing",
        actor: "Finance Reviewer",
        comment: "Additional business context requested.",
        occurredAt: "2026-06-28 16:42",
      },
    ],
  },
];

export function findInvoiceReview(invoiceId: string | undefined) {
  return (
    invoiceReviewItems.find((invoice) => invoice.id === invoiceId) ??
    invoiceReviewItems[0]
  );
}

export function findClaimReview(claimId: string | undefined) {
  return (
    claimReviewItems.find((claim) => claim.id === claimId) ??
    claimReviewItems[0]
  );
}
