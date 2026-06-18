import { ThemedCard, ThemedCardHeader, ThemedCardTitle, ThemedCardDescription, ThemedCardContent } from "@/components/ui/themed-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Calendar, Utensils, Broom } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="font-heading text-5xl md:text-6xl font-bold text-primary">
          Welcome to Your Chaos Planner
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Your private sanctuary for organizing life&apos;s beautiful chaos. Everything stays local, everything stays yours.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ThemedCard variant="glow">
          <ThemedCardHeader>
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-primary" />
              <ThemedCardTitle>Today&apos;s Focus</ThemedCardTitle>
            </div>
            <ThemedCardDescription>
              Your hourly schedule and mood tracking
            </ThemedCardDescription>
          </ThemedCardHeader>
          <ThemedCardContent>
            <div className="flex justify-center">
              <ProgressRing progress={35} size={100} />
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              6 of 17 hours planned
            </p>
          </ThemedCardContent>
        </ThemedCard>

        <ThemedCard variant="glow">
          <ThemedCardHeader>
            <div className="flex items-center gap-3">
              <Utensils className="w-6 h-6 text-accent" />
              <ThemedCardTitle>Meal Planning</ThemedCardTitle>
            </div>
            <ThemedCardDescription>
              This week&apos;s delicious adventures
            </ThemedCardDescription>
          </ThemedCardHeader>
          <ThemedCardContent>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Meals Planned</span>
                  <span className="text-sm text-muted-foreground">12/21</span>
                </div>
                <Progress value={57} className="h-2" />
              </div>
            </div>
          </ThemedCardContent>
        </ThemedCard>

        <ThemedCard variant="glow">
          <ThemedCardHeader>
            <div className="flex items-center gap-3">
              <Broom className="w-6 h-6 text-secondary-foreground" />
              <ThemedCardTitle>Chaos Cleaner</ThemedCardTitle>
            </div>
            <ThemedCardDescription>
              Keep your spaces sparkling
            </ThemedCardDescription>
          </ThemedCardHeader>
          <ThemedCardContent>
            <div className="flex justify-center">
              <ProgressRing progress={68} size={100} />
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              7 of 11 rooms cleaned today
            </p>
          </ThemedCardContent>
        </ThemedCard>
      </div>

      <ThemedCard variant="primary" className="overflow-hidden">
        <ThemedCardHeader>
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-primary" />
            <ThemedCardTitle>30-Day Declutter Challenge</ThemedCardTitle>
          </div>
          <ThemedCardDescription>
            One small step each day toward a clearer space
          </ThemedCardDescription>
        </ThemedCardHeader>
        <ThemedCardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Challenge Progress</span>
                <span className="text-sm text-muted-foreground">Day 8/30</span>
              </div>
              <Progress value={27} className="h-3" />
            </div>
            <p className="text-sm text-muted-foreground">
              Current task: Organize one drawer in your bedroom
            </p>
          </div>
        </ThemedCardContent>
      </ThemedCard>
    </div>
  );
}
