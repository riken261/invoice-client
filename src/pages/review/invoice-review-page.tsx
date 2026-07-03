import * as React from "react";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockCounterClockwiseIcon,
  FilePdfIcon,
  ProhibitIcon,
} from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { PageBackButton } from "@/components/navigation/page-back-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  bffService,
  type BffInvoiceReviewItem,
  type BffReviewStep,
} from "@/services/bff-service";

import "./review.css";

type ReviewQueueStatus = BffInvoiceReviewItem["status"];
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

const InvoiceReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { invoiceId } = useParams();
  const { i18n, t } = useTranslation();
  const [comment, setComment] = React.useState("");
  const [error, setError] = React.useState("");
  const [invoice, setInvoice] = React.useState<BffInvoiceReviewItem | null>(
    null,
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [result, setResult] = React.useState("");

  React.useEffect(() => {
    let ignore = false;

    async function loadInvoice() {
      if (!invoiceId) {
        if (!ignore) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const detail = await bffService.finance.getInvoiceDetail(invoiceId);
        if (!ignore) {
          setInvoice({ ...detail, applicant: "-", status: "pending" });
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

    queueMicrotask(() => void loadInvoice());

    return () => {
      ignore = true;
    };
  }, [invoiceId]);

  const currencyFormatter = React.useMemo(
    () =>
      new Intl.NumberFormat(i18n.language, {
        currency: "CNY",
        style: "currency",
      }),
    [i18n.language],
  );

  const submitDecision = (decision: "approved" | "rejected") => {
    if (isSubmitting || !invoice) {
      return;
    }

    setIsSubmitting(true);
    setError("");
    void bffService.finance
      .decideInvoice(
        invoice.id,
        decision === "approved" ? "approve" : "reject",
        comment,
      )
      .then(() =>
        setResult(
          t(
            decision === "approved"
              ? "invoiceReview.result.approved"
              : "invoiceReview.result.rejected",
            { invoiceId: invoice.id },
          ),
        ),
      )
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
            {t("invoiceReviewList.state.loading")}
          </div>
        ) : null}
        {error ? <p className="review-page__result">{error}</p> : null}
        {!isLoading && invoice ? (
          <>
            <header className="review-page__heading">
              <div>
                <h1 className="review-page__title">
                  {t("invoiceReview.title")}
                </h1>
                <p className="review-page__subtitle">{invoice.id}</p>
              </div>
              <div className="review-page__heading-actions">
                <Button
                  onClick={() => navigate("/finance/invoices")}
                  type="button"
                  variant="outline"
                >
                  <ArrowLeftIcon />
                  {t("invoiceReview.actions.back")}
                </Button>
              </div>
            </header>

            <section className="review-page__detail-layout">
              <section className="review-page__detail-panel">
                <div className="review-page__file-preview">
                  <FilePdfIcon />
                  <div>
                    <strong>{invoice.fileName}</strong>
                    <span>{t("invoiceReview.preview.subtitle")}</span>
                  </div>
                </div>

                <div className="review-page__section-title">
                  <span>{t("invoiceReview.basic.title")}</span>
                </div>
                <dl className="review-page__details">
                  <div>
                    <dt>{t("invoiceReview.basic.status")}</dt>
                    <dd>
                      <Badge variant={statusVariant[invoice.status]}>
                        {t(statusKey(invoice.status))}
                      </Badge>
                    </dd>
                  </div>
                  <div>
                    <dt>{t("invoiceReview.basic.risk")}</dt>
                    <dd>{t(riskKey(invoice.duplicateRisk))}</dd>
                  </div>
                  <div>
                    <dt>{t("invoiceReview.basic.applicant")}</dt>
                    <dd>{invoice.applicant}</dd>
                  </div>
                  <div>
                    <dt>{t("invoiceReview.basic.amount")}</dt>
                    <dd>{currencyFormatter.format(invoice.amount)}</dd>
                  </div>
                  <div>
                    <dt>{t("invoiceReview.basic.seller")}</dt>
                    <dd>{invoice.seller}</dd>
                  </div>
                  <div>
                    <dt>{t("invoiceReview.basic.submittedAt")}</dt>
                    <dd>{invoice.submittedAt}</dd>
                  </div>
                </dl>

                <div className="review-page__section-title">
                  <span>{t("invoiceReview.ocr.title")}</span>
                  <Badge variant="outline">
                    {t("invoiceReview.ocr.confidence", {
                      value: formatPercent(invoice.ocrConfidence),
                    })}
                  </Badge>
                </div>
                <div className="review-page__field-list">
                  {invoice.ocrFields.map((field) => (
                    <div className="review-page__field" key={field.label}>
                      <span>{field.label}</span>
                      <strong>{field.userValue ?? field.value}</strong>
                      {field.userValue ? (
                        <small>
                          {t("invoiceReview.ocr.originalValue", {
                            value: field.value,
                          })}
                        </small>
                      ) : null}
                      <small>
                        {t("invoiceReview.ocr.fieldConfidence", {
                          value: formatPercent(field.confidence),
                        })}
                      </small>
                    </div>
                  ))}
                </div>

                <div className="review-page__section-title">
                  <span>{t("invoiceReview.duplicate.title")}</span>
                </div>
                <div className="review-page__field-list">
                  {invoice.duplicateHits.length > 0 ? (
                    invoice.duplicateHits.map((duplicateId) => (
                      <div className="review-page__field" key={duplicateId}>
                        <span>{t("invoiceReview.duplicate.hit")}</span>
                        <strong>{duplicateId}</strong>
                      </div>
                    ))
                  ) : (
                    <p className="review-page__result">
                      {t("invoiceReview.duplicate.empty")}
                    </p>
                  )}
                </div>
              </section>

              <aside className="review-page__side-panel">
                <DecisionForm
                  comment={comment}
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
                  {invoice.reviewRecords.map((step) => (
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
  isSubmitting,
  onCommentChange,
  onSubmit,
  result,
}: {
  comment: string;
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
          disabled={isSubmitting}
          onClick={() => onSubmit("approved")}
          type="button"
        >
          {isSubmitting ? <Spinner /> : <CheckCircleIcon />}
          {t("reviewDecision.approve")}
        </Button>
        <Button
          disabled={isSubmitting}
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

function statusKey(status: ReviewQueueStatus) {
  return `reviewStatus.${status}` as const;
}

function riskKey(risk: "low" | "medium" | "high") {
  return `reviewRisk.${risk}` as const;
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

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export { InvoiceReviewPage };
