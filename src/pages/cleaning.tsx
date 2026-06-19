import { useState, useEffect } from "react";
import { ThemedCard, ThemedCardHeader, ThemedCardTitle, ThemedCardDescription, ThemedCardContent } from "@/components/ui/themed-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Home as HomeIcon,
  Sparkles,
  CheckCircle2,
  Plus,
  Calendar,
  Zap,
  TrendingUp,
  ListChecks,
  ChevronRight
} from "lucide-react";
import {
  PREDEFINED_ROOMS,
  getTodaysCleaningProgress,
  getCleaningStreak,
  getAllRoomsProgress,
  getDailyTasksDueToday,
  type RoomProgress
} from "@/lib/storage";
import Link from "next/link";

export default function CleaningDashboard() {
  const [todayProgress, setTodayProgress] = useState({ complete: 0, total: 0, percentage: 0 });
  const [streak, setStreak] = useState({ current: 0, longest: 0 });
  const [roomsProgress, setRoomsProgress] = useState<RoomProgress[]>([]);
  const [tasksToday, setTasksToday] = useState<number>(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTodayProgress(getTodaysCleaningProgress());
    setStreak(getCleaningStreak());
    setRoomsProgress(getAllRoomsProgress());
    setTasksToday(getDailyTasksDueToday().length);
  };

  const getRoomIcon = (room: string) => {
    return <HomeIcon className="w-5 h-5" />;
  };

  const getRoomPercentage = (progress: RoomProgress) => {
    const total = progress.dailyTotal + progress.weeklyTotal;
    const complete = progress.dailyComplete + progress.weeklyComplete;
    return total > 0 ? Math.round((complete / total) * 100) : 0;
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
              Chaos Cleaner
            </h1>
          </div>
          <div className="flex gap-2">
            <Link href="/cleaning/daily-reset">
              <Button variant="default" className="gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Daily Reset
              </Button>
            </Link>
            <Link href="/cleaning/weekly-reset">
              <Button variant="outline" className="gap-2">
                <ListChecks className="w-4 h-4" />
                Weekly Reset
              </Button>
            </Link>
          </div>
        </div>
        <p className="text-muted-foreground">Room-based cleaning command centre</p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ThemedCard variant="primary">
          <ThemedCardHeader>
            <ThemedCardTitle className="text-lg">Today's Progress</ThemedCardTitle>
          </ThemedCardHeader>
          <ThemedCardContent>
            <div className="flex items-center justify-center">
              <ProgressRing progress={todayProgress.percentage} size={120} />
            </div>
            <div className="mt-4 text-center space-y-1">
              <p className="text-2xl font-bold text-foreground">
                {todayProgress.complete}/{todayProgress.total}
              </p>
              <p className="text-sm text-muted-foreground">Daily tasks complete</p>
            </div>
          </ThemedCardContent>
        </ThemedCard>

        <ThemedCard variant="glow">
          <ThemedCardHeader>
            <ThemedCardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent" />
              Current Streak
            </ThemedCardTitle>
          </ThemedCardHeader>
          <ThemedCardContent>
            <div className="text-center space-y-2">
              <div className="text-5xl font-bold text-primary">{streak.current}</div>
              <p className="text-sm text-muted-foreground">days in a row</p>
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  <span>Best: {streak.longest} days</span>
                </div>
              </div>
            </div>
          </ThemedCardContent>
        </ThemedCard>

        <ThemedCard variant="glow">
          <ThemedCardHeader>
            <ThemedCardTitle className="text-lg">Tasks Due Today</ThemedCardTitle>
          </ThemedCardHeader>
          <ThemedCardContent>
            <div className="text-center space-y-2">
              <div className="text-5xl font-bold text-foreground">{tasksToday}</div>
              <p className="text-sm text-muted-foreground">daily tasks waiting</p>
              <Link href="/cleaning/daily-reset">
                <Button variant="outline" size="sm" className="mt-2 gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Start Daily Reset
                </Button>
              </Link>
            </div>
          </ThemedCardContent>
        </ThemedCard>
      </div>

      {/* Room Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-heading font-semibold text-foreground">All Rooms</h2>
          <Link href="/cleaning/add-task">
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Task
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PREDEFINED_ROOMS.map((room) => {
            const progress = roomsProgress.find(r => r.room === room);
            const percentage = progress ? getRoomPercentage(progress) : 0;
            
            return (
              <Link key={room} href={`/cleaning/room/${encodeURIComponent(room)}`}>
                <ThemedCard variant="glow" className="hover:border-primary/50 transition-colors cursor-pointer">
                  <ThemedCardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getRoomIcon(room)}
                        <div>
                          <h3 className="font-semibold text-foreground">{room}</h3>
                          <p className="text-xs text-muted-foreground">
                            {progress ? `${progress.dailyComplete + progress.weeklyComplete}/${progress.dailyTotal + progress.weeklyTotal} tasks` : "No tasks"}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{percentage}%</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      
                      {progress && (
                        <div className="flex gap-2 pt-2">
                          {progress.dailyTotal > 0 && (
                            <Badge variant="outline" className="text-xs">
                              Daily: {progress.dailyComplete}/{progress.dailyTotal}
                            </Badge>
                          )}
                          {progress.weeklyTotal > 0 && (
                            <Badge variant="outline" className="text-xs">
                              Weekly: {progress.weeklyComplete}/{progress.weeklyTotal}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </ThemedCardContent>
                </ThemedCard>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <ThemedCard variant="glow">
        <ThemedCardHeader>
          <ThemedCardTitle>Quick Actions</ThemedCardTitle>
        </ThemedCardHeader>
        <ThemedCardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/cleaning/daily-reset">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-xs">Daily Reset</span>
              </Button>
            </Link>
            <Link href="/cleaning/weekly-reset">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <ListChecks className="w-5 h-5" />
                <span className="text-xs">Weekly Reset</span>
              </Button>
            </Link>
            <Link href="/deep-clean">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <Calendar className="w-5 h-5" />
                <span className="text-xs">Deep Clean</span>
              </Button>
            </Link>
            <Link href="/cleaning/add-task">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <Plus className="w-5 h-5" />
                <span className="text-xs">Add Task</span>
              </Button>
            </Link>
          </div>
        </ThemedCardContent>
      </ThemedCard>
    </div>
  );
}