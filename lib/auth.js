import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

/**
 * BetterAuth handles:
 *  - Email/Password registration & login
 *  - "Continue with Google" social login
 *  - Session management (cookies)
 *
 * It is initialized AFTER the MongoDB connection is ready (see index.js)
 * because the mongodb adapter needs a live `Db` instance.
 */
let authInstance;

export const initAuth = (db) => {
  authInstance = betterAuth({
    database: mongodbAdapter(db),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins: [process.env.CLIENT_URL],
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      },
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          defaultValue: "user", // user | vendor | admin
          input: false, // never trust the client to set their own role
        },
        photoURL: {
          type: "string",
          required: false,
        },
        fraud: {
          type: "boolean",
          defaultValue: false,
          input: false,
        },
      },
    },
    advanced: {
      crossSubDomainCookies: { enabled: false },
      defaultCookieAttributes: {
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
      },
    },
  });

  return authInstance;
};

export const getAuth = () => {
  if (!authInstance) {
    throw new Error("Auth not initialized. Call initAuth(db) first.");
  }
  return authInstance;
};
