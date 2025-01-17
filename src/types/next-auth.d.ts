import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image: string | null;
      githubId: string | null;
      googleId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    name: string;
    image: string | null;
    password_hash?: string | null;
    githubId: string | null;
    googleId: string | null;
    bio?: string | null;
    reputation_points?: number | null;
    created_at?: Date;
    updated_at?: Date;
  }

  interface Account {
    provider: string;
    type: "oauth" | "email" | "credentials";
    providerAccountId: string;
    access_token?: string;
    expires_at?: number;
    refresh_token?: string;
    id_token?: string;
    scope?: string;
    session_state?: string;
    token_type?: string;
  }

  interface Profile {
    sub?: string;
    name?: string;
    email?: string;
    picture?: string;
    login?: string;
    email_verified?: boolean;
  }
}