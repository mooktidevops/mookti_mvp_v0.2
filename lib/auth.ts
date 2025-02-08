import { compare } from "bcrypt-ts";
import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";

import { authConfig } from "@/app/(auth)/auth.config";
import { getUser } from "@/db/queries";

export const authOptions: NextAuthConfig = {
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "jsmith@example.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        console.log("DEBUG: authorize called with credentials:", credentials);

        // Ensure credentials are provided.
        if (!credentials) {
          console.error("DEBUG: Missing credentials.");
          return null;
        }

        // Verify that email and password are strings.
        if (
          typeof credentials.email !== "string" ||
          typeof credentials.password !== "string"
        ) {
          console.error("DEBUG: Invalid credential types:", credentials);
          return null;
        }

        const { email, password } = credentials;
        const users = await getUser(email);
        console.log("DEBUG: getUser returned:", users);

        if (users.length === 0) {
          console.error("DEBUG: No user found for email:", email);
          return null;
        }

        const dbUser = users[0];
        const passwordsMatch = await compare(password, dbUser.password!);
        console.log("DEBUG: Password comparison result:", passwordsMatch);

        if (!passwordsMatch) {
          console.error("DEBUG: Password mismatch for email:", email);
          return null;
        }

        console.log("DEBUG: Successful authentication for email:", email);
        // Return the user object with necessary properties.
        return {
          id: dbUser.id,
          email: dbUser.email,
          role: dbUser.role,
        };
      },
    }),
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);