import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { ThemedCard } from "@/components/ui/themed-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Calendar,
  Sparkles,
  Home,
  Utensils,
  Cake,
  Flame,
  Trophy,
  Heart,
  Star,
  Zap,
} from "lucide-react";
import {
  getCleaningTasks,
  getCleaningStreak,
  getAllRoomsProgress,
  getDeepCleanTasks,
  getDeclutterProgress,
  getAllWeeklyMealPlans,
  getImportantDates,
  getDailyPlan,
  type CleaningTask,
} from "@/lib/storage";

interface Stats {
  tasksCompletedWeek: number;
  tasksCompletedMonth: number;
  tasksCompletedAllTime: number;
  dailyProgress: number;
  weeklyProgress: number;
  deepProgress: number;
  currentStreak: number;
  bestStreak: number;
  plannerStreak: number;
  plannerBestStreak: number;
  mealPlansCreated: number;
  birthdaysTracked: number;
  declutterProgress: number;
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats>({
    tasksCompletedWeek: 0,
    tasksCompletedMonth: 0,
    tasksCompletedAllTime: 0,
    dailyProgress: 0,
    weeklyProgress: 0,
    deepProgress: 0,
    currentStreak: 0,
    bestStreak: 0,
    plannerStreak: 0,
    plannerBestStreak: 0,
    mealPlansCreated: 0,
    birthdaysTracked: 0,
    declutterProgress: 0,
  });

  const [roomsProgress, setRoomsProgress] = useState<Array<{ room: string; percentage: number }>>([]);

  useEffect(() => {
    calculateStats();
  }, []);

  const calculateStats = () => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    
    // Get all cleaning tasks
    const tasks = getCleaningTasks();
    
    // Calculate week start (Monday)
    const weekStart = new Date(today);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
    weekStart.setDate(diff);
    const weekStartStr = weekStart.toISOString().split("T")[0];
    
    // Calculate month start
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthStartStr = monthStart.toISOString().split("T")[0];
    
    // Count completed tasks
    const completedThisWeek = tasks.filter(t => 
      t.lastCompleted && t.lastCompleted >= weekStartStr
    ).length;
    
    const completedThisMonth = tasks.filter(t => 
      t.lastCompleted && t.lastCompleted >= monthStartStr
    ).length;
    
    const completedAllTime = tasks.filter(t => t.lastCompleted).length;
    
    // Daily progress
    const dailyTasks = tasks.filter(t => t.frequency === "daily");
    const dailyCompleted = dailyTasks.filter(t => t.lastCompleted === todayStr).length;
    const dailyProgress = dailyTasks.length > 0 
      ? Math.round((dailyCompleted / dailyTasks.length) * 100) 
      : 0;
    
    // Weekly progress
    const weeklyTasks = tasks.filter(t => t.frequency === "weekly");
    const weeklyCompleted = weeklyTasks.filter(t => {
      if (!t.lastCompleted) return false;
      const completedDate = new Date(t.lastCompleted);
      return completedDate >= weekStart;
    }).length;
    const weeklyProgress = weeklyTasks.length > 0 
      ? Math.round((weeklyCompleted / weeklyTasks.length) * 100) 
      : 0;
    
    // Deep clean progress
    const deepTasks = getDeepCleanTasks();
    const deepCompleted = deepTasks.filter(t => t.completed).length;
    const deepProgress = deepTasks.length > 0 
      ? Math.round((deepCompleted / deepTasks.length) * 100) 
      : 0;
    
    // Streaks
    const streak = getCleaningStreak();
    
    // Planner streaks (consecutive days with plans)
    const { current: plannerStreak, longest: plannerBestStreak } = calculatePlannerStreak();
    
    // Meal plans
    const mealPlans = getAllWeeklyMealPlans();
    
    // Important dates
    const importantDates = getImportantDates();
    const birthdays = importantDates.filter(d => d.category === "birthday");
    
    // Declutter progress
    const declutterData = getDeclutterProgress();
    
