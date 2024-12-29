// app/admin/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import {
  Home,
  Image as ImageIcon,
  PanelLeft,
  NotebookPen,
  Settings
} from 'lucide-react';
import Link from 'next/link';

import { VercelLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { ToastProvider } from '@/components/ui/use-toast';

import { DashboardBreadcrumb } from './components/dashboard-breadcrumb';
import { NavItem } from './nav-item';
import Providers from './providers';
import { SearchInput } from './search';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <ToastProvider>
        <main className="flex min-h-screen w-full flex-col bg-muted/40">
          <DesktopNav />
          <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
              <div className="flex items-center gap-4 flex-1">
                <MobileNav />
                <DashboardBreadcrumb />
                <div className="ml-auto">
                  <SearchInput />
                </div>
              </div>
            </header>
            <main className="grid flex-1 items-start gap-2 p-4 sm:px-6 sm:py-0 bg-muted/40 md:gap-4">
              {children}
            </main>
          </div>
          <Analytics />
        </main>
      </ToastProvider>
    </Providers>
  );
}

function DesktopNav() {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="#"
          className="group flex size-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:size-8 md:text-base"
        >
          <VercelLogo className="size-3 transition-all group-hover:scale-110" />
          <span className="sr-only">Acme Inc</span>
        </Link>

        {/* Admin Dashboard */}
        <NavItem href="/admin" label="Admin Dashboard">
          <Home className="size-5" />
        </NavItem>

        {/* Content Studio */}
        <NavItem href="/admin/content-studio" label="Content Studio">
          <NotebookPen className="size-5" />
        </NavItem>

        {/* Media Library */}
        <NavItem href="/admin/media-library" label="Media Library">
          <ImageIcon className="size-5" />
        </NavItem>
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="#"
              className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:size-8"
            >
              <Settings className="size-5" />
              <span className="sr-only">Settings</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Settings</TooltipContent>
        </Tooltip>
      </nav>
    </aside>
  );
}

function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <PanelLeft className="size-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs">
        <nav className="grid gap-6 text-lg font-medium">
          <Link
            href="#"
            className="group flex size-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
          >
            <VercelLogo className="size-3 transition-all group-hover:scale-110" />
            <span className="sr-only">Acme Inc</span>
          </Link>

          {/* Admin Dashboard */}
          <Link
            href="/admin"
            className="flex items-center gap-4 px-2.5 text-foreground"
          >
            <Home className="size-5" />
            Admin Dashboard
          </Link>

          {/* Content Studio */}
          <Link
            href="/admin/content-studio"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <NotebookPen className="size-5" />
            Content Studio
          </Link>

          {/* Media Library */}
          <Link
            href="/admin/media-library"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <ImageIcon className="size-5" />
            Media Library
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}