export type ClaimStatus = "draft" | "submitted" | "rejected" | "paid";
export type ClaimCategory = "travel" | "office" | "meal" | "service";

export interface ClaimInvoiceItem {
  amount: number;
  expenseCategory: ClaimCategory;
  fileName: string;
  id: string;
  invoiceNumber: string;
  seller: string;
  submittedAt: string;
}

export interface ClaimReviewStep {
  action: "created" | "submitted" | "rejected" | "approved" | "paid";
  actor: string;
  comment: string;
  occurredAt: string;
}

export interface ClaimListItem {
  amount: number;
  applicant: string;
  category: ClaimCategory;
  description: string;
  id: string;
  invoices: ClaimInvoiceItem[];
  rejectedReason?: string;
  status: ClaimStatus;
  submittedAt: string;
  title: string;
  timeline: ClaimReviewStep[];
}

export const reimbursableInvoices: ClaimInvoiceItem[] = [
  {
    amount: 368,
    expenseCategory: "office",
    fileName: "INV-20260629-0001.pdf",
    id: "INV-20260629-0001",
    invoiceNumber: "89342716",
    seller: "Shanghai Demo Technology Co., Ltd.",
    submittedAt: "2026-06-29",
  },
  {
    amount: 126.8,
    expenseCategory: "travel",
    fileName: "INV-20260629-0002.pdf",
    id: "INV-20260629-0002",
    invoiceNumber: "56421908",
    seller: "Hangzhou Cloud Bridge Trading Co., Ltd.",
    submittedAt: "2026-06-29",
  },
  {
    amount: 52.5,
    expenseCategory: "meal",
    fileName: "INV-20260628-0013.pdf",
    id: "INV-20260628-0013",
    invoiceNumber: "78349021",
    seller: "Shenzhen Qianhai Convenience Store",
    submittedAt: "2026-06-28",
  },
];

export const mockClaims: ClaimListItem[] = [
  {
    amount: 494.8,
    applicant: "Riken",
    category: "travel",
    description: "Customer visit transportation reimbursement.",
    id: "CLM-20260629-0001",
    invoices: [reimbursableInvoices[0], reimbursableInvoices[1]],
    status: "submitted",
    submittedAt: "2026-06-29 11:30",
    title: "June customer visit reimbursement",
    timeline: [
      {
        action: "created",
        actor: "Riken",
        comment: "Draft created from selected invoices.",
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
    invoices: [reimbursableInvoices[0]],
    rejectedReason: "Business purpose is missing. Add details and resubmit.",
    status: "rejected",
    submittedAt: "2026-06-28 16:10",
    title: "Project material reimbursement",
    timeline: [
      {
        action: "created",
        actor: "Riken",
        comment: "Draft created.",
        occurredAt: "2026-06-28 15:45",
      },
      {
        action: "submitted",
        actor: "Riken",
        comment: "Submitted for review.",
        occurredAt: "2026-06-28 16:10",
      },
      {
        action: "rejected",
        actor: "Finance Reviewer",
        comment: "Business purpose is missing. Add details and resubmit.",
        occurredAt: "2026-06-28 17:20",
      },
    ],
  },
  {
    amount: 980,
    applicant: "Riken",
    category: "service",
    description: "Supplier service fee reimbursement.",
    id: "CLM-20260626-0012",
    invoices: [
      {
        amount: 980,
        expenseCategory: "service",
        fileName: "INV-20260626-0012.pdf",
        id: "INV-20260626-0012",
        invoiceNumber: "12093476",
        seller: "Beijing North Star Service Co., Ltd.",
        submittedAt: "2026-06-26",
      },
    ],
    status: "paid",
    submittedAt: "2026-06-26 09:18",
    title: "Supplier service fee reimbursement",
    timeline: [
      {
        action: "created",
        actor: "Riken",
        comment: "Draft created.",
        occurredAt: "2026-06-26 09:02",
      },
      {
        action: "approved",
        actor: "Finance Reviewer",
        comment: "Approved.",
        occurredAt: "2026-06-26 14:35",
      },
      {
        action: "paid",
        actor: "Cashier",
        comment: "Payment completed.",
        occurredAt: "2026-06-27 10:10",
      },
    ],
  },
  {
    amount: 52.5,
    applicant: "Riken",
    category: "meal",
    description: "Working meal reimbursement draft.",
    id: "CLM-DRAFT-0003",
    invoices: [reimbursableInvoices[2]],
    status: "draft",
    submittedAt: "2026-06-29 15:00",
    title: "Working meal reimbursement draft",
    timeline: [
      {
        action: "created",
        actor: "Riken",
        comment: "Draft saved.",
        occurredAt: "2026-06-29 15:00",
      },
    ],
  },
];

export function findMockClaim(claimId: string | undefined) {
  return mockClaims.find((claim) => claim.id === claimId) ?? mockClaims[0];
}
