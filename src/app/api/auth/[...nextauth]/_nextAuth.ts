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

/**
 * Patch: Add utility to read authToken from cookies (works in both API/server* context)
 */
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

/**
 * Handle OAUTH provider (Google/Facebook)
 * Called inside `signIn` only for OAuth providers
 */
async function handleOAuthSign({ user, account }: { user: User | AdapterUser; account: any }) {
  const registerCredentials: Auth2SignData = {
    token: account.id_token!, // exchange with microservice
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
    maxAge: 30 * 60, // 30 minutes - just for OAuth flow, not actual session
  },
  callbacks: {
    /**
     * JWT callback: whenever a new JWT "session token" is created/updated
     * - This persists user fields into the token
     */
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

    /**
     * Session callback: whenever a session is checked/created
     * - Syncs our app fields into the session's user object
     * - Also attempts to set .authTokenCookie from cookies (if available)
     * 
    
     */
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
      return true; // CredentialsProvider: fallback, actual logic in `authorize`
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
      /**
        * FLOW FOR GOOGLE ONE TAP SIGNIN:
       * 1. When user completes One Tap, the Google One Tap JS library emits a "credential" JWT string.
       * 2. Frontend calls NextAuth signIn('google-one-tap', { credential })
       * 3. NextAuth server calls authorize(credentials, req):
       *    - This method calls the backend microservice with the Google credential to verify/convert to app user JWT.
       *    - If successful, it returns a User object (must match the expected NextAuth user shape, with id, email, etc.).
       * 4. After authorize returns the user:
       *    a. signIn callback is executed (for credentials provider, this returns true directly, no additional logic).
       *    b. jwt callback runs: embedds fields on the token.
       *    c. session callback runs: fields from token mapped onto session.user, session returned to requester.
       * 5. Client is redirected or shown as signed in.
       */
      async authorize(credentials, req): Promise<User | null> {
        console.log('Authorize called with ' + credentials?.credential);
        if (!credentials?.credential) {
          throw new Error('No credential found.');
        }
        // Single call to microservice for CredentialsProvider
        try {
          const response = await serverAuthService.oauthSign({
            token: credentials.credential,
            provider: 'google',
            authType: AuthType.OAUTH,
          });
          console.log('service reponse ' + JSON.stringify(response, null, 2));

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
          // All fields must match NextAuth User type.
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

