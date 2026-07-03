import * as React from "react";
import {
  ArrowClockwiseIcon,
  EyeIcon,
  PlayIcon,
  ProhibitIcon,
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
import { bffService, type BffStorageFailureItem } from "@/services/bff-service";

import "./admin.css";

type StorageFailureStatus = BffStorageFailureItem["status"];

const statusVariant: Record<
  StorageFailureStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  failed: "destructive",
  ignored: "outline",
  retrying: "secondary",
};

const StorageFailurePage: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = React.useState(true);
  const [items, setItems] = React.useState<BffStorageFailureItem[]>([]);
  const [processingId, setProcessingId] = React.useState("");
  const [result, setResult] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<
    StorageFailureStatus | "all"
  >("all");

  const loadItems = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const page = await bffService.admin.getStorageFailures();
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
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      const matchesQuery =
        !normalizedQuery ||
        [
          item.id,
          item.fileId,
          item.invoiceId,
          item.provider,
          item.bucket,
          item.objectKey,
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

  const process = (id: string, action: "retry" | "ignore" | "preview") => {
    if (processingId) {
      return;
    }
    setProcessingId(id);
    const request =
      action === "retry"
        ? bffService.admin.retryStorageFailure(id)
        : action === "ignore"
          ? bffService.admin.ignoreStorageFailure(id)
          : Promise.resolve();
    void request
      .then(() => {
        setResult(t(`adminStorage.result.${action}`, { id }));
        if (action !== "preview") {
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
            <h1 className="admin-page__title">{t("adminStorage.title")}</h1>
            <p className="admin-page__subtitle">{t("adminStorage.subtitle")}</p>
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
            label={t("adminStorage.metrics.failed")}
            value={items.filter((item) => item.status === "failed").length}
          />
          <Metric
            label={t("adminStorage.metrics.retrying")}
            value={items.filter((item) => item.status === "retrying").length}
          />
          <Metric
            label={t("adminStorage.metrics.providers")}
            value={new Set(items.map((item) => item.provider)).size}
          />
          <Metric
            label={t("adminStorage.metrics.total")}
            value={items.length}
          />
        </section>

        <section className="admin-page__toolbar">
          <Input
            aria-label={t("adminStorage.filters.search")}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("adminStorage.filters.searchPlaceholder")}
            value={query}
          />
          <Select
            onValueChange={(value) =>
              setStatusFilter(value as StorageFailureStatus | "all")
            }
            value={statusFilter}
          >
            <SelectTrigger className="admin-page__status-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("adminStorage.filters.all")}
              </SelectItem>
              <SelectItem value="failed">
                {t("adminStorage.status.failed")}
              </SelectItem>
              <SelectItem value="retrying">
                {t("adminStorage.status.retrying")}
              </SelectItem>
              <SelectItem value="ignored">
                {t("adminStorage.status.ignored")}
              </SelectItem>
            </SelectContent>
          </Select>
        </section>

        <section className="admin-page__table-panel">
          {isLoading ? (
            <div className="admin-page__state">
              <Spinner />
              {t("adminStorage.state.loading")}
            </div>
          ) : null}

          {!isLoading && filteredItems.length === 0 ? (
            <div className="admin-page__state">
              {t("adminStorage.state.empty")}
            </div>
          ) : null}

          {!isLoading && filteredItems.length > 0 ? (
            <div className="admin-page__table-scroll">
              <table className="admin-page__table">
                <thead>
                  <tr>
                    <th>{t("adminStorage.columns.file")}</th>
                    <th>{t("adminStorage.columns.provider")}</th>
                    <th>{t("adminStorage.columns.objectKey")}</th>
                    <th>{t("adminStorage.columns.retryCount")}</th>
                    <th>{t("adminStorage.columns.failedAt")}</th>
                    <th>{t("adminStorage.columns.status")}</th>
                    <th>{t("adminStorage.columns.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.fileId}</strong>
                        <span>{item.invoiceId}</span>
                      </td>
                      <td>
                        {item.provider} / {item.bucket}
                      </td>
                      <td>{item.objectKey}</td>
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
                            {t("adminStorage.actions.retry")}
                          </Button>
                          <Button
                            disabled={Boolean(processingId)}
                            onClick={() => process(item.id, "preview")}
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            <EyeIcon />
                            {t("adminStorage.actions.preview")}
                          </Button>
                          <Button
                            disabled={Boolean(processingId)}
                            onClick={() => process(item.id, "ignore")}
                            size="sm"
                            type="button"
                            variant="destructive"
                          >
                            <ProhibitIcon />
                            {t("adminStorage.actions.ignore")}
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

function statusKey(status: StorageFailureStatus) {
  return `adminStorage.status.${status}` as const;
}

export { StorageFailurePage };
