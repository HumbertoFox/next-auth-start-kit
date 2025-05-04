'use server';

import { signIn } from '@/auth';
import { signInSchema } from '@/lib/zod';
import { AuthError } from 'next-auth';

type FormStateLoginUser =
    | {
        errors?: {
            email?: string[];
            password?: string[];
        }
        message?: string;
        info?: string;
    } | undefined;

export async function loginUser(state: FormStateLoginUser, formData: FormData): Promise<FormStateLoginUser> {
    const validatedFields = signInSchema.safeParse({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    });

    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors, };
    };

    const { email, password } = validatedFields.data;

    try {
        await signIn('credentials', { email, password, redirect: false });

        return { message: 'authentication successful! Directing to Dashboard please wait...' };
    } catch (error) {
        if (error instanceof AuthError) {
            return { info: 'invalid credentials!' };
        };

        console.error('Unknown error occurred:', error);
        return { info: 'Unknown error occurred' };
    };
}