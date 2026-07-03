import * as React from "react";
import {
  CheckCircleIcon,
  FloppyDiskIcon,
  PlugsConnectedIcon,
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
import { Switch } from "@/components/ui/switch";
import {
  bffService,
  type BffSystemConfigSection,
} from "@/services/bff-service";

import "./admin.css";

type ConfigValue = BffSystemConfigSection["fields"][number]["value"];
type ConfigSection = BffSystemConfigSection["code"];
type ConfigFieldKind = "number" | "password" | "select" | "switch" | "text";

interface ConfigFieldSchema {
  kind: ConfigFieldKind;
  label?: string;
  max?: number;
  min?: number;
  options?: string[];
  step?: number;
}

const CONFIG_FIELD_SCHEMAS: Record<
  ConfigSection,
  Record<string, ConfigFieldSchema>
> = {
  mq: {
    deadLetterExchange: { kind: "text", label: "Dead letter exchange" },
    domainEventsExchange: { kind: "text", label: "Domain events exchange" },
    host: { kind: "text", label: "RabbitMQ host" },
    integrationEventsExchange: {
      kind: "text",
      label: "Integration events exchange",
    },
    maxAttempts: { kind: "number", label: "Max attempts", min: 1, step: 1 },
    outboxRoutingKey: { kind: "text", label: "Outbox routing key" },
    password: { kind: "password", label: "Password" },
    port: { kind: "number", label: "Port", min: 1, step: 1 },
    provider: { kind: "select", label: "Provider", options: ["RABBITMQ"] },
    username: { kind: "text", label: "Username" },
    virtualHost: { kind: "text", label: "Virtual host" },
  },
  ocr: {
    endpoint: { kind: "text", label: "Endpoint" },
    host: { kind: "text", label: "Host" },
    lowConfidenceThreshold: {
      kind: "number",
      label: "Low confidence threshold",
      max: 1,
      min: 0,
      step: 0.01,
    },
    maxAttempts: { kind: "number", label: "Max attempts", min: 1, step: 1 },
    mockEnabled: { kind: "switch", label: "Mock enabled" },
    provider: {
      kind: "select",
      label: "Provider",
      options: ["MOCK", "TENCENT_CLOUD"],
    },
    region: { kind: "text", label: "Region" },
    secretId: { kind: "password", label: "SecretId" },
    secretKey: { kind: "password", label: "SecretKey" },
    tencentEnabled: { kind: "switch", label: "Tencent enabled" },
    timeoutSeconds: {
      kind: "number",
      label: "Timeout seconds",
      min: 1,
      step: 1,
    },
    token: { kind: "password", label: "Token" },
  },
  security: {
    auditLevel: {
      kind: "select",
      label: "Audit level",
      options: ["BASIC", "SECURITY", "FULL"],
    },
    clientId: { kind: "text", label: "Client ID" },
    clientSecret: { kind: "password", label: "Client secret" },
    issuer: { kind: "text", label: "OIDC issuer" },
    loginBlockEnabled: { kind: "switch", label: "Login block enabled" },
    maxLoginFailures: {
      kind: "number",
      label: "Max login failures",
      min: 1,
      step: 1,
    },
    nonceTtlSeconds: {
      kind: "number",
      label: "Nonce TTL seconds",
      min: 1,
      step: 1,
    },
    realm: { kind: "text", label: "Realm" },
    sessionTtlMinutes: {
      kind: "number",
      label: "Session TTL minutes",
      min: 1,
      step: 1,
    },
  },
  storage: {
    accessKeyId: { kind: "password", label: "AccessKey ID" },
    bucket: { kind: "text", label: "Bucket" },
    downloadExpiresMinutes: {
      kind: "number",
      label: "Download URL minutes",
      min: 1,
      step: 1,
    },
    endpoint: { kind: "text", label: "Endpoint" },
    localRoot: { kind: "text", label: "Local root" },
    maxSizeMb: { kind: "number", label: "Max size MB", min: 1, step: 1 },
    previewExpiresMinutes: {
      kind: "number",
      label: "Preview URL minutes",
      min: 1,
      step: 1,
    },
    provider: {
      kind: "select",
      label: "Provider",
      options: ["LOCAL", "S3", "OSS", "MINIO"],
    },
    region: { kind: "text", label: "Region" },
    secretAccessKey: { kind: "password", label: "Secret access key" },
    storageType: {
      kind: "select",
      label: "Storage type",
      options: ["LOCAL", "S3", "OSS", "MINIO"],
    },
  },
};

const SystemConfigPage: React.FC = () => {
  const { t } = useTranslation();
  const [sections, setSections] = React.useState<BffSystemConfigSection[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [result, setResult] = React.useState("");
  const [values, setValues] = React.useState<Record<string, ConfigValue>>({});

  React.useEffect(() => {
    let ignore = false;

    async function loadSettings() {
      try {
        const nextSections = await bffService.admin.getSettings();
        if (ignore) {
          return;
        }
        setSections(nextSections);
        setValues(
          Object.fromEntries(
            nextSections.flatMap((section) =>
              section.fields.map((field) => [
                `${section.code}.${field.code}`,
                field.value,
              ]),
            ),
          ),
        );
      } catch (caught) {
        if (!ignore) {
          setResult(caught instanceof Error ? caught.message : String(caught));
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    queueMicrotask(() => void loadSettings());

    return () => {
      ignore = true;
    };
  }, []);

  const updateValue = (key: string, value: ConfigValue) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const submit = (action: "save" | "test") => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    const request =
      action === "test"
        ? bffService.admin.testSettings(
            sections[0]?.code ?? "ocr",
            valuesForSection(sections[0], values),
          )
        : Promise.all(
            sections.map((section) =>
              bffService.admin.updateSettings(
                section.code,
                valuesForSection(section, values),
              ),
            ),
          );

    void request
      .then(() => setResult(t(`adminSystemConfig.result.${action}`)))
      .catch((caught) =>
        setResult(caught instanceof Error ? caught.message : String(caught)),
      )
      .finally(() => setIsSubmitting(false));
  };

  return (
    <main className="admin-page">
      <section className="admin-page__content">
        <header className="admin-page__heading">
          <div>
            <h1 className="admin-page__title">
              {t("adminSystemConfig.title")}
            </h1>
            <p className="admin-page__subtitle">
              {t("adminSystemConfig.subtitle")}
            </p>
          </div>
          <div className="admin-page__heading-actions">
            <Button
              disabled={isSubmitting}
              onClick={() => submit("test")}
              type="button"
              variant="outline"
            >
              {isSubmitting ? <Spinner /> : <PlugsConnectedIcon />}
              {t("adminSystemConfig.actions.test")}
            </Button>
            <Button
              disabled={isSubmitting}
              onClick={() => submit("save")}
              type="button"
            >
              {isSubmitting ? <Spinner /> : <FloppyDiskIcon />}
              {t("adminSystemConfig.actions.save")}
            </Button>
          </div>
        </header>

        <section className="admin-page__summary">
          <Metric
            label={t("adminSystemConfig.metrics.environment")}
            value="dev"
          />
          <Metric
            label={t("adminSystemConfig.metrics.sections")}
            value={sections.length}
          />
          <Metric
            label={t("adminSystemConfig.metrics.masked")}
            value={
              sections
                .flatMap((section) => section.fields)
                .filter((field) => field.masked).length
            }
          />
          <Metric
            label={t("adminSystemConfig.metrics.status")}
            value={
              <Badge variant="default">
                <CheckCircleIcon />
                {t("adminSystemConfig.status.active")}
              </Badge>
            }
          />
        </section>

        {isLoading ? (
          <div className="admin-page__state">
            <Spinner />
            {t("adminOutbox.state.loading")}
          </div>
        ) : null}

        <section className="admin-page__config-grid">
          {sections.map((section) => (
            <section className="admin-page__config-panel" key={section.code}>
              <div className="admin-page__section-title">
                <span>{t(sectionTitleKey(section.code))}</span>
              </div>
              <div className="admin-page__field-list">
                {section.fields.map((field) => {
                  const fieldKey = `${section.code}.${field.code}`;
                  return (
                    <label className="admin-page__config-field" key={fieldKey}>
                      <span>
                        {t(
                          `adminSystemConfig.fields.${section.code}.${field.code}`,
                          {
                            defaultValue:
                              fieldSchema(section.code, field).label ??
                              humanizeFieldCode(field.code),
                          },
                        )}
                      </span>
                      {renderConfigControl({
                        field,
                        fieldKey,
                        schema: fieldSchema(section.code, field),
                        updateValue,
                        value: values[fieldKey] ?? field.value,
                      })}
                    </label>
                  );
                })}
              </div>
            </section>
          ))}
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

function sectionTitleKey(section: "ocr" | "storage" | "mq" | "security") {
  return `adminSystemConfig.sections.${section}.title` as const;
}

function valuesForSection(
  section: BffSystemConfigSection | undefined,
  values: Record<string, ConfigValue>,
) {
  if (!section) {
    return {};
  }

  return Object.fromEntries(
    section.fields.map((field) => [
      field.code,
      values[`${section.code}.${field.code}`] ?? "",
    ]),
  );
}

function fieldSchema(
  section: ConfigSection,
  field: BffSystemConfigSection["fields"][number],
): ConfigFieldSchema {
  return (
    CONFIG_FIELD_SCHEMAS[section][field.code] ?? {
      kind: inferFieldKind(field),
      label: humanizeFieldCode(field.code),
    }
  );
}

function inferFieldKind(
  field: BffSystemConfigSection["fields"][number],
): ConfigFieldKind {
  if (field.masked) {
    return "password";
  }
  if (typeof field.value === "boolean") {
    return "switch";
  }
  if (typeof field.value === "number") {
    return "number";
  }
  return "text";
}

function renderConfigControl({
  fieldKey,
  schema,
  updateValue,
  value,
}: {
  field: BffSystemConfigSection["fields"][number];
  fieldKey: string;
  schema: ConfigFieldSchema;
  updateValue: (key: string, value: ConfigValue) => void;
  value: ConfigValue;
}) {
  if (schema.kind === "select") {
    return (
      <Select
        onValueChange={(nextValue) => updateValue(fieldKey, nextValue)}
        value={String(value ?? "")}
      >
        <SelectTrigger className="admin-page__config-select">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(schema.options ?? []).map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (schema.kind === "switch") {
    return (
      <div className="admin-page__config-switch">
        <Switch
          checked={Boolean(value)}
          onCheckedChange={(checked) => updateValue(fieldKey, checked)}
        />
        <strong>{Boolean(value) ? "Enabled" : "Disabled"}</strong>
      </div>
    );
  }

  if (schema.kind === "number") {
    return (
      <Input
        max={schema.max}
        min={schema.min}
        onChange={(event) => {
          const nextValue = event.target.value;
          updateValue(fieldKey, nextValue === "" ? "" : Number(nextValue));
        }}
        step={schema.step}
        type="number"
        value={String(value ?? "")}
      />
    );
  }

  return (
    <Input
      onChange={(event) => updateValue(fieldKey, event.target.value)}
      type={schema.kind === "password" ? "password" : "text"}
      value={String(value ?? "")}
    />
  );
}

function humanizeFieldCode(code: string) {
  return code
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[._-]+/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

export { SystemConfigPage };
