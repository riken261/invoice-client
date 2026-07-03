import * as React from "react";
import {
  ArrowClockwiseIcon,
  EyeIcon,
  FilePlusIcon,
  ProhibitIcon,
  PencilSimpleLineIcon,
} from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";

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
import { bffService, type BffClaimItem } from "@/services/bff-service";

import "./claim.css";

type ClaimCategory = BffClaimItem["category"];
type ClaimStatus = BffClaimItem["status"];

const statusVariant: Record<
  ClaimStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  archived: "secondary",
  draft: "secondary",
  paid: "default",
  rejected: "destructive",
  submitted: "outline",
};

const ClaimListPage: React.FC = () => {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get("status")?.toLowerCase();
  const [isLoading, setIsLoading] = React.useState(true);
  const [claims, setClaims] = React.useState<BffClaimItem[]>([]);
  const [abandoningClaimId, setAbandoningClaimId] = React.useState("");
  const [openingClaimId, setOpeningClaimId] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<ClaimStatus | "all">(
    isClaimStatus(initialStatus) ? initialStatus : "all",
  );

  const loadClaims = async () => {
    setIsLoading(true);
    try {
      const page = await bffService.claims.getList();
      setClaims(page.items);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    let ignore = false;

    async function loadInitialClaims() {
      try {
        const page = await bffService.claims.getList();
        if (!ignore) {
          setClaims(page.items);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    queueMicrotask(() => void loadInitialClaims());

    return () => {
      ignore = true;
    };
  }, []);

  const currencyFormatter = React.useMemo(
    () =>
      new Intl.NumberFormat(i18n.language, {
        currency: "CNY",
        style: "currency",
      }),
    [i18n.language],
  );

  const filteredClaims = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return claims.filter((claim) => {
      const matchesStatus =
        statusFilter === "all" || claim.status === statusFilter;
      const matchesQuery =
        !normalizedQuery ||
        [claim.id, claim.title, claim.applicant].some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        );

      return matchesStatus && matchesQuery;
    });
  }, [claims, query, statusFilter]);

  const refreshClaims = () => {
    if (isLoading) {
      return;
    }

    void loadClaims();
  };

  const openClaim = (claimId: string) => {
    if (openingClaimId) {
      return;
    }

    setOpeningClaimId(claimId);
    window.setTimeout(() => navigate(`/claims/${claimId}`), 350);
  };

  const abandonClaim = (claimId: string) => {
    if (abandoningClaimId) {
      return;
    }

    setAbandoningClaimId(claimId);
    void bffService.claims
      .abandon(claimId)
      .then(loadClaims)
      .finally(() => setAbandoningClaimId(""));
  };

  return (
    <main className="claim-page">
      <section className="claim-page__content">
        <header className="claim-page__heading">
          <div>
            <h1 className="claim-page__title">{t("claimList.title")}</h1>
            <p className="claim-page__subtitle">{t("claimList.subtitle")}</p>
          </div>
          <div className="claim-page__heading-actions">
            <Button
              disabled={isLoading}
              onClick={refreshClaims}
              type="button"
              variant="outline"
            >
              {isLoading ? <Spinner /> : <ArrowClockwiseIcon />}
              {t("claimList.actions.refresh")}
            </Button>
            <Button onClick={() => navigate("/claims/new")} type="button">
              <FilePlusIcon />
              {t("claimList.actions.create")}
            </Button>
          </div>
        </header>

        <section className="claim-page__summary">
          <Metric label={t("claimList.metrics.total")} value={claims.length} />
          <Metric
            label={t("claimList.metrics.submitted")}
            value={
              claims.filter((claim) => claim.status === "submitted").length
            }
          />
          <Metric
            label={t("claimList.metrics.rejected")}
            value={claims.filter((claim) => claim.status === "rejected").length}
          />
          <Metric
            label={t("claimList.metrics.amount")}
            value={currencyFormatter.format(
              claims.reduce((total, claim) => total + claim.amount, 0),
            )}
          />
        </section>

        <section className="claim-page__toolbar">
          <Input
            aria-label={t("claimList.filters.search")}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("claimList.filters.searchPlaceholder")}
            value={query}
          />
          <Select
            onValueChange={(value) =>
              setStatusFilter(value as ClaimStatus | "all")
            }
            value={statusFilter}
          >
            <SelectTrigger className="claim-page__status-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("claimList.filters.all")}</SelectItem>
              <SelectItem value="draft">
                {t("claimList.status.draft")}
              </SelectItem>
              <SelectItem value="submitted">
                {t("claimList.status.submitted")}
              </SelectItem>
              <SelectItem value="rejected">
                {t("claimList.status.rejected")}
              </SelectItem>
              <SelectItem value="paid">{t("claimList.status.paid")}</SelectItem>
              <SelectItem value="archived">
                {t("claimList.status.archived")}
              </SelectItem>
            </SelectContent>
          </Select>
        </section>

        <section className="claim-page__table-panel">
          {isLoading ? (
            <div className="claim-page__state">
              <Spinner />
              {t("claimList.state.loading")}
            </div>
          ) : null}

          {!isLoading && filteredClaims.length === 0 ? (
            <div className="claim-page__state">
              {t("claimList.state.empty")}
            </div>
          ) : null}

          {!isLoading && filteredClaims.length > 0 ? (
            <div className="claim-page__table-scroll">
              <table className="claim-page__table">
                <thead>
                  <tr>
                    <th>{t("claimList.columns.claim")}</th>
                    <th>{t("claimList.columns.category")}</th>
                    <th>{t("claimList.columns.amount")}</th>
                    <th>{t("claimList.columns.invoices")}</th>
                    <th>{t("claimList.columns.submittedAt")}</th>
                    <th>{t("claimList.columns.status")}</th>
                    <th>{t("claimList.columns.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClaims.map((claim) => (
                    <tr key={claim.id}>
                      <td>
                        <strong>{claim.id}</strong>
                        <span>{claim.title}</span>
                        {claim.rejectedReason ? (
                          <span>{claim.rejectedReason}</span>
                        ) : null}
                      </td>
                      <td>{t(categoryKey(claim.category))}</td>
                      <td>{currencyFormatter.format(claim.amount)}</td>
                      <td>{claim.invoices.length}</td>
                      <td>{claim.submittedAt}</td>
                      <td>
                        <Badge variant={statusVariant[claim.status]}>
                          {t(statusKey(claim.status))}
                        </Badge>
                      </td>
                      <td>
                        <div className="claim-page__row-actions">
                          <Button
                            disabled={Boolean(openingClaimId)}
                            onClick={() => openClaim(claim.id)}
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            {openingClaimId === claim.id ? (
                              <Spinner />
                            ) : (
                              <EyeIcon />
                            )}
                            {t("claimList.actions.view")}
                          </Button>
                          {claim.status === "rejected" ? (
                            <>
                              <Button
                                onClick={() =>
                                  navigate(
                                    `/claims/new?source=rejected&claimId=${claim.id}`,
                                  )
                                }
                                size="sm"
                                type="button"
                              >
                                <PencilSimpleLineIcon />
                                {t("claimList.actions.resubmit")}
                              </Button>
                              <Button
                                disabled={Boolean(abandoningClaimId)}
                                onClick={() => abandonClaim(claim.id)}
                                size="sm"
                                type="button"
                                variant="outline"
                              >
                                {abandoningClaimId === claim.id ? (
                                  <Spinner />
                                ) : (
                                  <ProhibitIcon />
                                )}
                                {t("claimList.actions.abandon")}
                              </Button>
                            </>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      </section>
    </main>
  );
};

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="claim-page__metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function isClaimStatus(value: string | undefined): value is ClaimStatus {
  return (
    value === "draft" ||
    value === "submitted" ||
    value === "rejected" ||
    value === "paid" ||
    value === "archived"
  );
}

function categoryKey(category: ClaimCategory) {
  return `claimList.category.${category}` as const;
}

function statusKey(status: ClaimStatus) {
  return `claimList.status.${status}` as const;
}

export { ClaimListPage };
