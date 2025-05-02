'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { updateUserSchema } from '@/lib/zod';

type FormStateUserUpdate =
    | {
        errors?: {
            name?: string[];
            email?: string[];
        };
        message?: string;
        success?: boolean;
    } | undefined;

export async function updateUser(state: FormStateUserUpdate, formData: FormData): Promise<FormStateUserUpdate> {
    const validatedFields = updateUserSchema.safeParse({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { name, email } = validatedFields.data;
    const session = await auth();

    if (!session?.user) {
        return { message: 'User not authenticated.' };
    }

    const emailInUse = await prisma.user.findUnique({
        where: { email },
    });

    if (emailInUse && emailInUse.id !== session.user.id) {
        return { errors: { email: ['This email is already in use.'] } };
    }

    const dataToUpdate: { name?: string; email?: string } = {};
    if (session.user.name !== name) dataToUpdate.name = name;
    if (session.user.email !== email) dataToUpdate.email = email;

    if (Object.keys(dataToUpdate).length === 0) {
        return { message: 'No changes made.' };
    }

    await prisma.user.update({
        where: { id: session.user.id },
        data: dataToUpdate,
    });

    return { success: true };
}