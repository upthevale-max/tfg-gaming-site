"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dice6, Calendar, Users, Trophy, ChevronRight } from "lucide-react";
import Image from "next/image";

interface Game {
  id: string;
  name: string;
  iconUrl?: string;
}

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession() || {};
  const [games, setGames] = useState<Game[]>([]);
  const [gamesLoading, setGamesLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await fetch("/api/games/public");
        if (res.ok) {
          const data = await res.json();
          setGames(data);
        }
      } catch (error) {
        console.error("Failed to fetch games:", error);
      } finally {
        setGamesLoading(false);
      }
    };

    fetchGames();
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <Dice6 className="h-12 w-12 text-green-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 to-transparent"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="flex justify-center mb-8">
            <Dice6 className="h-24 w-24 text-green-500 animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
            TFG Gaming Club
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join Stafford's premier tabletop gaming community. Book tables, play games, and connect with fellow wargaming enthusiasts every Monday night.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-green-500 hover:bg-green-600 text-black font-bold text-lg px-8">
                Join Now
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="border-green-500 text-green-500 hover:bg-green-500/10 text-lg px-8">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-green-500">Why Join TFG?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-lg border border-green-500/30 hover:border-green-500/60 transition-all hover:scale-105">
              <Calendar className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">Easy Booking</h3>
              <p className="text-gray-400">
                Reserve your table online for Monday night gaming sessions. See what games are being played and join existing tables.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-lg border border-green-500/30 hover:border-green-500/60 transition-all hover:scale-105">
              <Users className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">Active Community</h3>
              <p className="text-gray-400">
                Connect with passionate gamers in Stafford. Join our Discord community and make new friends who share your hobby.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-lg border border-green-500/30 hover:border-green-500/60 transition-all hover:scale-105">
              <Trophy className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">Multiple Games</h3>
              <p className="text-gray-400 mb-4">
                {gamesLoading ? (
                  "Loading available games..."
                ) : games.length > 0 ? (
                  "Play your favourite games with dedicated space and terrain. Here are some of our top games:"
                ) : (
                  "Play your favourite tabletop wargames with dedicated space and terrain."
                )}
              </p>
              {!gamesLoading && games.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {games.map((game) => (
                    <span
                      key={game.id}
                      className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full border border-green-500/30"
                    >
                      {game.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Photo Gallery Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-green-500">Our Community in Action</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Team Photo - Featured Large */}
            <div className="md:col-span-2 lg:col-span-2 relative aspect-video bg-gray-800 rounded-lg overflow-hidden group">
              <Image
                src="/gallery-team-photo.jpg"
                alt="TFG Gaming Club members at The Emporium"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 66vw, 50vw"
              />
            </div>

            {/* Member Portrait */}
            <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden group">
              <Image
                src="/gallery-member-portrait.jpg"
                alt="Club member enjoying the gaming session"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>

            {/* Venue Wide Shot */}
            <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden group">
              <Image
                src="/gallery-venue-wide.jpg"
                alt="The Emporium gaming venue with multiple tables"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>

            {/* Terrain Setup */}
            <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden group">
              <Image
                src="/gallery-terrain-setup.jpg"
                alt="Detailed terrain setup for tabletop wargaming"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>

            {/* Gaming Action */}
            <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden group">
              <Image
                src="/gallery-gaming-action.jpg"
                alt="Players reacting to an exciting game moment"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>

            {/* Racing Game */}
            <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden group">
              <Image
                src="/gallery-racing-game.jpg"
                alt="Colorful gaming mat with vehicles and miniatures"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Club Info Section */}
      <section className="py-16 px-4 bg-black/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8 text-green-500">Monday Night Gaming</h2>
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-lg border border-green-500/30">
            <p className="text-2xl text-white mb-4">
              <strong className="text-green-500">Every Monday</strong> | 6:00pm - 10:30pm
            </p>
            <p className="text-xl text-gray-300 mb-6">
              The Emporium Stafford (Upstairs)
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-gray-400">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-green-500">Weekly:</span> £3
              </div>
              <div className="hidden sm:block text-gray-600">|</div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-green-500">Monthly:</span> £10
              </div>
              <div className="hidden sm:block text-gray-600">|</div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-green-500">Yearly:</span> £100
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">Ready to Roll the Dice?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Create your account and start booking tables for Monday night gaming sessions.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-green-500 hover:bg-green-600 text-black font-bold text-lg px-12">
              Get Started
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
