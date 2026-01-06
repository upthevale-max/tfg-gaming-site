// Client-safe membership utility functions (no Prisma imports)

// Define MembershipType locally to avoid Prisma import
export type MembershipType = "WEEKLY" | "MONTHLY" | "YEARLY";

export function isMembershipActive(
  membershipType: MembershipType,
  membershipExpiry: Date | null
): boolean {
  if (membershipType === "WEEKLY") {
    return true; // Weekly members always "active" but pay per attendance
  }
  
  if (!membershipExpiry) {
    return false;
  }
  
  return new Date() < membershipExpiry;
}

/**
 * Checks if a membership has expired and needs to be downgraded
 */
export function hasMembershipExpired(
  membershipType: MembershipType,
  membershipExpiry: Date | null
): boolean {
  if (membershipType === "WEEKLY") {
    return false; // Weekly memberships don't expire
  }
  
  if (!membershipExpiry) {
    return false; // No expiry date means already expired or never set
  }
  
  return new Date() >= membershipExpiry;
}

/**
 * Check if user is within 2-week notification window after expiry
 */
export function isWithinRenewalWindow(membershipExpiredAt: Date | null): boolean {
  if (!membershipExpiredAt) {
    return false;
  }

  const now = new Date();
  const twoWeeksInMs = 14 * 24 * 60 * 60 * 1000;
  const timeSinceExpiry = now.getTime() - membershipExpiredAt.getTime();

  return timeSinceExpiry >= 0 && timeSinceExpiry <= twoWeeksInMs;
}

export function getMembershipPrice(type: MembershipType): number {
  switch (type) {
    case "WEEKLY":
      return 3;
    case "MONTHLY":
      return 10;
    case "YEARLY":
      return 100;
    default:
      return 0;
  }
}

export function calculateExpiry(type: MembershipType): Date | null {
  if (type === "WEEKLY") {
    return null; // Weekly doesn't have expiry
  }
  
  const now = new Date();
  const expiry = new Date(now);
  
  if (type === "MONTHLY") {
    expiry.setMonth(expiry.getMonth() + 1);
  } else if (type === "YEARLY") {
    expiry.setFullYear(expiry.getFullYear() + 1);
  }
  
  return expiry;
}
