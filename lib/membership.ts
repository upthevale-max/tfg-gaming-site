// Server-side membership functions (uses Prisma)
import { MembershipType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { hasMembershipExpired } from "./membership-utils";

// Re-export client-safe utilities
export * from "./membership-utils";

/**
 * Check and downgrade expired memberships for a user
 * Returns the previous membership type if downgraded, null otherwise
 * 
 * SERVER-ONLY: This function uses Prisma and must only be called from API routes
 */
export async function checkAndDowngradeExpiredMembership(
  userId: string
): Promise<{ downgraded: boolean; previousType?: MembershipType } | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      membershipType: true,
      membershipExpiry: true,
      membershipExpiredAt: true,
    },
  });

  if (!user) {
    return null;
  }

  // Check if membership has expired
  if (hasMembershipExpired(user.membershipType, user.membershipExpiry)) {
    const previousType = user.membershipType;
    
    // Downgrade to WEEKLY
    await prisma.user.update({
      where: { id: userId },
      data: {
        membershipType: "WEEKLY",
        membershipExpiredAt: new Date(), // Track when it expired
        membershipExpiry: null, // Clear expiry date
      },
    });

    return { downgraded: true, previousType };
  }

  return { downgraded: false };
}
