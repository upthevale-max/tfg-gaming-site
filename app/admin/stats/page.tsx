"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, Calendar, Trophy } from "lucide-react";
import useSWR from "swr";
import { toast } from "react-hot-toast";

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
});

interface StatsData {
  overview: {
    totalBookings: number;
    totalPlayers: number;
    activePlayers: number;
    avgPlayersPerBooking: string;
  };
  topGames: Array<{ name: string; count: number }>;
  weeklyTrends: Array<{ date: string; bookings: number; players: number }>;
  membershipBreakdown: Array<{ type: string; count: number }>;
}

export default function AdminStatsPage() {
  const router = useRouter();
  const { status } = useSession() || {};
  const { data: stats, error, isLoading } = useSWR<StatsData>(
    status === "authenticated" ? "/api/admin/stats" : null,
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 60000, // Refresh every minute
    }
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
  }, [status, router]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch stats");
      router.push("/admin");
    }
  }, [error, router]);

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-green-500 mb-2">
              Club Statistics
            </h1>
            <p className="text-gray-400">Track trends and performance over time</p>
          </div>
          <Button onClick={() => router.push("/admin")} variant="outline">
            Back to Admin
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-900/50 to-gray-800 border-blue-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Calendar className="h-10 w-10 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-400">Total Bookings</p>
                  <p className="text-3xl font-bold text-white">{stats.overview.totalBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-gray-800 border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Users className="h-10 w-10 text-green-500" />
                <div>
                  <p className="text-sm text-gray-400">Total Members</p>
                  <p className="text-3xl font-bold text-white">{stats.overview.totalPlayers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/50 to-gray-800 border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <TrendingUp className="h-10 w-10 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-400">Active Players</p>
                  <p className="text-3xl font-bold text-white">{stats.overview.activePlayers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900/50 to-gray-800 border-yellow-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <BarChart3 className="h-10 w-10 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-400">Avg Players/Booking</p>
                  <p className="text-3xl font-bold text-white">{stats.overview.avgPlayersPerBooking}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Games */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              <Trophy className="h-6 w-6 text-green-500" />
              Most Popular Games
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topGames.map((game, index) => (
                <div key={game.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-600">#{index + 1}</span>
                    <span className="text-white font-medium">{game.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-48 bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-green-500 h-3 rounded-full"
                        style={{
                          width: `${(game.count / stats.topGames[0].count) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-green-500 font-bold w-12 text-right">
                      {game.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Trends */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-green-500" />
              Weekly Trends (Last 12 Weeks)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.weeklyTrends.map((week) => (
                <div key={week.date} className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
                  <span className="text-gray-400">
                    {new Date(week.date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span className="text-white font-medium">{week.bookings}</span>
                      <span className="text-gray-500 text-sm">bookings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-500" />
                      <span className="text-white font-medium">{week.players}</span>
                      <span className="text-gray-500 text-sm">players</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Membership Breakdown */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              <Users className="h-6 w-6 text-green-500" />
              Membership Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {stats.membershipBreakdown.map((membership) => (
                <div
                  key={membership.type}
                  className="p-6 bg-gray-800/50 rounded-lg text-center"
                >
                  <p className="text-gray-400 text-sm mb-2">{membership.type}</p>
                  <p className="text-4xl font-bold text-white">{membership.count}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {((membership.count / stats.overview.totalPlayers) * 100).toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
