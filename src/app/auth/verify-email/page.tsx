'use client';

import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, startTransition, useActionState, useEffect } from 'react';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/components/layouts/auth-layout';
import { handleEmailVerification } from '@/app/api/auth/handleemailverification';

export default function VerifyEmail() {
    const [state, action, pending] = useActionState(handleEmailVerification, undefined);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        startTransition(() => action());
    };

    useEffect(() => {
        const alreadySent = sessionStorage.getItem('verification-email-sent');

        if (!alreadySent) {
            sessionStorage.setItem('verification-email-sent', 'true');
            startTransition(() => { action(); });
        };
    }, [action]);
    return (
        <AuthLayout title="Verify email" description="Please verify your email address by clicking on the link we just emailed to you.">
            {state?.status === "verification-link-sent" && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    A new verification link has been sent to the email address you provided during registration.
                </div>
            )}

            {state?.error && (
                <div className="mb-4 text-center text-sm font-medium text-red-500">{state.error}</div>
            )}

            <form onSubmit={submit} className="space-y-6 text-center">
                <Button disabled={pending || state?.status === 'verification-email-sent' || state?.error !== ''} variant="secondary">
                    {pending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Resend verification email
                </Button>

                <TextLink href={!state?.status ? "/login" : "/login?status=email verified"} className="mx-auto block text-sm">
                    Log in
                </TextLink>
            </form>
        </AuthLayout>
    );
}
