// app/api/auth/[...nextauth]/route.ts
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
        login: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.login || !credentials?.password) {
          throw new Error("Please enter all fields");
        }

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credentials.login },
              { username: credentials.login }
            ]
          },
          select: {
            id: true,
            email: true,
            username: true,
            name: true,
            password_hash: true,
            image: true,
            githubId: true,
            googleId: true,
          },
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
          username: user.username,
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

  pages: {
    signIn: "/signin",
    error: "/auth/error",
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 days
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.username = user.username;
        token.picture = user.image;
        token.githubId = user.githubId;
        token.googleId = user.googleId;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.username = token.username as string;
        session.user.image = token.picture as string;
        session.user.githubId = token.githubId as string;
        session.user.googleId = token.googleId as string;
      }
      return session;
    },

    async signIn({ user, account }) {
      try {
        console.log("SignIn Callback - User:", user);
        console.log("SignIn Callback - Account:", account);
    
        if (account?.provider === "credentials") {
          return true;
        }
    
        if (account?.provider === "google" || account?.provider === "github") {
          const existingUser = await prisma.user.findFirst({
            where: {
              OR: [
                { email: user.email },
                { githubId: account.provider === "github" ? user.id : undefined },
                { googleId: account.provider === "google" ? user.id : undefined }
              ]
            },
          });
    
          console.log("Existing User:", existingUser);
    
          if (!existingUser) {
            const baseUsername = (user.name || user.email?.split('@')[0] || 'user')
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '');
            
            let username = baseUsername;
            let counter = 1;
            
            while (await prisma.user.findUnique({ where: { username } })) {
              username = `${baseUsername}${counter}`;
              counter++;
            }
    
            // Create user and account in a transaction
            const result = await prisma.$transaction(async (prisma) => {
              // Create the user first
              const newUser = await prisma.user.create({
                data: {
                  email: user.email!,
                  name: user.name || "",
                  username,
                  image: user.image || null,
                  githubId: account.provider === "github" ? user.id : null,
                  googleId: account.provider === "google" ? user.id : null,
                  reputation_points: 0,
                },
              });
    
              // Then create the associated account
              await prisma.account.create({
                data: {
                  userId: newUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  refresh_token: account.refresh_token,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state,
                },
              });
    
              return newUser;
            });
    
            console.log("New User and Account Created:", result);
            return true;
          }
    
          // For existing users, ensure the account exists
          const existingAccount = await prisma.account.findFirst({
            where: {
              userId: existingUser.id,
              provider: account.provider,
            },
          });
    
          if (!existingAccount) {
            // Create the account for existing user
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                refresh_token: account.refresh_token,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
              },
            });
          }
    
          // Update user information if needed
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              ...(account.provider === "github" ? { githubId: user.id } : {}),
              ...(account.provider === "google" ? { googleId: user.id } : {}),
              image: user.image || existingUser.image,
              name: user.name || existingUser.name,
            },
          });
    
          return true;
        }
    
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    }
  },
};

export default NextAuth(authOptions);