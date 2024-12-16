// app/admin/components/dashboard-breadcrumb.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const paths = pathname.split('/').filter(Boolean);
  let breadcrumbs: BreadcrumbItem[] = [];
  let currentPath = '';

  paths.forEach((path, index) => {
    currentPath += `/${path}`;
    
    // Convert path to readable label
    let label = path.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    // Special cases for specific routes
    switch (path) {
      case 'admin':
        label = 'Dashboard';
        break;
      case 'content-studio':
        label = 'Content Studio';
        break;
      case 'media-library':
        label = 'Media Library';
        break;
    }

    // Don't make the last item a link
    const isLastItem = index === paths.length - 1;
    breadcrumbs.push({
      label,
      href: isLastItem ? undefined : currentPath
    });
  });

  return breadcrumbs;
}

export function DashboardBreadcrumb() {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  if (breadcrumbs.length <= 1) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.label}>
            <BreadcrumbItem>
              {crumb.href ? (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href}>{crumb.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}