    // Room progress
    const allRoomsProgress = getAllRoomsProgress();
    const roomsWithPercentage = allRoomsProgress.map(room => {
      const totalTasks = room.dailyTotal + room.weeklyTotal + room.monthlyTotal + room.deepTotal;
      const completedTasks = room.dailyComplete + room.weeklyComplete + room.monthlyComplete + room.deepComplete;
      const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      return { room: room.room, percentage };
    }).sort((a, b) => b.percentage - a.percentage);
    
    setStats({
      tasksCompletedWeek: completedThisWeek,
      tasksCompletedMonth: completedThisMonth,
      tasksCompletedAllTime: completedAllTime,
      dailyProgress,
      weeklyProgress,
      deepProgress,
      currentStreak: streak.current,
      bestStreak: streak.longest,
      plannerStreak,
      plannerBestStreak,
      mealPlansCreated: mealPlans.length,
      birthdaysTracked: birthdays.length,
      declutterProgress: declutterData.percentage,
    });
    
    setRoomsProgress(roomsWithPercentage);
  };

  const calculatePlannerStreak = (): { current: number; longest: number } => {
    const today = new Date();
    let current = 0;
    let longest = 0;
    let tempStreak = 0;
    
    // Check backwards from today
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split("T")[0];
      const plan = getDailyPlan(dateStr);
      
      if (plan && (plan.notes || plan.brainDump || plan.priorities.some(p => p))) {
        if (i === current) {
          current++;
        }
        tempStreak++;
        if (tempStreak > longest) {
          longest = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
    }
    
    return { current, longest };
  };

  const getMotivationalMessage = () => {
    const totalProgress = Math.round(
      (stats.dailyProgress + stats.weeklyProgress + stats.deepProgress) / 3
    );
    
    if (totalProgress >= 80) return "You're absolutely crushing it! ⭐";
    if (totalProgress >= 60) return "Fantastic progress! Keep it up! 🌟";
    if (totalProgress >= 40) return "You're doing great! 💪";
    if (totalProgress >= 20) return "Nice start! Every step counts! 🌸";
    return "Ready for a fresh start? You've got this! 💖";
  };

  return (
    <Layout>
      <SEO 
        title="Statistics & Progress"
        description="Track your progress and streaks across all your tasks"
      />
      
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="font-heading text-4xl font-bold text-foreground flex items-center justify-center gap-3">
            <BarChart3 className="w-10 h-10 text-primary" />
            Your Progress
          </h1>
          <p className="text-lg text-muted-foreground">
            {getMotivationalMessage()}
          </p>
        </div>

        {/* Task Completion Metrics */}
        <ThemedCard variant="gradient" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h2 className="font-heading text-2xl font-bold">Tasks Completed</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-primary">
                {stats.tasksCompletedWeek}
              </div>
              <div className="text-sm text-muted-foreground">This Week</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-accent">
                {stats.tasksCompletedMonth}
              </div>
              <div className="text-sm text-muted-foreground">This Month</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-secondary">
                {stats.tasksCompletedAllTime}
              </div>
              <div className="text-sm text-muted-foreground">All Time</div>
            </div>
          </div>
        </ThemedCard>

        {/* Progress Rings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ThemedCard variant="elevated" className="p-6">
            <div className="flex flex-col items-center gap-4">
              <ProgressRing 
                progress={stats.dailyProgress} 
                size={140}
                strokeWidth={12}
              />
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="font-heading text-lg font-bold">Daily Tasks</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {stats.dailyProgress}% Complete
                </p>
              </div>
            </div>
          </ThemedCard>

          <ThemedCard variant="elevated" className="p-6">
            <div className="flex flex-col items-center gap-4">
              <ProgressRing 
                progress={stats.weeklyProgress} 
                size={140}
                strokeWidth={12}
                color="var(--accent)"
              />
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Calendar className="w-5 h-5 text-accent" />
                  <h3 className="font-heading text-lg font-bold">Weekly Tasks</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {stats.weeklyProgress}% Complete
                </p>
              </div>
            </div>
          </ThemedCard>

          <ThemedCard variant="elevated" className="p-6">
            <div className="flex flex-col items-center gap-4">
              <ProgressRing 
                progress={stats.deepProgress} 
                size={140}
                strokeWidth={12}
                color="var(--secondary)"
              />
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Star className="w-5 h-5 text-secondary" />
                  <h3 className="font-heading text-lg font-bold">Deep Clean</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {stats.deepProgress}% Complete
                </p>
              </div>
            </div>
          </ThemedCard>
        </div>

        {/* Streaks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ThemedCard variant="glow" className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Flame className="w-6 h-6 text-primary" />
              <h2 className="font-heading text-xl font-bold">Cleaning Streaks</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Current Streak</div>
                  <div className="text-3xl font-bold text-primary">
                    {stats.currentStreak} days
                  </div>
                </div>
                {stats.currentStreak > 0 && (
                  <Badge variant="default" className="text-lg px-4 py-2">
                    <Flame className="w-4 h-4 mr-1" />
                    On fire!
                  </Badge>
                )}
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-border">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Best Streak</div>
                  <div className="text-2xl font-bold text-accent">
                    {stats.bestStreak} days
                  </div>
                </div>
                <Trophy className="w-8 h-8 text-accent" />
              </div>
            </div>
          </ThemedCard>

          <ThemedCard variant="glow" className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-accent" />
              <h2 className="font-heading text-xl font-bold">Planner Streaks</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Current Streak</div>
                  <div className="text-3xl font-bold text-accent">
                    {stats.plannerStreak} days
                  </div>
                </div>
                {stats.plannerStreak > 0 && (
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    <Heart className="w-4 h-4 mr-1" />
                    Consistent!
                  </Badge>
                )}
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-border">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Best Streak</div>
                  <div className="text-2xl font-bold text-secondary">
                    {stats.plannerBestStreak} days
                  </div>
                </div>
                <Trophy className="w-8 h-8 text-secondary" />
              </div>
            </div>
          </ThemedCard>
        </div>

        {/* Room Progress */}
        <ThemedCard variant="gradient" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Home className="w-6 h-6 text-primary" />
            <h2 className="font-heading text-2xl font-bold">Room Progress</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roomsProgress.map((room) => (
              <div key={room.room} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{room.room}</span>
                  <span className="text-sm font-bold text-primary">
                    {room.percentage}%
                  </span>
                </div>
                <Progress value={room.percentage} className="h-3" />
              </div>
            ))}
          </div>
        </ThemedCard>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ThemedCard variant="elevated" className="p-6 text-center">
            <Utensils className="w-10 h-10 text-primary mx-auto mb-3" />
            <div className="text-3xl font-bold text-primary mb-2">
              {stats.mealPlansCreated}
            </div>
            <div className="text-sm text-muted-foreground">
              Weekly Meal Plans Created
            </div>
          </ThemedCard>

          <ThemedCard variant="elevated" className="p-6 text-center">
            <Cake className="w-10 h-10 text-accent mx-auto mb-3" />
            <div className="text-3xl font-bold text-accent mb-2">
              {stats.birthdaysTracked}
            </div>
            <div className="text-sm text-muted-foreground">
              Birthdays Tracked
            </div>
          </ThemedCard>

          <ThemedCard variant="elevated" className="p-6 text-center">
            <Star className="w-10 h-10 text-secondary mx-auto mb-3" />
            <div className="text-3xl font-bold text-secondary mb-2">
              {stats.declutterProgress}%
            </div>
            <div className="text-sm text-muted-foreground">
              Declutter Challenge
            </div>
          </ThemedCard>
        </div>

        {/* Motivational Footer */}
        <ThemedCard variant="glow" className="p-8 text-center">
          <div className="max-w-2xl mx-auto space-y-3">
            <Heart className="w-12 h-12 text-primary mx-auto" />
            <h3 className="font-heading text-2xl font-bold">
              Every step forward is progress! 💖
            </h3>
            <p className="text-muted-foreground">
              Remember, progress isn&apos;t about perfection. It&apos;s about showing up and doing what you can, when you can. You&apos;re doing amazing!
            </p>
          </div>
        </ThemedCard>
      </div>
    </Layout>
  );
}