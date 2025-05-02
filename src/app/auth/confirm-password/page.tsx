'use client';

import { Eye, EyeClosed, LoaderCircle } from 'lucide-react';
import { startTransition, useActionState, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/components/layouts/auth-layout';
import { Icon } from '@/components/ui/icon';
import { resetPassword } from '@/app/api/auth/resetpassword';

export default function ConfirmPassword() {
    const [state, action, pending] = useActionState(resetPassword, undefined);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [data, setData] = useState<Required<{ password: string }>>({
        password: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setData({ ...data, [id]: value });
    };

    const toggleShowPassword = () => setShowPassword(!showPassword);
    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        startTransition(() => action(formData));
    };
    return (
        <AuthLayout
            title="Confirm your password"
            description="This is a secure area of the application. Please confirm your password before continuing."
        >
            <form onSubmit={submit}>
                <div className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                autoComplete="current-password"
                                value={data.password}
                                autoFocus
                                onChange={handleChange}
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

                    <div className="flex items-center">
                        <Button className="w-full" disabled={pending}>
                            {pending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Confirm password
                        </Button>
                    </div>
                </div>
            </form>
        </AuthLayout>
    );
}
