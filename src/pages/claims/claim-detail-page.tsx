import * as React from "react";
import {
  ArrowLeftIcon,
  ClockCounterClockwiseIcon,
  PencilSimpleLineIcon,
  ProhibitIcon,
} from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const ClaimDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { claimId } = useParams();
  const { i18n, t } = useTranslation();
  const [claim, setClaim] = React.useState<BffClaimItem | null>(null);
  const [error, setError] = React.useState("");
  const [isAbandoning, setIsAbandoning] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadClaim = React.useCallback(async () => {
    if (!claimId) {
      setIsLoading(false);
      return;
    }

    try {
      const detail = await bffService.claims.getDetail(claimId);
      setClaim(detail);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setIsLoading(false);
    }
  }, [claimId]);

  React.useEffect(() => {
    let ignore = false;

    async function loadCurrentClaim() {
      if (!claimId) {
        if (!ignore) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const detail = await bffService.claims.getDetail(claimId);
        if (!ignore) {
          setClaim(detail);
        }
      } catch (caught) {
        if (!ignore) {
          setError(caught instanceof Error ? caught.message : String(caught));
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    queueMicrotask(() => void loadCurrentClaim());

    return () => {
      ignore = true;
    };
  }, [claimId]);

  const currencyFormatter = React.useMemo(
    () =>
      new Intl.NumberFormat(i18n.language, {
        currency: "CNY",
        style: "currency",
      }),
    [i18n.language],
  );

  const abandonClaim = () => {
    if (!claim || isAbandoning) {
      return;
    }

    setIsAbandoning(true);
    setError("");
    void bffService.claims
      .abandon(claim.id)
      .then(() => loadClaim())
      .catch((caught) =>
        setError(caught instanceof Error ? caught.message : String(caught)),
      )
      .finally(() => setIsAbandoning(false));
  };

  return (
    <main className="claim-page">
      <section className="claim-page__content">
        {isLoading ? (
          <div className="claim-page__state">
            <Spinner />
            {t("claimList.state.loading")}
          </div>
        ) : null}
        {error ? <p className="claim-page__result">{error}</p> : null}
        {!isLoading && claim ? (
          <>
            <header className="claim-page__heading">
              <div>
                <h1 className="claim-page__title">{t("claimDetail.title")}</h1>
                <p className="claim-page__subtitle">{claim.id}</p>
              </div>
              <div className="claim-page__heading-actions">
                <Button
                  onClick={() => navigate("/claims")}
                  type="button"
                  variant="outline"
                >
                  <ArrowLeftIcon />
                  {t("claimDetail.actions.back")}
                </Button>
                {claim.status === "rejected" ? (
                  <>
                    <Button
                      onClick={() =>
                        navigate(
                          `/claims/new?source=rejected&claimId=${claim.id}`,
                        )
                      }
                      type="button"
                    >
                      <PencilSimpleLineIcon />
                      {t("claimDetail.actions.resubmit")}
                    </Button>
                    <Button
                      disabled={isAbandoning}
                      onClick={abandonClaim}
                      type="button"
                      variant="outline"
                    >
                      {isAbandoning ? <Spinner /> : <ProhibitIcon />}
                      {t("claimDetail.actions.abandon")}
                    </Button>
                  </>
                ) : null}
              </div>
            </header>

            <section className="claim-page__detail-layout">
              <section className="claim-page__form-panel">
                <div className="claim-page__section-title">
                  <span>{t("claimDetail.basic.title")}</span>
                </div>
                <dl className="claim-page__summary-list claim-page__summary-list--grid">
                  <div>
                    <dt>{t("claimDetail.basic.claimTitle")}</dt>
                    <dd>{claim.title}</dd>
                  </div>
                  <div>
                    <dt>{t("claimDetail.basic.status")}</dt>
                    <dd>
                      <Badge variant={statusVariant[claim.status]}>
                        {t(statusKey(claim.status))}
                      </Badge>
                    </dd>
                  </div>
                  <div>
                    <dt>{t("claimDetail.basic.category")}</dt>
                    <dd>{t(categoryKey(claim.category))}</dd>
                  </div>
                  <div>
                    <dt>{t("claimDetail.basic.amount")}</dt>
                    <dd>{currencyFormatter.format(claim.amount)}</dd>
                  </div>
                  <div>
                    <dt>{t("claimDetail.basic.applicant")}</dt>
                    <dd>{claim.applicant}</dd>
                  </div>
                  <div>
                    <dt>{t("claimDetail.basic.submittedAt")}</dt>
                    <dd>{claim.submittedAt}</dd>
                  </div>
                  <div className="claim-page__summary-list-wide">
                    <dt>{t("claimDetail.basic.description")}</dt>
                    <dd>{claim.description}</dd>
                  </div>
                  {claim.rejectedReason ? (
                    <div className="claim-page__summary-list-wide">
                      <dt>{t("claimDetail.basic.rejectedReason")}</dt>
                      <dd>{claim.rejectedReason}</dd>
                    </div>
                  ) : null}
                </dl>

                <div className="claim-page__detail-panel">
                  <div className="claim-page__section-title">
                    <span>{t("claimDetail.invoices.title")}</span>
                  </div>
                  <div className="claim-page__table-scroll">
                    <table className="claim-page__table claim-page__table--compact">
                      <thead>
                        <tr>
                          <th>{t("claimDetail.invoices.invoice")}</th>
                          <th>{t("claimDetail.invoices.seller")}</th>
                          <th>{t("claimDetail.invoices.category")}</th>
                          <th>{t("claimDetail.invoices.amount")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {claim.invoices.map((invoice) => (
                          <tr key={invoice.id}>
                            <td>
                              <strong>{invoice.invoiceNumber}</strong>
                              <span>{invoice.id}</span>
                            </td>
                            <td>{invoice.seller}</td>
                            <td>{t(categoryKey(invoice.expenseCategory))}</td>
                            <td>{currencyFormatter.format(invoice.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              <aside className="claim-page__summary-panel">
                <div className="claim-page__section-title">
                  <ClockCounterClockwiseIcon />
                  <span>{t("claimDetail.timeline.title")}</span>
                </div>
                <ol className="claim-page__timeline">
                  {claim.timeline.map((step) => (
                    <li key={`${step.action}-${step.occurredAt}`}>
                      <strong>{t(timelineActionKey(step.action))}</strong>
                      <span>{step.occurredAt}</span>
                      <span>{step.actor}</span>
                      <p>{step.comment}</p>
                    </li>
                  ))}
                </ol>
              </aside>
            </section>
          </>
        ) : null}
      </section>
    </main>
  );
};

function categoryKey(category: ClaimCategory) {
  return `claimDetail.category.${category}` as const;
}

function statusKey(status: ClaimStatus) {
  return `claimDetail.status.${status}` as const;
}

function timelineActionKey(action: BffClaimItem["timeline"][number]["action"]) {
  if (
    action === "approved" ||
    action === "created" ||
    action === "paid" ||
    action === "rejected" ||
    action === "submitted"
  ) {
    return `claimDetail.timeline.action.${action}` as const;
  }
  return "claimDetail.timeline.action.created" as const;
}

export { ClaimDetailPage };
