import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { ThemedCard, ThemedCardHeader, ThemedCardTitle, ThemedCardContent } from "@/components/ui/themed-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Wand2, Plus, CheckCircle2, XCircle, Calendar as CalendarIcon, AlertCircle, Filter, Trash2 } from "lucide-react";
import {
  getDeepCleanTasks,
  getUnscheduledDeepCleanTasks,
  getScheduledDeepCleanTasks,
  getDeepCleanTasksForDate,
  getOverdueDeepCleanTasks,
  scheduleDeepCleanTask,
  completeDeepCleanTask,
  addDeepCleanTask,
  deleteDeepCleanTask,
  type DeepCleanTask,
} from "@/lib/storage";
import { cn } from "@/lib/utils";

const ROOMS = [
  "Kitchen",
  "Living Room",
  "Bedroom",
  "Bathroom",
  "Guest Room",
  "Office",
  "Laundry Room",
  "Garage",
  "Hallway",
  "Dining Room",
  "Basement",
];

export default function DeepCleanPage() {
  const [unscheduledTasks, setUnscheduledTasks] = useState<DeepCleanTask[]>([]);
  const [scheduledTasks, setScheduledTasks] = useState<DeepCleanTask[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<DeepCleanTask[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedRoom, setSelectedRoom] = useState<string>("all");
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskRoom, setNewTaskRoom] = useState("");
  const [taskToSchedule, setTaskToSchedule] = useState<DeepCleanTask | null>(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  const loadTasks = () => {
    setUnscheduledTasks(getUnscheduledDeepCleanTasks());
    setScheduledTasks(getScheduledDeepCleanTasks());
    setOverdueTasks(getOverdueDeepCleanTasks());
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleScheduleTask = (task: DeepCleanTask) => {
    setTaskToSchedule(task);
    setScheduleDialogOpen(true);
  };

  const confirmSchedule = () => {
    if (taskToSchedule && selectedDate) {
      const dateStr = selectedDate.toISOString().split("T")[0];
      scheduleDeepCleanTask(taskToSchedule.id, dateStr);
      loadTasks();
      setScheduleDialogOpen(false);
      setTaskToSchedule(null);
    }
  };

  const handleCompleteTask = (taskId: string) => {
    completeDeepCleanTask(taskId);
    loadTasks();
  };

  const handleAddTask = () => {
    if (newTaskName.trim() && newTaskRoom) {
      addDeepCleanTask(newTaskName, newTaskRoom);
      setNewTaskName("");
      setNewTaskRoom("");
      loadTasks();
    }
  };

  const handleDeleteTask = (taskId: string) => {
    deleteDeepCleanTask(taskId);
    loadTasks();
  };

  const filteredScheduledTasks = selectedRoom === "all" 
    ? scheduledTasks 
    : scheduledTasks.filter(task => task.room === selectedRoom);

  const filteredUnscheduledTasks = selectedRoom === "all"
    ? unscheduledTasks
    : unscheduledTasks.filter(task => task.room === selectedRoom);

  const selectedDateStr = selectedDate?.toISOString().split("T")[0];
  const tasksForSelectedDate = selectedDateStr 
    ? getDeepCleanTasksForDate(selectedDateStr)
    : [];

  // Group scheduled tasks by date
  const tasksByDate = filteredScheduledTasks.reduce((acc, task) => {
    if (task.scheduledDate) {
      if (!acc[task.scheduledDate]) {
        acc[task.scheduledDate] = [];
      }
      acc[task.scheduledDate].push(task);
    }
    return acc;
  }, {} as Record<string, DeepCleanTask[]>);

  return (
    <Layout>
      <SEO 
        title="Deep Clean Calendar - Kitten's Chaos Planner"
        description="Schedule and track deep cleaning tasks"
      />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wand2 className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-heading font-bold">Deep Clean Calendar</h1>
              <p className="text-muted-foreground">Schedule intensive cleaning tasks</p>
            </div>
          </div>
          
          {overdueTasks.length > 0 && (
            <Badge variant="destructive" className="gap-2">
              <AlertCircle className="w-4 h-4" />
              {overdueTasks.length} Overdue
            </Badge>
          )}
        </div>

        {/* Room Filter */}
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <Select value={selectedRoom} onValueChange={setSelectedRoom}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by room" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rooms</SelectItem>
              {ROOMS.map(room => (
                <SelectItem key={room} value={room}>{room}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Unscheduled Tasks Backlog */}
          <ThemedCard variant="glow">
            <ThemedCardHeader>
              <ThemedCardTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-accent" />
                Unscheduled Tasks
                <Badge variant="secondary">{filteredUnscheduledTasks.length}</Badge>
              </ThemedCardTitle>
            </ThemedCardHeader>
            <ThemedCardContent>
              <div className="space-y-3">
                {/* Add New Task */}
                <div className="flex gap-2">
                  <Input
                    placeholder="New task..."
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                  />
                  <Select value={newTaskRoom} onValueChange={setNewTaskRoom}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Room" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROOMS.map(room => (
                        <SelectItem key={room} value={room}>{room}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    size="icon" 
                    onClick={handleAddTask}
                    disabled={!newTaskName.trim() || !newTaskRoom}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Unscheduled Task List */}
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {filteredUnscheduledTasks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Wand2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>All tasks scheduled!</p>
                    </div>
                  ) : (
                    filteredUnscheduledTasks.map(task => (
                      <div 
                        key={task.id} 
                        className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">{task.task}</p>
                          <p className="text-xs text-muted-foreground">{task.room}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleScheduleTask(task)}
                        >
                          <CalendarIcon className="w-4 h-4 mr-1" />
                          Schedule
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </ThemedCardContent>
          </ThemedCard>

          {/* Calendar View */}
          <ThemedCard variant="glow">
            <ThemedCardHeader>
              <ThemedCardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                Schedule Calendar
              </ThemedCardTitle>
            </ThemedCardHeader>
            <ThemedCardContent>
              <div className="space-y-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  modifiers={{
                    scheduled: (date) => {
                      const dateStr = date.toISOString().split("T")[0];
                      return !!tasksByDate[dateStr];
                    },
                    overdue: (date) => {
                      const dateStr = date.toISOString().split("T")[0];
                      const today = new Date().toISOString().split("T")[0];
                      return dateStr < today && !!tasksByDate[dateStr];
                    },
                  }}
                  modifiersStyles={{
                    scheduled: { 
                      fontWeight: "bold",
                      backgroundColor: "hsl(var(--primary) / 0.2)",
                    },
                    overdue: {
                      fontWeight: "bold",
                      backgroundColor: "hsl(var(--destructive) / 0.2)",
                      color: "hsl(var(--destructive))",
                    },
                  }}
                />

                {/* Tasks for Selected Date */}
                {selectedDate && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      Tasks for {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </h3>
                    {tasksForSelectedDate.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-2">No tasks scheduled</p>
                    ) : (
                      <div className="space-y-2">
                        {tasksForSelectedDate.map(task => (
                          <div 
                            key={task.id}
                            className={cn(
                              "flex items-center gap-2 p-2 rounded-lg",
                              task.scheduledDate && task.scheduledDate < new Date().toISOString().split("T")[0]
                                ? "bg-destructive/10 border border-destructive/20"
                                : "bg-muted/30"
                            )}
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium">{task.task}</p>
                              <p className="text-xs text-muted-foreground">{task.room}</p>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleCompleteTask(task.id)}
                            >
                              <CheckCircle2 className="w-4 h-4 text-primary" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ThemedCardContent>
          </ThemedCard>
        </div>

        {/* Upcoming Scheduled Tasks */}
        <ThemedCard variant="primary">
          <ThemedCardHeader>
            <ThemedCardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Upcoming Deep Clean Jobs
              <Badge variant="secondary">{filteredScheduledTasks.length}</Badge>
            </ThemedCardTitle>
          </ThemedCardHeader>
          <ThemedCardContent>
            <div className="space-y-2">
              {filteredScheduledTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No tasks scheduled yet</p>
                </div>
              ) : (
                Object.entries(tasksByDate)
                  .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                  .map(([date, tasks]) => {
                    const isOverdue = date < new Date().toISOString().split("T")[0];
                    return (
                      <div key={date} className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          {isOverdue && <AlertCircle className="w-4 h-4 text-destructive" />}
                          <span className={cn(isOverdue && "text-destructive")}>
                            {new Date(date).toLocaleDateString("en-US", { 
                              weekday: "short",
                              month: "short", 
                              day: "numeric",
                              year: "numeric"
                            })}
                          </span>
                          {isOverdue && <Badge variant="destructive">Overdue</Badge>}
                        </div>
                        {tasks.map(task => (
                          <div 
                            key={task.id}
                            className={cn(
                              "flex items-center gap-2 p-3 rounded-lg ml-6",
                              isOverdue 
                                ? "bg-destructive/10 border border-destructive/20"
                                : "bg-muted/30"
                            )}
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium">{task.task}</p>
                              <p className="text-xs text-muted-foreground">{task.room}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCompleteTask(task.id)}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Complete
                            </Button>
                          </div>
                        ))}
                      </div>
                    );
                  })
              )}
            </div>
          </ThemedCardContent>
        </ThemedCard>
      </div>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {taskToSchedule && (
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="font-medium">{taskToSchedule.task}</p>
                <p className="text-sm text-muted-foreground">{taskToSchedule.room}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium mb-2">Select Date</p>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                className="flex-1" 
                onClick={confirmSchedule}
                disabled={!selectedDate}
              >
                Schedule for {selectedDate?.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setScheduleDialogOpen(false);
                  setTaskToSchedule(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}