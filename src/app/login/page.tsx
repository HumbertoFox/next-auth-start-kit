import { Suspense } from 'react';
import LoginClient from './login-client';
import LoadingLoginSimple from '@/components/loading-login-simple';

export default function LoginPage() {
    return (
        <Suspense fallback={<LoadingLoginSimple />}>
            <LoginClient />
        </Suspense>
    );
}