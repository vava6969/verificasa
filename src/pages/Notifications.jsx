import React, { useEffect } from "react";
import NotificationsPanel from "@/components/NotificationsPanel";

// Dedicated notifications page — the destination every unread badge points
// at (header bell, site menu, bottom nav, Contul meu). Before this page the
// panel lived only inside /settings and the red dot led nowhere.
export default function Notifications() {
  useEffect(() => { document.title = "Notificări – VerifiCasa"; }, []);
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
      <NotificationsPanel />
      <p className="mt-4 text-xs text-muted-foreground">
        Primești notificări în aplicație și pe email. Le poți gestiona din Setări.
      </p>
    </div>
  );
}
