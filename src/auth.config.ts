import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt-ts';
import type { NextAuthConfig } from 'next-auth';
import { prisma } from './lib/prisma';

const authConfig: NextAuthConfig = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            async authorize(credentials) {
                const email = credentials.email as string;
                const password = credentials.password as string;

                if (!email || !password) {
                    throw new Error('required field.');
                }

                const user = await prisma.user.findUnique({ where: { email } });

                if (!user) {
                    throw new Error('Invalid email.');
                }

                const tokenExisting = await prisma.verificationToken.findFirst({ where: { identifier: email } });

                if (tokenExisting && new Date() > tokenExisting.expires) {
                    await prisma.verificationToken.delete({ where: { identifier_token: { identifier: email, token: tokenExisting.token } } });
                }

                const isValid = await compare(password, user.password);

                if (!isValid) {
                    throw new Error('Invalid password.');
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    emailVerified: user.emailVerified,
                    role: user.role
                };
            }
        })
    ],
    session: {
        strategy: 'jwt',
        maxAge: 5 * 60,
        updateAge: 0
    },
    pages: {
        signIn: '/login',
        signOut: '/dashboard/logout'
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (trigger === 'update' && session) {
                token.name = session.name;
                token.email = session.email;
                token.emailVerified = session.emailVerified as Date | null;
                token.role = session.role;
            }

            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
                token.image = user.image;
                token.emailVerified = user.emailVerified as Date | null;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.name = token.name as string;
                session.user.email = token.email as string;
                session.user.image = token.image as string;
                session.user.emailVerified = token.emailVerified as Date | null;
                session.user.role = token.role as string;
            }
            return session;
        }
    }
};

export default authConfig;