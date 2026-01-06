"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Users, Shield, CreditCard, Gift, Calendar, AlertCircle, Search, Filter, KeyRound } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAdminUsers } from "@/lib/hooks/use-bookings";

interface User {
  id: string;
  username: string;
  realName: string;
  dob: string;
  discordUsername: string;
  membershipType: string;
  membershipExpiry: string | null;
  membershipExpiredAt: string | null;
  isAdmin: boolean;
  balanceDue: number;
  freeWeek: boolean;
}

// Helper function to check if user is within 2-week renewal window
function isWithinRenewalWindow(membershipExpiredAt: string | null): boolean {
  if (!membershipExpiredAt) return false;
  
  const now = new Date();
  const expiredDate = new Date(membershipExpiredAt);
  const twoWeeksInMs = 14 * 24 * 60 * 60 * 1000;
  const timeSinceExpiry = now.getTime() - expiredDate.getTime();
  
  return timeSinceExpiry >= 0 && timeSinceExpiry <= twoWeeksInMs;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { status } = useSession() || {};
  const { users, isLoading, isError, mutate } = useAdminUsers();
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [membershipFilter, setMembershipFilter] = useState("all");
  const [adminFilter, setAdminFilter] = useState("all");
  const [balanceFilter, setBalanceFilter] = useState("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
  }, [status, router]);

  useEffect(() => {
    if (isError) {
      toast.error("Failed to fetch users - retrying...");
      router.push("/dashboard");
    }
  }, [isError, router]);

  // Filter and search users
  const filteredUsers = useMemo(() => {
    return users.filter((user: User) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        user.realName.toLowerCase().includes(searchLower) ||
        user.username.toLowerCase().includes(searchLower) ||
        user.discordUsername.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // Membership filter
      if (membershipFilter !== "all" && user.membershipType !== membershipFilter) {
        return false;
      }

      // Admin filter
      if (adminFilter === "admin" && !user.isAdmin) return false;
      if (adminFilter === "non-admin" && user.isAdmin) return false;

      // Balance filter
      if (balanceFilter === "has-balance" && user.balanceDue <= 0) return false;
      if (balanceFilter === "no-balance" && user.balanceDue > 0) return false;

      return true;
    });
  }, [users, searchQuery, membershipFilter, adminFilter, balanceFilter]);

  const handlePromote = async (userId: string, currentIsAdmin: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/promote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAdmin: !currentIsAdmin }),
      });

      if (res.ok) {
        toast.success(currentIsAdmin ? "Admin removed" : "Admin promoted");
        mutate();
      } else {
        toast.error("Failed to update user");
      }
    } catch (error) {
      toast.error("Failed to update user");
    }
  };

  const handleMembershipChange = async (userId: string, membershipType: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/membership`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membershipType }),
      });

      if (res.ok) {
        toast.success("Membership updated");
        mutate();
      } else {
        toast.error("Failed to update membership");
      }
    } catch (error) {
      toast.error("Failed to update membership");
    }
  };

  const handleMarkPaid = async (userId: string, balanceDue: number) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/mark-paid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: balanceDue }),
      });

      if (res.ok) {
        toast.success("Marked as paid");
        mutate();
      } else {
        toast.error("Failed to mark as paid");
      }
    } catch (error) {
      toast.error("Failed to mark as paid");
    }
  };

  const handleFreeWeek = async (userId: string, currentFreeWeek: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/free-week`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ freeWeek: !currentFreeWeek }),
      });

      if (res.ok) {
        toast.success(currentFreeWeek ? "Free week removed" : "Free week added");
        mutate();
      } else {
        toast.error("Failed to toggle free week");
      }
    } catch (error) {
      toast.error("Failed to toggle free week");
    }
  };

  const handleResetPassword = async (userId: string, userName: string) => {
    const newPassword = prompt(`Enter new password for ${userName} (min 6 characters):`);
    
    if (!newPassword) return;
    
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      if (res.ok) {
        toast.success("Password reset successfully");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to reset password");
      }
    } catch (error) {
      toast.error("Failed to reset password");
    }
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
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-green-500 mb-2">
              User Management
            </h1>
            <p className="text-gray-400">
              Showing {filteredUsers.length} of {users.length} members
            </p>
          </div>
          <Button onClick={() => router.push("/admin")} variant="outline">
            Back to Admin
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-green-500/30">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm text-gray-400 flex items-center gap-1">
                  <Search className="h-4 w-4" />
                  Search
                </label>
                <Input
                  placeholder="Name, username, discord..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                />
              </div>

              {/* Membership Filter */}
              <div className="space-y-2">
                <label className="text-sm text-gray-400 flex items-center gap-1">
                  <Filter className="h-4 w-4" />
                  Membership
                </label>
                <Select value={membershipFilter} onValueChange={setMembershipFilter}>
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="YEARLY">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Admin Filter */}
              <div className="space-y-2">
                <label className="text-sm text-gray-400 flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  Role
                </label>
                <Select value={adminFilter} onValueChange={setAdminFilter}>
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="admin">Admins Only</SelectItem>
                    <SelectItem value="non-admin">Non-Admins</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Balance Filter */}
              <div className="space-y-2">
                <label className="text-sm text-gray-400 flex items-center gap-1">
                  <CreditCard className="h-4 w-4" />
                  Balance
                </label>
                <Select value={balanceFilter} onValueChange={setBalanceFilter}>
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">All Balances</SelectItem>
                    <SelectItem value="has-balance">Has Balance Due</SelectItem>
                    <SelectItem value="no-balance">No Balance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Clear Filters */}
            {(searchQuery || membershipFilter !== "all" || adminFilter !== "all" || balanceFilter !== "all") && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setMembershipFilter("all");
                    setAdminFilter("all");
                    setBalanceFilter("all");
                  }}
                  className="text-gray-400"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {filteredUsers.length === 0 ? (
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-500/30">
              <CardContent className="p-12 text-center">
                <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No users match your filters</p>
              </CardContent>
            </Card>
          ) : (
            filteredUsers.map((user: User) => (
            <Card key={user.id} className="bg-gradient-to-br from-gray-900 to-gray-800 border-green-500/30">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-xl text-white">{user.realName}</CardTitle>
                      {user.isAdmin && (
                        <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                      {user.freeWeek && (
                        <Badge className="bg-green-500/20 text-green-500 border-green-500/50">
                          <Gift className="h-3 w-3 mr-1" />
                          Free Week
                        </Badge>
                      )}
                      {isWithinRenewalWindow(user.membershipExpiredAt) && (
                        <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/50">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Needs Renewal
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                      <span>👤 {user.username}</span>
                      <span>🗣️ {user.discordUsername}</span>
                      <span>🎂 {new Date(user.dob).toLocaleDateString('en-GB')}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePromote(user.id, user.isAdmin)}
                      className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10"
                    >
                      <Shield className="h-4 w-4 mr-1" />
                      {user.isAdmin ? "Remove Admin" : "Make Admin"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFreeWeek(user.id, user.freeWeek)}
                      className="border-green-500/50 text-green-500 hover:bg-green-500/10"
                    >
                      <Gift className="h-4 w-4 mr-1" />
                      {user.freeWeek ? "Remove Free Week" : "Add Free Week"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResetPassword(user.id, user.realName)}
                      className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                    >
                      <KeyRound className="h-4 w-4 mr-1" />
                      Reset Password
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Membership */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Membership Type
                    </label>
                    <Select
                      value={user.membershipType}
                      onValueChange={(value) => handleMembershipChange(user.id, value)}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="WEEKLY">Weekly (£3)</SelectItem>
                        <SelectItem value="MONTHLY">Monthly (£10)</SelectItem>
                        <SelectItem value="YEARLY">Yearly (£100)</SelectItem>
                      </SelectContent>
                    </Select>
                    {user.membershipExpiry && (
                      <p className="text-xs text-gray-500">
                        Expires: {new Date(user.membershipExpiry).toLocaleDateString('en-GB')}
                      </p>
                    )}
                    {isWithinRenewalWindow(user.membershipExpiredAt) && user.membershipExpiredAt && (
                      <div className="text-xs space-y-1 p-2 bg-orange-500/10 border border-orange-500/30 rounded">
                        <p className="text-orange-400 font-semibold">
                          ⚠ Expired: {new Date(user.membershipExpiredAt).toLocaleDateString('en-GB')}
                        </p>
                        <p className="text-orange-300">
                          Now on Weekly (£3/week). Select membership above to renew.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Balance */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 flex items-center gap-1">
                      <CreditCard className="h-4 w-4" />
                      Balance Due
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={`£${user.balanceDue.toFixed(2)}`}
                        disabled
                        className="bg-gray-800 border-gray-700"
                      />
                      {user.balanceDue > 0 && (
                        <Button
                          size="sm"
                          onClick={() => handleMarkPaid(user.id, user.balanceDue)}
                          className="bg-green-500 hover:bg-green-600 text-black"
                        >
                          Mark Paid
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
