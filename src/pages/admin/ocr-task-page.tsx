import * as React from "react";
import {
  ArrowClockwiseIcon,
  EyeIcon,
  PlayIcon,
  ProhibitIcon,
} from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

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
import { bffService, type BffOcrTaskItem } from "@/services/bff-service";

import "./admin.css";

type OcrTaskStatus = BffOcrTaskItem["status"];

const statusVariant: Record<
  OcrTaskStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  dead: "destructive",
  failed: "destructive",
  ignored: "outline",
  retrying: "secondary",
};

const OcrTaskPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get("status");
  const [isLoading, setIsLoading] = React.useState(true);
  const [items, setItems] = React.useState<BffOcrTaskItem[]>([]);
  const [processingId, setProcessingId] = React.useState("");
  const [result, setResult] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<OcrTaskStatus | "all">(
    initialStatus === "DEAD"
      ? "dead"
      : initialStatus === "FAILED"
        ? "failed"
        : "all",
  );

  const loadItems = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const page = await bffService.admin.getOcrTasks(
        statusFilter === "all" ? undefined : statusFilter.toUpperCase(),
      );
      setItems(page.items);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  React.useEffect(() => {
    queueMicrotask(() => void loadItems());
  }, [loadItems]);

  const filteredItems = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      const matchesQuery =
        !normalizedQuery ||
        [
          item.id,
          item.invoiceId,
          item.fileId,
          item.provider,
          item.owner,
          item.failureCode,
          item.lastError,
        ].some((value) => value.toLowerCase().includes(normalizedQuery));
      return matchesStatus && matchesQuery;
    });
  }, [items, query, statusFilter]);

  const refresh = () => {
    if (isLoading) {
      return;
    }
    void loadItems();
  };

  const process = (id: string, action: "detail" | "ignore" | "retry") => {
    if (processingId) {
      return;
    }
    setProcessingId(id);
    const request =
      action === "retry"
        ? bffService.admin.retryOcrTask(id)
        : action === "ignore"
          ? bffService.admin.ignoreOcrTask(id)
          : Promise.resolve();
    void request
      .then(() => {
        setResult(t(`adminOcrTasks.result.${action}`, { id }));
        if (action !== "detail") {
          void loadItems();
        }
      })
      .finally(() => setProcessingId(""));
  };

  return (
    <main className="admin-page">
      <section className="admin-page__content">
        <header className="admin-page__heading">
          <div>
            <h1 className="admin-page__title">{t("adminOcrTasks.title")}</h1>
            <p className="admin-page__subtitle">
              {t("adminOcrTasks.subtitle")}
            </p>
          </div>
          <div className="admin-page__heading-actions">
            <Button disabled={isLoading} onClick={refresh} variant="outline">
              {isLoading ? <Spinner /> : <ArrowClockwiseIcon />}
              {t("adminCommon.actions.refresh")}
            </Button>
          </div>
        </header>

        <section className="admin-page__summary">
          <Metric
            label={t("adminOcrTasks.metrics.failed")}
            value={items.filter((item) => item.status === "failed").length}
          />
          <Metric
            label={t("adminOcrTasks.metrics.dead")}
            value={items.filter((item) => item.status === "dead").length}
          />
          <Metric
            label={t("adminOcrTasks.metrics.retrying")}
            value={items.filter((item) => item.status === "retrying").length}
          />
          <Metric
            label={t("adminOcrTasks.metrics.total")}
            value={items.length}
          />
        </section>

        <section className="admin-page__toolbar">
          <Input
            aria-label={t("adminOcrTasks.filters.search")}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("adminOcrTasks.filters.searchPlaceholder")}
            value={query}
          />
          <Select
            onValueChange={(value) =>
              setStatusFilter(value as OcrTaskStatus | "all")
            }
            value={statusFilter}
          >
            <SelectTrigger className="admin-page__status-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("adminOcrTasks.filters.all")}
              </SelectItem>
              <SelectItem value="failed">
                {t("adminOcrTasks.status.failed")}
              </SelectItem>
              <SelectItem value="retrying">
                {t("adminOcrTasks.status.retrying")}
              </SelectItem>
              <SelectItem value="dead">
                {t("adminOcrTasks.status.dead")}
              </SelectItem>
              <SelectItem value="ignored">
                {t("adminOcrTasks.status.ignored")}
              </SelectItem>
            </SelectContent>
          </Select>
        </section>

        <section className="admin-page__table-panel">
          {isLoading ? (
            <div className="admin-page__state">
              <Spinner />
              {t("adminOcrTasks.state.loading")}
            </div>
          ) : null}

          {!isLoading && filteredItems.length === 0 ? (
            <div className="admin-page__state">
              {t("adminOcrTasks.state.empty")}
            </div>
          ) : null}

          {!isLoading && filteredItems.length > 0 ? (
            <div className="admin-page__table-scroll">
              <table className="admin-page__table">
                <thead>
                  <tr>
                    <th>{t("adminOcrTasks.columns.task")}</th>
                    <th>{t("adminOcrTasks.columns.invoice")}</th>
                    <th>{t("adminOcrTasks.columns.provider")}</th>
                    <th>{t("adminOcrTasks.columns.failure")}</th>
                    <th>{t("adminOcrTasks.columns.retryCount")}</th>
                    <th>{t("adminOcrTasks.columns.failedAt")}</th>
                    <th>{t("adminOcrTasks.columns.status")}</th>
                    <th>{t("adminOcrTasks.columns.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.id}</strong>
                        <span>{item.owner}</span>
                      </td>
                      <td>
                        {item.invoiceId} / {item.fileId}
                      </td>
                      <td>{item.provider}</td>
                      <td>
                        <strong>{item.failureCode}</strong>
                        <span>{item.lastError}</span>
                      </td>
                      <td>{item.retryCount}</td>
                      <td>{item.failedAt}</td>
                      <td>
                        <Badge variant={statusVariant[item.status]}>
                          {t(statusKey(item.status))}
                        </Badge>
                      </td>
                      <td>
                        <div className="admin-page__row-actions">
                          <Button
                            disabled={Boolean(processingId)}
                            onClick={() => process(item.id, "retry")}
                            size="sm"
                            type="button"
                          >
                            {processingId === item.id ? (
                              <Spinner />
                            ) : (
                              <PlayIcon />
                            )}
                            {t("adminOcrTasks.actions.retry")}
                          </Button>
                          <Button
                            disabled={Boolean(processingId)}
                            onClick={() => process(item.id, "detail")}
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            <EyeIcon />
                            {t("adminOcrTasks.actions.detail")}
                          </Button>
                          <Button
                            disabled={Boolean(processingId)}
                            onClick={() => process(item.id, "ignore")}
                            size="sm"
                            type="button"
                            variant="destructive"
                          >
                            <ProhibitIcon />
                            {t("adminOcrTasks.actions.ignore")}
                          </Button>
                        </div>
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

function statusKey(status: OcrTaskStatus) {
  return `adminOcrTasks.status.${status}` as const;
}

export { OcrTaskPage };
