import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ThemedCard, ThemedCardHeader, ThemedCardTitle, ThemedCardContent } from "@/components/ui/themed-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft,
  Plus,
  Home as HomeIcon
} from "lucide-react";
import {
  PREDEFINED_ROOMS,
  addCleaningTask
} from "@/lib/storage";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AddTaskPage() {
  const router = useRouter();
  const { room: queryRoom } = router.query;
  
  const [task, setTask] = useState("");
  const [room, setRoom] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly" | "deep">("daily");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (queryRoom && typeof queryRoom === "string") {
      setRoom(decodeURIComponent(queryRoom));
    }
  }, [queryRoom]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!task.trim() || !room) {
      alert("Please fill in task name and room");
      return;
    }

    addCleaningTask({
      task: task.trim(),
      room,
      frequency,
      priority,
      notes: notes.trim(),
    });

    router.push(`/cleaning/room/${encodeURIComponent(room)}`);
  };

  return (
    <div className="space-y-6 pb-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/cleaning">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <Plus className="w-8 h-8 text-primary" />
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Add Cleaning Task</h1>
            <p className="text-sm text-muted-foreground">Create a new room cleaning task</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <ThemedCard variant="glow">
        <ThemedCardHeader>
          <ThemedCardTitle className="flex items-center gap-2">
            <HomeIcon className="w-5 h-5" />
            Task Details
          </ThemedCardTitle>
        </ThemedCardHeader>
        <ThemedCardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="task">Task Name *</Label>
              <Input
                id="task"
                placeholder="e.g., Wipe counters"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="room">Room *</Label>
              <Select value={room} onValueChange={setRoom} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a room" />
                </SelectTrigger>
                <SelectContent>
                  {PREDEFINED_ROOMS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency *</Label>
              <Select value={frequency} onValueChange={(val) => setFrequency(val as any)} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="deep">Deep Clean</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(val) => setPriority(val as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional details or instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
              <Link href="/cleaning">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </ThemedCardContent>
      </ThemedCard>
    </div>
  );
}