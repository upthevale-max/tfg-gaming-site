import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

// Add middleware to handle connection errors gracefully
prisma.$use(async (params, next) => {
  const maxRetries = 3;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      return await next(params);
    } catch (error: any) {
      retries++;
      
      // Check if it's a connection error
      if (error?.code === 'P2024' || error?.message?.includes('connection')) {
        if (retries < maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, retries)));
          continue;
        }
      }
      
      // If not a connection error or max retries reached, throw the error
      throw error;
    }
  }
  
  throw new Error('Max retries reached');
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
