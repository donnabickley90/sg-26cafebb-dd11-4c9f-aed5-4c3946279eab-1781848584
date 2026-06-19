import { useState, useEffect } from "react";
import { ThemedCard, ThemedCardHeader, ThemedCardTitle, ThemedCardDescription, ThemedCardContent } from "@/components/ui/themed-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar, 
  Utensils, 
  Wand2, 
  Clock, 
  Plus, 
  CheckCircle2, 
  Cake, 
  Heart, 
  Star, 
  StickyNote,
  Zap,
  Sparkles,
  Moon,
  ListChecks,
  CalendarDays,
  Home as HomeIcon
} from "lucide-react";
import { getTodaysMealsFromWeekly, getDeepCleanTasksForDate, completeDeepCleanTask, getDeclutterProgress, getCurrentDeclutterDay, getUpcomingImportantDates, type DeepCleanTask } from "@/lib/storage";
import Link from "next/link";

export default function Home() {
  const [quickNote, setQuickNote] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [spoons, setSpoons] = useState(3);
  const [todaysMeals, setTodaysMeals] = useState<{ breakfast: string; lunch: string; dinner: string; snacks: string; drinks: string } | null>(null);
  const [deepCleanTasksToday, setDeepCleanTasksToday] = useState<DeepCleanTask[]>([]);
  const [declutterProgress, setDeclutterProgress] = useState({ completedDays: 0, totalDays: 30, completedItems: 0, totalItems: 465, percentage: 0 });
  const [declutterCurrentDay, setDeclutterCurrentDay] = useState<number | null>(null);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<Array<{ name: string; date: string; daysUntil: number; category: string }>>([]);
  const [widgetOrder, setWidgetOrder] = useState<string[]>([
    "progress-summary",
    "schedule",
    "meals",
    "chores",
    "deep-clean",
    "declutter",
    "birthdays",
    "dates",
    "priorities",
    "mood",
    "notes",
  ]);

  // Mock data for demonstration
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
  const dateString = today.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  // Load today's meals and deep clean tasks on mount
  useEffect(() => {
    // Load widget order
    const savedOrder = localStorage.getItem("widget_order");
    if (savedOrder) {
      setWidgetOrder(JSON.parse(savedOrder));
    }

    const meals = getTodaysMealsFromWeekly(todayStr);
    setTodaysMeals(meals);
    
    const deepCleanTasks = getDeepCleanTasksForDate(todayStr);
    setDeepCleanTasksToday(deepCleanTasks);
    
    const declutterProg = getDeclutterProgress();
    setDeclutterProgress(declutterProg);
    
    const currentDay = getCurrentDeclutterDay();
    setDeclutterCurrentDay(currentDay);

    // Load upcoming birthdays
    const upcomingDates = getUpcomingImportantDates(30);
    const birthdaysData = upcomingDates.map(date => {
      const [month, day] = date.date.split("-");
      const displayDate = new Date(2026, parseInt(month) - 1, parseInt(day)).toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric" 
      });
      
      // Calculate days until
      const currentYear = today.getFullYear();
      const thisYearDate = new Date(currentYear, parseInt(month) - 1, parseInt(day));
      const diffTime = thisYearDate.getTime() - today.getTime();
      let daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (daysUntil < 0) {
        const nextYearDate = new Date(currentYear + 1, parseInt(month) - 1, parseInt(day));
        daysUntil = Math.ceil((nextYearDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      }
      
      return {
        name: date.name,
        date: displayDate,
        daysUntil,
        category: date.category,
      };
    });
    setUpcomingBirthdays(birthdaysData);
  }, [todayStr]);

  const handleCompleteDeepClean = (taskId: string) => {
    completeDeepCleanTask(taskId);
    setDeepCleanTasksToday(getDeepCleanTasksForDate(todayStr));
  };

  const upcomingHours = [
    { time: "9:00 AM", task: "Morning routine & coffee", status: "done" },
    { time: "10:00 AM", task: "Deep work session", status: "current" },
    { time: "11:00 AM", task: "Team sync", status: "pending" },
    { time: "12:00 PM", task: "Lunch break", status: "pending" },
  ];

  const choresForToday = [
    { room: "Kitchen", task: "Wipe counters", done: true },
    { room: "Bedroom", task: "Make bed", done: true },
    { room: "Bathroom", task: "Quick clean", done: false },
  ];

  const priorities = [
    { text: "Finish project proposal", done: false },
    { text: "Call dentist", done: false },
    { text: "Grocery shopping", done: false },
  ];

  const moods = ["😊", "😐", "😔", "😤", "😴"];

  // Widget component map
  const widgetComponents: Record<string, JSX.Element> = {
    "progress-summary": (
      <ThemedCard variant="primary" key="progress-summary">
        <ThemedCardHeader>
          <ThemedCardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Progress Summary
          </ThemedCardTitle>
        </ThemedCardHeader>
        <ThemedCardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col items-center space-y-3">
              <ProgressRing progress={35} size={90} />
              <div className="text-center">
                <p className="text-sm font-medium">Daily Planner</p>
                <p className="text-xs text-muted-foreground">6/17 hours</p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-3">
              <ProgressRing progress={68} size={90} />
              <div className="text-center">
                <p className="text-sm font-medium">Cleaning</p>
                <p className="text-xs text-muted-foreground">7/11 rooms</p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-3">
              <div className="flex items-end gap-2">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">8</div>
                  <p className="text-xs text-muted-foreground">day streak</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">12</div>
                  <p className="text-xs text-muted-foreground">week streak</p>
                </div>
              </div>
            </div>
          </div>
        </ThemedCardContent>
      </ThemedCard>
    ),
    "schedule": (
      <ThemedCard variant="glow" key="schedule">
        <ThemedCardHeader>
          <ThemedCardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Today's Schedule
          </ThemedCardTitle>
          <ThemedCardDescription>Upcoming hourly blocks</ThemedCardDescription>
        </ThemedCardHeader>
        <ThemedCardContent>
          <div className="space-y-3">
            {upcomingHours.map((hour, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                <div className="text-sm font-medium text-muted-foreground min-w-[80px]">
                  {hour.time}
                </div>
                <div className="flex-1 text-sm">{hour.task}</div>
                {hour.status === "done" && <CheckCircle2 className="w-4 h-4 text-primary" />}
                {hour.status === "current" && <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />}
              </div>
            ))}
          </div>
        </ThemedCardContent>
      </ThemedCard>
    ),
    "meals": (
      <ThemedCard variant="glow" key="meals">
        <ThemedCardHeader>
          <ThemedCardTitle className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-accent" />
            Today's Meals
          </ThemedCardTitle>
          <ThemedCardDescription>What's on the menu</ThemedCardDescription>
        </ThemedCardHeader>
        <ThemedCardContent>
          {todaysMeals ? (
            <div className="space-y-3">
              {todaysMeals.breakfast && (
                <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  <Badge variant="outline" className="min-w-[90px]">Breakfast</Badge>
                  <div className="text-sm">{todaysMeals.breakfast}</div>
                </div>
              )}
              {todaysMeals.lunch && (
                <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  <Badge variant="outline" className="min-w-[90px]">Lunch</Badge>
                  <div className="text-sm">{todaysMeals.lunch}</div>
                </div>
              )}
              {todaysMeals.dinner && (
                <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  <Badge variant="outline" className="min-w-[90px]">Dinner</Badge>
                  <div className="text-sm">{todaysMeals.dinner}</div>
                </div>
              )}
              {todaysMeals.snacks && (
                <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  <Badge variant="outline" className="min-w-[90px]">Snacks</Badge>
                  <div className="text-sm">{todaysMeals.snacks}</div>
                </div>
              )}
              {todaysMeals.drinks && (
                <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  <Badge variant="outline" className="min-w-[90px]">Drinks</Badge>
                  <div className="text-sm">{todaysMeals.drinks}</div>
                </div>
              )}
              {!todaysMeals.breakfast && !todaysMeals.lunch && !todaysMeals.dinner && !todaysMeals.snacks && !todaysMeals.drinks && (
                <div className="text-center py-4">
                  <p className="text-muted-foreground text-sm">No meals planned for today</p>
                  <Link href="/meals">
                    <Button variant="outline" size="sm" className="mt-2">
                      Plan Meals
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground text-sm">No meals planned for today</p>
              <Link href="/meals">
                <Button variant="outline" size="sm" className="mt-2">
                  Plan Meals
                </Button>
              </Link>
            </div>
          )}
        </ThemedCardContent>
      </ThemedCard>
    ),
    "chores": (
      <ThemedCard variant="glow" key="chores">
        <ThemedCardHeader>
          <ThemedCardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-secondary-foreground" />
            Chores Due Today
          </ThemedCardTitle>
          <ThemedCardDescription>Daily cleaning tasks</ThemedCardDescription>
        </ThemedCardHeader>
        <ThemedCardContent>
          <div className="space-y-2">
            {choresForToday.map((chore, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                <input type="checkbox" checked={chore.done} readOnly className="w-4 h-4" />
                <HomeIcon className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{chore.room}</p>
                  <p className="text-xs text-muted-foreground">{chore.task}</p>
                </div>
              </div>
            ))}
          </div>
        </ThemedCardContent>
      </ThemedCard>
    ),
    "deep-clean": (
      <ThemedCard variant="glow" key="deep-clean">
        <ThemedCardHeader>
          <ThemedCardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Deep Clean Tasks
          </ThemedCardTitle>
          <ThemedCardDescription>Scheduled deep cleaning</ThemedCardDescription>
        </ThemedCardHeader>
        <ThemedCardContent>
          <div className="space-y-2">
            {deepCleanTasksToday.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground text-sm">No deep clean tasks scheduled for today</p>
                <Link href="/deep-clean">
                  <Button variant="outline" size="sm" className="mt-2">
                    Schedule Tasks
                  </Button>
                </Link>
              </div>
            ) : (
              deepCleanTasksToday.map((task) => (
                <div key={task.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{task.task}</p>
                    <p className="text-xs text-muted-foreground">{task.room}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleCompleteDeepClean(task.id)}
                  >
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ThemedCardContent>
      </ThemedCard>
    ),
    "declutter": (
      <ThemedCard variant="glow" key="declutter">
        <ThemedCardHeader>
          <ThemedCardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            Declutter Challenge
          </ThemedCardTitle>
          <ThemedCardDescription>30-day item clearing challenge</ThemedCardDescription>
        </ThemedCardHeader>
        <ThemedCardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{declutterProgress.completedItems}/{declutterProgress.totalItems}</p>
                <p className="text-xs text-muted-foreground">Items cleared</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{declutterProgress.completedDays}/30</p>
                <p className="text-xs text-muted-foreground">Days completed</p>
              </div>
            </div>
            
            <Progress value={declutterProgress.percentage} className="h-2" />
            
            {declutterCurrentDay && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/10 border border-accent/20">
                <Star className="w-4 h-4 text-accent" />
                <p className="text-sm">
                  Currently on <span className="font-semibold">Day {declutterCurrentDay}</span>
                </p>
              </div>
            )}
            
            <Link href="/declutter">
              <Button variant="outline" size="sm" className="w-full">
                View Challenge
              </Button>
            </Link>
          </div>
        </ThemedCardContent>
      </ThemedCard>
    ),
    "birthdays": (
      <ThemedCard variant="glow" key="birthdays">
        <ThemedCardHeader>
          <ThemedCardTitle className="flex items-center gap-2">
            <Cake className="w-5 h-5 text-accent" />
            Upcoming Birthdays
          </ThemedCardTitle>
          <ThemedCardDescription>Don't forget to celebrate!</ThemedCardDescription>
        </ThemedCardHeader>
        <ThemedCardContent>
          {upcomingBirthdays.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground text-sm">No upcoming birthdays or dates in the next 30 days</p>
              <Link href="/birthdays">
                <Button variant="outline" size="sm" className="mt-2">
                  Add Birthdays
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingBirthdays.slice(0, 3).map((birthday, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    {birthday.category === "birthday" && <Cake className="w-4 h-4 text-primary" />}
                    {birthday.category === "anniversary" && <Heart className="w-4 h-4 text-accent" />}
                    {birthday.category === "holiday" && <Sparkles className="w-4 h-4 text-secondary" />}
                    <div>
                      <p className="text-sm font-medium">{birthday.name}</p>
                      <p className="text-xs text-muted-foreground">{birthday.date}</p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {birthday.daysUntil === 0 ? "Today!" : 
                     birthday.daysUntil === 1 ? "Tomorrow" : 
                     `${birthday.daysUntil} days`}
                  </Badge>
                </div>
              ))}
              {upcomingBirthdays.length > 3 && (
                <Link href="/birthdays">
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    View All ({upcomingBirthdays.length})
                  </Button>
                </Link>
              )}
            </div>
          )}
        </ThemedCardContent>
      </ThemedCard>
    ),
    "dates": (
      <ThemedCard variant="glow" key="dates">
        <ThemedCardHeader>
          <ThemedCardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Important Dates
          </ThemedCardTitle>
          <ThemedCardDescription>Anniversaries & special events</ThemedCardDescription>
        </ThemedCardHeader>
        <ThemedCardContent>
          {upcomingBirthdays.filter(b => b.category === "anniversary").length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground text-sm">No upcoming anniversaries</p>
              <Link href="/birthdays">
                <Button variant="outline" size="sm" className="mt-2">
                  Add Anniversaries
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingBirthdays.filter(b => b.category === "anniversary").slice(0, 2).map((date, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <div>
                    <p className="text-sm font-medium">{date.name}</p>
                    <p className="text-xs text-muted-foreground">{date.date}</p>
                  </div>
                  <Badge variant="secondary">
                    {date.daysUntil === 0 ? "Today!" : `${date.daysUntil} days`}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </ThemedCardContent>
      </ThemedCard>
    ),
    "priorities": (
      <ThemedCard variant="glow" key="priorities">
        <ThemedCardHeader>
          <ThemedCardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Top 3 Priorities
          </ThemedCardTitle>
        </ThemedCardHeader>
        <ThemedCardContent>
          <div className="space-y-2">
            {priorities.map((priority, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                <input type="checkbox" checked={priority.done} readOnly className="w-4 h-4" />
                <span className="text-sm flex-1">{priority.text}</span>
              </div>
            ))}
          </div>
        </ThemedCardContent>
      </ThemedCard>
    ),
    "mood": (
      <ThemedCard variant="glow" key="mood">
        <ThemedCardHeader>
          <ThemedCardTitle className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-accent" />
            Mood & Energy
          </ThemedCardTitle>
        </ThemedCardHeader>
        <ThemedCardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Current Mood</p>
              <div className="flex gap-2">
                {moods.map((emoji, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMood(emoji)}
                    className={`text-2xl p-2 rounded-lg transition-all ${
                      mood === emoji ? "bg-primary/20 scale-110" : "bg-muted/30 hover:bg-muted/50"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Spoons Today</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Zap
                      key={s}
                      className={`w-4 h-4 cursor-pointer ${
                        s <= spoons ? "fill-accent text-accent" : "text-muted"
                      }`}
                      onClick={() => setSpoons(s)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ThemedCardContent>
      </ThemedCard>
    ),
    "notes": (
      <ThemedCard variant="glow" key="notes">
        <ThemedCardHeader>
          <ThemedCardTitle className="flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-primary" />
            Quick Notes
          </ThemedCardTitle>
        </ThemedCardHeader>
        <ThemedCardContent>
          <Textarea
            placeholder="Jot down quick thoughts..."
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </ThemedCardContent>
      </ThemedCard>
    ),
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header with Date */}
      <div className="text-center space-y-2 border-b border-border pb-6">
        <div className="flex items-center justify-center gap-3">
          <Moon className="w-8 h-8 text-primary" />
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary">
            Kitten's Chaos Planner
          </h1>
          <Sparkles className="w-8 h-8 text-accent" />
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-semibold text-foreground">{dayName}</p>
          <p className="text-lg text-muted-foreground">{dateString}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h2 className="text-xl font-heading font-semibold text-foreground flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Button variant="outline" className="h-auto py-3 flex flex-col gap-2">
            <Calendar className="w-5 h-5" />
            <span className="text-xs">Today's Planner</span>
          </Button>
          <Button variant="outline" className="h-auto py-3 flex flex-col gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-xs">Daily Reset</span>
          </Button>
          <Button variant="outline" className="h-auto py-3 flex flex-col gap-2">
            <ListChecks className="w-5 h-5" />
            <span className="text-xs">Weekly Reset</span>
          </Button>
          <Button variant="outline" className="h-auto py-3 flex flex-col gap-2">
            <Plus className="w-5 h-5" />
            <span className="text-xs">Add Task</span>
          </Button>
          <Button variant="outline" className="h-auto py-3 flex flex-col gap-2">
            <Utensils className="w-5 h-5" />
            <span className="text-xs">Add Meal</span>
          </Button>
          <Button variant="outline" className="h-auto py-3 flex flex-col gap-2">
            <Cake className="w-5 h-5" />
            <span className="text-xs">Add Birthday</span>
          </Button>
          <Button variant="outline" className="h-auto py-3 flex flex-col gap-2">
            <StickyNote className="w-5 h-5" />
            <span className="text-xs">Quick Note</span>
          </Button>
          <Link href="/declutter">
            <Button variant="outline" className="h-auto py-3 flex flex-col gap-2 w-full">
              <Sparkles className="w-5 h-5" />
              <span className="text-xs">Declutter</span>
            </Button>
          </Link>
          <Button variant="outline" className="h-auto py-3 flex flex-col gap-2">
            <CalendarDays className="w-5 h-5" />
            <span className="text-xs">Deep Clean</span>
          </Button>
        </div>
      </div>

      {/* Dynamically ordered widgets */}
      <div className="space-y-6">
        {widgetOrder.map((widgetKey) => {
          const widget = widgetComponents[widgetKey];
          if (!widget) return null;
          
          // Render progress-summary full width, others in 2-column grid where appropriate
          if (widgetKey === "progress-summary") {
            return widget;
          }
          
          // Group 2-column widgets
          const twoColWidgets = ["schedule", "meals", "chores", "deep-clean", "declutter", "birthdays", "dates"];
          const threeColWidgets = ["priorities", "mood", "notes"];
          
          return null; // Will be handled by grid sections below
        })}
        
        {/* Two-column grid section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {widgetOrder
            .filter(key => ["schedule", "meals", "chores", "deep-clean", "declutter", "birthdays", "dates"].includes(key))
            .map(key => widgetComponents[key])}
        </div>
        
        {/* Three-column grid section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {widgetOrder
            .filter(key => ["priorities", "mood", "notes"].includes(key))
            .map(key => widgetComponents[key])}
        </div>
      </div>
    </div>
  );
}