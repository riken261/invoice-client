import * as React from "react";
import {
  ArrowClockwiseIcon,
  DownloadSimpleIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { bffService, type BffSecurityAuditItem } from "@/services/bff-service";

import "./admin.css";

type SecurityAuditResult = BffSecurityAuditItem["result"];
type SecurityAuditRisk = BffSecurityAuditItem["risk"];

const riskVariant: Record<
  SecurityAuditRisk,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  high: "destructive",
  low: "outline",
  medium: "secondary",
};

const resultVariant: Record<
  SecurityAuditResult,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  blocked: "destructive",
  failed: "secondary",
  success: "default",
};

const SecurityAuditPage: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = React.useState(true);
  const [items, setItems] = React.useState<BffSecurityAuditItem[]>([]);
  const [result, setResult] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [riskFilter, setRiskFilter] = React.useState<SecurityAuditRisk | "all">(
    "all",
  );

  const loadItems = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const page = await bffService.admin.getSecurityAuditLogs();
      setItems(page.items);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    queueMicrotask(() => void loadItems());
  }, [loadItems]);

  const filteredItems = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesRisk = riskFilter === "all" || item.risk === riskFilter;
      const matchesQuery =
        !normalizedQuery ||
        [
          item.action,
          item.actor,
          item.resource,
          item.sourceIp,
          item.traceId,
        ].some((value) => value.toLowerCase().includes(normalizedQuery));
      return matchesRisk && matchesQuery;
    });
  }, [items, query, riskFilter]);

  const refresh = () => {
    if (isLoading) {
      return;
    }
    void loadItems();
  };

  const runAuditAction = (action: "trace" | "export", traceId?: string) => {
    if (action === "trace") {
      setResult(
        t("adminSecurityAudit.result.trace", { traceId: traceId ?? "" }),
      );
      return;
    }

    setResult(t("adminSecurityAudit.result.export"));
  };

  return (
    <main className="admin-page">
      <section className="admin-page__content">
        <header className="admin-page__heading">
          <div>
            <h1 className="admin-page__title">
              {t("adminSecurityAudit.title")}
            </h1>
            <p className="admin-page__subtitle">
              {t("adminSecurityAudit.subtitle")}
            </p>
          </div>
          <div className="admin-page__heading-actions">
            <Button onClick={() => runAuditAction("export")} variant="outline">
              <DownloadSimpleIcon />
              {t("adminSecurityAudit.actions.export")}
            </Button>
            <Button disabled={isLoading} onClick={refresh} variant="outline">
              {isLoading ? <Spinner /> : <ArrowClockwiseIcon />}
              {t("adminCommon.actions.refresh")}
            </Button>
          </div>
        </header>

        <section className="admin-page__summary">
          <Metric
            label={t("adminSecurityAudit.metrics.highRisk")}
            value={items.filter((item) => item.risk === "high").length}
          />
          <Metric
            label={t("adminSecurityAudit.metrics.blocked")}
            value={items.filter((item) => item.result === "blocked").length}
          />
          <Metric
            label={t("adminSecurityAudit.metrics.actors")}
            value={new Set(items.map((item) => item.actor)).size}
          />
          <Metric
            label={t("adminSecurityAudit.metrics.total")}
            value={items.length}
          />
        </section>

        <section className="admin-page__toolbar">
          <Input
            aria-label={t("adminSecurityAudit.filters.search")}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("adminSecurityAudit.filters.searchPlaceholder")}
            value={query}
          />
          <Select
            onValueChange={(value) =>
              setRiskFilter(value as SecurityAuditRisk | "all")
            }
            value={riskFilter}
          >
            <SelectTrigger className="admin-page__status-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("adminSecurityAudit.filters.all")}
              </SelectItem>
              <SelectItem value="low">
                {t("adminSecurityAudit.risk.low")}
              </SelectItem>
              <SelectItem value="medium">
                {t("adminSecurityAudit.risk.medium")}
              </SelectItem>
              <SelectItem value="high">
                {t("adminSecurityAudit.risk.high")}
              </SelectItem>
            </SelectContent>
          </Select>
        </section>

        <section className="admin-page__table-panel">
          {isLoading ? (
            <div className="admin-page__state">
              <Spinner />
              {t("adminSecurityAudit.state.loading")}
            </div>
          ) : null}

          {!isLoading && filteredItems.length === 0 ? (
            <div className="admin-page__state">
              {t("adminSecurityAudit.state.empty")}
            </div>
          ) : null}

          {!isLoading && filteredItems.length > 0 ? (
            <div className="admin-page__table-scroll">
              <table className="admin-page__table">
                <thead>
                  <tr>
                    <th>{t("adminSecurityAudit.columns.action")}</th>
                    <th>{t("adminSecurityAudit.columns.actor")}</th>
                    <th>{t("adminSecurityAudit.columns.resource")}</th>
                    <th>{t("adminSecurityAudit.columns.sourceIp")}</th>
                    <th>{t("adminSecurityAudit.columns.risk")}</th>
                    <th>{t("adminSecurityAudit.columns.result")}</th>
                    <th>{t("adminSecurityAudit.columns.occurredAt")}</th>
                    <th>{t("adminSecurityAudit.columns.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.traceId}>
                      <td>
                        <strong>{item.action}</strong>
                        <span>{item.traceId}</span>
                      </td>
                      <td>{item.actor}</td>
                      <td>{item.resource}</td>
                      <td>{item.sourceIp}</td>
                      <td>
                        <Badge variant={riskVariant[item.risk]}>
                          {t(riskKey(item.risk))}
                        </Badge>
                      </td>
                      <td>
                        <Badge variant={resultVariant[item.result]}>
                          {t(resultKey(item.result))}
                        </Badge>
                      </td>
                      <td>{item.occurredAt}</td>
                      <td>
                        <Button
                          onClick={() => runAuditAction("trace", item.traceId)}
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          <MagnifyingGlassIcon />
                          {t("adminSecurityAudit.actions.trace")}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>

        {result ? <p className="admin-page__result">{result}</p> : null}
      </section>
    </main>
  );
};

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="admin-page__metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function riskKey(risk: SecurityAuditRisk) {
  return `adminSecurityAudit.risk.${risk}` as const;
}

function resultKey(result: SecurityAuditResult) {
  return `adminSecurityAudit.resultStatus.${result}` as const;
}

export { SecurityAuditPage };
