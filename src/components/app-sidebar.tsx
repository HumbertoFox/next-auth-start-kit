'use client';

import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { User, type NavItem } from '@/types';
import { BookOpen, Folder, LayoutGrid, UserRoundCog, UserRoundPlus, UsersRound } from 'lucide-react';
import AppLogo from './app-logo';
import Link from 'next/link';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'Administrators',
        href: '/dashboard/admins',
        icon: UserRoundCog,
    },
    {
        title: 'Register User',
        href: '/dashboard/admins/register',
        icon: UserRoundPlus,
    },
    {
        title: 'Users',
        href: '/dashboard/admins/users',
        icon: UsersRound,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/HumbertoFox/next-auth-start-kit',
        icon: Folder,
    },
    {
        title: 'Developer',
        href: 'https://betofoxnet-info.vercel.app/',
        icon: BookOpen,
    },
];

export function AppSidebar({ user }: { user: User }) {
    const isAdmin = user.role === 'ADMIN';

    const navItems = isAdmin ? [...mainNavItems, ...adminNavItems] : mainNavItems;
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser user={user} />
            </SidebarFooter>
        </Sidebar>
    );
}
