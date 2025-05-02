'use server';

import { sendPasswordResetEmail } from '@/lib/mail';
import { prisma } from '@/lib/prisma';
import { passwordForgotSchema } from '@/lib/zod';
import crypto from 'crypto';

type FormStatePasswordForgot =
    | {
        errors?: {
            email?: string[];
        }
        message?: string;
    } | undefined;

export async function forgotPassword(state: FormStatePasswordForgot, formData: FormData): Promise<FormStatePasswordForgot> {
    const validatedFields = passwordForgotSchema.safeParse({
        email: formData.get('email') as string,
    });

    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors };
    };

    const { email } = validatedFields.data;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        return { message: 'If your email is registered, you will receive a link to reset your password.' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.verificationToken.create({ data: { identifier: email, token, expires } });

    const resetLink = `${process.env.AUTH_URL}/auth/reset-password?token=${token}&email=${email}`;

    await sendPasswordResetEmail(email, resetLink);

    return {
        message: 'If your email is registered, you will receive a link to reset your password.',
    };
}