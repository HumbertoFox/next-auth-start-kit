'use client';

import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { startTransition, useActionState, useEffect, useState } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/components/layouts/app-layout';
import SettingsLayout from '@/components/layouts/settings/app-layout';
import { useSession } from 'next-auth/react';
import { updateUser } from '@/app/api/actions/updateuser';
import { emailVerifiedChecked } from '@/app/api/actions/emailverified';
import { useRouter } from 'next/navigation';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/dashboard/settings/profile'
    }
];

type ProfileForm = {
    name?: string | null;
    email?: string | null;
};

export default function Profile() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const [state, action, pending] = useActionState(updateUser, undefined);
    const [mustVerifyEmail, setMustVerifyEmail] = useState<boolean>(false);
    const [status, setStatus] = useState<string | null>(null);
    const [recentlySuccessful, setRecentlySuccessful] = useState<boolean>(false);

    const [data, setData] = useState<ProfileForm>({ name: '', email: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setData({ ...data, [id]: value });
    };

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        startTransition(() => action(formData));
    };

    const handleVerifildEmail = async () => {
        const result = await emailVerifiedChecked();
        setStatus(result);
        
        if (result === 'verification-link-sent') {
            setTimeout(() => router.push('/dashboard/logout'), 3000);
        }
    };

    useEffect(() => {
        if (state?.success) {
            update({ name: data.name, email: data.email });
            setRecentlySuccessful(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);

    useEffect(() => {
        if (session?.user && (!data.name || !data.email)) {
            setData({
                name: session.user.name,
                email: session.user.email
            });
        }

        if (!session?.user.emailVerified) {
            setMustVerifyEmail(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session]);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Profile information" description="Update your name and email address" />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                className="mt-1 block w-full"
                                value={data.name ?? ""}
                                onChange={handleChange}
                                required
                                autoComplete="name"
                                placeholder="Full name"
                            />
                            <InputError className="mt-2" message={state?.errors?.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email ?? ""}
                                onChange={handleChange}
                                required
                                autoComplete="username"
                                placeholder="Email address"
                            />
                            <InputError className="mt-2" message={state?.errors?.email} />
                        </div>

                        {mustVerifyEmail && (
                            <div>
                                <p className="text-muted-foreground -mt-4 text-sm">
                                    Your email address is unverified.&nbsp;&nbsp;
                                    <button
                                        type="button"
                                        onClick={handleVerifildEmail}
                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    >
                                        Click here to resend the verification email.
                                    </button>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        A new verification link has been sent to your email address.
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Button disabled={pending}>Save</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Saved</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
