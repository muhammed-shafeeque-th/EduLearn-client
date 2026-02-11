import { DefaultSession,  NextAuthOptions, User } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import CredentialsProvider from 'next-auth/providers/credentials';
import { Auth2SignData, AuthProvider } from '@/types/auth';
import { AuthType, AuthUser } from '@/types/auth';
import { AdapterUser } from 'next-auth/adapters';
import { UserRoles } from '@/types/auth';
import { config } from '@/lib/config';
import { serverAuthService } from '@/services/server-service-clients';


import { cookies } from 'next/headers';
import { authCookieToken, authRefreshToken } from '@/lib/constants';
import { decodeJwt } from '@/lib/utils';
import { getAccessTokenOptions, getRefreshTokenOptions } from './helper';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      token?: string;
      accessToken?: string;
      provider?: string;
    } & DefaultSession['user'] & AuthUser;
    authTokenCookie?: string;
  }

  interface User extends AuthUser {
    token?: string;
    provider?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    token?: string;
    role?: UserRoles;
    accessToken?: string;
    provider?: string;
  }
}


async function handleOAuthSign({ user, account }: { user: User | AdapterUser; account: any }) {
  const registerCredentials: Auth2SignData = {
    token: account.id_token!, 
    provider: account.provider as AuthProvider,
    authType: AuthType.OAUTH,
  };
  try {
    const response = await serverAuthService.oauthSign(registerCredentials);
    if (!response.success) {
      console.error(`OAuth sign error: ${response.error?.code} - ${response.message}`);
      return false; // reject sign-in
    }

    const { accessToken, refreshToken } = response.data;

    const cookieStore = await cookies();

    cookieStore.set(
      authCookieToken,
      accessToken,
      { ...getAccessTokenOptions(accessToken), sameSite: 'none' }
    );

    cookieStore.set(
      authRefreshToken,
      refreshToken,
      { ...getRefreshTokenOptions(refreshToken), sameSite: 'none' }
    );
    const decoded = decodeJwt<any>(accessToken);

    user.id = decoded.userId;
    user.role = decoded.role;
    user.name = decoded.username;
    user.image = decoded.avatar;
    user.email = decoded.email;
    user.token = accessToken;
    user.provider = account.provider;


    return true;
  } catch (error) {
    console.error('OAuth sign error:', error);
    return false;
  }
}


export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 60, 
  },
  callbacks: {

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.token = user.token;
        token.provider = user.provider;
      }
      return token;
    },

    async session({ session, token, ...rest }) {
      if (token) {
        session.user.userId = token.id;
        session.user.role = token.role!;
        session.user.email = token.email!;
        session.user.name = token.name;
        session.user.avatar = token.image as string;
        session.user.token = token.token!;
        session.user.provider = token.provider;
      }
  
      return session;
    },
    async signIn({ user, account }) {
      if (account && (account.provider === 'google' || account.provider === 'facebook')) {
        return await handleOAuthSign({ user, account });
      }
      return true; 
    },
  },
  secret: config.nextAuthSecret,
  useSecureCookies: process.env.NODE_ENV === 'production',
  providers: [
    GoogleProvider({
      clientId: config.googleClientId!,
      clientSecret: config.googleClientSecret!,
    }),
    FacebookProvider({
      clientId: config.facebookClientId!,
      clientSecret: config.facebookClientSecret!,
    }),
    CredentialsProvider({
      id: 'google-one-tap',
      name: 'Google One Tap',
      credentials: {
        credential: { type: 'text' },
      },
      async authorize(credentials, req): Promise<User | null> {
        console.log('Authorize called with ' + credentials?.credential);
        if (!credentials?.credential) {
          throw new Error('No credential found.');
        }
     
        try {
          const response = await serverAuthService.oauthSign({
            token: credentials.credential,
            provider: 'google',
            authType: AuthType.OAUTH,
          });

          if (!response.success) {
            throw new Error(response.message);
          }

          const { accessToken, refreshToken } = response.data;

          const cookieStore = await cookies();
      
        
    cookieStore.set(
      authCookieToken,
      accessToken,
      { ...getAccessTokenOptions(accessToken), sameSite: 'none' }
    );

    cookieStore.set(
      authRefreshToken,
      refreshToken,
      { ...getRefreshTokenOptions(refreshToken), sameSite: 'none' }
    );
          const decoded = decodeJwt<any>(accessToken);
      
          if (!decoded) {
            throw new Error('Invalid JWT decoded from OAuth');
          }
       
          return {
            userId: decoded.userId,
            username: decoded.username,
            id: decoded.userId,
            name: decoded.username,
            email: decoded.email,
            avatar: decoded.avatar,
            image: decoded.avatar,
            role: decoded.role,
            token: accessToken,
            provider: 'google',
          };
        } catch (error) {
          console.error(error);
          throw error;
        }
      },
    }),
  ],
};

