import * as React from "react";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockCounterClockwiseIcon,
  ProhibitIcon,
  RowsIcon,
} from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { PageBackButton } from "@/components/navigation/page-back-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  bffService,
  type BffClaimReviewItem,
  type BffReviewStep,
} from "@/services/bff-service";

import "./review.css";

type ReviewQueueStatus = BffClaimReviewItem["status"];
type ReviewTimelineAction = BffReviewStep["action"];

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

const ClaimReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { claimId } = useParams();
  const { i18n, t } = useTranslation();
  const [claim, setClaim] = React.useState<BffClaimReviewItem | null>(null);
  const [comment, setComment] = React.useState("");
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [result, setResult] = React.useState("");
  const isDecisionLocked =
    claim?.status === "approved" || claim?.status === "rejected";

  React.useEffect(() => {
    let ignore = false;

    async function loadClaim() {
      if (!claimId) {
        if (!ignore) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const detail = await bffService.finance.getClaimDetail(claimId);
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

    queueMicrotask(() => void loadClaim());

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

  const submitDecision = (decision: "approved" | "rejected") => {
    if (isSubmitting || !claim || isDecisionLocked) {
      return;
    }

    setIsSubmitting(true);
    setError("");
    void bffService.finance
      .decideClaim(
        claim.id,
        decision === "approved" ? "approve" : "reject",
        comment,
      )
      .then(async (response) => {
        const detail = await bffService.finance
          .getClaimDetail(claim.id)
          .catch(() => claim);
        setClaim(applyReviewDecision(detail, response, decision, comment));
        setComment("");
        setResult(
          t(
            decision === "approved"
              ? "claimReview.result.approved"
              : "claimReview.result.rejected",
            { claimId: claim.id },
          ),
        );
      })
      .catch((caught) =>
        setError(caught instanceof Error ? caught.message : String(caught)),
      )
      .finally(() => setIsSubmitting(false));
  };

  return (
    <main className="review-page">
      <section className="review-page__content">
        {isLoading ? (
          <div className="review-page__state">
            <Spinner />
            {t("claimReviewList.state.loading")}
          </div>
        ) : null}
        {error ? <p className="review-page__result">{error}</p> : null}
        {!isLoading && claim ? (
          <>
            <header className="review-page__heading">
              <div>
                <h1 className="review-page__title">{t("claimReview.title")}</h1>
                <p className="review-page__subtitle">{claim.id}</p>
              </div>
              <div className="review-page__heading-actions">
                <Button
                  onClick={() => navigate("/finance/claims")}
                  type="button"
                  variant="outline"
                >
                  <ArrowLeftIcon />
                  {t("claimReview.actions.back")}
                </Button>
              </div>
            </header>

            <section className="review-page__detail-layout">
              <section className="review-page__detail-panel">
                <div className="review-page__section-title">
                  <RowsIcon />
                  <span>{t("claimReview.basic.title")}</span>
                </div>
                <dl className="review-page__details">
                  <div>
                    <dt>{t("claimReview.basic.claimTitle")}</dt>
                    <dd>{claim.title}</dd>
                  </div>
                  <div>
                    <dt>{t("claimReview.basic.status")}</dt>
                    <dd>
                      <Badge variant={statusVariant[claim.status]}>
                        {t(statusKey(claim.status))}
                      </Badge>
                    </dd>
                  </div>
                  <div>
                    <dt>{t("claimReview.basic.category")}</dt>
                    <dd>{t(categoryKey(claim.category))}</dd>
                  </div>
                  <div>
                    <dt>{t("claimReview.basic.amount")}</dt>
                    <dd>{currencyFormatter.format(claim.amount)}</dd>
                  </div>
                  <div>
                    <dt>{t("claimReview.basic.applicant")}</dt>
                    <dd>{claim.applicant}</dd>
                  </div>
                  <div>
                    <dt>{t("claimReview.basic.submittedAt")}</dt>
                    <dd>{claim.submittedAt}</dd>
                  </div>
                  <div className="review-page__details-wide">
                    <dt>{t("claimReview.basic.description")}</dt>
                    <dd>{claim.description}</dd>
                  </div>
                </dl>

                <div className="review-page__section-title">
                  <span>{t("claimReview.invoices.title")}</span>
                </div>
                <div className="review-page__table-scroll">
                  <table className="review-page__table review-page__table--compact">
                    <thead>
                      <tr>
                        <th>{t("claimReview.invoices.invoice")}</th>
                        <th>{t("claimReview.invoices.seller")}</th>
                        <th>{t("claimReview.invoices.category")}</th>
                        <th>{t("claimReview.invoices.amount")}</th>
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
                    <tfoot>
                      <tr>
                        <td>{t("claimReview.invoices.total")}</td>
                        <td>{claim.invoices.length}</td>
                        <td />
                        <td>
                          {currencyFormatter.format(totalInvoiceAmount(claim))}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </section>

              <aside className="review-page__side-panel">
                <DecisionForm
                  comment={comment}
                  isDecisionLocked={isDecisionLocked}
                  isSubmitting={isSubmitting}
                  onCommentChange={setComment}
                  onSubmit={submitDecision}
                  result={result}
                />

                <div className="review-page__section-title">
                  <ClockCounterClockwiseIcon />
                  <span>{t("reviewTimeline.title")}</span>
                </div>
                <ol className="review-page__timeline">
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

function DecisionForm({
  comment,
  isDecisionLocked,
  isSubmitting,
  onCommentChange,
  onSubmit,
  result,
}: {
  comment: string;
  isDecisionLocked: boolean;
  isSubmitting: boolean;
  onCommentChange: (value: string) => void;
  onSubmit: (decision: "approved" | "rejected") => void;
  result: string;
}) {
  const { t } = useTranslation();

  return (
    <form
      className="review-page__decision-form"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="review-page__section-title">
        <span>{t("reviewDecision.title")}</span>
      </div>
      <label className="review-page__form-field">
        <span>{t("reviewDecision.comment")}</span>
        <textarea
          className="review-page__textarea"
          onChange={(event) => onCommentChange(event.target.value)}
          placeholder={t("reviewDecision.commentPlaceholder")}
          value={comment}
        />
      </label>
      <div className="review-page__decision-actions">
        <PageBackButton disabled={isSubmitting} />
        <Button
          disabled={isSubmitting || isDecisionLocked}
          onClick={() => onSubmit("approved")}
          type="button"
        >
          {isSubmitting ? <Spinner /> : <CheckCircleIcon />}
          {t("reviewDecision.approve")}
        </Button>
        <Button
          disabled={isSubmitting || isDecisionLocked}
          onClick={() => onSubmit("rejected")}
          type="button"
          variant="destructive"
        >
          <ProhibitIcon />
          {t("reviewDecision.reject")}
        </Button>
      </div>
      {result ? <p className="review-page__result">{result}</p> : null}
    </form>
  );
}

function totalInvoiceAmount(claim: BffClaimReviewItem) {
  return claim.invoices.reduce((total, invoice) => total + invoice.amount, 0);
}

function applyReviewDecision(
  claim: BffClaimReviewItem,
  response: unknown,
  decision: "approved" | "rejected",
  fallbackComment: string,
): BffClaimReviewItem {
  const record = asRecord(response);
  const status = String(record.status ?? "").toLowerCase();
  const step: BffReviewStep = {
    action:
      status.includes("reject") || record.action === "REJECT"
        ? "rejected"
        : decision,
    actor: stringField(record.actor ?? record.reviewerId, "-"),
    comment: stringField(record.comment, fallbackComment || "-"),
    occurredAt: stringField(
      record.reviewedAt ?? record.occurredAt ?? record.createdAt,
      new Date().toLocaleString(),
    ),
  };
  const timeline = claim.timeline.some(
    (item) => item.action === step.action && item.comment === step.comment,
  )
    ? claim.timeline
    : [...claim.timeline, step];

  return {
    ...claim,
    status: step.action === "rejected" ? "rejected" : "approved",
    timeline,
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stringField(value: unknown, fallback = "") {
  if (typeof value === "string" && value) {
    return value;
  }
  if (typeof value === "number") {
    return String(value);
  }
  return fallback;
}

function categoryKey(category: BffClaimReviewItem["category"]) {
  return `claimReview.category.${category}` as const;
}

function statusKey(status: ReviewQueueStatus) {
  return `reviewStatus.${status}` as const;
}

function timelineActionKey(action: ReviewTimelineAction) {
  if (
    action === "approved" ||
    action === "created" ||
    action === "duplicateChecked" ||
    action === "ocrConfirmed" ||
    action === "rejected" ||
    action === "reviewing" ||
    action === "submitted"
  ) {
    return `reviewTimeline.action.${action}` as const;
  }
  return "reviewTimeline.action.created" as const;
}

export { ClaimReviewPage };
