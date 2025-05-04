import AppLayout from '@/components/layouts/app-layout';
import { prisma } from '@/lib/prisma';
import { type BreadcrumbItem } from '@/types';
import RegisterUserForm from '@/app/dashboard/admins/form-register-user';

type UserProps = {
    name: string;
    email: string;
    role: string;
}

export default async function Edit({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { id }, select: { name: true, email: true, role: true } });
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Administrators', href: '/dashboard/admins' },
        { title: user?.name ? `Edit ${user.name}` : 'Edit User', href: `/dashboard/admins/edit/${id}` },
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex gap-4 rounded-xl p-4">
                <RegisterUserForm user={user as UserProps} valueButton="Edit" />
            </div>
        </AppLayout>
    );
}
