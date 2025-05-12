import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const options: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username:", type: "text", placeholder: "Your username" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials){
                // This is where we need to retrieve user data
                // to verify with credentials
                // Docs: https://next-auth.js.org/configuration/providers/credentials
                const user = { id: "4", name: "eyuale", password: "nextauth"}

                if(credentials?.username === user.name && credentials?.password === user.password){
                    return user
                }else{
                    return null
                }
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/signin",
    },
    callbacks: {
        async session({ session }) {
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
    },
}
