'use client';

import { AppContent } from '@/components/app-content';
import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/app-shell';
import { User, type BreadcrumbItem } from '@/types';
import type { PropsWithChildren } from 'react';

export default function AppHeaderLayout({ children, breadcrumbs, user }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[], user: User }>) {
    return (
        <AppShell>
            <AppHeader user={user} breadcrumbs={breadcrumbs} />
            <AppContent>{children}</AppContent>
        </AppShell>
    );
}
