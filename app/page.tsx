"use client";

import { useState } from "react";
import ExpressFlow from "@/components/ExpressFlow";
import InterpretFlow from "@/components/InterpretFlow";

type Flow = "express" | "interpret";

export default function Home() {
  const [flow, setFlow] = useState<Flow>("express");

  return (
    <main className="mx-auto flex min-h-screen max-w-device flex-col items-center gap-6 px-5 py-10">
      <header className="space-y-1 text-center">
        <h1 className="text-2xl font-bold">Maternify</h1>
        <p className="text-sm text-slate-600">
          ChatGPT gives information. Maternify gives her a voice.
        </p>
      </header>

      <div className="flex w-full max-w-device overflow-hidden rounded-full border border-slate-300 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setFlow("express")}
          className={`flex-1 px-4 py-2 ${flow === "express" ? "bg-slate-900 text-white" : "text-slate-600"}`}
          aria-pressed={flow === "express"}
        >
          Express<span className="ml-1 font-normal opacity-80">表达</span>
        </button>
        <button
          type="button"
          onClick={() => setFlow("interpret")}
          className={`flex-1 px-4 py-2 ${flow === "interpret" ? "bg-slate-900 text-white" : "text-slate-600"}`}
          aria-pressed={flow === "interpret"}
        >
          Interpret<span className="ml-1 font-normal opacity-80">解读</span>
        </button>
      </div>

      {flow === "express" ? <ExpressFlow /> : <InterpretFlow />}

      <footer className="mt-auto pt-6 text-center text-[11px] text-slate-400">
        Not a professional interpreter service. In an emergency, call 999.
      </footer>
    </main>
  );
}
