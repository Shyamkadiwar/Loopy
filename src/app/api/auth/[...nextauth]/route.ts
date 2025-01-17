// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions } from "next-auth";
import { authOptions } from "./options";

const handler = NextAuth(authOptions as AuthOptions);

export { handler as GET, handler as POST };