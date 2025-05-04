'use server';

import { prisma } from '@/lib/prisma';
import { signUpSchema } from '@/lib/zod';
import * as bcrypt from 'bcrypt-ts';

type FormStateRegisterAdminUser =
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

export async function updateAdminUser(state: FormStateRegisterAdminUser, formData: FormData): Promise<FormStateRegisterAdminUser> {
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

        await prisma.user.upsert({
            where: { email },
            update: { name, password: hashedPassword, role },
            create: { name, email, password: hashedPassword, role }
        });

        return { message: 'User updated successfully!' };

    } catch (error) {
        console.error(error);
        return { info: 'Something went wrong. Please try again later.' };
    }
}