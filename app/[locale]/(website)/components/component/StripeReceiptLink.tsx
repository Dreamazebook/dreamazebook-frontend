import { useTranslations } from "next-intl";

interface StripeReceiptLinkProps {
  stripeReceiptUrl?: string;
  variant?: "button" | "link";
  className?: string;
}

const StripeReceiptLink: React.FC<StripeReceiptLinkProps> = ({
  stripeReceiptUrl,
  variant = "button",
  className = "",
}) => {
  const t = useTranslations("orderSummary");

  if (!stripeReceiptUrl) {
    return null;
  }

  const defaultButtonClass =
    "text-white bg-black py-2 px-4 rounded hover:opacity-70";
  const defaultLinkClass = "text-primary hover:underline";

  const computedClassName =
    className ||
    (variant === "button" ? defaultButtonClass : defaultLinkClass);

  return (
    <a
      href={stripeReceiptUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={computedClassName}
    >
      {t("actions.downloadInvoice")}
    </a>
  );
};

export default StripeReceiptLink;
