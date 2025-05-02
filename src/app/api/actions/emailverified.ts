'use server';

import { auth } from '@/auth';
import { sendEmailVerification } from '@/lib/mail';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function emailVerifiedChecked() {
    const session = await auth();

    if (!session?.user?.email) return null;

    const email = session?.user?.email;
    const tokenExisting = await prisma.verificationToken.findFirst({ where: { identifier: email } });

    const isCheckedEmail = await prisma.user.findUnique({ where: { email } });

    if (isCheckedEmail?.emailVerified) return null;

    if (tokenExisting && new Date() > tokenExisting.expires) {
        await prisma.verificationToken.delete({ where: { identifier_token: { identifier: email, token: tokenExisting.token } } });

        const token = crypto.randomBytes(32).toString('hex');

        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await prisma.verificationToken.create({ data: { identifier: email, token, expires } });

        const verifyLink = `${process.env.AUTH_URL}/auth/verify-email?token=${token}&email=${email}`;

        await sendEmailVerification(email, verifyLink);

        return 'verification-link-sent';
    }

    return 'verification-link-sent';
}