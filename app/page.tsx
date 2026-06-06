import ExpressFlow from "@/components/ExpressFlow";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-device flex-col items-center gap-6 px-5 py-10">
      <header className="space-y-1 text-center">
        <h1 className="text-2xl font-bold">Maternify</h1>
        <p className="text-sm text-slate-600">
          ChatGPT gives information. Maternify gives her a voice.
        </p>
      </header>

      <ExpressFlow />

      <footer className="mt-auto pt-6 text-center text-[11px] text-slate-400">
        Not a professional interpreter service. In an emergency, call 999.
      </footer>
    </main>
  );
}
