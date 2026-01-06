import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, Users, Calendar, CreditCard, MessageSquare, ParkingCircle, Hammer } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-green-500">
            About TFG Gaming Club
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Too Fat Goblins - Stafford's premier tabletop gaming community
          </p>
        </div>

        {/* Main Info Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Location & Time */}
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-green-500/50">
            <CardHeader>
              <CardTitle className="flex items-center text-green-500">
                <MapPin className="h-6 w-6 mr-2" />
                Location & Times
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <div>
                <p className="font-semibold text-white mb-1">Venue</p>
                <p>The Emporium Stafford (Upstairs)</p>
                <p className="text-sm text-gray-400">Stafford</p>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Every Monday Night</p>
                  <p className="text-lg">6:00pm - 10:30pm</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Membership Pricing */}
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-green-500/50">
            <CardHeader>
              <CardTitle className="flex items-center text-green-500">
                <CreditCard className="h-6 w-6 mr-2" />
                Membership Prices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Weekly Attendance</span>
                  <span className="font-bold text-white text-lg">£3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Monthly Membership</span>
                  <span className="font-bold text-white text-lg">£10</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Yearly Membership</span>
                  <span className="font-bold text-white text-lg">£100</span>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400">
                  Register and log in to view payment information
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Organisers */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-green-500/50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-500">
              <Users className="h-6 w-6 mr-2" />
              Club Organisers & Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <div>
              <p className="font-semibold text-white mb-2">Organisers</p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-gray-800/50 px-4 py-2 rounded-lg">
                  Jonathan Clarke
                </div>
                <div className="bg-gray-800/50 px-4 py-2 rounded-lg">
                  Jace Winter
                </div>
              </div>
            </div>
            <div>
              <p className="font-semibold text-white mb-2">Supported By</p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-gray-800/50 px-4 py-2 rounded-lg">
                  Phil (Too Fat Goblins)
                </div>
                <div className="bg-gray-800/50 px-4 py-2 rounded-lg">
                  Matt Sargeant
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Games & Terrain */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Supported Games */}
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-green-500/50">
            <CardHeader>
              <CardTitle className="flex items-center text-green-500">
                <Calendar className="h-6 w-6 mr-2" />
                Supported Games
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-gray-300">
                <div className="bg-gray-800/50 px-4 py-3 rounded-lg">
                  💀 Warhammer 40,000
                </div>
                <div className="bg-gray-800/50 px-4 py-3 rounded-lg">
                  ⚔️ Necromunda
                </div>
                <div className="bg-gray-800/50 px-4 py-3 rounded-lg">
                  🎖️ Bolt Action
                </div>
                <div className="bg-gray-800/50 px-4 py-3 rounded-lg">
                  🎲 And many more!
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terrain */}
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-green-500/50">
            <CardHeader>
              <CardTitle className="flex items-center text-green-500">
                <Hammer className="h-6 w-6 mr-2" />
                Terrain & Tables
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <p>
                We provide quality terrain and dedicated gaming tables for all your tabletop battles.
              </p>
              <div className="space-y-2 text-sm">
                <p>• Multiple themed terrain sets</p>
                <p>• 15 gaming tables available</p>
                <p>• Bring your own terrain welcome</p>
                <p>• Storage available for members</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Parking */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-green-500/50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-500">
              <ParkingCircle className="h-6 w-6 mr-2" />
              Parking Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-300">
            <p>Street parking is available in the surrounding area. Please be mindful of parking restrictions and local residents.</p>
            <div className="bg-gray-800/50 p-4 rounded-lg text-sm">
              <p className="text-yellow-500 font-semibold mb-2">⚠️ Important</p>
              <p>Check street signs for parking times and restrictions. Some areas have residents-only parking in the evenings.</p>
            </div>
          </CardContent>
        </Card>

        {/* Discord */}
        <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-500/50">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-400">
              <MessageSquare className="h-6 w-6 mr-2" />
              Join Our Discord Community
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">
              Connect with other members, discuss tactics, arrange games, and stay updated with club news!
            </p>
            <a href="https://discord.gg/xRqZz9g2xd" target="_blank" rel="noopener noreferrer">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                <MessageSquare className="h-4 w-4 mr-2" />
                Join Discord Server
              </Button>
            </a>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center py-8">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Join?</h2>
          <p className="text-gray-400 mb-6">Create an account and start booking your tables today!</p>
          <Link href="/register">
            <Button size="lg" className="bg-green-500 hover:bg-green-600 text-black font-bold">
              Register Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
