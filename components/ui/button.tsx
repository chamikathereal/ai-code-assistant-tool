import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
}

export function Button({
  variant = "default",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const styles =
    variant === "outline"
      ? "border border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      : "bg-slate-900 text-white hover:bg-slate-700 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200";

  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
