'use server';

import { prisma } from '@/lib/prisma';
import { signUpSchema } from '@/lib/zod';
import * as bcrypt from 'bcrypt-ts';

type FormStateRegisterUser =
    | {
        errors?: {
            name?: string[];
            email?: string[];
            password?: string[];
            role?: string[];
            password_confirmation?: string[];
        }
        message?: string;
        info?: string;
    } | undefined;

export async function registerUser(state: FormStateRegisterUser, formData: FormData): Promise<FormStateRegisterUser> {
    const validatedFields = signUpSchema.safeParse({
        name: formData.get('name') as string,
        email: (formData.get('email') as string)?.toLowerCase().trim(),
        password: formData.get('password') as string,
        role: formData.get('role') as string,
        password_confirmation: formData.get('password_confirmation') as string
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors
        };
    };

    const { name, email, password, role } = validatedFields.data;

    try {
        const hashedPassword = await bcrypt.hash(password, 12);

        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
            return { info: 'Data already registered' };
        };

        await prisma.user.create({ data: { name, email, password: hashedPassword, role } });

        return { message: 'Data registered successfully! Directing to Dashboard please wait...' };

    } catch (error) {
        console.error(error);
        return { info: 'Something went wrong. Please try again later.' };
    }
}