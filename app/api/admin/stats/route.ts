import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { username: session.user.email },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all bookings with game info
    const allBookings = await prisma.booking.findMany({
      include: {
        game: true,
        players: true,
        creator: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Calculate stats
    const totalBookings = allBookings.length;
    const totalPlayers = await prisma.user.count();
    
    // Unique players who have booked
    const uniquePlayerIds = new Set<string>();
    allBookings.forEach(booking => {
      uniquePlayerIds.add(booking.createdById);
      booking.players.forEach(player => uniquePlayerIds.add(player.id));
    });
    const activePlayers = uniquePlayerIds.size;

    // Game popularity
    const gameStats: Record<string, { name: string; count: number }> = {};
    allBookings.forEach(booking => {
      if (!gameStats[booking.game.id]) {
        gameStats[booking.game.id] = {
          name: booking.game.name,
          count: 0,
        };
      }
      gameStats[booking.game.id].count++;
    });

    const topGames = Object.values(gameStats)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Bookings by week (last 12 weeks)
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

    const recentBookings = allBookings.filter(
      booking => new Date(booking.date) >= twelveWeeksAgo
    );

    // Group by week
    const weeklyStats: Record<string, { date: string; bookings: number; players: number }> = {};
    recentBookings.forEach(booking => {
      const bookingDate = new Date(booking.date);
      // Get Monday of that week
      const dayOfWeek = bookingDate.getDay();
      const diff = bookingDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const monday = new Date(bookingDate.setDate(diff));
      const weekKey = monday.toISOString().split('T')[0];

      if (!weeklyStats[weekKey]) {
        weeklyStats[weekKey] = {
          date: weekKey,
          bookings: 0,
          players: 0,
        };
      }

      weeklyStats[weekKey].bookings++;
      weeklyStats[weekKey].players += booking.players.length + 1; // +1 for creator
    });

    const weeklyTrends = Object.values(weeklyStats)
      .sort((a, b) => a.date.localeCompare(b.date));

    // Membership breakdown
    const membershipStats = await prisma.user.groupBy({
      by: ['membershipType'],
      _count: true,
    });

    const membershipBreakdown = membershipStats.map(stat => ({
      type: stat.membershipType,
      count: stat._count,
    }));

    // Average players per booking
    const avgPlayersPerBooking = totalBookings > 0
      ? (allBookings.reduce((sum, b) => sum + b.players.length + 1, 0) / totalBookings).toFixed(1)
      : 0;

    return NextResponse.json({
      overview: {
        totalBookings,
        totalPlayers,
        activePlayers,
        avgPlayersPerBooking,
      },
      topGames,
      weeklyTrends,
      membershipBreakdown,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
