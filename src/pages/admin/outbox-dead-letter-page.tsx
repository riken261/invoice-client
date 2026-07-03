import * as React from "react";
import {
  ArrowClockwiseIcon,
  ArchiveBoxIcon,
  PlayIcon,
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
import { bffService, type BffOutboxItem } from "@/services/bff-service";

import "./admin.css";

type AdminProcessStatus = BffOutboxItem["status"];

const statusVariant: Record<
  AdminProcessStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  deadLetter: "destructive",
  resolved: "default",
  retrying: "secondary",
};

const OutboxDeadLetterPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get("status");
  const [isLoading, setIsLoading] = React.useState(true);
  const [items, setItems] = React.useState<BffOutboxItem[]>([]);
  const [processingId, setProcessingId] = React.useState("");
  const [result, setResult] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<
    AdminProcessStatus | "all"
  >(initialStatus === "DEAD_LETTER" ? "deadLetter" : "all");

  const loadItems = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const page = await bffService.admin.getOutboxEvents(
        statusFilter === "deadLetter" ? "DEAD_LETTER" : undefined,
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
          item.aggregateId,
          item.aggregateType,
          item.eventType,
          item.routingKey,
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

  const process = (id: string, action: "replay" | "archive") => {
    if (processingId) {
      return;
    }
    setProcessingId(id);
    const request =
      action === "replay"
        ? bffService.admin.retryOutboxEvent(id)
        : Promise.resolve();
    void request
      .then(() => {
        setResult(t(`adminOutbox.result.${action}`, { id }));
        void loadItems();
      })
      .finally(() => setProcessingId(""));
  };

  return (
    <main className="admin-page">
      <section className="admin-page__content">
        <header className="admin-page__heading">
          <div>
            <h1 className="admin-page__title">{t("adminOutbox.title")}</h1>
            <p className="admin-page__subtitle">{t("adminOutbox.subtitle")}</p>
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
            label={t("adminOutbox.metrics.deadLetter")}
            value={items.filter((item) => item.status === "deadLetter").length}
          />
          <Metric
            label={t("adminOutbox.metrics.retrying")}
            value={items.filter((item) => item.status === "retrying").length}
          />
          <Metric
            label={t("adminOutbox.metrics.maxRetry")}
            value={
              items.length
                ? Math.max(...items.map((item) => item.retryCount))
                : 0
            }
          />
          <Metric label={t("adminOutbox.metrics.total")} value={items.length} />
        </section>

        <section className="admin-page__toolbar">
          <Input
            aria-label={t("adminOutbox.filters.search")}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("adminOutbox.filters.searchPlaceholder")}
            value={query}
          />
          <Select
            onValueChange={(value) =>
              setStatusFilter(value as AdminProcessStatus | "all")
            }
            value={statusFilter}
          >
            <SelectTrigger className="admin-page__status-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("adminOutbox.filters.all")}
              </SelectItem>
              <SelectItem value="deadLetter">
                {t("adminOutbox.status.deadLetter")}
              </SelectItem>
              <SelectItem value="retrying">
                {t("adminOutbox.status.retrying")}
              </SelectItem>
              <SelectItem value="resolved">
                {t("adminOutbox.status.resolved")}
              </SelectItem>
            </SelectContent>
          </Select>
        </section>

        <section className="admin-page__table-panel">
          {isLoading ? (
            <div className="admin-page__state">
              <Spinner />
              {t("adminOutbox.state.loading")}
            </div>
          ) : null}

          {!isLoading && filteredItems.length === 0 ? (
            <div className="admin-page__state">
              {t("adminOutbox.state.empty")}
            </div>
          ) : null}

          {!isLoading && filteredItems.length > 0 ? (
            <div className="admin-page__table-scroll">
              <table className="admin-page__table">
                <thead>
                  <tr>
                    <th>{t("adminOutbox.columns.event")}</th>
                    <th>{t("adminOutbox.columns.aggregate")}</th>
                    <th>{t("adminOutbox.columns.routingKey")}</th>
                    <th>{t("adminOutbox.columns.retryCount")}</th>
                    <th>{t("adminOutbox.columns.failedAt")}</th>
                    <th>{t("adminOutbox.columns.status")}</th>
                    <th>{t("adminOutbox.columns.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.id}</strong>
                        <span>{item.eventType}</span>
                      </td>
                      <td>
                        {item.aggregateType} / {item.aggregateId}
                      </td>
                      <td>{item.routingKey}</td>
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
                            onClick={() => process(item.id, "replay")}
                            size="sm"
                            type="button"
                          >
                            {processingId === item.id ? (
                              <Spinner />
                            ) : (
                              <PlayIcon />
                            )}
                            {t("adminOutbox.actions.replay")}
                          </Button>
                          <Button
                            disabled={Boolean(processingId)}
                            onClick={() => process(item.id, "archive")}
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            <ArchiveBoxIcon />
                            {t("adminOutbox.actions.archive")}
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

function statusKey(status: AdminProcessStatus) {
  return `adminOutbox.status.${status}` as const;
}

export { OutboxDeadLetterPage };
