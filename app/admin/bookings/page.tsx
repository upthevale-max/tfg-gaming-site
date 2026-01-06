"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, CheckCircle, XCircle, Trash2, Gamepad2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { isMembershipActive } from "@/lib/membership-utils";
import { useAdminBookings } from "@/lib/hooks/use-bookings";

interface Player {
  id: string;
  discordUsername: string;
  realName: string;
  membershipType: string;
  membershipExpiry: string | null; // Comes from API as JSON string
  freeWeek: boolean;
}

interface Booking {
  id: string;
  tableNumber: number;
  game: { name: string };
  creator: Player;
  players: Player[];
  paidUsers: Array<{ id: string }>;
  playersNeeded: number;
  notes?: string;
  status: string;
}

export default function AdminBookingsPage() {
  const router = useRouter();
  const { status } = useSession() || {};
  const { bookings, isLoading, isError, mutate } = useAdminBookings();
  const [nextMonday, setNextMonday] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // Calculate next Monday
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilMonday = dayOfWeek === 1 ? 7 : (8 - dayOfWeek) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() + daysUntilMonday);
    setNextMonday(monday.toLocaleDateString("en-GB", { 
      weekday: "long", 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    }));
  }, [status, router]);

  useEffect(() => {
    if (isError) {
      toast.error("Failed to fetch bookings - retrying...");
    }
  }, [isError]);

  const togglePayment = async (bookingId: string, userId: string, currentlyPaid: boolean) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/mark-paid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isPaid: !currentlyPaid }),
      });

      if (res.ok) {
        toast.success(currentlyPaid ? "Payment unmarked" : "Marked as paid");
        mutate(); // Refresh data from server
      } else {
        toast.error("Failed to update payment status");
      }
    } catch (error) {
      toast.error("Failed to update payment status");
    }
  };

  const removePlayer = async (bookingId: string, userId: string, playerName: string) => {
    if (!confirm(`Remove ${playerName} from this booking?`)) return;

    try {
      const res = await fetch(`/api/bookings/${bookingId}/remove-player`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        toast.success("Player removed successfully");
        mutate(); // Refresh data from server
      } else {
        toast.error("Failed to remove player");
      }
    } catch (error) {
      toast.error("Failed to remove player");
    }
  };

  const isPlayerPaid = (bookingId: string, playerId: string) => {
    const booking = bookings.find((b: Booking) => b.id === bookingId);
    return booking?.paidUsers.some((p: { id: string }) => p.id === playerId) || false;
  };

  const needsPayment = (player: Player) => {
    // Users with free week don't need payment
    if (player.freeWeek) {
      return false;
    }
    
    // Check if user has active membership (MONTHLY/YEARLY)
    // Convert the string date to Date object for proper comparison
    const hasActiveMembership = isMembershipActive(
      player.membershipType as "WEEKLY" | "MONTHLY" | "YEARLY",
      player.membershipExpiry ? new Date(player.membershipExpiry) : null
    );
    
    // If they have active MONTHLY/YEARLY membership, they don't need payment
    if (hasActiveMembership && player.membershipType !== "WEEKLY") {
      return false;
    }
    
    // Weekly members or expired members need payment
    return true;
  };

  const getAllPlayers = (booking: Booking) => {
    const allPlayers = [booking.creator, ...booking.players];
    // Remove duplicates by id
    return allPlayers.filter(
      (player, index, self) => index === self.findIndex((p) => p.id === player.id)
    );
  };

  const getGameSummary = () => {
    const gameCounts: { [key: string]: number } = {};
    bookings.forEach((booking: Booking) => {
      const gameName = booking.game.name;
      gameCounts[gameName] = (gameCounts[gameName] || 0) + 1;
    });
    return gameCounts;
  };

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-green-500 mb-2">
              Bookings Overview
            </h1>
            <p className="text-gray-400">{nextMonday}</p>
          </div>
          <Button onClick={() => router.push("/admin")} variant="outline">
            Back to Admin
          </Button>
        </div>

        {/* Game Summary */}
        {bookings.length > 0 && (
          <Card className="bg-gradient-to-br from-orange-900/50 to-gray-800 border-orange-500/30">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-500">
                <Gamepad2 className="h-6 w-6 mr-2" />
                Tonight's Games
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {Object.entries(getGameSummary()).map(([gameName, count]) => (
                  <div
                    key={gameName}
                    className="bg-gray-900/50 border border-orange-500/30 rounded-lg px-4 py-2"
                  >
                    <span className="text-white font-semibold">{count}x</span>
                    <span className="text-gray-400 ml-2">{gameName}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-900/50 to-gray-800 border-blue-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Calendar className="h-10 w-10 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-400">Total Bookings</p>
                  <p className="text-3xl font-bold text-white">{bookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-gray-800 border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Users className="h-10 w-10 text-green-500" />
                <div>
                  <p className="text-sm text-gray-400">Total Players</p>
                  <p className="text-3xl font-bold text-white">
                    {bookings.reduce((sum: number, b: Booking) => sum + b.players.length, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/50 to-gray-800 border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Calendar className="h-10 w-10 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-400">Available Tables</p>
                  <p className="text-3xl font-bold text-white">
                    {15 - bookings.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings List */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">All Bookings</h2>
          {bookings.length === 0 ? (
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-500/30">
              <CardContent className="p-12 text-center">
                <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No bookings yet for {nextMonday}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking: Booking) => (
                <Card key={booking.id} className="bg-gradient-to-br from-gray-900 to-gray-800 border-green-500/30">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-white">
                        Table {booking.tableNumber}
                      </CardTitle>
                      <Badge className="bg-green-500/20 text-green-500 border-green-500/50">
                        {booking.game.name}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center text-gray-300">
                      <Users className="h-5 w-5 text-green-500 mr-2" />
                      <span>{getAllPlayers(booking).length} / {booking.playersNeeded} players</span>
                    </div>

                    <div>
                      <p className="text-sm text-gray-400 mb-3">Players & Payment Status:</p>
                      <div className="space-y-2">
                        {getAllPlayers(booking).map((player) => {
                          const requiresPayment = needsPayment(player);
                          const isPaid = isPlayerPaid(booking.id, player.id);
                          const isCreator = player.id === booking.creator.id;

                          return (
                            <div
                              key={player.id}
                              className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div>
                                  <p className="text-sm font-medium text-white">
                                    {player.realName}
                                    {isCreator && (
                                      <Badge variant="secondary" className="ml-2 text-xs">
                                        Creator
                                      </Badge>
                                    )}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {player.discordUsername}
                                  </p>
                                </div>
                                {player.freeWeek ? (
                                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                                    🎁 Free Week
                                  </Badge>
                                ) : !requiresPayment ? (
                                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                                    {player.membershipType === "YEARLY" ? "Yearly Member" : 
                                     player.membershipType === "MONTHLY" ? "Monthly Member" : 
                                     "Member"}
                                  </Badge>
                                ) : isPaid ? (
                                  <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                                    ✓ Paid
                                  </Badge>
                                ) : (
                                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                                    ⚠ Unpaid
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {requiresPayment && (
                                  <Button
                                    size="sm"
                                    variant={isPaid ? "outline" : "default"}
                                    onClick={() => togglePayment(booking.id, player.id, isPaid)}
                                    className={
                                      isPaid
                                        ? "border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
                                        : "bg-green-500 hover:bg-green-600 text-black"
                                    }
                                  >
                                    {isPaid ? (
                                      <>
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Unmark
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Mark Paid
                                      </>
                                    )}
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => removePlayer(booking.id, player.id, player.realName)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {booking.notes && (
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Notes:</p>
                        <p className="text-sm text-gray-300 italic">{booking.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
