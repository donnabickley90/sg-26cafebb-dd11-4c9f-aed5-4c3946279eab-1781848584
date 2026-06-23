import { useState, useEffect, useRef, useCallback } from "react";
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
  Home as HomeIcon,
  RefreshCw
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

  // Pull-to-refresh state
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Pull-to-refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    // Don't interfere with button/link clicks
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, textarea, select')) {
      return;
    }
    
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === 0 || isRefreshing) return;

    // Don't interfere with button/link interactions
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, textarea, select')) {
      return;
    }

    const touchY = e.touches[0].clientY;
    const distance = touchY - touchStartY.current;

    if (distance > 0 && containerRef.current && containerRef.current.scrollTop === 0) {
      setIsPulling(true);
      setPullDistance(Math.min(distance, 120)); // Max pull distance
      
      // Only prevent default when actually pulling to refresh
      if (distance > 10) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 80 && !isRefreshing) {
      // Trigger refresh
      setIsRefreshing(true);
      setIsPulling(false);
      
      // Simulate refresh delay
      setTimeout(() => {
        loadDashboardData();
        setIsRefreshing(false);
        setPullDistance(0);
      }, 1000);
    } else {
      setIsPulling(false);
      setPullDistance(0);
    }
    
    touchStartY.current = 0;
  };

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
        <ThemedCardHeader>
          <ThemedCardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Progress Summary
          </ThemedCardTitle>
        </ThemedCardHeader>
        <ThemedCardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col items-center space-y-3">
              <ProgressRing progress={35} size={90} />
              <div className="text-center">
                <p className="text-sm font-medium">Daily Planner</p>
                <p className="text-xs text-muted-foreground">6/17 hours</p>
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
    <div 
      ref={containerRef}
      className="space-y-6 pb-8 relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      <div 
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center transition-all duration-300 pointer-events-none"
        style={{
          transform: `translateY(${isPulling ? pullDistance - 60 : isRefreshing ? 20 : -60}px)`,
          opacity: isPulling || isRefreshing ? 1 : 0,
        }}
      >
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-full px-6 py-3 shadow-lg flex items-center gap-3">
          <RefreshCw 
            className={`w-5 h-5 text-primary ${isRefreshing ? 'animate-spin' : ''}`}
            style={{
              transform: isPulling ? `rotate(${pullDistance * 3}deg)` : 'rotate(0deg)',
            }}
          />
          <span className="text-sm font-medium">
            {isRefreshing ? 'Refreshing...' : isPulling && pullDistance > 80 ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      </div>

      {/* Header with Date */}
      <div className="text-center space-y-1 sm:space-y-2 border-b border-border pb-3 sm:pb-6">
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <Moon className="w-5 h-5 sm:w-8 sm:h-8 text-primary" />
          <h1 className="font-heading text-xl sm:text-4xl md:text-5xl font-bold text-primary">
            Chaos Planner
          </h1>
          <Sparkles className="w-5 h-5 sm:w-8 sm:h-8 text-accent" />
        </div>
        <div className="space-y-0.5 sm:space-y-1">
          <p className="text-lg sm:text-2xl font-semibold text-foreground">{dayName}</p>
          <p className="text-sm sm:text-lg text-muted-foreground">{dateString}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2 sm:space-y-3">
        <h2 className="text-base sm:text-xl font-heading font-semibold text-foreground flex items-center gap-2">
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <Link href={`/daily/${todayForPlanner}`}>
            <Button variant="outline" className="h-auto py-2 sm:py-3 flex flex-col gap-1 sm:gap-2 w-full">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[10px] sm:text-xs">Today's Planner</span>
            </Button>
          </Link>
          <Link href="/meals">
            <Button variant="outline" className="h-auto py-2 sm:py-3 flex flex-col gap-1 sm:gap-2 w-full">
              <Utensils className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[10px] sm:text-xs">Plan Meals</span>
            </Button>
          </Link>
          <Link href="/birthdays">
            <Button variant="outline" className="h-auto py-2 sm:py-3 flex flex-col gap-1 sm:gap-2 w-full">
              <Cake className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[10px] sm:text-xs">Add Birthday</span>
            </Button>
          </Link>
          <Button variant="outline" className="h-auto py-2 sm:py-3 flex flex-col gap-1 sm:gap-2" onClick={() => {
            const note = prompt("Enter your quick note:");
            if (note) {
              setQuickNote(note);
            }
          }}>
            <StickyNote className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-[10px] sm:text-xs">Quick Note</span>
          </Button>
        </div>
      </div>

      {/* Dynamically ordered widgets */}
      <div className="space-y-3 sm:space-y-6">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
          {widgetOrder
            .filter(key => ["schedule", "meals", "birthdays", "dates"].includes(key))
            .map(key => widgetComponents[key])}
        </div>
        
        {/* Three-column grid section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
          {widgetOrder
            .filter(key => ["priorities", "mood", "notes"].includes(key))
            .map(key => widgetComponents[key])}
        </div>
      </div>
    </div>
  );
}