'use client';

import { Eye, EyeClosed, LoaderCircle } from 'lucide-react';
import { startTransition, useActionState, useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/components/layouts/auth-layout';
import { Icon } from '@/components/ui/icon';
import { resetPassword } from '@/app/api/auth/resetpassword';
import { useSearchParams } from 'next/navigation';

type ResetPasswordForm = {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function ResetPasswordClient() {
    const searchParams = useSearchParams();
    const [state, action, pending] = useActionState(resetPassword, undefined);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState<boolean>(false);
    const [data, setData] = useState<Required<ResetPasswordForm>>({
        token: searchParams.get('token') ?? '',
        email: searchParams.get('email') ?? '',
        password: '',
        password_confirmation: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setData({ ...data, [id]: value });
    };

    const toggleShowPassword = () => setShowPassword(!showPassword);
    const toggleShowPasswordConfirm = () => setShowPasswordConfirm(!showPasswordConfirm);
    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        startTransition(() => action(formData));
    };

    useEffect(() => {
        if (state?.message) {
            setData({
                ...data,
                password: '',
                password_confirmation: ''
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);
    return (
        <AuthLayout title="Reset password" description="Please enter your new password below">
            <form onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            className="block w-full"
                            readOnly
                            onChange={handleChange}
                        />
                        <InputError message={state?.errors?.email} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                tabIndex={2}
                                autoComplete="new-password"
                                value={data.password}
                                className="block w-full"
                                autoFocus
                                onChange={handleChange}
                                placeholder="Password"
                            />
                            <button
                                type="button"
                                className='absolute right-2 top-[6px] opacity-30 hover:opacity-100 duration-300 cursor-pointer'
                                onClick={toggleShowPassword}
                            >
                                {showPassword ? <Icon iconNode={Eye} /> : <Icon iconNode={EyeClosed} />}
                            </button>
                        </div>
                        <InputError message={state?.errors?.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm password</Label>
                        <div className="relative">
                            <Input
                                id="password_confirmation"
                                type={showPasswordConfirm ? "text" : "password"}
                                name="password_confirmation"
                                tabIndex={3}
                                autoComplete="new-password"
                                value={data.password_confirmation}
                                className="block w-full"
                                onChange={handleChange}
                                placeholder="Confirm password"
                            />
                            <button
                                type="button"
                                className='absolute right-2 top-[6px] opacity-30 hover:opacity-100 duration-300 cursor-pointer'
                                onClick={toggleShowPasswordConfirm}
                            >
                                {showPasswordConfirm ? <Icon iconNode={Eye} /> : <Icon iconNode={EyeClosed} />}
                            </button>
                        </div>
                        <InputError message={state?.errors?.password_confirmation} className="mt-2" />
                    </div>

                    <input type="hidden" name="token" value={data.token} />

                    <Button type="submit" className="mt-4 w-full" disabled={pending}>
                        {pending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Reset password
                    </Button>
                </div>
            </form>

            {(state?.message || state?.info) && <div className={`mb-4 text-center text-sm font-medium ${state.info ? 'text-orange-400' : 'text-green-400'}`}>{state.message || state.info}</div>}
        </AuthLayout>
    );
}
