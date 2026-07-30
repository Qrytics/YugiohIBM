import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './db';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    // Email/password authentication (simplified for demo)
    CredentialsProvider({
      name: 'Demo Login',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'demo@ibm.com' },
        name: { label: 'Name', type: 'text', placeholder: 'Your Name' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        // Find or create user (simplified - no password for demo)
        let user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          // Create new user
          user = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.name || credentials.email.split('@')[0],
              profile: {
                create: {
                  level: 1,
                  xp: 0,
                  rank: 'bronze',
                  mmr: 1000,
                },
              },
            },
          });

          // Give starter collection (all neutral cards)
          const neutralCards = ['neutral_001', 'neutral_002', 'neutral_003', 'neutral_004', 'neutral_005'];
          await prisma.cardOwnership.createMany({
            data: neutralCards.map((cardId) => ({
              userId: user!.id,
              cardId,
              quantity: 2,
            })),
          });

          // Create starter deck automatically
          await prisma.deck.create({
            data: {
              userId: user!.id,
              name: 'Starter Deck',
              profession: 'neutral',
              cards: {
                create: neutralCards.map((cardId) => ({
                  cardId,
                  quantity: 2,
                })),
              },
            },
          });

          console.log(`Created new user ${user.email} with starter cards and deck`);
        }

        return {
          id: user.id,
          email: user.email!,
          name: user.name!,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};
