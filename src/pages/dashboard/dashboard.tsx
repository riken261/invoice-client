import * as React from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useGet } from "@/hooks/http";
import { useAppSelector } from "@/store/hooks";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import "./dashboard.css";

interface DashboardActionItem {
  actionName: string;
  badgeCount: number;
  enabled: boolean;
  i18nKey: string;
  permissionCode: string;
  routerPath: string;
}

interface DashboardActionGroup {
  actions: DashboardActionItem[];
  code: string;
  name: string;
}

interface DashboardActionMenusResponse {
  menuList: DashboardActionGroup[];
}

interface EmployeeDashboardSummaryResponse {
  draftClaimCount: number;
  manualInputRequiredCount: number;
  ocrConfirmRequiredCount: number;
  ocrProcessingCount: number;
  rejectedClaimCount: number;
  rejectedInvoiceCount: number;
}

interface FinanceDashboardSummaryResponse {
  averageWaitingHours: string;
  duplicateInvoiceCount: number;
  pendingClaimCount: number;
  pendingInvoiceCount: number;
}

interface AdminDashboardSummaryResponse {
  outboxDeadLetterCount: number;
  securityEventCount: number;
  storageFailureCount: number;
}

const ACTION_MENUS_API =
  "/invoice-common-service/bff/v1/dashboard/action-menus";
const EMPLOYEE_SUMMARY_API =
  "/invoice-common-service/bff/v1/dashboard/employee-summary";
const FINANCE_SUMMARY_API =
  "/invoice-common-service/bff/v1/dashboard/finance-summary";
