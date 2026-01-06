import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: {
      discordUsername: 'Sneakyvale'
    }
  });

  if (!user) {
    console.log('❌ User with Discord username "Sneakyvale" not found');
    console.log('Make sure the user has registered on the website first.');
    return;
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id
    },
    data: {
      isAdmin: true
    }
  });

  console.log('✅ Successfully set Sneakyvale as admin!');
  console.log(`User: ${updatedUser.realName} (${updatedUser.username})`);
  console.log(`Discord: ${updatedUser.discordUsername}`);
  console.log(`Admin: ${updatedUser.isAdmin}`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
