'use client';

import { Eye, EyeClosed, LoaderCircle } from 'lucide-react';
import { startTransition, useActionState, useEffect, useRef, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/components/layouts/auth-layout';
import { Icon } from '@/components/ui/icon';
import { loginUser } from '@/app/api/actions/loginuser';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

export default function Login() {
    const { data: session, update } = useSession();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<string | boolean>(false);
    const canResetPassword = !status;
    const router = useRouter();
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const [state, action, pending] = useActionState(loginUser, undefined);
    const [isVisibledPassword, setIsVisibledPassword] = useState<boolean>(false);
    const [data, setData] = useState<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const togglePasswordVisibility = () => setIsVisibledPassword(!isVisibledPassword);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value, type, checked } = e.target;
        setData({
            ...data,
            [id]: type === 'checkbox' ? checked : value,
        });
    };

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        startTransition(() => action(formData));
    };

    useEffect(() => {
        const statusFromParams = searchParams.get('status');
        const emailFromParams = searchParams.get('email');

        if (emailFromParams) {
            setData((prevData) => ({
                ...prevData,
                email: emailFromParams,
            }));

            passwordRef?.current?.focus();
        };

        if (statusFromParams) {
            setStatus(statusFromParams);

            const timer = setTimeout(() => {
                setStatus(true);
            }, 5000);

            return () => clearTimeout(timer);
        };
    }, [searchParams]);

    useEffect(() => {
        if (session?.user) {
            router.push('/dashboard/logout');
        };

        if (state?.message) {
            setData({
                email: '',
                password: '',
                remember: false
            });

            if (!session?.user) update();

            router.push('/dashboard');
        };

        if (state?.info && emailRef.current) {
            emailRef.current.focus();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state, session?.user]);
    return (
        <AuthLayout title="Log in to your account" description="Enter your email and password below to log in">
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            ref={emailRef}
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={handleChange}
                            placeholder="email@example.com"
                        />
                        <InputError message={state?.errors?.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            {canResetPassword && (
                                <TextLink href="/auth/forgot-password" className="ml-auto text-sm" tabIndex={5}>
                                    Forgot password?
                                </TextLink>
                            )}
                        </div>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                type={isVisibledPassword ? "text" : "password"}
                                ref={passwordRef}
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                value={data.password}
                                onChange={handleChange}
                                placeholder="Password"
                            />
                            <button
                                type="button"
                                className='absolute right-2 top-[6px] opacity-30 hover:opacity-100 duration-300 cursor-pointer'
                                onClick={togglePasswordVisibility}
                            >
                                {isVisibledPassword ? <Icon iconNode={Eye} /> : <Icon iconNode={EyeClosed} />}
                            </button>
                        </div>
                        <InputError message={state?.errors?.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onClick={() => setData({ ...data, remember: !data.remember })}
                            tabIndex={3}
                        />
                        <Label htmlFor="remember">Remember me</Label>
                    </div>

                    <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={pending}>
                        {pending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Log in
                    </Button>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    Don&apos;t have an account?&nbsp;&nbsp;
                    <TextLink href="/register" tabIndex={5}>
                        Sign up
                    </TextLink>
                </div>
            </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
            {(state?.message || state?.info) && <div className={`mb-4 text-center text-sm font-medium ${state.message ? 'text-green-400' : 'text-orange-400'}`}>{state.message || state.info}</div>}
        </AuthLayout>
    );
}
