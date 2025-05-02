'use server';

import { prisma } from '@/lib/prisma';
import { passwordResetSchema } from '@/lib/zod';
import { hash } from 'bcrypt-ts';

type FormStatePasswordReset =
    | {
        errors?: {
            email?: string[];
            token?: string[];
            password?: string[];
            password_confirmation?: string[];
        }
        message?: string;
        info?: string;
    } | undefined;

export async function resetPassword(state: FormStatePasswordReset, formData: FormData): Promise<FormStatePasswordReset> {
    const validatedFields = passwordResetSchema.safeParse({
        email: formData.get('email') as string,
        token: formData.get('token') as string,
        password: formData.get('password') as string,
        password_confirmation: formData.get('password_confirmation') as string
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    };

    const { email, token, password } = validatedFields.data;

    const record = await prisma.verificationToken.findUnique({
        where: { identifier_token: { identifier: email, token } }
    });

    if (!record || record.expires < new Date()) {
        return { info: 'Invalid or expired token.' };
    }

    const hashedPassword = await hash(password, 12);

    await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
    });

    await prisma.verificationToken.delete({
        where: { identifier_token: { identifier: email, token } }
    });

    return { message: 'Password reset successfully!' };
}