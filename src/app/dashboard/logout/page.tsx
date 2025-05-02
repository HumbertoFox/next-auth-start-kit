'use client';

import LoadingLoginSimple from '@/components/loading-login-simple';
import { signOut } from 'next-auth/react';
import { useEffect } from 'react';

export default function Logout() {
    useEffect(() => {
        signOut({ callbackUrl: '/login' });
    }, []);
    return (
        <LoadingLoginSimple />
    );
}