import { HTMLAttributes } from "react";
import clsx from "clsx";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-[var(--radius-card)] bg-base-50 shadow-[var(--shadow-softer)] border border-rose-100",
        className
      )}
      {...props}
    />
  );
}
