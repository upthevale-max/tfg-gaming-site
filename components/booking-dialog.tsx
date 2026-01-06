"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-hot-toast";
import { useGames } from "@/lib/hooks/use-bookings";

interface Game {
  id: string;
  name: string;
}

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableNumber: number | null;
  onSuccess: () => void;
}

export function BookingDialog({
  open,
  onOpenChange,
  tableNumber,
  onSuccess,
}: BookingDialogProps) {
  // Use SWR hook for games (automatically cached and deduplicated)
  const { games } = useGames();
  
  const [selectedGame, setSelectedGame] = useState("");
  const [playersNeeded, setPlayersNeeded] = useState("2");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedGame) {
      toast.error("Please select a game");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: selectedGame,
          tableNumber,
          playersNeeded: parseInt(playersNeeded),
          notes,
        }),
      });

      if (res.ok) {
        onSuccess();
        setSelectedGame("");
        setPlayersNeeded("2");
        setNotes("");
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to create booking");
      }
    } catch (error) {
      toast.error("Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-green-500/50">
        <DialogHeader>
          <DialogTitle className="text-green-500">Book Table {tableNumber}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Create a new booking for upcoming Monday
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="game" className="text-white">Game</Label>
            <Select value={selectedGame} onValueChange={setSelectedGame}>
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue placeholder="Select a game" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {games.map((game: Game) => (
                  <SelectItem key={game.id} value={game.id}>
                    {game.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="players" className="text-white">Players Needed</Label>
            <Input
              id="players"
              type="number"
              min="1"
              max="10"
              value={playersNeeded}
              onChange={(e) => setPlayersNeeded(e.target.value)}
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-white">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-gray-800 border-gray-700"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-green-500 hover:bg-green-600 text-black"
            >
              {loading ? "Creating..." : "Create Booking"}
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1 border-gray-700"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
