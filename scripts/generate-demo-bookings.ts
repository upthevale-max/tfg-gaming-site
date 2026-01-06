import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function getLastMonday(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  let daysToSubtract;
  
  if (dayOfWeek === 0) {
    // Sunday
    daysToSubtract = 6;
  } else if (dayOfWeek === 1) {
    // Monday - get last Monday
    daysToSubtract = 7;
  } else {
    // Tuesday-Saturday
    daysToSubtract = dayOfWeek - 1;
  }
  
  const lastMonday = new Date(now);
  lastMonday.setDate(now.getDate() - daysToSubtract);
  lastMonday.setHours(19, 0, 0, 0); // 7:00 PM
  return lastMonday;
}

async function main() {
  console.log("Generating demo bookings for last Monday...");

  const lastMonday = getLastMonday();
  console.log("Last Monday date:", lastMonday.toLocaleDateString());

  // Get all games
  const games = await prisma.game.findMany();
  if (games.length === 0) {
    console.error("No games found. Please run the seed script first.");
    return;
  }

  // Create demo users with different membership types
  const demoUsers = [
    {
      username: "demo_weekly1",
      realName: "Alice Johnson",
      discordUsername: "AliceGamer#1234",
      membershipType: "WEEKLY" as const,
      membershipExpiry: null,
      password: await bcrypt.hash("demo123", 10),
    },
    {
      username: "demo_weekly2",
      realName: "Bob Smith",
      discordUsername: "BobTheBuilder#5678",
      membershipType: "WEEKLY" as const,
      membershipExpiry: null,
      password: await bcrypt.hash("demo123", 10),
    },
    {
      username: "demo_weekly3",
      realName: "Charlie Brown",
      discordUsername: "CharlieBrown#9012",
      membershipType: "WEEKLY" as const,
      membershipExpiry: null,
      password: await bcrypt.hash("demo123", 10),
    },
    {
      username: "demo_monthly1",
      realName: "Diana Prince",
      discordUsername: "WonderWoman#3456",
      membershipType: "MONTHLY" as const,
      membershipExpiry: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
      password: await bcrypt.hash("demo123", 10),
    },
    {
      username: "demo_yearly1",
      realName: "Ethan Hunt",
      discordUsername: "MissionPossible#7890",
      membershipType: "YEARLY" as const,
      membershipExpiry: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000), // 300 days from now
      password: await bcrypt.hash("demo123", 10),
    },
    {
      username: "demo_weekly4",
      realName: "Fiona Green",
      discordUsername: "FionaGames#2345",
      membershipType: "WEEKLY" as const,
      membershipExpiry: null,
      password: await bcrypt.hash("demo123", 10),
    },
  ];

  const createdUsers: Array<{
    id: string;
    username: string;
    realName: string;
    discordUsername: string;
    membershipType: string;
    membershipExpiry: Date | null;
  }> = [];
  for (const userData of demoUsers) {
    const user = await prisma.user.upsert({
      where: { username: userData.username },
      update: {},
      create: {
        username: userData.username,
        password: userData.password,
        realName: userData.realName,
        dob: new Date("1990-01-01"),
        discordUsername: userData.discordUsername,
        membershipType: userData.membershipType,
        membershipExpiry: userData.membershipExpiry,
        isAdmin: false,
        balanceDue: 0,
      },
    });
    createdUsers.push(user);
    console.log(`Created user: ${user.realName} (${user.membershipType})`);
  }

  // Create demo bookings for last Monday
  const bookings = [
    {
      tableNumber: 1,
      gameId: games[0].id,
      createdById: createdUsers[0].id, // Alice (Weekly - unpaid)
      players: [createdUsers[1].id], // Bob (Weekly - unpaid)
      playersNeeded: 2,
      notes: "Friendly match - beginners welcome!",
    },
    {
      tableNumber: 3,
      gameId: games[1] ? games[1].id : games[0].id,
      createdById: createdUsers[3].id, // Diana (Monthly - member)
      players: [createdUsers[4].id], // Ethan (Yearly - member)
      playersNeeded: 2,
      notes: "Campaign game - session 3",
    },
    {
      tableNumber: 5,
      gameId: games[2] ? games[2].id : games[0].id,
      createdById: createdUsers[2].id, // Charlie (Weekly - unpaid)
      players: [createdUsers[5].id], // Fiona (Weekly - unpaid)
      playersNeeded: 3,
      notes: "Looking for one more player!",
    },
  ];

  for (const bookingData of bookings) {
    const { players: playerIds, ...bookingInfo } = bookingData;
    
    const booking = await prisma.booking.create({
      data: {
        ...bookingInfo,
        date: lastMonday,
        status: "COMPLETED",
        players: {
          connect: playerIds.map((id) => ({ id })),
        },
        paidUsers: {
          // Only connect monthly/yearly members as paid
          connect: playerIds
            .filter((id) => {
              const user = createdUsers.find((u) => u.id === id);
              return user && (user.membershipType === "MONTHLY" || user.membershipType === "YEARLY");
            })
            .map((id) => ({ id })),
        },
      },
      include: {
        game: true,
        creator: true,
        players: true,
        paidUsers: true,
      },
    });

    console.log(
      `Created booking: Table ${booking.tableNumber} - ${booking.game.name} (${booking.players.length + 1} players, ${booking.paidUsers.length} paid)`
    );
  }

  console.log("\n✅ Demo data generated successfully!");
  console.log("\nSummary:");
  console.log(`- Created ${createdUsers.length} demo users`);
  console.log(`- Created ${bookings.length} bookings for ${lastMonday.toLocaleDateString()}`);
  console.log(`\nWeekly members (should show as unpaid):`);
  createdUsers
    .filter((u) => u.membershipType === "WEEKLY")
    .forEach((u) => console.log(`  - ${u.realName} (${u.discordUsername})`));
  console.log(`\nMonthly/Yearly members (should show as paid/member):`);
  createdUsers
    .filter((u) => u.membershipType !== "WEEKLY")
    .forEach((u) => console.log(`  - ${u.realName} (${u.discordUsername})`));
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
