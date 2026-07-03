import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";

import { OutboxDeadLetterPage } from "@/pages/admin/outbox-dead-letter-page";
import { SecurityAuditPage } from "@/pages/admin/security-audit-page";
import { StorageFailurePage } from "@/pages/admin/storage-failure-page";
import { AuthCallbackPage } from "@/pages/auth/auth-callback-page";
import { ClaimCreatePage } from "@/pages/claims/claim-create-page";
import { ClaimDetailPage } from "@/pages/claims/claim-detail-page";
import { ClaimListPage } from "@/pages/claims/claim-list-page";
import { LoginPage } from "@/pages/auth/login-page";
import { Dashboard } from "@/pages/dashboard/dashboard.tsx";
import { ClaimReviewListPage } from "@/pages/review/claim-review-list-page";
import { ClaimReviewPage } from "@/pages/review/claim-review-page";
import { FinanceReviewPage } from "@/pages/review/finance-review-page";
import { InvoiceDetailPage } from "@/pages/invoices/detail/invoice-detail-page";
import { InvoiceListPage } from "@/pages/invoices/list/invoice-list-page.tsx";
import { InvoiceReviewListPage } from "@/pages/review/invoice-review-list-page";
import { InvoiceReviewPage } from "@/pages/review/invoice-review-page";
import { InvoiceUploadComplatePage } from "@/pages/invoices/upload/invoice-upload-complete.tsx";
import { InvoiceUploadConfirmPage } from "@/pages/invoices/upload/invoice-upload-confirm.tsx";
import { InvoiceUploadManualPage } from "@/pages/invoices/upload/invoice-upload-manual.tsx";
import { InvoiceUploadOcrPage } from "@/pages/invoices/upload/invoice-upload-ocr.tsx";
import { InvoiceUploadPage } from "@/pages/invoices/upload/invoice-upload-page.tsx";
import { GuestOnly, RequireAuth } from "@/routes/route-guard";

export const router: RouteObject[] = [
  {
    path: "/",
    element: (
      <RequireAuth>
        <Navigate replace to="/dashboard" />
      </RequireAuth>
    ),
  },
  {
    path: "/auth",
    element: (
      <GuestOnly>
        <LoginPage />
      </GuestOnly>
    ),
  },
  { path: "/auth/callback", element: <AuthCallbackPage /> },
  {
    path: "/dashboard",
    element: (
      <RequireAuth>
        <Dashboard />
      </RequireAuth>
    ),
  },
  {
    path: "/invoices",
    element: (
      <RequireAuth>
        <InvoiceListPage />
      </RequireAuth>
    ),
  },
  {
    path: "/invoices/:invoiceId",
    element: (
      <RequireAuth>
        <InvoiceDetailPage />
      </RequireAuth>
    ),
  },
  {
    path: "/invoice/upload",
    element: (
      <RequireAuth>
        <InvoiceUploadPage />
      </RequireAuth>
    ),
  },
  {
    path: "/invoice/upload/ocr",
    element: (
      <RequireAuth>
        <InvoiceUploadOcrPage />
      </RequireAuth>
    ),
  },
  {
    path: "/invoice/upload/manual",
    element: (
      <RequireAuth>
        <InvoiceUploadManualPage />
      </RequireAuth>
    ),
  },
  {
    path: "/invoice/upload/confirm",
    element: (
      <RequireAuth>
        <InvoiceUploadConfirmPage />
      </RequireAuth>
    ),
  },
  {
    path: "/invoice/upload/complate",
    element: (
      <RequireAuth>
        <InvoiceUploadComplatePage />
      </RequireAuth>
    ),
  },
  {
    path: "/claims",
    element: (
      <RequireAuth>
        <ClaimListPage />
      </RequireAuth>
    ),
  },
  {
    path: "/claims/new",
    element: (
      <RequireAuth>
        <ClaimCreatePage />
      </RequireAuth>
    ),
  },
  {
    path: "/claims/:claimId",
    element: (
      <RequireAuth>
        <ClaimDetailPage />
      </RequireAuth>
    ),
  },
  {
    path: "/finance/reviews",
    element: (
      <RequireAuth>
        <FinanceReviewPage />
      </RequireAuth>
    ),
  },
  {
    path: "/finance/invoices",
    element: (
      <RequireAuth>
        <InvoiceReviewListPage />
      </RequireAuth>
    ),
  },
  {
    path: "/finance/invoices/:invoiceId/review",
    element: (
      <RequireAuth>
        <InvoiceReviewPage />
      </RequireAuth>
    ),
  },
  {
    path: "/finance/claims",
    element: (
      <RequireAuth>
        <ClaimReviewListPage />
      </RequireAuth>
    ),
  },
  {
    path: "/finance/claims/:claimId/review",
    element: (
      <RequireAuth>
        <ClaimReviewPage />
      </RequireAuth>
    ),
  },
  {
    path: "/admin/outbox-events",
    element: (
      <RequireAuth>
        <OutboxDeadLetterPage />
      </RequireAuth>
    ),
  },
  {
    path: "/admin/storage-failures",
    element: (
      <RequireAuth>
        <StorageFailurePage />
      </RequireAuth>
    ),
  },
  {
    path: "/admin/audit-logs",
    element: (
      <RequireAuth>
        <SecurityAuditPage />
      </RequireAuth>
    ),
  },
];
