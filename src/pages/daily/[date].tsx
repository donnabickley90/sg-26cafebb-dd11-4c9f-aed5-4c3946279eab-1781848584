import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Star,
  Smile,
  Zap,
  UtensilsCrossed,
  SparklesIcon,
  Moon,
  AlertCircle,
} from "lucide-react";
import {
  getOrCreateDailyPlan,
  saveDailyPlan,
  getTodaysMealsFromWeekly,
  getChoresForDate,
  getBirthdaysForDate,
  type DailyPlannerData,
} from "@/lib/storage";
import Link from "next/link";

export default function DailyPlannerPage() {
  const router = useRouter();
  const { date: dateParam } = router.query;
  const dateStr = typeof dateParam === "string" ? dateParam : "";

  const [dailyData, setDailyData] = useState<DailyPlannerData | null>(null);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    if (dateStr) {
      const date = new Date(dateStr + "T12:00:00");
      setCurrentDate(date);
      const data = getOrCreateDailyPlan(dateStr);
      setDailyData(data);
    }
  }, [dateStr]);

  useEffect(() => {
    if (dailyData) {
      const timer = setTimeout(() => {
        saveDailyPlan(dailyData);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [dailyData]);

  const updateField = (field: keyof DailyPlannerData, value: any) => {
    if (dailyData) {
      setDailyData({ ...dailyData, [field]: value });
    }
  };

  const updateHourlyBlock = (hour: string, field: "task" | "completed", value: any) => {
    if (dailyData) {
      setDailyData({
        ...dailyData,
        hourlyBlocks: {
          ...dailyData.hourlyBlocks,
          [hour]: {
            ...dailyData.hourlyBlocks[hour],
            [field]: value,
          },
        },
      });
    }
  };

  const updatePriority = (index: number, value: string) => {
    if (dailyData) {
      const newPriorities = [...dailyData.priorities];
      newPriorities[index] = value;
      setDailyData({ ...dailyData, priorities: newPriorities });
    }
  };

  const navigateDate = (offset: number) => {
    if (currentDate) {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + offset);
      const newDateStr = newDate.toISOString().split("T")[0];
      router.push(`/daily/${newDateStr}`);
    }
  };

  if (!dailyData || !currentDate) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </Layout>
    );
  }

  const formatDateDisplay = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const hours = Array.from({ length: 19 }, (_, i) => {
    const h = i + 5;
    return {
      time: `${h.toString().padStart(2, "0")}:00`,
      display: h === 12 ? "12:00 PM" : h > 12 ? `${h - 12}:00 PM` : `${h}:00 AM`,
    };
  });

  const mealsData = getTodaysMealsFromWeekly(dateStr);
  const choresData = getChoresForDate(dateStr);
  const birthdaysData = getBirthdaysForDate(dateStr);

  const moods = [
    { emoji: "😄", label: "Great" },
    { emoji: "🙂", label: "Good" },
    { emoji: "😐", label: "Okay" },
    { emoji: "😔", label: "Low" },
    { emoji: "😣", label: "Rough" },
  ];

  return (
    <Layout>
      <SEO
        title={`${formatDateDisplay(currentDate)} - Daily Planner`}
        description="Your daily planner with hourly schedule, priorities, and trackers"
      />

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Header with Date Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigateDate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-1">{formatDateDisplay(currentDate)}</h1>
            <Link href="/calendar">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                View Calendar
              </Button>
            </Link>
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigateDate(1)}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column - Priorities, Mood, Energy */}
          <div className="lg:col-span-1 space-y-6">
            {/* Top 3 Priorities */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Top 3 Priorities</h2>
              </div>
              <div className="space-y-3">
                {dailyData.priorities.map((priority, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-primary font-bold">{idx + 1}.</span>
                    <Input
                      value={priority}
                      onChange={(e) => updatePriority(idx, e.target.value)}
                      placeholder={`Priority ${idx + 1}`}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            </Card>

            {/* Mood Tracker */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Smile className="h-5 w-5 text-accent" />
                <h2 className="text-xl font-bold">Today's Mood</h2>
              </div>
              <div className="flex justify-between gap-2">
                {moods.map((mood) => (
                  <button
                    key={mood.label}
                    onClick={() => updateField("mood", mood.label)}
                    className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                      dailyData.mood === mood.label
                        ? "bg-primary/20 border-2 border-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    <span className="text-2xl mb-1">{mood.emoji}</span>
                    <span className="text-xs">{mood.label}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Energy/Spoons Tracker */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-secondary" />
                <h2 className="text-xl font-bold">Energy Level</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-bold text-primary">{dailyData.energy}</span>
                  <span className="text-sm text-muted-foreground">/ 5 spoons</span>
                </div>
                <Slider
                  value={[dailyData.energy]}
                  onValueChange={(v) => updateField("energy", v[0])}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
              </div>
            </Card>

            {/* Daily Reminder */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="h-5 w-5 text-accent" />
                <h2 className="text-xl font-bold">Daily Reminder</h2>
              </div>
              <Textarea
                value={dailyData.dailyReminder}
                onChange={(e) => updateField("dailyReminder", e.target.value)}
                placeholder="Important reminder for today..."
                rows={3}
              />
            </Card>

            {/* Cross-Module Widgets */}
            {birthdaysData.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <SparklesIcon className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">Birthdays Today</h2>
                </div>
                <div className="space-y-2">
                  {birthdaysData.map((birthday) => (
                    <div key={birthday.id} className="text-sm">
                      🎉 <span className="font-semibold">{birthday.name}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {mealsData && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <UtensilsCrossed className="h-5 w-5 text-accent" />
                  <h2 className="text-xl font-bold">Today's Meals</h2>
                </div>
                <div className="space-y-2 text-sm">
                  {mealsData.breakfast && (
                    <div>
                      <span className="font-semibold">Breakfast:</span> {mealsData.breakfast}
                    </div>
                  )}
                  {mealsData.lunch && (
                    <div>
                      <span className="font-semibold">Lunch:</span> {mealsData.lunch}
                    </div>
                  )}
                  {mealsData.dinner && (
                    <div>
                      <span className="font-semibold">Dinner:</span> {mealsData.dinner}
                    </div>
                  )}
                  {mealsData.snacks && (
                    <div>
                      <span className="font-semibold">Snacks:</span> {mealsData.snacks}
                    </div>
                  )}
                  {mealsData.drinks && (
                    <div>
                      <span className="font-semibold">Drinks:</span> {mealsData.drinks}
                    </div>
                  )}
                </div>
                <Link href="/meals">
                  <Button variant="outline" size="sm" className="mt-3 w-full">
                    Edit Meals
                  </Button>
                </Link>
              </Card>
            )}

            {choresData.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <SparklesIcon className="h-5 w-5 text-secondary" />
                  <h2 className="text-xl font-bold">Chores Due Today</h2>
                </div>
                <div className="space-y-2">
                  {choresData.map((chore) => (
                    <div key={chore.id} className="text-sm">
                      • <span className="font-semibold">{chore.room}:</span> {chore.task}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Hourly Schedule - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Moon className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">Hourly Schedule</h2>
              </div>
              <div className="space-y-3">
                {hours.map(({ time, display }) => {
                  const block = dailyData.hourlyBlocks[time];
                  return (
                    <div
                      key={time}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        checked={block.completed}
                        onCheckedChange={(checked) =>
                          updateHourlyBlock(time, "completed", checked)
                        }
                      />
                      <span className="font-semibold text-sm w-24 text-muted-foreground">
                        {display}
                      </span>
                      <Input
                        value={block.task}
                        onChange={(e) => updateHourlyBlock(time, "task", e.target.value)}
                        placeholder="What are you doing?"
                        className="flex-1"
                      />
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Daily Notes */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Daily Notes</h2>
              <Textarea
                value={dailyData.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="Notes, thoughts, reflections..."
                rows={6}
              />
            </Card>

            {/* Brain Dump */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Brain Dump</h2>
              <Textarea
                value={dailyData.brainDump}
                onChange={(e) => updateField("brainDump", e.target.value)}
                placeholder="Get everything out of your head..."
                rows={6}
              />
            </Card>

            {/* Tomorrow Reminder */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Tomorrow's Reminder</h2>
              <Textarea
                value={dailyData.tomorrowReminder}
                onChange={(e) => updateField("tomorrowReminder", e.target.value)}
                placeholder="What to remember for tomorrow..."
                rows={4}
              />
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}