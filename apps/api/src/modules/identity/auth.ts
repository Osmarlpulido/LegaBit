import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

import type { ApiConfig } from "../../bootstrap/config.js";
import type { MongoDatabase } from "../../infrastructure/mongodb.js";

export type CurrentAuthSession = {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
  };
  session: {
    id: string;
    expiresAt: Date;
  };
};

export type AuthService = {
  handler(request: Request): Promise<Response>;
  getSession(headers: Headers): Promise<CurrentAuthSession | null>;
};

export function createAuthService(config: ApiConfig, database: MongoDatabase): AuthService {
  const google = config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: config.GOOGLE_CLIENT_ID,
          clientSecret: config.GOOGLE_CLIENT_SECRET
        }
      }
    : undefined;

  const auth = betterAuth({
    appName: "LegaBit",
    baseURL: config.BETTER_AUTH_URL,
    secret: config.BETTER_AUTH_SECRET,
    trustedOrigins: config.AUTH_TRUSTED_ORIGINS,
    database: mongodbAdapter(database.database, { client: database.client }),
    emailAndPassword: { enabled: false },
    socialProviders: google,
    advanced: {
      cookiePrefix: "legabit",
      useSecureCookies: config.NODE_ENV === "production"
    }
  });

  return {
    handler: (request) => auth.handler(request),
    getSession: async (headers) => {
      const result = await auth.api.getSession({ headers });
      return result
        ? {
            user: {
              id: result.user.id,
              email: result.user.email,
              name: result.user.name,
              image: result.user.image
            },
            session: {
              id: result.session.id,
              expiresAt: result.session.expiresAt
            }
          }
        : null;
    }
  };
}
