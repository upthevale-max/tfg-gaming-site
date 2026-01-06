"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle, Calendar, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { usePaymentLogs } from "@/lib/hooks/use-bookings";

interface UnpaidPlayer {
  id: string;
  realName: string;
  discordUsername: string;
  membershipType: string;
}

interface BookingWithUnpaid {
  id: string;
  date: string;
  tableNumber: number;
  gameName: string;
  unpaidPlayers: UnpaidPlayer[];
}

interface GroupedBookings {
  [weekDate: string]: BookingWithUnpaid[];
}

export default function AdminPaymentLogsPage() {
  const router = useRouter();
  const { status } = useSession() || {};
  const { bookings, isLoading, isError, mutate } = usePaymentLogs();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
  }, [status, router]);

  useEffect(() => {
    if (isError) {
      toast.error("Failed to fetch payment data - retrying...");
    }
  }, [isError]);

  const handleMarkPaid = async (bookingId: string, playerId: string, markAsPaid: boolean) => {
    try {
      const res = await fetch(`/api/payment-logs/${bookingId}/mark-paid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, markAsPaid }),
      });

      if (res.ok) {
        toast.success(markAsPaid ? "Marked as paid" : "Marked as unpaid");
        mutate(); // Refresh data from server
      } else {
        toast.error("Failed to update payment status");
      }
    } catch (error) {
      toast.error("Failed to update payment status");
    }
  };

  // Group bookings by week
  const groupedBookings: GroupedBookings = bookings.reduce((acc: GroupedBookings, booking: BookingWithUnpaid) => {
    const weekKey = new Date(booking.date).toLocaleDateString('en-GB');
    if (!acc[weekKey]) {
      acc[weekKey] = [];
    }
    acc[weekKey].push(booking);
    return acc;
  }, {} as GroupedBookings);

  // Calculate statistics
  const totalUnpaid = bookings.reduce((sum: number, booking: BookingWithUnpaid) => sum + booking.unpaidPlayers.length, 0);
  const totalAmountDue = totalUnpaid * 3; // £3 per unpaid session

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-green-500 mb-2">
              Payment Logs
            </h1>
            <p className="text-gray-400">Track unpaid weekly sessions</p>
          </div>
          <Button onClick={() => router.push("/admin")} variant="outline">
            Back to Admin
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-green-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Unpaid</p>
                  <p className="text-3xl font-bold text-red-500">{totalUnpaid}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-green-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Amount Due</p>
                  <p className="text-3xl font-bold text-orange-500">
                    £{totalAmountDue.toFixed(2)}
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-green-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Bookings</p>
                  <p className="text-3xl font-bold text-green-500">{bookings.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Unpaid Bookings by Week */}
        <div className="space-y-6">
          {Object.keys(groupedBookings).length === 0 ? (
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-green-500/30">
              <CardContent className="pt-6 text-center text-gray-400">
                <p>🎉 All payments are up to date! No unpaid bookings found.</p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedBookings)
              .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
              .map(([weekDate, weekBookings]) => {
                const totalUnpaidInWeek = weekBookings.reduce(
                  (sum, booking) => sum + booking.unpaidPlayers.length,
                  0
                );
                const totalOwed = totalUnpaidInWeek * 3; // £3 per session

                return (
                  <Card
                    key={weekDate}
                    className="bg-gradient-to-br from-gray-900 to-gray-800 border-green-500/30"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-xl text-white flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-green-500" />
                            Week of {weekDate}
                          </CardTitle>
                          <div className="flex gap-4 text-sm">
                            <span className="text-gray-400">
                              {weekBookings.length} {weekBookings.length === 1 ? "booking" : "bookings"}
                            </span>
                            <span className="text-red-400">
                              {totalUnpaidInWeek} unpaid {totalUnpaidInWeek === 1 ? "player" : "players"}
                            </span>
                            <span className="text-orange-400">
                              £{totalOwed.toFixed(2)} owed
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {weekBookings.map((booking) => (
                        <div key={booking.id} className="space-y-2">
                          <div className="flex items-center gap-3 text-sm">
                            <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/50">
                              Table {booking.tableNumber}
                            </Badge>
                            <span className="text-gray-400">{booking.gameName}</span>
                          </div>
                          <div className="space-y-2 ml-4 border-l-2 border-gray-700 pl-4">
                            {booking.unpaidPlayers.map((player) => (
                              <div
                                key={player.id}
                                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                              >
                                <div className="flex-1">
                                  <p className="font-medium text-white">{player.realName}</p>
                                  <div className="flex gap-3 text-xs text-gray-400 mt-1">
                                    <span>@{player.discordUsername}</span>
                                    <span>£3.00 due</span>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleMarkPaid(booking.id, player.id, true)}
                                  className="bg-green-500 hover:bg-green-600 text-black"
                                >
                                  Mark Paid
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
}
