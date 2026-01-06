import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Create default test admin user (required for testing)
  const hashedPassword = await bcrypt.hash("johndoe123", 10);
  
  const testUser = await prisma.user.upsert({
    where: { username: "john@doe.com" },
    update: {
      password: hashedPassword, // Update password in case it changed
    },
    create: {
      username: "john@doe.com",
      password: hashedPassword,
      realName: "John Doe",
      dob: new Date("1990-01-01"),
      discordUsername: "johndoe#0000",
      membershipType: "YEARLY",
      membershipExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      isAdmin: true,
      balanceDue: 0,
    },
  });
  console.log("Created test admin user:", testUser.username);

  // Create default games
  const games = [
    { name: "Warhammer 40,000" },
    { name: "Necromunda" },
    { name: "Bolt Action" },
  ];

  for (const game of games) {
    const createdGame = await prisma.game.upsert({
      where: { name: game.name },
      update: {},
      create: game,
    });
    console.log("Created game:", createdGame.name);
  }

  // Create default settings
  const settings = await prisma.settings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      tableCount: 15,
    },
  });
  console.log("Created settings with", settings.tableCount, "tables");

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
