import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            image?: string | null;
            emailVerified: Date | null;
            role: string;
        } & DefaultSession['user'];
    }

    interface User {
        id: string;
        role: string;
        emailVerified?: Date | null;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        email?: string | null;
        name?: string | null;
        image?: string | null;
        emailVerified?: Date | null;
        role?: string | null;
    }
}