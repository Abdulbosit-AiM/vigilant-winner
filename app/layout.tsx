import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LangProvider } from "@/components/LangProvider";
import AppShell from "@/components/AppShell";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Maternify",
  description:
    "Express your maternity symptoms clearly and understand NHS letters — support, not diagnosis.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Noto+Sans+SC:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-foreground">
        <LangProvider>
          <AppShell>{children}</AppShell>
          <Toaster position="top-center" richColors />
        </LangProvider>
      </body>
    </html>
  );
}
