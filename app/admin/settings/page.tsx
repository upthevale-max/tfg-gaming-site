"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { toast } from "react-hot-toast";
import { useSettings } from "@/lib/hooks/use-bookings";

export default function AdminSettingsPage() {
  const router = useRouter();
  const { status } = useSession() || {};
  const { tableCount: initialTableCount, isLoading, isError } = useSettings();
  const [tableCount, setTableCount] = useState(15);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
  }, [status, router]);

  useEffect(() => {
    if (isError) {
      toast.error("Failed to fetch settings - retrying...");
    }
  }, [isError]);

  // Update local state when data is loaded
  useEffect(() => {
    if (initialTableCount) {
      setTableCount(initialTableCount);
    }
  }, [initialTableCount]);

  const handleSave = async () => {
    if (tableCount < 1 || tableCount > 50) {
      toast.error("Table count must be between 1 and 50");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableCount: parseInt(tableCount.toString()) }),
      });

      if (res.ok) {
        toast.success("Settings saved successfully");
      } else {
        toast.error("Failed to save settings");
      }
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
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
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-green-500 mb-2">
              Club Settings
            </h1>
            <p className="text-gray-400">Configure club operational settings</p>
          </div>
          <Button onClick={() => router.push("/admin")} variant="outline">
            Back to Admin
          </Button>
        </div>

        <Card className="bg-gradient-to-br from-yellow-900/50 to-gray-800 border-yellow-500/50">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-500">
              <Settings className="h-6 w-6 mr-2" />
              Table Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tableCount" className="text-white text-lg">
                  Number of Available Tables
                </Label>
                <p className="text-sm text-gray-400">
                  Set the total number of tables available for booking each Monday.
                </p>
                <div className="flex gap-4 items-end">
                  <div className="flex-1 max-w-xs">
                    <Input
                      id="tableCount"
                      type="number"
                      min="1"
                      max="50"
                      value={tableCount}
                      onChange={(e) => setTableCount(parseInt(e.target.value) || 1)}
                      className="bg-gray-800 border-gray-700 text-white text-lg"
                    />
                  </div>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-green-500 hover:bg-green-600 text-black"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400">
                  <strong className="text-white">Current Setting:</strong> {tableCount} tables available
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-3">About Settings</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>• Changes take effect immediately</p>
              <p>• Existing bookings are not affected by table count changes</p>
              <p>• Recommended: 10-20 tables for optimal club operations</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
