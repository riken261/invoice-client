import * as React from "react";
import { EyeIcon, EyeSlashIcon, LockKeyIcon } from "@phosphor-icons/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import "./login-page.css";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  createLoginUrl,
  DEFAULT_TENANT_CODE,
  getSsoRedirectUri,
} from "@/services/auth-service";

const createLoginFormSchema = (t: ReturnType<typeof useTranslation>["t"]) =>
  z.object({
    email: z
      .string()
      .min(1, t("auth.login.validation.emailRequired"))
      .email(t("auth.login.validation.emailInvalid")),
    password: z.string().min(1, t("auth.login.validation.passwordRequired")),
    rememberMe: z.boolean(),
  });

type LoginFormValues = z.infer<ReturnType<typeof createLoginFormSchema>>;

const LoginPage: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const [ssoErrorMessage, setSsoErrorMessage] = React.useState<string | null>(
    null,
  );
  const [isSsoLoading, setIsSsoLoading] = React.useState(false);
  const currentLanguage = i18n.resolvedLanguage;
  const loginFormSchema = React.useMemo(() => createLoginFormSchema(t), [t]);
  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    resolver: zodResolver(loginFormSchema),
  });
  const {
    formState: { errors },
    trigger,
  } = form;
  const errorsRef = React.useRef(errors);

  React.useEffect(() => {
    errorsRef.current = errors;
  }, [errors]);

  React.useEffect(() => {
    const errorFields = Object.keys(errorsRef.current) as Array<
      keyof LoginFormValues
    >;

    if (errorFields.length > 0) {
      void trigger(errorFields);
    }
  }, [currentLanguage, trigger]);

  const handleSubmit = (values: LoginFormValues) => {
    void values;
  };

  const handleSsoLogin = async () => {
    setIsSsoLoading(true);
    setSsoErrorMessage(null);

    try {
      const response = await createLoginUrl({
        redirectUri: getSsoRedirectUri(),
        tenantCode: DEFAULT_TENANT_CODE,
      });

      window.location.assign(response.loginUrl);
    } catch {
      setSsoErrorMessage(t("auth.login.ssoLoginFailed"));
      setIsSsoLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-page__main">
        <h1 className="login-page__brand">{t("auth.login.brand")}</h1>
        <Form {...form}>
          <form
            className="login-page__form"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="login-page__field login-page__field--email">
                  <FormLabel className="login-page__label">
                    {t("auth.login.emailLabel")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="login-page__input"
                      placeholder={t("auth.login.emailPlaceholder")}
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="login-page__message" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="login-page__field login-page__field--password">
                  <FormLabel className="login-page__label">
                    {t("auth.login.passwordLabel")}
                  </FormLabel>
                  <span className="login-page__password-control">
                    <FormControl>
                      <Input
                        className="login-page__password-input"
                        placeholder={t("auth.login.passwordPlaceholder")}
                        type={isPasswordVisible ? "text" : "password"}
                        {...field}
                      />
                    </FormControl>
                    <Button
                      aria-label={t(
                        isPasswordVisible
                          ? "auth.login.hidePassword"
                          : "auth.login.showPassword",
                      )}
                      aria-pressed={isPasswordVisible}
                      className="login-page__password-toggle"
                      onClick={() =>
                        setIsPasswordVisible((current) => !current)
                      }
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      {isPasswordVisible ? (
                        <EyeSlashIcon size={20} weight="bold" />
                      ) : (
                        <EyeIcon size={20} weight="bold" />
                      )}
                    </Button>
                  </span>
                  <FormMessage className="login-page__message" />
                </FormItem>
              )}
            />
            <div className="login-page__forgot">
              <Button className="login-page__link" type="button" variant="link">
                {t("auth.login.forgotPassword")}
              </Button>
            </div>

            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="login-page__remember">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        className="login-page__checkbox"
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                      />
                    </FormControl>
                    {t("auth.login.rememberMe")}
                  </FormLabel>
                </FormItem>
              )}
            />

            <Button className="login-page__submit" type="submit">
              {t("auth.login.signIn")}
            </Button>

            <p className="login-page__register">
              {t("auth.login.noAccount")}{" "}
              <Button className="login-page__link" type="button" variant="link">
                {t("auth.login.registerNow")}
              </Button>
            </p>

            <div className="login-page__divider">
              <div className="login-page__divider-line" />
              <span className="login-page__divider-text">
                {t("auth.login.signInWith")}
              </span>
              <div className="login-page__divider-line" />
            </div>

            <div className="login-page__providers">
              <ProviderButton
                disabled={isSsoLoading}
                icon={<LockKeyIcon size={20} weight="bold" />}
                label={
                  isSsoLoading
                    ? t("auth.login.ssoRedirecting")
                    : t("auth.login.sso")
                }
                onClick={handleSsoLogin}
              />
            </div>
            {ssoErrorMessage ? (
              <p className="login-page__message">{ssoErrorMessage}</p>
            ) : null}
          </form>
        </Form>
      </section>
    </main>
  );
};

interface ProviderButtonProps {
  disabled?: boolean;
  icon?: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const ProviderButton: React.FC<ProviderButtonProps> = ({
  disabled,
  icon,
  label,
  onClick,
}) => {
  return (
    <Button
      className="login-page__provider-button"
      disabled={disabled}
      onClick={onClick}
      type="button"
      variant="outline"
    >
      {icon}
      {label}
    </Button>
  );
};

export { LoginPage };
