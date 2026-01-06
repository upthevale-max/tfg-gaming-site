"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dice6, LogOut, UserCog, Settings } from "lucide-react";
import { useEffect, useState } from "react";

export function Navigation() {
  const { data: session, status } = useSession() || {};
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (session?.user?.email) {
      fetch("/api/membership/status")
        .then((res) => res.json())
        .then((data) => {
          if (data.isAdmin) {
            setIsAdmin(true);
          }
        })
        .catch(() => {});
    }
  }, [session]);

  if (!mounted) {
    return (
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-black/80 border-b border-green-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Dice6 className="h-8 w-8 text-green-500" />
              <span className="text-xl font-bold text-white">TFG Gaming Club</span>
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  const isAuthenticated = status === "authenticated" && session;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-black/80 border-b border-green-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Dice6 className="h-8 w-8 text-green-500" />
            <span className="text-xl font-bold text-white">TFG Gaming Club</span>
          </Link>

          <div className="flex items-center space-x-1">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-white hover:text-green-500">
                    Home
                  </Button>
                </Link>
                <Link href="/bookings">
                  <Button variant="ghost" className="text-white hover:text-green-500">
                    Bookings
                  </Button>
                </Link>
                <Link href="/membership">
                  <Button variant="ghost" className="text-white hover:text-green-500">
                    Membership
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="ghost" className="text-white hover:text-green-500">
                    About TFG
                  </Button>
                </Link>
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="ghost" className="text-white hover:text-green-500">
                      <UserCog className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Link href="/settings">
                  <Button variant="ghost" className="text-white hover:text-green-500">
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-white hover:text-red-500"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/about">
                  <Button variant="ghost" className="text-white hover:text-green-500">
                    About TFG
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="ghost" className="text-white hover:text-green-500">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-green-500 hover:bg-green-600 text-black">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
