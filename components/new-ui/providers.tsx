'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/components/custom/theme-provider';
import { Toaster } from 'sonner';

export function Providers({
  session,
  children,
}: {
  session?: any;
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SessionProvider session={session}>
        <Toaster position="top-center" />
        {children}
      </SessionProvider>
    </ThemeProvider>
  );
}