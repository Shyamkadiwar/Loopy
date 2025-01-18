import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
  
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password_hash) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          githubId: user.githubId,
          googleId: user.googleId,
        };
      },
    }),

    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],

  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user = {
          ...session.user,
          id: user.id,
          email: user.email || null,
          name: user.name || null,
          image: user.image || null,
          bio: user.bio || null,
          githubId: user.githubId || null,
          googleId: user.googleId || null,
        };
      }
      return session;
    },

    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "google" || account?.provider === "github") {
          const existingUser = await prisma.user.findFirst({
            where: {
              OR: [
                { email: user.email },
                { githubId: account.provider === "github" ? user.id : null },
                { googleId: account.provider === "google" ? user.id : null },
              ],
            },
          });

          if (!existingUser) {
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || "",
                image: user.image || null,
                githubId: account.provider === "github" ? user.id : null,
                googleId: account.provider === "google" ? user.id : null,
                reputation_points: 0,
              },
            });
            return !!newUser;
          }
          if (account.provider === "github" && !existingUser.githubId) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { githubId: user.id },
            });
          }

          if (account.provider === "google" && !existingUser.googleId) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { googleId: user.id },
            });
          }
        } else if (account?.provider === "credentials") {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || "",
                image: user.image || null,
                reputation_points: 0,
              },
            });
            return !!newUser;
          }
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
  },

  pages: {
    signIn: "/signin",
    error: "/auth/error",
  },
};

export default NextAuth(authOptions);