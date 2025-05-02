import authConfig from './auth.config';
import { NextAuthConfig } from 'next-auth';

const middlewareConfig: NextAuthConfig = {
    ...authConfig,
};

export default middlewareConfig;