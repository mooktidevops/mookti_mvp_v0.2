import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    role: string; // Add role here
  }

  interface Session {
    user: {
      id: string;
      email: string;
      role: string; // Session user now includes role
    };
  }
}