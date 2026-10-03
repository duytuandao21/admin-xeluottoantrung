import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth-context";

export async function generateMetadata(): Promise<Metadata> {
  let favicon = '/favicon.png';
  try {
    const baseUrl = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');
    const response = await fetch(`${baseUrl}/api/v1/site-settings/thiet-lap-favicon`, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
    if (response.ok) {
      const rows = await response.json() as { key: string; value: string }[];
      const url = rows.find(row => row.key === 'favicon')?.value;
      if (url && /^(https?:\/\/[^\s]+|\/(?!\/)[^\s]*)$/i.test(url)) favicon = url;
    }
  } catch { /* Use the bundled icon if the API is temporarily unavailable. */ }
  return { title: 'Quản lý website TOÀN TRUNG', description: 'Trang quản trị hệ thống Xe Lướt Toàn Trung', icons: { icon: favicon } };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <AuthProvider><LayoutShell>{children}</LayoutShell></AuthProvider>
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}

function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <LayoutShellClient>{children}</LayoutShellClient>
  );
}

// Must be separate client component to use hooks
import LayoutShellClient from "@/components/LayoutShell";
