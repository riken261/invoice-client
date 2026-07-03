import * as React from "react";
import {
  FloppyDiskIcon,
  PaperPlaneTiltIcon,
  PlusCircleIcon,
} from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";

import { PageBackButton } from "@/components/navigation/page-back-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  bffService,
  type BffClaimInvoice,
  type BffClaimItem,
} from "@/services/bff-service";

import "./claim.css";

type ClaimCategory = BffClaimItem["category"];
type SubmitAction = "draft" | "submit";

const ClaimCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const [searchParams] = useSearchParams();
  const sourceClaimId = searchParams.get("claimId") ?? undefined;
  const isRejectedResubmit = searchParams.get("source") === "rejected";
  const [claimableInvoices, setClaimableInvoices] = React.useState<
    BffClaimInvoice[]
  >([]);
  const [sourceClaim, setSourceClaim] = React.useState<BffClaimItem | null>(
    null,
  );
  const [category, setCategory] = React.useState<ClaimCategory>("travel");
  const [description, setDescription] = React.useState(
    isRejectedResubmit ? t("claimCreate.prefill.rejectedDescription") : "",
  );
  const [selectedInvoiceIds, setSelectedInvoiceIds] = React.useState<
    Set<string>
  >(() => new Set());
  const [submitAction, setSubmitAction] = React.useState<SubmitAction | null>(
    null,
  );
  const [createdClaimId, setCreatedClaimId] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let ignore = false;

    async function load() {
      const [claimable, rejectedClaim] = await Promise.all([
        bffService.invoices.getClaimable(),
        isRejectedResubmit && sourceClaimId
          ? bffService.claims.getDetail(sourceClaimId).catch(() => null)
          : Promise.resolve(null),
      ]);

      if (ignore) {
        return;
      }

      setClaimableInvoices(claimable.items);
      if (rejectedClaim) {
        setSourceClaim(rejectedClaim);
        setCategory(rejectedClaim.category);
        setDescription(rejectedClaim.description);
        setClaimableInvoices((current) =>
          mergeClaimInvoices(current, rejectedClaim.invoices),
        );
        setSelectedInvoiceIds(
          new Set(rejectedClaim.invoices.map((invoice) => invoice.id)),
        );
        return;
      }

      setSelectedInvoiceIds(
        new Set(claimable.items.map((invoice) => invoice.id)),
      );
    }

    void load().catch((caught) =>
      setError(caught instanceof Error ? caught.message : String(caught)),
    );

    return () => {
      ignore = true;
    };
  }, [isRejectedResubmit, sourceClaimId]);

  const currencyFormatter = React.useMemo(
    () =>
      new Intl.NumberFormat(i18n.language, {
        currency: "CNY",
        style: "currency",
      }),
    [i18n.language],
  );

  const selectedInvoices = React.useMemo(
    () =>
      claimableInvoices.filter((invoice) => selectedInvoiceIds.has(invoice.id)),
    [claimableInvoices, selectedInvoiceIds],
  );

  const totalAmount = React.useMemo(
    () =>
      selectedInvoices.reduce((total, invoice) => total + invoice.amount, 0),
    [selectedInvoices],
  );

  const toggleInvoice = (invoiceId: string, checked: boolean) => {
    setSelectedInvoiceIds((current) => {
      const next = new Set(current);

      if (checked) {
        next.add(invoiceId);
      } else {
        next.delete(invoiceId);
      }

      return next;
    });
  };

  const completeAction = (action: SubmitAction) => {
    if (submitAction || selectedInvoices.length === 0) {
      return;
    }

    setSubmitAction(action);
    setError("");
    const payload = {
      category,
      description,
      invoiceIds: selectedInvoices.map((invoice) => invoice.id),
      title: description.trim() || t("claimCreate.title"),
    };
    const saveClaim =
      isRejectedResubmit && sourceClaimId
        ? bffService.claims.updateDraft(sourceClaimId, payload).then(() => ({
            claimId: sourceClaimId,
          }))
        : bffService.claims.createDraft(payload);

    void saveClaim
      .then(async (response) => {
        const nextClaimId = readCreatedId(response);
        if (action === "submit") {
          await bffService.claims.submit(nextClaimId);
        }
        setCreatedClaimId(nextClaimId);
        navigate(`/claims/${nextClaimId}`);
      })
      .catch((caught) =>
        setError(caught instanceof Error ? caught.message : String(caught)),
      )
      .finally(() => setSubmitAction(null));
  };

  const canSubmit =
    selectedInvoices.length > 0 && description.trim().length > 0;

  return (
    <main className="claim-page">
      <section className="claim-page__content">
        <header className="claim-page__heading">
          <div>
            <h1 className="claim-page__title">
              {isRejectedResubmit
                ? t("claimCreate.resubmitTitle")
                : t("claimCreate.title")}
            </h1>
            <p className="claim-page__subtitle">{t("claimCreate.subtitle")}</p>
          </div>
          <Button
            onClick={() => navigate("/claims")}
            type="button"
            variant="outline"
          >
            {t("claimCreate.actions.back")}
          </Button>
        </header>

        {isRejectedResubmit ? (
          <section className="claim-page__notice">
            <strong>{t("claimCreate.rejectedNotice.title")}</strong>
            <span>{sourceClaim?.rejectedReason ?? "-"}</span>
          </section>
        ) : null}

        <section className="claim-page__editor">
          <div className="claim-page__form-panel">
            <div className="claim-page__field-grid">
              <label className="claim-page__field">
                <span>{t("claimCreate.fields.category")}</span>
                <Select
                  onValueChange={(value) => setCategory(value as ClaimCategory)}
                  value={category}
                >
                  <SelectTrigger className="claim-page__full-control">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="travel">
                      {t("claimCreate.category.travel")}
                    </SelectItem>
                    <SelectItem value="office">
                      {t("claimCreate.category.office")}
                    </SelectItem>
                    <SelectItem value="meal">
                      {t("claimCreate.category.meal")}
                    </SelectItem>
                    <SelectItem value="service">
                      {t("claimCreate.category.service")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </label>

              <label className="claim-page__field claim-page__field--wide">
                <span>{t("claimCreate.fields.description")}</span>
                <Input
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder={t("claimCreate.fields.descriptionPlaceholder")}
                  value={description}
                />
              </label>
            </div>

            <div className="claim-page__invoice-picker">
              <div className="claim-page__section-title">
                <PlusCircleIcon />
                <span>{t("claimCreate.invoicePicker.title")}</span>
              </div>
              <div className="claim-page__invoice-list">
                {claimableInvoices.map((invoice) => (
                  <label
                    className="claim-page__invoice-option"
                    key={invoice.id}
                  >
                    <Checkbox
                      checked={selectedInvoiceIds.has(invoice.id)}
                      onCheckedChange={(checked) =>
                        toggleInvoice(invoice.id, checked === true)
                      }
                    />
                    <span>
                      <strong>{invoice.invoiceNumber}</strong>
                      <small>{invoice.seller}</small>
                    </span>
                    <strong>{currencyFormatter.format(invoice.amount)}</strong>
                  </label>
                ))}
              </div>
            </div>

            <div className="claim-page__detail-panel">
              <div className="claim-page__section-title">
                <span>{t("claimCreate.details.title")}</span>
              </div>
              <div className="claim-page__table-scroll">
                <table className="claim-page__table claim-page__table--compact">
                  <thead>
                    <tr>
                      <th>{t("claimCreate.details.invoice")}</th>
                      <th>{t("claimCreate.details.seller")}</th>
                      <th>{t("claimCreate.details.category")}</th>
                      <th>{t("claimCreate.details.amount")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td>
                          <strong>{invoice.id}</strong>
                          <span>{invoice.fileName}</span>
                        </td>
                        <td>{invoice.seller}</td>
                        <td>{t(categoryKey(invoice.expenseCategory))}</td>
                        <td>{currencyFormatter.format(invoice.amount)}</td>
                      </tr>
                    ))}
                    {selectedInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={4}>{t("claimCreate.details.empty")}</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <aside className="claim-page__summary-panel">
            <div className="claim-page__section-title">
              <span>{t("claimCreate.summary.title")}</span>
            </div>
            <dl className="claim-page__summary-list">
              <div>
                <dt>{t("claimCreate.summary.invoiceCount")}</dt>
                <dd>{selectedInvoices.length}</dd>
              </div>
              <div>
                <dt>{t("claimCreate.summary.category")}</dt>
                <dd>{t(categoryKey(category))}</dd>
              </div>
              <div>
                <dt>{t("claimCreate.summary.amount")}</dt>
                <dd>{currencyFormatter.format(totalAmount)}</dd>
              </div>
              <div>
                <dt>{t("claimCreate.summary.status")}</dt>
                <dd>
                  <Badge variant={description.trim() ? "outline" : "secondary"}>
                    {description.trim()
                      ? t("claimCreate.summary.ready")
                      : t("claimCreate.summary.needDescription")}
                  </Badge>
                </dd>
              </div>
            </dl>

            {createdClaimId ? (
              <p className="claim-page__result">
                {t("claimCreate.result", { claimId: createdClaimId })}
              </p>
            ) : null}
            {error ? <p className="claim-page__result">{error}</p> : null}

            <div className="claim-page__submit-actions">
              <PageBackButton disabled={Boolean(submitAction)} />
              <Button
                disabled={
                  selectedInvoices.length === 0 || Boolean(submitAction)
                }
                onClick={() => completeAction("draft")}
                type="button"
                variant="outline"
              >
                {submitAction === "draft" ? <Spinner /> : <FloppyDiskIcon />}
                {t("claimCreate.actions.saveDraft")}
              </Button>
              <Button
                disabled={!canSubmit || Boolean(submitAction)}
                onClick={() => completeAction("submit")}
                type="button"
              >
                {submitAction === "submit" ? (
                  <Spinner />
                ) : (
                  <PaperPlaneTiltIcon />
                )}
                {isRejectedResubmit
                  ? t("claimCreate.actions.resubmit")
                  : t("claimCreate.actions.submit")}
              </Button>
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
};

function categoryKey(category: ClaimCategory) {
  return `claimCreate.category.${category}` as const;
}

function readCreatedId(response: unknown) {
  if (response && typeof response === "object") {
    const object = response as Record<string, unknown>;
    const id = object.id ?? object.claimId;
    if (typeof id === "string" && id) {
      return id;
    }
  }
  return "CLM-UNKNOWN";
}

function mergeClaimInvoices(
  claimableInvoices: BffClaimInvoice[],
  selectedInvoices: BffClaimInvoice[],
) {
  const byId = new Map(
    claimableInvoices.map((invoice) => [invoice.id, invoice]),
  );
  selectedInvoices.forEach((invoice) => byId.set(invoice.id, invoice));
  return Array.from(byId.values());
}

export { ClaimCreatePage };
