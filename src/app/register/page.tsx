'use client';

import { Eye, EyeClosed, LoaderCircle } from 'lucide-react';
import { startTransition, useActionState, useEffect, useRef, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/components/layouts/auth-layout';
import { Icon } from '@/components/ui/icon';
import { registerUser } from '@/app/api/actions/registeruser';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    role: string;
    password_confirmation: string;
};

export default function Register() {
    const router = useRouter();
    const emailRef = useRef<HTMLInputElement>(null);
    const [state, action, pending] = useActionState(registerUser, undefined);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState<boolean>(false);
    const [data, setData] = useState<RegisterForm>({
        name: '',
        email: '',
        password: '',
        role: 'USER',
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
            const { email, password } = data;

            setData({
                name: '',
                email: '',
                password: '',
                role: 'USER',
                password_confirmation: '',
            });

            signIn('credentials', {
                redirect: false,
                email,
                password
            }).then(() => router.push('/dashboard'));
        };

        if (state?.info && emailRef.current) {
            emailRef.current.focus();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);
    return (
        <AuthLayout title="Create an account" description="Enter your details below to create your account">
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={handleChange}
                            disabled={pending}
                            placeholder="Full name"
                        />
                        <InputError message={state?.errors?.name} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            ref={emailRef}
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={handleChange}
                            disabled={pending}
                            placeholder="email@example.com"
                        />
                        <InputError message={state?.errors?.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                tabIndex={3}
                                autoComplete="new-password"
                                value={data.password}
                                onChange={handleChange}
                                disabled={pending}
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
                                name="password_confirmation"
                                type={showPasswordConfirm ? "text" : "password"}
                                required
                                tabIndex={4}
                                autoComplete="new-password"
                                value={data.password_confirmation}
                                onChange={handleChange}
                                disabled={pending}
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
                        <InputError message={state?.errors?.password_confirmation} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="role">Tipo do Conta</Label>
                        <Select
                            required
                            value={data.role}
                            onValueChange={(value) => setData((prev) => ({ ...prev, role: value }))}
                            disabled={pending}
                        >
                            <SelectTrigger
                                id="role"
                                name="role"
                                title="Selecionar tipo de Conta"
                                tabIndex={5}
                            >
                                <SelectValue placeholder="Tipo de Conta" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="USER">
                                    Usuário
                                </SelectItem>
                                <SelectItem value="ADMIN">
                                    Administrador
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={state?.errors?.role} />
                    </div>

                    <input type="hidden" name="role" value={data.role} />

                    <Button type="submit" className="mt-2 w-full" tabIndex={6} disabled={pending} aria-busy={pending}>
                        {pending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Create account
                    </Button>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    Already have an account?&nbsp;&nbsp;
                    <TextLink href="/login" tabIndex={7}>
                        Log in
                    </TextLink>
                </div>
            </form>

            {(state?.info || state?.message) && <div className={`mb-4 text-center text-sm font-medium ${state.info ? 'text-orange-400' : 'text-green-600'}`}>{state.info || state.message}</div>}
        </AuthLayout>
    );
}
