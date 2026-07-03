import { combineReducers } from "@reduxjs/toolkit";

import { appPreferencesReducer } from "@/features/app-preferences/app-preferences-slice";
import { authReducer } from "@/features/auth/auth-slice";
import { auditReducer } from "@/features/audit/audit-slice";
import { authorizationReducer } from "@/features/authorization/authorization-slice";
import { claimReducer } from "@/features/claim/claim-slice";
import { duplicateReducer } from "@/features/duplicate/duplicate-slice";
import { fileArchiveReducer } from "@/features/file-archive/file-archive-slice";
import { identityReducer } from "@/features/identity/identity-slice";
import { integrationReducer } from "@/features/integration/integration-slice";
import { invoiceReducer } from "@/features/invoice/invoice-slice";
import { notificationReducer } from "@/features/notification/notification-slice";
import { reviewReducer } from "@/features/review/review-slice";
import { systemConfigReducer } from "@/features/system-config/system-config-slice";

export const rootReducer = combineReducers({
  appPreferences: appPreferencesReducer,
  auth: authReducer,
  audit: auditReducer,
  authorization: authorizationReducer,
  claim: claimReducer,
  duplicate: duplicateReducer,
  fileArchive: fileArchiveReducer,
  identity: identityReducer,
  integration: integrationReducer,
  invoice: invoiceReducer,
  notification: notificationReducer,
  review: reviewReducer,
  systemConfig: systemConfigReducer,
});
