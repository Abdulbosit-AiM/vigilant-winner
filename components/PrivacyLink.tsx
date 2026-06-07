"use client";

import { useState } from "react";
import PrivacyModal from "@/components/PrivacyModal";
import { useT } from "@/components/LangProvider";

/** Inline "Privacy & data" trigger + modal. Drop anywhere it needs to be reachable. */
export default function PrivacyLink({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const t = useT();
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`underline underline-offset-2 hover:text-foreground ${className}`}
      >
        {t("privacy.open")}
      </button>
      {open && <PrivacyModal onClose={() => setOpen(false)} />}
    </>
  );
}
