"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Clock, LogOut } from "lucide-react";
import { BookingDialog } from "@/components/booking-dialog";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useBookings } from "@/lib/hooks/use-bookings";

interface Player {
  id: string;
  discordUsername: string;
}

interface Booking {
  id: string;
  tableNumber: number;
  game: { name: string };
  creator: Player;
  players: Player[];
  playersNeeded: number;
  notes?: string;
  status: string;
}

interface BookingGridProps {
  tableCount: number;
}

export function BookingGrid({ tableCount }: BookingGridProps) {
  const { data: session } = useSession() || {};
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Use SWR hook for intelligent caching and deduplication
  const { bookings, userBooking, userId, isLoading, mutate } = useBookings();

  const handleTableClick = (tableNumber: number) => {
    if (userBooking) {
      toast.error("You already have a booking for this Monday");
      return;
    }

    const existingBooking = bookings.find((b: Booking) => b.tableNumber === tableNumber);
    if (!existingBooking) {
      setSelectedTable(tableNumber);
      setIsDialogOpen(true);
    }
  };

  const handleJoinBooking = async (bookingId: string) => {
    if (userBooking) {
      toast.error("You already have a booking for this Monday");
      return;
    }

    try {
      const res = await fetch("/api/bookings/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      if (res.ok) {
        toast.success("Successfully joined booking!");
        // Immediately revalidate cache to show updated data
        mutate();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to join booking");
      }
    } catch (error) {
      toast.error("Failed to join booking");
    }
  };

  const handleBookingCreated = () => {
    setIsDialogOpen(false);
    toast.success("Booking created successfully!");
    // Immediately revalidate cache to show new booking
    mutate();
  };

  const handleLeaveBooking = async (bookingId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to leave this booking?")) return;

    try {
      const res = await fetch(`/api/bookings/${bookingId}/leave`, {
        method: "POST",
      });

      if (res.ok) {
        toast.success("Successfully left booking!");
        // Immediately revalidate cache to show updated state
        mutate();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to leave booking");
      }
    } catch (error) {
      toast.error("Failed to leave booking");
    }
  };

  const isUserInBooking = (booking: Booking): boolean => {
    if (!userId) return false;
    return booking.creator.id === userId || booking.players.some((p) => p.id === userId);
  };

  const isUserCreator = (booking: Booking): boolean => {
    if (!userId) return false;
    return booking.creator.id === userId;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Clock className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: tableCount }, (_, i) => i + 1).map((tableNum) => {
          const booking = bookings.find((b: Booking) => b.tableNumber === tableNum);
          const isUserTable = booking ? isUserInBooking(booking) : false;
          const userIsCreator = booking ? isUserCreator(booking) : false;

          return (
            <Card
              key={tableNum}
              className={`relative overflow-hidden transition-all hover:scale-105 cursor-pointer ${
                booking
                  ? "bg-gradient-to-br from-gray-900 to-gray-800 border-green-500/50"
                  : "bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700 hover:border-green-500/50"
              } ${isUserTable ? "ring-2 ring-green-500" : ""}`}
              onClick={() => !booking && handleTableClick(tableNum)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-green-500 font-bold">Table {tableNum}</span>
                  {booking && (
                    <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/50">
                      {booking.game.name}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {booking ? (
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-300">
                      <Users className="h-4 w-4 mr-2 text-green-500" />
                      {booking.players.length} / {booking.playersNeeded} players
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {booking.players.map((player: Player) => (
                        <Badge key={player.id} variant="secondary" className="text-xs">
                          {player.discordUsername}
                        </Badge>
                      ))}
                    </div>
                    {booking.notes && (
                      <p className="text-xs text-gray-400 italic">{booking.notes}</p>
                    )}
                    <div className="flex gap-2">
                      {booking.players.length < booking.playersNeeded && !userBooking && (
                        <Button
                          size="sm"
                          className="flex-1 bg-green-500 hover:bg-green-600 text-black"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJoinBooking(booking.id);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Join Table
                        </Button>
                      )}
                      {isUserTable && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                          onClick={(e) => handleLeaveBooking(booking.id, e)}
                        >
                          <LogOut className="h-4 w-4 mr-1" />
                          Leave Table
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Plus className="h-8 w-8 mx-auto text-gray-500 mb-2" />
                    <p className="text-sm text-gray-400">Click to book</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <BookingDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        tableNumber={selectedTable}
        onSuccess={handleBookingCreated}
      />
    </>
  );
}
