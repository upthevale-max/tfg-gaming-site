import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import DiscordProvider from "next-auth/providers/discord";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "identify email",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Accept both username and email fields (for testing compatibility)
        const usernameOrEmail = (credentials as any)?.email || credentials?.username;
        console.log("[AUTH] Authorize called with:", { usernameOrEmail });
        
        if (!usernameOrEmail || !credentials?.password) {
          console.log("[AUTH] Missing credentials");
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { username: usernameOrEmail },
        });

        if (!user) {
          console.log("[AUTH] User not found:", credentials.username);
          return null;
        }

        console.log("[AUTH] User found:", user.username);

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        console.log("[AUTH] Password valid:", isPasswordValid);

        if (!isPasswordValid) {
          console.log("[AUTH] Invalid password");
          return null;
        }

        console.log("[AUTH] Login successful for:", user.username);
        return {
          id: user.id,
          email: user.username, // Using username as email for NextAuth
          name: user.realName,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Discord OAuth sign-in
      if (account?.provider === "discord") {
        const discordId = user.id;
        const email = user.email;
        const discordUsername = (profile as any)?.username || user.name;

        if (!email || !discordUsername) {
          console.log("[AUTH] Discord sign-in missing email or username");
          return false;
        }

        // Check if user exists by Discord ID (stored in Account table)
        const existingAccount = await prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: "discord",
              providerAccountId: discordId,
            },
          },
          include: { user: true },
        });

        if (existingAccount) {
          // User already exists, allow sign-in
          return true;
        }

        // Check if user exists by discord username
        const existingUser = await prisma.user.findFirst({
          where: { discordUsername },
        });

        if (existingUser) {
          // Link Discord account to existing user
          await prisma.account.create({
            data: {
              userId: existingUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
            },
          });
          return true;
        }

        // New user - they need to register first with their Discord username
        console.log("[AUTH] Discord user not found in database:", discordUsername);
        return "/register?error=discord_not_registered&discord=" + encodeURIComponent(discordUsername);
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      
      // For Discord login, fetch the actual user from database
      if (account?.provider === "discord" && account.providerAccountId) {
        const dbAccount = await prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: "discord",
              providerAccountId: account.providerAccountId,
            },
          },
          include: { user: true },
        });

        if (dbAccount?.user) {
          token.id = dbAccount.user.id;
          token.email = dbAccount.user.username;
          token.name = dbAccount.user.realName;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).id = token.id;
        if (token.email) {
          session.user.email = token.email as string;
        }
        if (token.name) {
          session.user.name = token.name as string;
        }
      }
      return session;
    },
  },
};
