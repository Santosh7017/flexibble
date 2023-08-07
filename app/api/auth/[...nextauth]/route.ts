import NextAuth from "next-auth/next";
import { authOptions } from "@/lib/session";// Use @ symbol to refer to the src directory
const handler = NextAuth(authOptions);

export {handler as GET, handler as POST};