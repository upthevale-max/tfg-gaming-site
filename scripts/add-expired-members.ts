import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Creating demo expired members...");

  const hashedPassword = await bcrypt.hash("demo123", 10);

  // Get a date 1 week ago for membershipExpiredAt (within 2-week notification window)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // Get a date 10 days ago for membershipExpiredAt (also within window)
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

  // Demo expired monthly member
  const expiredMonthly = await prisma.user.upsert({
    where: { username: "expired_monthly" },
    update: {},
    create: {
      username: "expired_monthly",
      password: hashedPassword,
      realName: "Grace Wilson",
      dob: new Date("1992-08-20"),
      discordUsername: "GraceExpired",
      membershipType: "WEEKLY", // Already downgraded
      membershipExpiry: null,
      membershipExpiredAt: oneWeekAgo, // Expired 1 week ago
      isAdmin: false,
      balanceDue: 0,
      freeWeek: false,
    },
  });

  // Demo expired yearly member
  const expiredYearly = await prisma.user.upsert({
    where: { username: "expired_yearly" },
    update: {},
    create: {
      username: "expired_yearly",
      password: hashedPassword,
      realName: "Henry Martinez",
      dob: new Date("1988-03-15"),
      discordUsername: "HenryExpired",
      membershipType: "WEEKLY", // Already downgraded
      membershipExpiry: null,
      membershipExpiredAt: tenDaysAgo, // Expired 10 days ago
      isAdmin: false,
      balanceDue: 0,
      freeWeek: false,
    },
  });

  console.log("\n✅ Created demo expired members:");
  console.log(
    `  - ${expiredMonthly.realName} (${expiredMonthly.username}) - Monthly expired ${oneWeekAgo.toLocaleDateString()}`
  );
  console.log(
    `  - ${expiredYearly.realName} (${expiredYearly.username}) - Yearly expired ${tenDaysAgo.toLocaleDateString()}`
  );
  console.log("\n🔑 All demo expired members use password: demo123");
  console.log(
    "\n⚠ Both users are now on WEEKLY membership and will show renewal notifications."
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
