import { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDateIndicators } from "@/lib/storage";
import Link from "next/link";

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1));
  const [view, setView] = useState<"month" | "week" | "year">("month");

  const formatDate = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add leading days from previous month
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push(d);
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Add trailing days from next month
    const remainingDays = 42 - days.length; // 6 rows of 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const getWeekDays = (date: Date): Date[] => {
    const day = date.getDay();
    const diff = date.getDate() - day;
    const sunday = new Date(date.setDate(diff));
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + i));
    }
    return days;
  };

  const getAllMonths2026 = (): Date[] => {
    return Array.from({ length: 12 }, (_, i) => new Date(2026, i, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextWeek = () => {
    const newDate = new Date(currentMonth);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentMonth(newDate);
  };

  const prevWeek = () => {
    const newDate = new Date(currentMonth);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentMonth(newDate);
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const DayIndicators = ({ date }: { date: Date }) => {
    const indicators = getDateIndicators(formatDate(date));
    return (
      <div className="flex gap-1 justify-center mt-1">
        {indicators.hasBirthday && (
          <div className="w-1.5 h-1.5 rounded-full bg-primary" title="Birthday" />
        )}
        {indicators.hasMeal && (
          <div className="w-1.5 h-1.5 rounded-full bg-accent" title="Meal planned" />
        )}
        {indicators.hasChores && (
          <div className="w-1.5 h-1.5 rounded-full bg-secondary" title="Chores due" />
        )}
        {indicators.hasPlan && (
          <div className="w-1.5 h-1.5 rounded-full bg-foreground/50" title="Has plan" />
        )}
      </div>
    );
  };

  const MonthView = () => {
    const days = getDaysInMonth(currentMonth);
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-bold">
            {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h2>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
              {day}
            </div>
          ))}
          {days.map((day, i) => {
            const dateStr = formatDate(day);
            return (
              <Link key={i} href={`/daily/${dateStr}`}>
                <Card
                  className={`p-3 text-center cursor-pointer transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/20 ${
                    !isCurrentMonth(day) ? "opacity-40" : ""
                  } ${isToday(day) ? "border-primary border-2" : ""}`}
                >
                  <div className="text-lg font-semibold">{day.getDate()}</div>
                  <DayIndicators date={day} />
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    );
  };

  const WeekView = () => {
    const days = getWeekDays(new Date(currentMonth));
    const hours = Array.from({ length: 19 }, (_, i) => i + 5); // 5 AM to 11 PM

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={prevWeek}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-bold">
            Week of {days[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </h2>
          <Button variant="ghost" size="icon" onClick={nextWeek}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-8 gap-2 overflow-x-auto">
          <div className="col-span-1"></div>
          {days.map((day, i) => (
            <Link key={i} href={`/daily/${formatDate(day)}`}>
              <Card
                className={`p-2 text-center cursor-pointer hover:border-primary ${
                  isToday(day) ? "border-primary" : ""
                }`}
              >
                <div className="font-semibold text-sm">
                  {day.toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div className="text-lg">{day.getDate()}</div>
                <DayIndicators date={day} />
              </Card>
            </Link>
          ))}

          {hours.map((hour) => (
            <>
              <div key={`time-${hour}`} className="text-right text-sm text-muted-foreground pr-2">
                {hour === 12 ? "12 PM" : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
              </div>
              {days.map((day, dayIdx) => (
                <Card
                  key={`${hour}-${dayIdx}`}
                  className="h-12 hover:border-primary cursor-pointer"
                />
              ))}
            </>
          ))}
        </div>
      </div>
    );
  };

  const YearView = () => {
    const months = getAllMonths2026();

    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-center">2026 Year Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {months.map((month, idx) => {
            const days = getDaysInMonth(month);
            const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

            return (
              <Card key={idx} className="p-4">
                <h3 className="text-center font-bold mb-3">
                  {month.toLocaleDateString("en-US", { month: "long" })}
                </h3>
                <div className="grid grid-cols-7 gap-1">
                  {weekDays.map((day, i) => (
                    <div key={i} className="text-center text-xs text-muted-foreground">
                      {day}
                    </div>
                  ))}
                  {days.map((day, i) => {
                    const dateStr = formatDate(day);
                    return (
                      <Link key={i} href={`/daily/${dateStr}`}>
                        <div
                          className={`text-center text-xs p-1 cursor-pointer hover:bg-primary/20 rounded ${
                            !isCurrentMonth(day) ? "opacity-30" : ""
                          } ${isToday(day) ? "bg-primary text-primary-foreground" : ""}`}
                        >
                          {day.getDate()}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <SEO
        title="Calendar - Kitten's 2026 Chaos Planner"
        description="View your 2026 calendar with daily, weekly, monthly, and yearly views"
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center gap-3 mb-8">
          <CalendarIcon className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">2026 Calendar</h1>
        </div>

        <Tabs value={view} onValueChange={(v) => setView(v as any)} className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>

          <TabsContent value="month">
            <MonthView />
          </TabsContent>

          <TabsContent value="week">
            <WeekView />
          </TabsContent>

          <TabsContent value="year">
            <YearView />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}