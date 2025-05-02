'use client';

import AppLayoutTemplate from '@/components/layouts/app/app-sidebar-layout';
import { User, type BreadcrumbItem } from '@/types';
import { useSession } from 'next-auth/react';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
};

export default function AppLayout({ children, breadcrumbs, ...props }: AppLayoutProps) {
    const { data: session } = useSession();
    if (!session?.user) return null;
    const user = session.user;
    return (
        <AppLayoutTemplate user={user as User} breadcrumbs={breadcrumbs} {...props}>
            {children}
        </AppLayoutTemplate>
    )
};