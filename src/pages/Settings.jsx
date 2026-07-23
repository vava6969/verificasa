import React from "react";
import { useAuth } from "@/lib/AuthContext";
import AvatarUpload from "@/components/AvatarUpload";
import ThemeToggle from "@/components/ThemeToggle";

export default function Settings() {
  const { user } = useAuth();
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-bold text-navy">Setări cont</h1>

      <section className="mt-6 rounded-2xl border border-border bg-white p-6 shadow-soft">
        <h2 className="font-heading text-lg font-bold text-navy">Poza de profil</h2>
        <p className="text-sm text-muted-foreground">Va apărea în comentarii (cu like/reply) și în meniul tău.</p>
        <div className="mt-4"><AvatarUpload /></div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-white p-6 shadow-soft">
        <h2 className="font-heading text-lg font-bold text-navy">Aspect</h2>
        <p className="text-sm text-muted-foreground">Comută între temă deschisă și întunecată.</p>
        <div className="mt-4"><ThemeToggle withLabel /></div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-white p-6 shadow-soft">
        <h2 className="font-heading text-lg font-bold text-navy">Date cont</h2>
        <dl className="mt-3 text-sm">
          <div className="flex justify-between border-b border-border/50 py-2"><dt className="text-muted-foreground">Nume</dt><dd className="font-semibold text-navy">{user?.full_name || "—"}</dd></div>
          <div className="flex justify-between border-b border-border/50 py-2"><dt className="text-muted-foreground">Email</dt><dd className="font-semibold text-navy">{user?.email || "—"}</dd></div>
          <div className="flex justify-between py-2"><dt className="text-muted-foreground">Rol</dt><dd className="font-semibold text-navy">{(user?.role || "—").toUpperCase()}</dd></div>
        </dl>
      </section>
    </div>
  );
}