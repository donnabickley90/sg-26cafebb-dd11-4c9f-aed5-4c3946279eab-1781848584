import { useState, useEffect, useCallback } from "react";
import type { ReactElement } from "react";
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
import { getTodaysMealsFromWeekly, getUpcomingImportantDates } from "@/lib/storage";
import Link from "next/link";

export default function Home() {
  const [quickNote, setQuickNote] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [spoons, setSpoons] = useState(3);
  const [todaysMeals, setTodaysMeals] = useState<{ breakfast: string; lunch: string; dinner: string; snacks: string; drinks: string } | null>(null);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<Array<{ name: string; date: string; daysUntil: number; category: string }>>([]);
  const [widgetOrder, setWidgetOrder] = useState<string[]>([
    "progress-summary",
    "schedule",
    "meals",
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

  // Load/refresh all dashboard data
  const loadDashboardData = useCallback(() => {
    const meals = getTodaysMealsFromWeekly(todayStr);
    setTodaysMeals(meals);

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
  }, [todayStr, today]);

  // Initial load
  useEffect(() => {
    // Load widget order
    if (typeof window !== "undefined") {
      const savedOrder = localStorage.getItem("widget_order");
      if (savedOrder) {
        setWidgetOrder(JSON.parse(savedOrder));
      }
    }

    loadDashboardData();
  }, [loadDashboardData]);

  const upcomingHours = [
    { time: "9:00 AM", task: "Morning routine & coffee", status: "done" },
    { time: "10:00 AM", task: "Deep work session", status: "current" },
    { time: "11:00 AM", task: "Team sync", status: "pending" },
    { time: "12:00 PM", task: "Lunch break", status: "pending" },
  ];

  const priorities = [
    { text: "Finish project proposal", done: false },
    { text: "Call dentist", done: false },
    { text: "Grocery shopping", done: false },
  ];

  const moods = ["😊", "😐", "😔", "😤", "😴"];

  // Generate today's date for planner link
  const todayForPlanner = new Date().toISOString().split("T")[0];

  // Widget component map
  const widgetComponents: Record<string, ReactElement> = {
    "progress-summary": (
      <ThemedCard variant="primary" key="progress-summary">
        <ThemedCardHeader className="p-6 sm:p-6">
          <ThemedCardTitle className="flex items-center gap-3 text-2xl sm:text-2xl">
            <Star className="w-7 h-7 sm:w-7 sm:h-7" />
            Progress Summary
          </ThemedCardTitle>
        </ThemedCardHeader>
        <ThemedCardContent className="p-6 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-8">
            <div className="flex flex-col items-center space-y-5">
              <ProgressRing progress={35} size={130} />
              <div className="text-center">
                <p className="text-lg sm:text-base font-medium">Daily Planner</p>
                <p className="text-base sm:text-sm text-muted-foreground">6/17 hours</p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-5">
              <div className="flex items-end gap-6">
                <div className="text-center">
                  <div className="text-5xl sm:text-4xl font-bold text-primary">8</div>
                  <p className="text-base sm:text-sm text-muted-foreground mt-1">day streak</p>
                </div>
                <div className="text-center">
                  <div className="text-5xl sm:text-4xl font-bold text-accent">12</div>
                  <p className="text-base sm:text-sm text-muted-foreground mt-1">week streak</p>
                </div>
              </div>
            </div>
          </div>
        </ThemedCardContent>
      </ThemedCard>
    ),
    "schedule": (
      <ThemedCard variant="glow" key="schedule">
        <ThemedCardHeader className="p-6 sm:p-6">
          <ThemedCardTitle className="flex items-center gap-3 text-xl sm:text-xl">
            <Clock className="w-6 h-6 sm:w-6 sm:h-6 text-primary" />
            Today's Schedule
          </ThemedCardTitle>
          <ThemedCardDescription className="text-base sm:text-sm mt-1">Upcoming hourly blocks</ThemedCardDescription>
        </ThemedCardHeader>
        <ThemedCardContent className="p-6 sm:p-6 pt-0 sm:pt-0">
          <div className="space-y-4">
            {upcomingHours.map((hour, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 sm:p-3 rounded-lg bg-muted/30">
                <div className="text-lg sm:text-base font-medium text-muted-foreground min-w-[95px] sm:min-w-[85px]">
                  {hour.time}
                </div>
                <div className="flex-1 text-lg sm:text-base">{hour.task}</div>
                {hour.status === "done" && <CheckCircle2 className="w-6 h-6 sm:w-5 sm:h-5 text-primary flex-shrink-0" />}
                {hour.status === "current" && <div className="w-3 h-3 sm:w-3 sm:h-3 rounded-full bg-accent animate-pulse flex-shrink-0" />}
              </div>
            ))}
          </div>
        </ThemedCardContent>
      </ThemedCard>
    ),
    "meals": (
      <ThemedCard variant="glow" key="meals">
        <ThemedCardHeader className="p-6 sm:p-6">
          <ThemedCardTitle className="flex items-center gap-3 text-xl sm:text-xl">
            <Utensils className="w-6 h-6 sm:w-6 sm:h-6 text-accent" />
            Today's Meals
          </ThemedCardTitle>
          <ThemedCardDescription className="text-base sm:text-sm mt-1">What's on the menu</ThemedCardDescription>
        </ThemedCardHeader>
        <ThemedCardContent className="p-6 sm:p-6 pt-0 sm:pt-0">
          {todaysMeals ? (
            <div className="space-y-4">
              {todaysMeals.breakfast && (
                <div className="flex items-center gap-4 p-4 sm:p-3 rounded-lg bg-muted/30">
                  <Badge variant="outline" className="min-w-[110px] sm:min-w-[100px] text-base sm:text-sm py-1">Breakfast</Badge>
                  <div className="text-lg sm:text-base">{todaysMeals.breakfast}</div>
                </div>
              )}
              {todaysMeals.lunch && (
                <div className="flex items-center gap-4 p-4 sm:p-3 rounded-lg bg-muted/30">
                  <Badge variant="outline" className="min-w-[110px] sm:min-w-[100px] text-base sm:text-sm py-1">Lunch</Badge>
                  <div className="text-lg sm:text-base">{todaysMeals.lunch}</div>
                </div>
              )}
              {todaysMeals.dinner && (
                <div className="flex items-center gap-4 p-4 sm:p-3 rounded-lg bg-muted/30">
                  <Badge variant="outline" className="min-w-[110px] sm:min-w-[100px] text-base sm:text-sm py-1">Dinner</Badge>
                  <div className="text-lg sm:text-base">{todaysMeals.dinner}</div>
                </div>
              )}
              {todaysMeals.snacks && (
                <div className="flex items-center gap-4 p-4 sm:p-3 rounded-lg bg-muted/30">
                  <Badge variant="outline" className="min-w-[110px] sm:min-w-[100px] text-base sm:text-sm py-1">Snacks</Badge>
                  <div className="text-lg sm:text-base">{todaysMeals.snacks}</div>
                </div>
              )}
              {todaysMeals.drinks && (
                <div className="flex items-center gap-4 p-4 sm:p-3 rounded-lg bg-muted/30">
                  <Badge variant="outline" className="min-w-[110px] sm:min-w-[100px] text-base sm:text-sm py-1">Drinks</Badge>
                  <div className="text-lg sm:text-base">{todaysMeals.drinks}</div>
                </div>
              )}
              {!todaysMeals.breakfast && !todaysMeals.lunch && !todaysMeals.dinner && !todaysMeals.snacks && !todaysMeals.drinks && (
                <div className="text-center py-8 sm:py-6">
                  <p className="text-muted-foreground text-lg sm:text-base mb-4">No meals planned for today</p>
                  <Link href="/meals">
                    <Button variant="outline" size="default" className="text-base">
                      Plan Meals
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-6">
              <p className="text-muted-foreground text-lg sm:text-base mb-4">No meals planned for today</p>
              <Link href="/meals">
                <Button variant="outline" size="default" className="text-base">
                  Plan Meals
                </Button>
              </Link>
            </div>
          )}
        </ThemedCardContent>
      </ThemedCard>
    ),
    "birthdays": (
      <ThemedCard variant="glow" key="birthdays">
        <ThemedCardHeader className="p-6 sm:p-6">
          <ThemedCardTitle className="flex items-center gap-3 text-xl sm:text-xl">
            <Cake className="w-6 h-6 sm:w-6 sm:h-6 text-accent" />
            Upcoming Birthdays
          </ThemedCardTitle>
          <ThemedCardDescription className="text-base sm:text-sm mt-1">Don't forget to celebrate!</ThemedCardDescription>
        </ThemedCardHeader>
        <ThemedCardContent className="p-6 sm:p-6 pt-0 sm:pt-0">
          {upcomingBirthdays.length === 0 ? (
            <div className="text-center py-8 sm:py-6">
              <p className="text-muted-foreground text-lg sm:text-base mb-4">No upcoming birthdays or dates in the next 30 days</p>
              <Link href="/birthdays">
                <Button variant="outline" size="default" className="text-base">
                  Add Birthdays
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-3">
              {upcomingBirthdays.slice(0, 3).map((birthday, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 sm:p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-4 sm:gap-3">
                    {birthday.category === "birthday" && <Cake className="w-6 h-6 sm:w-5 sm:h-5 text-primary flex-shrink-0" />}
                    {birthday.category === "anniversary" && <Heart className="w-6 h-6 sm:w-5 sm:h-5 text-accent flex-shrink-0" />}
                    {birthday.category === "holiday" && <Sparkles className="w-6 h-6 sm:w-5 sm:h-5 text-secondary flex-shrink-0" />}
                    <div>
                      <p className="text-lg sm:text-base font-medium">{birthday.name}</p>
                      <p className="text-base sm:text-sm text-muted-foreground">{birthday.date}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-base sm:text-sm py-1">
                    {birthday.daysUntil === 0 ? "Today!" : 
                     birthday.daysUntil === 1 ? "Tomorrow" : 
                     `${birthday.daysUntil} days`}
                  </Badge>
                </div>
              ))}
              {upcomingBirthdays.length > 3 && (
                <Link href="/birthdays">
                  <Button variant="outline" size="default" className="w-full mt-4 text-base">
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
        <ThemedCardHeader className="p-6 sm:p-6">
          <ThemedCardTitle className="flex items-center gap-3 text-xl sm:text-xl">
            <Heart className="w-6 h-6 sm:w-6 sm:h-6 text-primary" />
            Important Dates
          </ThemedCardTitle>
          <ThemedCardDescription className="text-base sm:text-sm mt-1">Anniversaries & special events</ThemedCardDescription>
        </ThemedCardHeader>
        <ThemedCardContent className="p-6 sm:p-6 pt-0 sm:pt-0">
          {upcomingBirthdays.filter(b => b.category === "anniversary").length === 0 ? (
            <div className="text-center py-8 sm:py-6">
              <p className="text-muted-foreground text-lg sm:text-base mb-4">No upcoming anniversaries</p>
              <Link href="/birthdays">
                <Button variant="outline" size="default" className="text-base">
                  Add Anniversaries
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-3">
              {upcomingBirthdays.filter(b => b.category === "anniversary").slice(0, 2).map((date, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 sm:p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="text-lg sm:text-base font-medium">{date.name}</p>
                    <p className="text-base sm:text-sm text-muted-foreground">{date.date}</p>
                  </div>
                  <Badge variant="secondary" className="text-base sm:text-sm py-1">
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
        <ThemedCardHeader className="p-6 sm:p-6">
          <ThemedCardTitle className="flex items-center gap-3 text-xl sm:text-xl">
            <Star className="w-6 h-6 sm:w-6 sm:h-6 text-primary" />
            Top 3 Priorities
          </ThemedCardTitle>
        </ThemedCardHeader>
        <ThemedCardContent className="p-6 sm:p-6 pt-0 sm:pt-0">
          <div className="space-y-4 sm:space-y-3">
            {priorities.map((priority, idx) => (
              <div key={idx} className="flex items-center gap-4 sm:gap-3 p-4 sm:p-3 rounded-lg bg-muted/30">
                <input type="checkbox" checked={priority.done} readOnly className="w-6 h-6 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="text-lg sm:text-base flex-1">{priority.text}</span>
              </div>
            ))}
          </div>
        </ThemedCardContent>
      </ThemedCard>
    ),
    "mood": (
      <ThemedCard variant="glow" key="mood">
        <ThemedCardHeader className="p-6 sm:p-6">
          <ThemedCardTitle className="flex items-center gap-3 text-xl sm:text-xl">
            <Moon className="w-6 h-6 sm:w-6 sm:h-6 text-accent" />
            Mood & Energy
          </ThemedCardTitle>
        </ThemedCardHeader>
        <ThemedCardContent className="p-6 sm:p-6 pt-0 sm:pt-0">
          <div className="space-y-6 sm:space-y-5">
            <div>
              <p className="text-lg sm:text-base font-medium mb-4 sm:mb-3">Current Mood</p>
              <div className="flex gap-3 sm:gap-3">
                {moods.map((emoji, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMood(emoji)}
                    className={`text-4xl sm:text-3xl p-4 sm:p-3 rounded-lg transition-all ${
                      mood === emoji ? "bg-primary/20 scale-110" : "bg-muted/30 hover:bg-muted/50"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-4 sm:mb-3">
                <p className="text-lg sm:text-base font-medium">Spoons Today</p>
                <div className="flex gap-3 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Zap
                      key={s}
                      className={`w-7 h-7 sm:w-5 sm:h-5 cursor-pointer ${
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
        <ThemedCardHeader className="p-6 sm:p-6">
          <ThemedCardTitle className="flex items-center gap-3 text-xl sm:text-xl">
            <StickyNote className="w-6 h-6 sm:w-6 sm:h-6 text-primary" />
            Quick Notes
          </ThemedCardTitle>
        </ThemedCardHeader>
        <ThemedCardContent className="p-6 sm:p-6 pt-0 sm:pt-0">
          <Textarea
            placeholder="Jot down quick thoughts..."
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
            className="min-h-[140px] sm:min-h-[120px] resize-none text-lg sm:text-base"
          />
        </ThemedCardContent>
      </ThemedCard>
    ),
  };

  return (
    <div className="space-y-10 pb-12 relative">
      {/* Header with Date */}
      <div className="text-center space-y-4 border-b border-border pb-8">
        <div className="flex items-center justify-center gap-4">
          <Moon className="w-9 h-9 sm:w-10 sm:h-10 text-primary" />
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-primary">
            Chaos Planner
          </h1>
          <Sparkles className="w-9 h-9 sm:w-10 sm:h-10 text-accent" />
        </div>
        <div className="space-y-2">
          <p className="text-3xl sm:text-4xl font-semibold text-foreground">{dayName}</p>
          <p className="text-lg sm:text-xl text-muted-foreground">{dateString}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-heading font-semibold text-foreground flex items-center gap-3">
          <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link href={`/daily/${todayForPlanner}`}>
            <Button variant="outline" className="h-auto py-6 sm:py-7 flex flex-col gap-3 w-full">
              <Calendar className="w-8 h-8 sm:w-9 sm:h-9" />
              <span className="text-base sm:text-lg font-medium">Today's Planner</span>
            </Button>
          </Link>
          <Link href="/meals">
            <Button variant="outline" className="h-auto py-6 sm:py-7 flex flex-col gap-3 w-full">
              <Utensils className="w-8 h-8 sm:w-9 sm:h-9" />
              <span className="text-base sm:text-lg font-medium">Plan Meals</span>
            </Button>
          </Link>
          <Link href="/birthdays">
            <Button variant="outline" className="h-auto py-6 sm:py-7 flex flex-col gap-3 w-full">
              <Cake className="w-8 h-8 sm:w-9 sm:h-9" />
              <span className="text-base sm:text-lg font-medium">Add Birthday</span>
            </Button>
          </Link>
          <Button variant="outline" className="h-auto py-6 sm:py-7 flex flex-col gap-3" onClick={() => {
            const note = prompt("Enter your quick note:");
            if (note) {
              setQuickNote(note);
            }
          }}>
            <StickyNote className="w-8 h-8 sm:w-9 sm:h-9" />
            <span className="text-base sm:text-lg font-medium">Quick Note</span>
          </Button>
        </div>
      </div>

      {/* Dynamically ordered widgets */}
      <div className="space-y-6">
        {widgetOrder.map((widgetKey) => {
          const widget = widgetComponents[widgetKey];
          if (!widget) return null;
          
          // Render progress-summary full width
          if (widgetKey === "progress-summary") {
            return widget;
          }
          
          return null; // Will be handled by grid sections below
        })}
        
        {/* Two-column grid section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {widgetOrder
            .filter(key => ["schedule", "meals", "birthdays", "dates"].includes(key))
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