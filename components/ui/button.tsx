import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/shared/icons";
import { cn } from "@/lib/utils";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary";
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  showArrow?: boolean;
}

export function Button({
  children,
  href,
  variant = "primary",
  className,
  type = "button",
  onClick,
  disabled,
  leadingIcon,
  trailingIcon,
  showArrow,
}: ButtonProps) {
  const classes = cn(
    variant === "primary" ? "primary-button button-shell" : "secondary-button button-shell",
    disabled && "cursor-not-allowed opacity-60",
    className
  );

  const shouldShowArrow =
    showArrow ?? (variant === "primary" && !leadingIcon && !trailingIcon);

  const content = (
    <>
      {leadingIcon ? <span className="button-icon">{leadingIcon}</span> : null}
      <span className="button-label">{children}</span>
      {trailingIcon ? (
        <span className="button-icon button-icon-trailing">{trailingIcon}</span>
      ) : null}
      {shouldShowArrow ? (
        <span className="button-icon button-icon-trailing">
          <ArrowUpRightIcon />
        </span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled}>
      {content}
    </button>
  );
}
