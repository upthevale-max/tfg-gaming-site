import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const prisma = new PrismaClient();

// Get the current Monday date using the same logic as the app
function getCurrentMonday(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();

  // If it's Monday and before 10:30 PM (22:30), return today's date
  if (dayOfWeek === 1 && (currentHour < 22 || (currentHour === 22 && currentMinutes < 30))) {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  // Otherwise, calculate next Monday
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);
  return nextMonday;
}

async function sendDiscordNotification(message: string): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.error('DISCORD_WEBHOOK_URL not configured');
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: message,
      }),
    });

    if (!response.ok) {
      console.error('Failed to send Discord notification:', response.statusText);
    }
  } catch (error) {
    console.error('Error sending Discord notification:', error);
  }
}

async function main() {
  console.log('Running Monday booking summary...');

  try {
    const mondayDate = getCurrentMonday();
    console.log('Fetching bookings for:', mondayDate.toDateString());

    // Fetch all bookings for this Monday
    const bookings = await prisma.booking.findMany({
      where: {
        date: mondayDate,
        status: 'ACTIVE',
      },
      include: {
        game: true,
        creator: {
          select: {
            realName: true,
            username: true,
          },
        },
        players: {
          select: {
            realName: true,
            username: true,
          },
        },
      },
      orderBy: {
        tableNumber: 'asc',
      },
    });

    if (bookings.length === 0) {
      const message = "⚠️ **No tables booked for tonight's session.** ⚠️";
      await sendDiscordNotification(message);
      console.log('No bookings found. Sent notification.');
      return;
    }

    // Build the Discord message
    let message = '🎲 **Tonight\'s Gaming Tables** 🎲\n\n';

    for (const booking of bookings) {
      message += `**Table ${booking.tableNumber}** - ${booking.game.name}\n`;
      message += `👤 ${booking.creator.realName || booking.creator.username} (Creator)\n`;
      
      // Add other players
      for (const player of booking.players) {
        // Skip the creator if they're also in the players list
        if (player.username !== booking.creator.username) {
          message += `👤 ${player.realName || player.username}\n`;
        }
      }
      
      message += '\n';
    }

    message += `**Total: ${bookings.length} table${bookings.length === 1 ? '' : 's'} booked**`;

    // Send to Discord
    await sendDiscordNotification(message);
    console.log('Booking summary sent successfully!');
    console.log('Message:', message);
  } catch (error) {
    console.error('Error generating booking summary:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
