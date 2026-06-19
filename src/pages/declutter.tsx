import { useState, useEffect } from "react";
import { ThemedCard, ThemedCardHeader, ThemedCardTitle, ThemedCardDescription, ThemedCardContent } from "@/components/ui/themed-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Sparkles, Calendar, CheckCircle2, Circle, RotateCcw, Trophy, Star } from "lucide-react";
import {
  getOrCreateDeclutterChallenge,
  markDeclutterDayComplete,
  markDeclutterDayIncomplete,
  updateDeclutterDayNotes,
  setDeclutterStartDate,
  resetDeclutterChallenge,
  getDeclutterProgress,
  getCurrentDeclutterDay,
  type DeclutterChallenge,
} from "@/lib/storage";

export default function DeclutterPage() {
  const [challenge, setChallenge] = useState<DeclutterChallenge | null>(null);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [startDate, setStartDateValue] = useState("");
  const [progress, setProgress] = useState({ completedDays: 0, totalDays: 30, completedItems: 0, totalItems: 465, percentage: 0 });
  const [currentDay, setCurrentDay] = useState<number | null>(null);

  useEffect(() => {
    loadChallenge();
  }, []);

  const loadChallenge = () => {
    const data = getOrCreateDeclutterChallenge();
    setChallenge(data);
    setStartDateValue(data.startDate || "");
    
    const prog = getDeclutterProgress();
    setProgress(prog);
    
    const current = getCurrentDeclutterDay();
    setCurrentDay(current);
  };

  const handleToggleDay = (dayNumber: number) => {
    if (!challenge) return;
    
    const dayKey = dayNumber.toString();
    const isCompleted = challenge.days[dayKey].completed;
    
    if (isCompleted) {
      markDeclutterDayIncomplete(dayNumber);
    } else {
      markDeclutterDayComplete(dayNumber, challenge.days[dayKey].notes);
    }
    
    loadChallenge();
  };

  const handleSaveNotes = (dayNumber: number) => {
    updateDeclutterDayNotes(dayNumber, editNotes);
    setEditingDay(null);
    setEditNotes("");
    loadChallenge();
  };

  const handleStartEditNotes = (dayNumber: number) => {
    if (!challenge) return;
    const dayKey = dayNumber.toString();
    setEditingDay(dayNumber);
    setEditNotes(challenge.days[dayKey].notes || "");
  };

  const handleSetStartDate = () => {
    if (startDate) {
      setDeclutterStartDate(startDate);
      loadChallenge();
    }
  };

  const handleReset = () => {
    resetDeclutterChallenge();
    setStartDateValue("");
    loadChallenge();
  };

  if (!challenge) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            <div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
                30-Day Declutter Challenge
              </h1>
              <p className="text-muted-foreground">Clear 465 items in 30 days</p>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Challenge
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset Declutter Challenge?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will clear all progress and start fresh. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset}>Reset</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Progress Overview */}
        <ThemedCard variant="primary">
          <ThemedCardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center space-y-3">
                <ProgressRing progress={progress.percentage} size={120} />
                <div className="text-center">
                  <p className="text-2xl font-bold">{progress.completedItems}/{progress.totalItems}</p>
                  <p className="text-sm text-muted-foreground">Items Decluttered</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center space-y-2">
                <Trophy className="w-12 h-12 text-accent" />
                <p className="text-3xl font-bold">{progress.completedDays}/30</p>
                <p className="text-sm text-muted-foreground">Days Completed</p>
              </div>
              
              <div className="flex flex-col items-center justify-center space-y-2">
                {currentDay ? (
                  <>
                    <Star className="w-12 h-12 text-primary" />
                    <p className="text-3xl font-bold">Day {currentDay}</p>
                    <p className="text-sm text-muted-foreground">Current Challenge Day</p>
                  </>
                ) : (
                  <>
                    <Calendar className="w-12 h-12 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Set start date below</p>
                  </>
                )}
              </div>
            </div>
          </ThemedCardContent>
        </ThemedCard>

        {/* Start Date Picker */}
        <ThemedCard variant="glow">
          <ThemedCardHeader>
            <ThemedCardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Challenge Start Date (Optional)
            </ThemedCardTitle>
            <ThemedCardDescription>
              Set a start date to track which day of the challenge you're on
            </ThemedCardDescription>
          </ThemedCardHeader>
          <ThemedCardContent>
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDateValue(e.target.value)}
                />
              </div>
              <Button onClick={handleSetStartDate} disabled={!startDate}>
                Set Start Date
              </Button>
            </div>
            {challenge.startDate && (
              <p className="text-sm text-muted-foreground mt-2">
                Started: {new Date(challenge.startDate).toLocaleDateString("en-US", { 
                  month: "long", 
                  day: "numeric", 
                  year: "numeric" 
                })}
              </p>
            )}
          </ThemedCardContent>
        </ThemedCard>
      </div>

      {/* Day-by-Day Checklist */}
      <div className="space-y-4">
        <h2 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-primary" />
          Daily Progress
        </h2>

        <div className="grid grid-cols-1 gap-3">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((dayNumber) => {
            const dayKey = dayNumber.toString();
            const day = challenge.days[dayKey];
            const isEditing = editingDay === dayNumber;
            const isCurrent = currentDay === dayNumber;

            return (
              <ThemedCard
                key={dayNumber}
                variant={day.completed ? "primary" : isCurrent ? "glow" : "default"}
                className="transition-all hover:scale-[1.01]"
              >
                <ThemedCardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Button
                        size="icon"
                        variant={day.completed ? "default" : "outline"}
                        onClick={() => handleToggleDay(dayNumber)}
                        className="shrink-0"
                      >
                        {day.completed ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </Button>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">Day {dayNumber}</h3>
                          <Badge variant={day.completed ? "default" : "outline"}>
                            {dayNumber} {dayNumber === 1 ? "item" : "items"}
                          </Badge>
                          {isCurrent && (
                            <Badge variant="secondary" className="ml-auto">
                              Current Day
                            </Badge>
                          )}
                        </div>
                        {day.completedDate && (
                          <p className="text-xs text-muted-foreground">
                            Completed: {new Date(day.completedDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Notes Section */}
                    <div className="pl-12">
                      {isEditing ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            placeholder="What did you declutter today? (e.g., old clothes, unused kitchen items, papers...)"
                            className="min-h-[80px]"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleSaveNotes(dayNumber)}>
                              Save Notes
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingDay(null);
                                setEditNotes("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {day.notes ? (
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {day.notes}
                              </p>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleStartEditNotes(dayNumber)}
                              >
                                Edit Notes
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStartEditNotes(dayNumber)}
                            >
                              Add Notes
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </ThemedCardContent>
              </ThemedCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}