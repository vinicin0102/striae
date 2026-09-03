import { ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "lg", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          "inline-flex items-center justify-center rounded-full font-semibold tracking-wide transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
          size === "lg" ? "px-8 py-4 text-base" : "px-5 py-2.5 text-sm",
          variant === "primary" &&
            "bg-plum-700 text-base-50 shadow-[var(--shadow-soft)] hover:bg-plum-900",
          variant === "secondary" &&
            "bg-rose-100 text-plum-700 hover:bg-rose-200",
          variant === "ghost" &&
            "bg-transparent text-plum-700 border border-plum-700/30 hover:bg-rose-100",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
