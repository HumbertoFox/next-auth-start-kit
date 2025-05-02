'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { passwordUpdateSchema } from '@/lib/zod';
import { compare, hash } from 'bcrypt-ts';

type FormStatePasswordUpdate =
    | {
        errors?: {
            current_password?: string[];
            password?: string[];
            password_confirmation?: string[];
        }
        message?: boolean;
    } | undefined;

export async function updatePassword(state: FormStatePasswordUpdate, formData: FormData): Promise<FormStatePasswordUpdate> {
    const validatedFields = passwordUpdateSchema.safeParse({
        current_password: formData.get('current_password') as string,
        password: formData.get('password') as string,
        password_confirmation: formData.get('password_confirmation') as string
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    };

    const { current_password, password } = validatedFields.data;

    const session = await auth();

    if (!session?.user) {
        return { errors: { current_password: ['User not authenticated.'] } };
    }

    const authUser = await prisma.user.findUnique({ where: { id: session.user.id } });

    if (!authUser) {return {errors: {current_password: ['User not authenticated.']}}}

    const isValid = await compare(current_password, authUser.password);

    if (!isValid) {
        return { errors: { current_password: ['Current password is incorrect.'] } };
    }

    if (current_password === password) {
        return { errors: { password: ['The new password cannot be the same as the old one.'] } };
    }

    const hashedPassword = await hash(password, 12);

    await prisma.user.update({
        where: { id: session.user.id },
        data: { password: hashedPassword },
    });

    return {
        message: true,
    };
}