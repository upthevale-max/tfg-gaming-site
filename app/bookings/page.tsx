"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { BookingGrid } from "@/components/booking-grid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { useSettings } from "@/lib/hooks/use-bookings";

export default function BookingsPage() {
  const router = useRouter();
  const { status } = useSession() || {};
  const { tableCount } = useSettings(); // Use SWR hook for settings
  const [nextMonday, setNextMonday] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
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
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <Card className="bg-gradient-to-r from-gray-900 to-gray-800 border-green-500/50">
          <CardHeader>
            <CardTitle className="flex items-center text-3xl text-green-500">
              <Calendar className="h-8 w-8 mr-3" />
              Table Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 text-lg">
              Booking for: <strong className="text-white">{nextMonday}</strong>
            </p>
            <p className="text-gray-400 mt-2">
              Select an available table to create a booking, or join an existing one.
            </p>
          </CardContent>
        </Card>

        {/* Bookings Grid */}
        <BookingGrid tableCount={tableCount} />
      </div>
    </div>
  );
}
