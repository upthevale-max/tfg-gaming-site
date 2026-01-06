"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { BookingGrid } from "@/components/booking-grid";
import { MembershipCard } from "@/components/membership-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Info } from "lucide-react";
import { useSettings } from "@/lib/hooks/use-bookings";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession() || {};
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
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-green-500 mb-2">
            Welcome to TFG Gaming
          </h1>
          <p className="text-gray-400 text-lg">
            Book your table for {nextMonday}
          </p>
        </div>

        {/* Info Banner */}
        <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Info className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <div className="space-y-2 text-gray-300">
                <p className="font-semibold text-white">Booking Information</p>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Bookings are for the upcoming Monday night (6:00pm - 10:30pm)</li>
                  <li>You can book one table or join an existing booking</li>
                  <li>Bookings freeze after Monday midnight for payment processing</li>
                  <li>Make sure your membership is active before booking</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Membership Status */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <MembershipCard />
          </div>
          
          <div className="md:col-span-2">
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-green-500/50">
              <CardHeader>
                <CardTitle className="flex items-center text-green-500">
                  <Calendar className="h-6 w-6 mr-2" />
                  Next Session
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Date</p>
                  <p className="text-lg font-semibold text-white">{nextMonday}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Time</p>
                  <p className="text-lg font-semibold text-white">6:00pm - 10:30pm</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Location</p>
                  <p className="text-lg font-semibold text-white">The Emporium Bar (Upstairs)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bookings Grid */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-6">Available Tables</h2>
          <BookingGrid tableCount={tableCount} />
        </div>
      </div>
    </div>
  );
}
