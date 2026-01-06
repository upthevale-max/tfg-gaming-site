"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Calendar, AlertCircle } from "lucide-react";
import { useMembership } from "@/lib/hooks/use-bookings";

interface MembershipStatus {
  membershipType: string;
  membershipExpiry: string | null;
  membershipExpiredAt: string | null;
  balanceDue: number;
  freeWeek: boolean;
  isActive: boolean;
  showRenewalNotification: boolean;
  previousMembershipType: string | null;
}

export function MembershipCard() {
  // Use SWR hook for membership (automatically cached and deduplicated)
  const { membership: status, isLoading } = useMembership();

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-green-500/50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!status) return null;

  const getMembershipColor = () => {
    switch (status.membershipType) {
      case "YEARLY":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";
      case "MONTHLY":
        return "bg-blue-500/20 text-blue-500 border-blue-500/50";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
  };

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-green-500/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-green-500">Membership Status</span>
          <Badge variant="outline" className={getMembershipColor()}>
            {status.membershipType}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {status.showRenewalNotification && status.previousMembershipType && status.membershipExpiredAt && (
          <div className="bg-orange-500/20 border border-orange-500/50 rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2 text-orange-500">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-semibold">Membership Expired</p>
                <p className="text-xs text-orange-400">
                  Your {status.previousMembershipType} membership expired on{" "}
                  {new Date(status.membershipExpiredAt).toLocaleDateString('en-GB')}. 
                  You&apos;ve been moved to Weekly membership (Pay-as-you-go).
                </p>
                <p className="text-xs text-orange-300 font-medium">
                  Please renew to continue enjoying member benefits!
                </p>
              </div>
            </div>
          </div>
        )}

        {status.freeWeek && (
          <div className="flex items-center gap-2 text-green-500 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>Free Week Active!</span>
          </div>
        )}

        {status.membershipExpiry && (
          <div className="flex items-center gap-2 text-gray-300">
            <Calendar className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-medium">Expires</p>
              <p className="text-xs text-gray-400">
                {new Date(status.membershipExpiry).toLocaleDateString('en-GB')}
              </p>
            </div>
          </div>
        )}

        {status.balanceDue > 0 && (
          <div className="flex items-center gap-2 text-gray-300">
            <CreditCard className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm font-medium">Balance Due</p>
              <p className="text-lg font-bold text-red-500">£{status.balanceDue.toFixed(2)}</p>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-700 space-y-2 text-xs text-gray-400">
          <p><strong>Weekly (£3):</strong> Pay per attendance</p>
          <p><strong>Monthly (£10):</strong> Unlimited bookings for 1 month</p>
          <p><strong>Yearly (£100):</strong> Unlimited bookings for 1 year</p>
        </div>
      </CardContent>
    </Card>
  );
}
