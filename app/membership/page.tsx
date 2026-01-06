"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { MembershipCard } from "@/components/membership-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Calendar, Check } from "lucide-react";

export default function MembershipPage() {
  const router = useRouter();
  const { status } = useSession() || {};

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-green-500 mb-4">
            Membership Plans
          </h1>
          <p className="text-gray-400 text-lg">
            Choose the plan that works best for you
          </p>
        </div>

        {/* Current Membership */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4">Your Current Membership</h2>
          <MembershipCard />
        </div>

        {/* Membership Options */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Available Plans</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Weekly */}
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-500/50 hover:border-gray-400 transition-all">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 bg-gray-700/50 rounded-full w-fit">
                  <CreditCard className="h-8 w-8 text-gray-400" />
                </div>
                <CardTitle className="text-2xl text-white">Weekly</CardTitle>
                <div className="mt-4">
                  <span className="text-5xl font-bold text-white">£3</span>
                  <span className="text-gray-400 ml-2">/ week</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">Pay only when you attend</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">No commitment required</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">Perfect for occasional visitors</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 pt-4 border-t border-gray-700">
                  Charged £3 per Monday session attended
                </p>
              </CardContent>
            </Card>

            {/* Monthly */}
            <Card className="bg-gradient-to-br from-blue-900/50 to-gray-800 border-blue-500/50 hover:border-blue-500 transition-all transform hover:scale-105 relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-blue-500 text-black px-4 py-1 rounded-full text-xs font-bold">
                  POPULAR
                </span>
              </div>
              <CardHeader className="text-center pb-4 pt-8">
                <div className="mx-auto mb-4 p-3 bg-blue-500/20 rounded-full w-fit">
                  <Calendar className="h-8 w-8 text-blue-500" />
                </div>
                <CardTitle className="text-2xl text-white">Monthly</CardTitle>
                <div className="mt-4">
                  <span className="text-5xl font-bold text-white">£10</span>
                  <span className="text-gray-400 ml-2">/ month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">Unlimited bookings</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">Save money on regular attendance</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">Great for regular gamers</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 pt-4 border-t border-gray-700">
                  Best value if you attend 4+ times per month
                </p>
              </CardContent>
            </Card>

            {/* Yearly */}
            <Card className="bg-gradient-to-br from-yellow-900/50 to-gray-800 border-yellow-500/50 hover:border-yellow-500 transition-all">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 bg-yellow-500/20 rounded-full w-fit">
                  <CreditCard className="h-8 w-8 text-yellow-500" />
                </div>
                <CardTitle className="text-2xl text-white">Yearly</CardTitle>
                <div className="mt-4">
                  <span className="text-5xl font-bold text-white">£100</span>
                  <span className="text-gray-400 ml-2">/ year</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">Unlimited bookings all year</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">Best value for money</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">For dedicated members</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 pt-4 border-t border-gray-700">
                  Save over £50 compared to monthly
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payment Info */}
        <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/30 max-w-4xl mx-auto">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">Payment Information</h3>
            <div className="space-y-3 text-gray-300">
              <p>
                <strong className="text-green-500">PayPal:</strong> cl4rk3y1991@gmail.com
              </p>
              <p className="text-sm text-gray-400">
                Contact an admin to upgrade your membership. Payment is processed via PayPal.
                Your membership will be activated immediately after payment confirmation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
