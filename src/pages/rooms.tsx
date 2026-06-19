import { useState, useEffect } from "react";
import { ThemedCard, ThemedCardHeader, ThemedCardTitle, ThemedCardContent } from "@/components/ui/themed-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home,
  UtensilsCrossed,
  Armchair,
  Bed,
  Bath,
  WashingMachine,
  DoorOpen,
  Grid3x3,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { getRoomTasks, getRoomProgress } from "@/lib/storage";
import Link from "next/link";

const ROOMS = [
  { id: "kitchen", name: "Kitchen", icon: UtensilsCrossed },
  { id: "lounge", name: "Lounge Room", icon: Armchair },
  { id: "dining", name: "Dining Room", icon: Home },
  { id: "master-bedroom", name: "Master Bedroom", icon: Bed },
  { id: "master-bathroom", name: "Master Bathroom", icon: Bath },
  { id: "guest-bathroom", name: "Guest Bathroom", icon: Bath },
  { id: "guest-toilet", name: "Guest Toilet", icon: Bath },
  { id: "spare-toilet", name: "Spare Toilet", icon: Bath },
  { id: "laundry", name: "Laundry", icon: WashingMachine },
  { id: "activity-room", name: "Activity Room", icon: Grid3x3 },
  { id: "entry", name: "Entry Way", icon: DoorOpen },
];

export default function RoomsPage() {
  const [roomsProgress, setRoomsProgress] = useState<Record<string, { total: number; completed: number; percentage: number }>>({});

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const progress: Record<string, { total: number; completed: number; percentage: number }> = {};
    ROOMS.forEach(room => {
      const tasks = getRoomTasks(room.id);
      const completed = tasks.filter(t => t.lastCompleted === today).length;
      const total = tasks.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      progress[room.id] = { total, completed, percentage };
    });
    setRoomsProgress(progress);
  }, []);

  const overallProgress = Object.values(roomsProgress).reduce((acc, room) => {
    acc.total += room.total;
    acc.completed += room.completed;
    return acc;
  }, { total: 0, completed: 0 });

  const overallPercentage = overallProgress.total > 0 
    ? Math.round((overallProgress.completed / overallProgress.total) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
            <Grid3x3 className="w-8 h-8 text-primary" />
            All Rooms
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage cleaning tasks by room
          </p>
        </div>
      </div>

      {/* Overall Progress */}
      <ThemedCard variant="primary">
        <ThemedCardHeader>
          <ThemedCardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Overall Progress
          </ThemedCardTitle>
        </ThemedCardHeader>
        <ThemedCardContent>
          <div className="flex items-center gap-6">
            <ProgressRing progress={overallPercentage} size={100} />
            <div>
              <p className="text-2xl font-bold">{overallProgress.completed}/{overallProgress.total}</p>
              <p className="text-sm text-muted-foreground">Tasks completed across all rooms</p>
            </div>
          </div>
        </ThemedCardContent>
      </ThemedCard>

      {/* Room Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ROOMS.map((room) => {
          const Icon = room.icon;
          const progress = roomsProgress[room.id] || { total: 0, completed: 0, percentage: 0 };
          
          return (
            <Link key={room.id} href={`/cleaning/room/${room.id}`}>
              <ThemedCard variant="glow" className="hover:scale-105 transition-all duration-200 cursor-pointer h-full">
                <ThemedCardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-primary/10">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg">{room.name}</h3>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <ProgressRing progress={progress.percentage} size={70} />
                    <div>
                      <p className="text-xl font-bold">{progress.completed}/{progress.total}</p>
                      <p className="text-xs text-muted-foreground">tasks complete</p>
                    </div>
                  </div>

                  {progress.percentage === 100 && progress.total > 0 && (
                    <Badge variant="default" className="mt-3 w-full justify-center">
                      ✨ Complete!
                    </Badge>
                  )}
                </ThemedCardContent>
              </ThemedCard>
            </Link>
          );
        })}
      </div>
    </div>
  );
}