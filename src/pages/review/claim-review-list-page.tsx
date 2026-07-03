import * as React from "react";
import { ArrowClockwiseIcon, EyeIcon } from "@phosphor-icons/react";
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
import { bffService, type BffClaimReviewItem } from "@/services/bff-service";

import "./review.css";

type ReviewQueueStatus = BffClaimReviewItem["status"];

const statusVariant: Record<
  ReviewQueueStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  approved: "default",
  duplicate: "destructive",
  escalated: "secondary",
  pending: "outline",
  rejected: "destructive",
};

const ClaimReviewListPage: React.FC = () => {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get("status");
  const [isLoading, setIsLoading] = React.useState(true);
  const [claims, setClaims] = React.useState<BffClaimReviewItem[]>([]);
  const [openingId, setOpeningId] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<
    ReviewQueueStatus | "all"
  >(isReviewStatus(initialStatus) ? initialStatus : "all");

  const loadClaims = async () => {
    setIsLoading(true);
    try {
      const page = await bffService.finance.getPendingClaims();
      setClaims(page.items);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    let ignore = false;

    async function loadInitialClaims() {
      try {
        const page = await bffService.finance.getPendingClaims();
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

  const refresh = () => {
    if (isLoading) {
      return;
    }
    void loadClaims();
  };

  const openReview = (claimId: string) => {
    if (openingId) {
      return;
    }
    setOpeningId(claimId);
    navigate(`/finance/claims/${claimId}/review`);
  };

  return (
    <main className="review-page">
      <section className="review-page__content">
        <header className="review-page__heading">
          <div>
            <h1 className="review-page__title">{t("claimReviewList.title")}</h1>
            <p className="review-page__subtitle">
              {t("claimReviewList.subtitle")}
            </p>
          </div>
          <div className="review-page__heading-actions">
            <Button
              onClick={() => navigate("/finance/reviews")}
              variant="outline"
            >
              {t("claimReviewList.actions.workbench")}
            </Button>
            <Button disabled={isLoading} onClick={refresh} variant="outline">
              {isLoading ? <Spinner /> : <ArrowClockwiseIcon />}
              {t("claimReviewList.actions.refresh")}
            </Button>
          </div>
        </header>

        <section className="review-page__toolbar">
          <Input
            aria-label={t("claimReviewList.filters.search")}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("claimReviewList.filters.searchPlaceholder")}
            value={query}
          />
          <Select
            onValueChange={(value) =>
              setStatusFilter(value as ReviewQueueStatus | "all")
            }
            value={statusFilter}
          >
            <SelectTrigger className="review-page__status-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("claimReviewList.filters.all")}
              </SelectItem>
              <SelectItem value="pending">
                {t("reviewStatus.pending")}
              </SelectItem>
              <SelectItem value="duplicate">
                {t("reviewStatus.duplicate")}
              </SelectItem>
              <SelectItem value="escalated">
                {t("reviewStatus.escalated")}
              </SelectItem>
              <SelectItem value="approved">
                {t("reviewStatus.approved")}
              </SelectItem>
              <SelectItem value="rejected">
                {t("reviewStatus.rejected")}
              </SelectItem>
            </SelectContent>
          </Select>
        </section>

        <section className="review-page__table-panel">
          {isLoading ? (
            <div className="review-page__state">
              <Spinner />
              {t("claimReviewList.state.loading")}
            </div>
          ) : null}

          {!isLoading && filteredClaims.length === 0 ? (
            <div className="review-page__state">
              {t("claimReviewList.state.empty")}
            </div>
          ) : null}

          {!isLoading && filteredClaims.length > 0 ? (
            <div className="review-page__table-scroll">
              <table className="review-page__table">
                <thead>
                  <tr>
                    <th>{t("claimReviewList.columns.claim")}</th>
                    <th>{t("claimReviewList.columns.applicant")}</th>
                    <th>{t("claimReviewList.columns.amount")}</th>
                    <th>{t("claimReviewList.columns.invoices")}</th>
                    <th>{t("claimReviewList.columns.submittedAt")}</th>
                    <th>{t("claimReviewList.columns.status")}</th>
                    <th>{t("claimReviewList.columns.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClaims.map((claim) => (
                    <tr key={claim.id}>
                      <td>
                        <strong>{claim.id}</strong>
                        <span>{claim.title}</span>
                      </td>
                      <td>{claim.applicant}</td>
                      <td>{currencyFormatter.format(claim.amount)}</td>
                      <td>{claim.invoices.length}</td>
                      <td>{claim.submittedAt}</td>
                      <td>
                        <Badge variant={statusVariant[claim.status]}>
                          {t(statusKey(claim.status))}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          disabled={Boolean(openingId)}
                          onClick={() => openReview(claim.id)}
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          {openingId === claim.id ? <Spinner /> : <EyeIcon />}
                          {t("claimReviewList.actions.review")}
                        </Button>
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

function isReviewStatus(value: string | null): value is ReviewQueueStatus {
  return (
    value === "approved" ||
    value === "pending" ||
    value === "duplicate" ||
    value === "escalated" ||
    value === "rejected"
  );
}

function statusKey(status: ReviewQueueStatus) {
  return `reviewStatus.${status}` as const;
}

export { ClaimReviewListPage };
