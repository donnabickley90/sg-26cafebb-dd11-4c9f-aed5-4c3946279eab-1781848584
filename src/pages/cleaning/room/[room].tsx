import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ThemedCard, ThemedCardHeader, ThemedCardTitle, ThemedCardContent } from "@/components/ui/themed-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Home as HomeIcon
} from "lucide-react";
import {
  getCleaningTasksByRoom,
  completeCleaningTask,
  deleteCleaningTask,
  getRoomProgress,
  type CleaningTask,
  type RoomProgress
} from "@/lib/storage";
import Link from "next/link";

export default function RoomDetailPage() {
  const router = useRouter();
  const { room } = router.query;
  const roomName = typeof room === "string" ? decodeURIComponent(room) : "";

  const [tasks, setTasks] = useState<CleaningTask[]>([]);
  const [roomProgress, setRoomProgress] = useState<RoomProgress | null>(null);

  useEffect(() => {
    if (roomName) {
      loadRoomData();
    }
  }, [roomName]);

  const loadRoomData = () => {
    const roomTasks = getCleaningTasksByRoom(roomName);
    setTasks(roomTasks);
    setRoomProgress(getRoomProgress(roomName));
  };

  const handleToggleTask = (taskId: string) => {
    completeCleaningTask(taskId);
    loadRoomData();
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteCleaningTask(taskId);
      loadRoomData();
    }
  };

  const getMondayOfWeek = (date: Date): string => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().split("T")[0];
  };

  const isTaskComplete = (task: CleaningTask): boolean => {
    if (!task.lastCompleted) return false;
    const today = new Date().toISOString().split("T")[0];
    
    if (task.frequency === "daily") {
      return task.lastCompleted === today;
    } else if (task.frequency === "weekly") {
      const weekStart = getMondayOfWeek(new Date());
      const taskWeekStart = getMondayOfWeek(new Date(task.lastCompleted));
      return weekStart === taskWeekStart;
    } else if (task.frequency === "monthly") {
      return task.lastCompleted?.startsWith(today.substring(0, 7)) || false;
    } else if (task.frequency === "deep") {
      return !!task.lastCompleted;
    }
    return false;
  };

  const dailyTasks = tasks.filter(t => t.frequency === "daily");
  const weeklyTasks = tasks.filter(t => t.frequency === "weekly");
  const monthlyTasks = tasks.filter(t => t.frequency === "monthly");
  const deepTasks = tasks.filter(t => t.frequency === "deep");

  const overallPercentage = roomProgress 
    ? Math.round(((roomProgress.dailyComplete + roomProgress.weeklyComplete) / 
        (roomProgress.dailyTotal + roomProgress.weeklyTotal || 1)) * 100)
    : 0;

  if (!roomName) {
    return <div>Loading...</div>;
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
            <HomeIcon className="w-8 h-8 text-primary" />
            <div>
              <h1 className="font-heading text-3xl font-bold text-foreground">{roomName}</h1>
              <p className="text-sm text-muted-foreground">Room cleaning tasks</p>
            </div>
          </div>
          <Link href={`/cleaning/add-task?room=${encodeURIComponent(roomName)}`}>
            <Button variant="default" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Task
            </Button>
          </Link>
        </div>

        {/* Room Progress */}
        <ThemedCard variant="primary">
          <ThemedCardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Room Progress</span>
                <span className="text-2xl font-bold text-primary">{overallPercentage}%</span>
              </div>
              <Progress value={overallPercentage} className="h-3" />
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-sm">
                  <p className="text-muted-foreground">Daily</p>
                  <p className="font-medium">
                    {roomProgress?.dailyComplete || 0}/{roomProgress?.dailyTotal || 0}
                  </p>
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground">Weekly</p>
                  <p className="font-medium">
                    {roomProgress?.weeklyComplete || 0}/{roomProgress?.weeklyTotal || 0}
                  </p>
                </div>
              </div>
            </div>
          </ThemedCardContent>
        </ThemedCard>
      </div>

      {/* Daily Tasks */}
      {dailyTasks.length > 0 && (
        <ThemedCard variant="glow">
          <ThemedCardHeader>
            <ThemedCardTitle className="flex items-center justify-between">
              <span>Daily Tasks</span>
              <Badge variant="outline">{dailyTasks.length}</Badge>
            </ThemedCardTitle>
          </ThemedCardHeader>
          <ThemedCardContent>
            <div className="space-y-2">
              {dailyTasks.map(task => {
                const isComplete = isTaskComplete(task);
                return (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <button onClick={() => handleToggleTask(task.id)}>
                      {isComplete ? (
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      )}
                    </button>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isComplete ? "line-through text-muted-foreground" : ""}`}>
                        {task.task}
                      </p>
                      {task.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{task.notes}</p>
                      )}
                      {task.priority && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {task.priority}
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </ThemedCardContent>
        </ThemedCard>
      )}

      {/* Weekly Tasks */}
      {weeklyTasks.length > 0 && (
        <ThemedCard variant="glow">
          <ThemedCardHeader>
            <ThemedCardTitle className="flex items-center justify-between">
              <span>Weekly Tasks</span>
              <Badge variant="outline">{weeklyTasks.length}</Badge>
            </ThemedCardTitle>
          </ThemedCardHeader>
          <ThemedCardContent>
            <div className="space-y-2">
              {weeklyTasks.map(task => {
                const isComplete = isTaskComplete(task);
                return (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <button onClick={() => handleToggleTask(task.id)}>
                      {isComplete ? (
                        <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      )}
                    </button>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isComplete ? "line-through text-muted-foreground" : ""}`}>
                        {task.task}
                      </p>
                      {task.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{task.notes}</p>
                      )}
                      {task.priority && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {task.priority}
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </ThemedCardContent>
        </ThemedCard>
      )}

      {/* Monthly Tasks */}
      {monthlyTasks.length > 0 && (
        <ThemedCard variant="glow">
          <ThemedCardHeader>
            <ThemedCardTitle className="flex items-center justify-between">
              <span>Monthly Tasks</span>
              <Badge variant="outline">{monthlyTasks.length}</Badge>
            </ThemedCardTitle>
          </ThemedCardHeader>
          <ThemedCardContent>
            <div className="space-y-2">
              {monthlyTasks.map(task => {
                const isComplete = isTaskComplete(task);
                return (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <button onClick={() => handleToggleTask(task.id)}>
                      {isComplete ? (
                        <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      )}
                    </button>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isComplete ? "line-through text-muted-foreground" : ""}`}>
                        {task.task}
                      </p>
                      {task.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{task.notes}</p>
                      )}
                      {task.priority && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {task.priority}
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </ThemedCardContent>
        </ThemedCard>
      )}

      {/* Deep Clean Tasks */}
      {deepTasks.length > 0 && (
        <ThemedCard variant="glow">
          <ThemedCardHeader>
            <ThemedCardTitle className="flex items-center justify-between">
              <span>Deep Clean Tasks</span>
              <Badge variant="outline">{deepTasks.length}</Badge>
            </ThemedCardTitle>
          </ThemedCardHeader>
          <ThemedCardContent>
            <div className="space-y-2">
              {deepTasks.map(task => {
                const isComplete = isTaskComplete(task);
                return (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <button onClick={() => handleToggleTask(task.id)}>
                      {isComplete ? (
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      )}
                    </button>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isComplete ? "line-through text-muted-foreground" : ""}`}>
                        {task.task}
                      </p>
                      {task.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{task.notes}</p>
                      )}
                      {task.priority && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {task.priority}
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </ThemedCardContent>
        </ThemedCard>
      )}

      {/* Empty State */}
      {tasks.length === 0 && (
        <ThemedCard variant="glow">
          <ThemedCardContent className="pt-6 text-center py-12">
            <HomeIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Tasks Yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first cleaning task for this room
            </p>
            <Link href={`/cleaning/add-task?room=${encodeURIComponent(roomName)}`}>
              <Button variant="default" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Task
              </Button>
            </Link>
          </ThemedCardContent>
        </ThemedCard>
      )}
    </div>
  );
}