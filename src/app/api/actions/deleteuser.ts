'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { deleteUserSchema } from '@/lib/zod';
import * as bcrypt from 'bcrypt-ts';

type FormStateUserDelete =
    | {
        errors?: {
            password?: string[];
        }
        message?: boolean;
    } | undefined;

export async function deleteUser(state: FormStateUserDelete, formData: FormData): Promise<FormStateUserDelete> {
    const validatedFields = deleteUserSchema.safeParse({
        password: formData.get('password') as string,
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors
        };
    };

    const { password } = validatedFields.data;
    const session = await auth();

    if (!session?.user?.id) {
        return { message: false };
    }

    const existingUser = await prisma.user.findUnique({
        where: { id: session.user.id }
    });

    if (!existingUser) {
        return { message: false };
    }

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) {
        return {
            errors: {
                password: ['Incorrect password.']
            }
        };
    }

    await prisma.user.delete({
        where: { id: session.user.id }
    });

    return { message: true };
}