const ADMIN_SUMMARY_API = "/api/bff/v1/dashboard/admin-summary";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const userPermissions = React.useMemo(
    () => new Set(currentUser?.permissions ?? []),
    [currentUser?.permissions],
  );
  const canViewEmployeeSummary = userPermissions.has("invoice:view:self");
  const canViewFinanceSummary = userPermissions.has("claim:finance-review");
  const canViewAdminSummary = userPermissions.has("system:config");
  const {
    data: actionMenus,
    isError,
    isLoading,
  } = useGet<DashboardActionMenusResponse>(ACTION_MENUS_API, {
    immediate: true,
  });
  const employeeSummary = useGet<EmployeeDashboardSummaryResponse>(
    EMPLOYEE_SUMMARY_API,
    { immediate: canViewEmployeeSummary },
  );
  const financeSummary = useGet<FinanceDashboardSummaryResponse>(
    FINANCE_SUMMARY_API,
    { immediate: canViewFinanceSummary },
  );
  const adminSummary = useGet<AdminDashboardSummaryResponse>(
    ADMIN_SUMMARY_API,
    {
      immediate: canViewAdminSummary,
    },
  );

  const actionGroups = React.useMemo(
    () =>
      (actionMenus?.menuList ?? [])
        .map((group) => ({
          ...group,
          actions: group.actions.filter(
            (action) =>
              action.enabled &&
              (!action.permissionCode ||
                userPermissions.has(action.permissionCode)),
          ),
        }))
        .filter((group) => group.actions.length > 0),
    [actionMenus?.menuList, userPermissions],
  );
  const [requestedAction, setRequestedAction] = React.useState("");
  const availableActions = React.useMemo(
    () => actionGroups.flatMap((group) => group.actions),
    [actionGroups],
  );
  const selectedAction = React.useMemo(() => {
    if (availableActions.some((action) => action.i18nKey === requestedAction)) {
      return requestedAction;
    }

    return availableActions[0]?.i18nKey ?? "";
  }, [availableActions, requestedAction]);

  const selectedDashboardAction = React.useMemo(
    () => availableActions.find((action) => action.i18nKey === selectedAction),
    [availableActions, selectedAction],
  );

  const translateDashboardText = (i18nKey: string, fallback: string) =>
    t(i18nKey, { defaultValue: fallback });

  const summaryGroups = React.useMemo(() => {
    const groups: {
      code: "admin" | "employee" | "finance";
      metrics: { label: string; path?: string; value: React.ReactNode }[];
    }[] = [];

    if (canViewEmployeeSummary && employeeSummary.data) {
      groups.push({
        code: "employee",
        metrics: [
          {
            label: t("dashboard.summary.employee.draftClaims"),
            path: "/claims?status=draft",
            value: employeeSummary.data.draftClaimCount,
          },
          {
            label: t("dashboard.action.todo.claimRejectedResubmit"),
            path: "/claims?status=rejected",
            value: employeeSummary.data.rejectedClaimCount,
          },
        ],
      });
    }

    if (canViewFinanceSummary && financeSummary.data) {
      groups.push({
        code: "finance",
        metrics: [
          {
            label: t("dashboard.summary.finance.pendingClaims"),
            value: financeSummary.data.pendingClaimCount,
          },
          {
            label: t("dashboard.summary.finance.averageWaitingHours"),
            value: financeSummary.data.averageWaitingHours,
          },
        ],
      });
    }

    if (canViewAdminSummary && adminSummary.data) {
      groups.push({
        code: "admin",
        metrics: [
          {
            label: t("dashboard.summary.admin.outboxDeadLetters"),
            value: adminSummary.data.outboxDeadLetterCount,
          },
          {
            label: t("dashboard.summary.admin.storageFailures"),
            value: adminSummary.data.storageFailureCount,
          },
          {
            label: t("dashboard.summary.admin.securityEvents"),
            value: adminSummary.data.securityEventCount,
          },
        ],
      });
    }

    return groups;
  }, [
    adminSummary.data,
    canViewAdminSummary,
    canViewEmployeeSummary,
    canViewFinanceSummary,
    employeeSummary.data,
    financeSummary.data,
    t,
  ]);
  const summaryIsLoading =
    employeeSummary.isLoading ||
    financeSummary.isLoading ||
    adminSummary.isLoading;

  const next = () => {
    const path: string = selectedDashboardAction?.routerPath ?? "";
    if (!path) {
      return;
    }
    navigate(path);
  };

  return (
    <main className="dashboard-page">
      <section className="dashboard-page__action-panel">
        <header className="dashboard-page__heading">
          <h1 className="dashboard-page__title">{t("dashboard.title")}</h1>
          <p className="dashboard-page__subtitle">{t("dashboard.subtitle")}</p>
        </header>

        {summaryIsLoading ? (
          <p className="dashboard-page__empty">
            <Spinner />
            {t("dashboard.summary.loading")}
          </p>
        ) : null}

        {summaryGroups.length > 0 ? (
          <section
            aria-label={t("dashboard.summary.aria")}
            className="dashboard-page__summary-groups"
          >
            {summaryGroups.map((group) => (
              <section
                className="dashboard-page__summary-group"
                key={group.code}
              >
                <h2 className="dashboard-page__summary-title">
                  {t(`dashboard.summary.${group.code}.title`)}
                </h2>
                <div className="dashboard-page__summary-grid">
                  {group.metrics.map((metric) => (
                    <button
                      className="dashboard-page__summary-metric"
                      disabled={!metric.path}
                      key={metric.label}
                      onClick={() => {
                        if (metric.path) {
                          navigate(metric.path);
                        }
                      }}
                      type="button"
                    >
                      <span>{metric.label}</span>
                      <strong>{metric.value}</strong>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </section>
        ) : null}

        {isLoading ? (
          <p className="dashboard-page__empty">
            <Spinner />
            {t("dashboard.state.loading")}
          </p>
        ) : null}

        {!isLoading && isError ? (
          <p className="dashboard-page__empty">{t("dashboard.state.error")}</p>
        ) : null}

        {!isLoading && !isError && actionGroups.length === 0 ? (
          <p className="dashboard-page__empty">{t("dashboard.state.empty")}</p>
        ) : null}

        {actionGroups.length > 0 ? (
          <RadioGroup
            className="dashboard-page__action-groups"
            onValueChange={setRequestedAction}
            value={selectedAction}
          >
            {actionGroups.map((group) => (
              <FieldSet
                className="dashboard-page__action-group"
                key={group.code}
              >
                <FieldDescription className="dashboard-page__group-title">
                  {translateDashboardText(group.code, group.name)}
                </FieldDescription>

                <div className="dashboard-page__action-list">
                  {group.actions.map((action) => (
                    <FieldLabel
                      className="dashboard-page__action-label"
                      htmlFor={action.i18nKey}
                      key={action.i18nKey}
                    >
                      <Field
                        className="dashboard-page__action-field"
                        orientation="horizontal"
                      >
                        <FieldContent>
                          <FieldTitle className="dashboard-page__action-title">
                            {translateDashboardText(
                              action.i18nKey,
                              action.actionName,
                            )}
                          </FieldTitle>
                          {action.badgeCount > 0 ? (
                            <FieldDescription className="dashboard-page__action-badge">
                              {action.badgeCount}
                            </FieldDescription>
                          ) : null}
                        </FieldContent>

                        <RadioGroupItem
                          id={action.i18nKey}
                          value={action.i18nKey}
                        />
                      </Field>
                    </FieldLabel>
                  ))}
                </div>
              </FieldSet>
            ))}
          </RadioGroup>
        ) : null}

        <div className="dashboard-page__actions">
          <Button
            disabled={isLoading || !selectedDashboardAction?.routerPath}
            onClick={next}
          >
            {t("dashboard.actions.continue")}
          </Button>
        </div>
      </section>
    </main>
  );
};

export { Dashboard };
