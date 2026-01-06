"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trophy, Trash2, Plus, Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAdminGames } from "@/lib/hooks/use-bookings";
import { Switch } from "@/components/ui/switch";

interface Game {
  id: string;
  name: string;
  iconUrl?: string;
  showOnFrontpage: boolean;
}

export default function AdminGamesPage() {
  const router = useRouter();
  const { status } = useSession() || {};
  const { games, isLoading, isError, mutate } = useAdminGames();
  const [newGameName, setNewGameName] = useState("");
  const [newGameIcon, setNewGameIcon] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
  }, [status, router]);

  useEffect(() => {
    if (isError) {
      toast.error("Failed to fetch games - retrying...");
    }
  }, [isError]);

  const handleAddGame = async () => {
    if (!newGameName.trim()) {
      toast.error("Please enter a game name");
      return;
    }

    setAdding(true);
    try {
      const res = await fetch("/api/games/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newGameName,
          iconUrl: newGameIcon || null,
        }),
      });

      if (res.ok) {
        toast.success("Game added successfully");
        setNewGameName("");
        setNewGameIcon("");
        mutate();
      } else {
        toast.error("Failed to add game");
      }
    } catch (error) {
      toast.error("Failed to add game");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    if (!confirm("Are you sure you want to delete this game?")) {
      return;
    }

    try {
      const res = await fetch(`/api/games/${gameId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Game deleted successfully");
        mutate();
      } else {
        toast.error("Failed to delete game");
      }
    } catch (error) {
      toast.error("Failed to delete game");
    }
  };

  const handleToggleFrontpage = async (gameId: string, currentValue: boolean) => {
    try {
      const res = await fetch(`/api/games/${gameId}/toggle-frontpage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showOnFrontpage: !currentValue }),
      });

      if (res.ok) {
        toast.success(!currentValue ? "Game will show on frontpage" : "Game hidden from frontpage");
        mutate();
      } else {
        toast.error("Failed to update game");
      }
    } catch (error) {
      toast.error("Failed to update game");
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
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-green-500 mb-2">
              Game Management
            </h1>
            <p className="text-gray-400">{games.length} games available</p>
          </div>
          <Button onClick={() => router.push("/admin")} variant="outline">
            Back to Admin
          </Button>
        </div>

        {/* Add New Game */}
        <Card className="bg-gradient-to-br from-green-900/50 to-gray-800 border-green-500/50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-500">
              <Plus className="h-6 w-6 mr-2" />
              Add New Game
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gameName" className="text-white">Game Name *</Label>
                  <Input
                    id="gameName"
                    placeholder="e.g., Warhammer 40k"
                    value={newGameName}
                    onChange={(e) => setNewGameName(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gameIcon" className="text-white">Icon URL (Optional)</Label>
                  <Input
                    id="gameIcon"
                    placeholder="https://media.istockphoto.com/id/942368914/vector/video-games-simple-icon-set-game-genres-and-attributes.jpg?s=170667a&w=0&k=20&c=r50BeHK8M1143azwVtIlbdgAcjAnyJ-Q439kCcGNlCg="
                    value={newGameIcon}
                    onChange={(e) => setNewGameIcon(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              </div>
              <Button
                onClick={handleAddGame}
                disabled={adding}
                className="bg-green-500 hover:bg-green-600 text-black"
              >
                <Plus className="h-4 w-4 mr-2" />
                {adding ? "Adding..." : "Add Game"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Games List */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Current Games</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {games.map((game: Game) => (
              <Card key={game.id} className="bg-gradient-to-br from-gray-900 to-gray-800 border-purple-500/30">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                          <Trophy className="h-6 w-6 text-purple-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-lg">{game.name}</h3>
                          {game.iconUrl && (
                            <p className="text-xs text-gray-500 truncate max-w-[200px]">
                              {game.iconUrl}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteGame(game.id)}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-500 border-red-500/50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Toggle for frontpage visibility */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        {game.showOnFrontpage ? (
                          <Eye className="h-4 w-4 text-green-500" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        )}
                        <span>Show on frontpage</span>
                      </div>
                      <Switch
                        checked={game.showOnFrontpage}
                        onCheckedChange={() => handleToggleFrontpage(game.id, game.showOnFrontpage)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
