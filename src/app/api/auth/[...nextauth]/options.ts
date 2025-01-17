import NextAuth, { AuthOptions, NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { User, Account, Profile, Session } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Record<"email" | "password", string> | undefined, req: any): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              password_hash: true,
              name: true,
              image: true,
              githubId: true,
              googleId: true,
            },
          });

          if (!user || !user.password_hash) {
            throw new Error("No user found with this email or password not set");
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password_hash
          );

          if (!isPasswordCorrect) {
            throw new Error("Incorrect password");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image || null,
            githubId: user.githubId || null,
            googleId: user.googleId || null,
          };
        } catch (error) {
          console.error('Auth Error:', error);
          throw new Error(error instanceof Error ? error.message : "Authorization failed");
        }
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, 
  },

  callbacks: {
    async signIn({ user, account, profile }: { 
      user: User; 
      account: Account | null; 
      profile?: Profile | undefined;
    }): Promise<boolean> {
      try {
        if (!user.email) return false;

        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          // Create a new user
          await prisma.user.create({
            data: {
              name: user.name || profile?.name || 'Anonymous',
              email: user.email,
              image: user.image || profile?.picture || null,
              githubId: account?.provider === "github" ? profile?.login : null,
              googleId: account?.provider === "google" ? profile?.sub : null,
              reputation_points: 0,
            },
          });
        } else {
          // Update existing user
          const updateData = {
            image: user.image || existingUser.image,
            ...(account?.provider === "github" && profile?.login 
              ? { githubId: profile.login }
              : {}),
            ...(account?.provider === "google" && profile?.sub 
              ? { googleId: profile.sub }
              : {}),
          };

          await prisma.user.update({
            where: { email: user.email },
            data: updateData,
          });
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },

    async session({ session, user }: { 
      session: Session; 
      user: User;
    }): Promise<Session> {
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image || null,
          githubId: user.githubId || null,
          googleId: user.googleId || null,
        },
      };
    },
  },

  pages: {
    signIn: "/auth/sign-in",
    signOut: "/auth/sign-out",
    error: "/auth/error",
  },

  // debug: process.env.NODE_ENV === 'development',
};

export default authOptions;