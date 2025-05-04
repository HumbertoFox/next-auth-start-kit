import AppLayout from '@/components/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import RegisterUserForm from '@/app/dashboard/admins/form-register-user';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Administrators',
        href: '/dashboard/admins',
    },
    {
        title: 'Register',
        href: '/dashboard/admins/register',
    },
];

export default function RegisterUserPage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex gap-4 rounded-xl p-4">
                <RegisterUserForm valueButton="Register" />
            </div>
        </AppLayout>
    );
}
