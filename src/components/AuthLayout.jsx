import React from "react";
import { Link } from "react-router-dom";
import VerifiCasaLogo from "@/components/VerifiCasaLogo";

// Shell for the platform auth side-pages (forgot password, reset password,
// OAuth consent). It only brands the frame — the auth forms themselves are
// passed in as children and are never reimplemented here.
// NOTE: the `icon` prop is still accepted by callers but no longer rendered;
// the wordmark carries the branding instead of a decorative lucide medallion.
export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* Form column */}
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10 lg:min-h-0">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="mb-8 flex min-h-[44px] items-center justify-center gap-2.5 lg:justify-start"
          >
            <VerifiCasaLogo size={34} tagline={false} />
          </Link>

          <h1 className="text-center font-heading text-3xl font-bold tracking-tight text-foreground lg:text-left">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-center text-sm text-muted-foreground lg:text-left">{subtitle}</p>
          )}

          <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
            {children}
          </div>

          {footer && (
            <p className="mt-6 text-center text-sm text-muted-foreground lg:text-left">{footer}</p>
          )}
        </div>
      </div>

      {/* Photo column — desktop only */}
      <div className="relative hidden lg:block">
        <img
          src="/images/properties/interior-03.webp"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
