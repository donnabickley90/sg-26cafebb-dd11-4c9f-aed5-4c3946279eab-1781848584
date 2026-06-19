import { useState, useEffect } from "react";
import { ThemedCard, ThemedCardHeader, ThemedCardTitle, ThemedCardContent } from "@/components/ui/themed-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowLeft,
  Home as HomeIcon,
  PartyPopper
} from "lucide-react";
import {
  PREDEFINED_ROOMS,
  getDailyTasksDueToday,
  completeCleaningTask,
  getCleaningTasksByRoom,
  type CleaningTask
} from "@/lib/storage";
import Link from "next/link";
import { useRouter } from "next/router";

export default function DailyReset() {
  const router = useRouter();
  const [tasksByRoom, setTasksByRoom] = useState<Map<string, CleaningTask[]>>(new Map());
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    const today = new Date().toISOString().split("T")[0];
    const allDailyTasks = getDailyTasksDueToday();
    
    // Group by room
    const grouped = new Map<string, CleaningTask[]>();
    PREDEFINED_ROOMS.forEach(room => {
      const roomTasks = allDailyTasks.filter(t => t.room === room);
      if (roomTasks.length > 0) {
        grouped.set(room, roomTasks);
      }
    });
    
    setTasksByRoom(grouped);
    
    // Calculate totals
    const allTasks = getCleaningTasksByRoom("");
    const dailyTasks = allTasks.filter(t => t.frequency === "daily");
    const completed = dailyTasks.filter(t => t.lastCompleted === today);
    
    setTotalCount(dailyTasks.length);
    setCompletedCount(completed.length);
    
    // Check if all done
    if (dailyTasks.length > 0 && completed.length === dailyTasks.length) {
      setShowSuccess(true);
    }
  };

  const handleToggleTask = (taskId: string) => {
    completeCleaningTask(taskId);
    loadTasks();
  };

  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const tasksRemaining = totalCount - completedCount;

  if (showSuccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <ThemedCard variant="primary" className="max-w-md w-full">
          <ThemedCardContent className="pt-6 text-center space-y-6">
            <PartyPopper className="w-20 h-20 mx-auto text-primary" />
            <div className="space-y-2">
              <h2 className="text-3xl font-heading font-bold text-foreground">
                Daily Reset Complete!
              </h2>
              <p className="text-muted-foreground">
                All {totalCount} daily tasks are done. Amazing work!
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/cleaning">
                <Button className="w-full" variant="default">
                  Back to Cleaning Dashboard
                </Button>
              </Link>
              <Link href="/">
                <Button className="w-full" variant="outline">
                  Go to Home
                </Button>
              </Link>
            </div>
          </ThemedCardContent>
        </ThemedCard>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Link href="/cleaning">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3 flex-1">
            <CheckCircle2 className="w-8 h-8 text-primary" />
            <div>
              <h1 className="font-heading text-3xl font-bold text-foreground">Daily Reset</h1>
              <p className="text-sm text-muted-foreground">Check off today's daily tasks</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <ThemedCard variant="primary">
          <ThemedCardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-2xl font-bold text-primary">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{completedCount} of {totalCount} tasks complete</span>
                <span>{tasksRemaining} remaining</span>
              </div>
            </div>
          </ThemedCardContent>
        </ThemedCard>
      </div>

      {/* Tasks by Room */}
      {tasksByRoom.size === 0 ? (
        <ThemedCard variant="glow">
          <ThemedCardContent className="pt-6 text-center py-12">
            <Sparkles className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
            <p className="text-muted-foreground mb-4">
              No daily tasks due today. Great work!
            </p>
            <Link href="/cleaning">
              <Button variant="outline">Back to Cleaning Dashboard</Button>
            </Link>
          </ThemedCardContent>
        </ThemedCard>
      ) : (
        <div className="space-y-4">
          {Array.from(tasksByRoom.entries()).map(([room, tasks]) => (
            <ThemedCard key={room} variant="glow">
              <ThemedCardHeader>
                <ThemedCardTitle className="flex items-center gap-2">
                  <HomeIcon className="w-5 h-5 text-accent" />
                  {room}
                </ThemedCardTitle>
              </ThemedCardHeader>
              <ThemedCardContent>
                <div className="space-y-2">
                  {tasks.map(task => {
                    const today = new Date().toISOString().split("T")[0];
                    const isComplete = task.lastCompleted === today;
                    
                    return (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => handleToggleTask(task.id)}
                      >
                        {isComplete ? (
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${isComplete ? "line-through text-muted-foreground" : ""}`}>
                            {task.task}
                          </p>
                          {task.notes && (
                            <p className="text-xs text-muted-foreground mt-1">{task.notes}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ThemedCardContent>
            </ThemedCard>
          ))}
        </div>
      )}
    </div>
  );
}