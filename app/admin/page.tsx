"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Settings, Trophy, CreditCard, BarChart3 } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Not admin');
  return res.json();
});

export default function AdminPage() {
  const router = useRouter();
  const { status } = useSession() || {};
  
  // Use SWR to check admin status
  const { data, error, isLoading } = useSWR(
    status === "authenticated" ? "/api/admin/users" : null,
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && error) {
      router.push("/dashboard");
    }
  }, [status, error, router]);

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!data || error) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-green-500 mb-2">
            Admin Panel
          </h1>
          <p className="text-gray-400 text-lg">
            Manage club operations and members
          </p>
        </div>

        {/* Admin Options Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/users">
            <Card className="bg-gradient-to-br from-blue-900/50 to-gray-800 border-blue-500/50 hover:border-blue-500 transition-all hover:scale-105 cursor-pointer">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 p-3 bg-blue-500/20 rounded-full w-fit">
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
                <CardTitle className="text-xl text-white">User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 text-center">
                  Manage members, memberships, and payments
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/games">
            <Card className="bg-gradient-to-br from-purple-900/50 to-gray-800 border-purple-500/50 hover:border-purple-500 transition-all hover:scale-105 cursor-pointer">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 p-3 bg-purple-500/20 rounded-full w-fit">
                  <Trophy className="h-8 w-8 text-purple-500" />
                </div>
                <CardTitle className="text-xl text-white">Games</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 text-center">
                  Add or remove supported games
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/bookings">
            <Card className="bg-gradient-to-br from-green-900/50 to-gray-800 border-green-500/50 hover:border-green-500 transition-all hover:scale-105 cursor-pointer">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 p-3 bg-green-500/20 rounded-full w-fit">
                  <Calendar className="h-8 w-8 text-green-500" />
                </div>
                <CardTitle className="text-xl text-white">Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 text-center">
                  View all bookings and attendance
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/settings">
            <Card className="bg-gradient-to-br from-yellow-900/50 to-gray-800 border-yellow-500/50 hover:border-yellow-500 transition-all hover:scale-105 cursor-pointer">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 p-3 bg-yellow-500/20 rounded-full w-fit">
                  <Settings className="h-8 w-8 text-yellow-500" />
                </div>
                <CardTitle className="text-xl text-white">Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 text-center">
                  Configure club settings
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/payment-logs">
            <Card className="bg-gradient-to-br from-red-900/50 to-gray-800 border-red-500/50 hover:border-red-500 transition-all hover:scale-105 cursor-pointer">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 p-3 bg-red-500/20 rounded-full w-fit">
                  <CreditCard className="h-8 w-8 text-red-500" />
                </div>
                <CardTitle className="text-xl text-white">Payment Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 text-center">
                  Track unpaid weekly sessions
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/stats">
            <Card className="bg-gradient-to-br from-cyan-900/50 to-gray-800 border-cyan-500/50 hover:border-cyan-500 transition-all hover:scale-105 cursor-pointer">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 p-3 bg-cyan-500/20 rounded-full w-fit">
                  <BarChart3 className="h-8 w-8 text-cyan-500" />
                </div>
                <CardTitle className="text-xl text-white">Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 text-center">
                  View trends and analytics
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
