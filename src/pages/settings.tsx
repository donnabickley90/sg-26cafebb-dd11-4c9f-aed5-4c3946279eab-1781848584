import { useState, useEffect } from "react";
import { ThemedCard, ThemedCardHeader, ThemedCardTitle, ThemedCardDescription, ThemedCardContent } from "@/components/ui/themed-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Settings as SettingsIcon, 
  Download, 
  Upload, 
  Palette, 
  Database, 
  Shield, 
  Trash2,
  Plus,
  X,
  ChevronUp,
  ChevronDown,
  Home as HomeIcon,
  Copy
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface AccentColor {
  name: string;
  value: string;
  hsl: string;
}

const ACCENT_COLORS: AccentColor[] = [
  { name: "Deep purple", value: "deep-purple", hsl: "270 50% 25%" },
  { name: "Hot pink", value: "hot-pink", hsl: "330 100% 70%" },
  { name: "Lilac", value: "lilac", hsl: "270 70% 80%" },
  { name: "Silver", value: "silver", hsl: "0 0% 75%" },
  { name: "Blood red", value: "blood-red", hsl: "0 100% 45%" },
  { name: "Midnight blue", value: "midnight-blue", hsl: "220 90% 30%" },
];

const DEFAULT_ROOMS = [
  "Kitchen",
  "Lounge Room",
  "Dining Room",
  "Master Bedroom",
  "Master Bathroom",
  "Guest Bathroom",
  "Guest Toilet",
  "Spare Toilet",
  "Laundry",
  "Activity Room",
  "Entry Way",
];

export default function Settings() {
  const { toast } = useToast();
  const [currentAccent, setCurrentAccent] = useState("hot-pink");
  const [customRooms, setCustomRooms] = useState<string[]>([]);
  const [newRoom, setNewRoom] = useState("");
  const [editingRoom, setEditingRoom] = useState<{ index: number; value: string } | null>(null);
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

  // Load settings on mount
  useEffect(() => {
    const savedAccent = localStorage.getItem("accent_color") || "hot-pink";
    setCurrentAccent(savedAccent);
    applyAccentColor(savedAccent);

    const savedRooms = localStorage.getItem("custom_rooms");
    if (savedRooms) {
      setCustomRooms(JSON.parse(savedRooms));
    }

    const savedOrder = localStorage.getItem("widget_order");
    if (savedOrder) {
      setWidgetOrder(JSON.parse(savedOrder));
    }
  }, []);

  const applyAccentColor = (colorValue: string) => {
    const color = ACCENT_COLORS.find(c => c.value === colorValue);
    if (color) {
      document.documentElement.style.setProperty("--primary", color.hsl);
    }
  };

  const handleAccentChange = (value: string) => {
    setCurrentAccent(value);
    localStorage.setItem("accent_color", value);
    applyAccentColor(value);
    toast({
      title: "Accent colour updated",
      description: "Your new colour scheme has been applied.",
    });
  };

  const exportData = () => {
    const allData: Record<string, string> = {};
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          allData[key] = value;
        }
      }
    }

    const dataStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kitten-planner-backup-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Data exported",
      description: "Your backup file has been downloaded.",
    });
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Clear existing data
        localStorage.clear();
        
        // Import new data
        Object.entries(data).forEach(([key, value]) => {
          localStorage.setItem(key, value as string);
        });

        toast({
          title: "Data imported",
          description: "Your backup has been restored. Refreshing...",
        });

        // Refresh page after 1 second
        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Invalid backup file format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const addCustomRoom = () => {
    if (!newRoom.trim()) return;
    
    const updated = [...customRooms, newRoom.trim()];
    setCustomRooms(updated);
    localStorage.setItem("custom_rooms", JSON.stringify(updated));
    setNewRoom("");
    
    toast({
      title: "Room added",
      description: `"${newRoom}" has been added to your room list.`,
    });
  };

  const deleteCustomRoom = (index: number) => {
    const updated = customRooms.filter((_, i) => i !== index);
    setCustomRooms(updated);
    localStorage.setItem("custom_rooms", JSON.stringify(updated));
    
    toast({
      title: "Room removed",
      description: "The room has been removed from your list.",
    });
  };

  const startEditRoom = (index: number) => {
    setEditingRoom({ index, value: customRooms[index] });
  };

  const saveEditRoom = () => {
    if (!editingRoom || !editingRoom.value.trim()) return;
    
    const updated = [...customRooms];
    updated[editingRoom.index] = editingRoom.value.trim();
    setCustomRooms(updated);
    localStorage.setItem("custom_rooms", JSON.stringify(updated));
    setEditingRoom(null);
    
    toast({
      title: "Room renamed",
      description: "The room name has been updated.",
    });
  };

  const moveWidget = (index: number, direction: "up" | "down") => {
    const newOrder = [...widgetOrder];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setWidgetOrder(newOrder);
    localStorage.setItem("widget_order", JSON.stringify(newOrder));
    
    toast({
      title: "Widget order updated",
      description: "Your dashboard layout has been saved.",
    });
  };

  const resetSection = (section: string) => {
    const confirmReset = window.confirm(`Are you sure you want to clear all ${section} data? This cannot be undone.`);
    if (!confirmReset) return;

    switch (section) {
      case "meals":
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith("meal_") || key?.startsWith("weekly_meal_")) {
            localStorage.removeItem(key);
            i--;
          }
        }
        localStorage.removeItem("grocery_list");
        localStorage.removeItem("favourite_meals");
        break;
      case "cleaning":
        localStorage.removeItem("cleaning_tasks");
        localStorage.removeItem("deep_clean_tasks");
        localStorage.removeItem("cleaning_streak");
        break;
      case "planner":
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith("daily_")) {
            localStorage.removeItem(key);
            i--;
          }
        }
        break;
      case "dates":
        localStorage.removeItem("important_dates");
        localStorage.removeItem("birthdays");
        break;
      case "declutter":
        localStorage.removeItem("declutter_challenge");
        break;
      case "all":
        const confirmAll = window.confirm("This will delete ALL app data. Are you absolutely sure?");
        if (confirmAll) {
          localStorage.clear();
        } else {
          return;
        }
        break;
    }

    toast({
      title: "Data cleared",
      description: `${section === "all" ? "All data" : section + " data"} has been reset.`,
    });

    if (section === "all") {
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const copyPreviousDay = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayStr = today.toISOString().split("T")[0];
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    
    const yesterdayData = localStorage.getItem(`daily_${yesterdayStr}`);
    
    if (!yesterdayData) {
      toast({
        title: "No data to copy",
        description: "Yesterday's planner doesn't have any data.",
        variant: "destructive",
      });
      return;
    }

    const data = JSON.parse(yesterdayData);
    const newData = {
      ...data,
      date: todayStr,
      hourlyBlocks: Object.fromEntries(
        Object.entries(data.hourlyBlocks).map(([time, block]: [string, any]) => [
          time,
          { task: block.task, completed: false }
        ])
      ),
    };

    localStorage.setItem(`daily_${todayStr}`, JSON.stringify(newData));
    
    toast({
      title: "Routine copied",
      description: "Yesterday's schedule has been copied to today.",
    });
  };

  const widgetLabels: Record<string, string> = {
    "progress-summary": "Progress Summary",
    "schedule": "Today's Schedule",
    "meals": "Today's Meals",
    "chores": "Chores Due Today",
    "deep-clean": "Deep Clean Tasks",
    "declutter": "Declutter Challenge",
    "birthdays": "Upcoming Birthdays",
    "dates": "Important Dates",
    "priorities": "Top 3 Priorities",
    "mood": "Mood & Energy",
    "notes": "Quick Notes",
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="text-center space-y-2 border-b border-border pb-6">
        <div className="flex items-center justify-center gap-3">
          <SettingsIcon className="w-8 h-8 text-primary" />
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary">
            Settings
          </h1>
        </div>
        <p className="text-muted-foreground">Customise your Chaos Planner experience</p>
      </div>

      {/* Data & Privacy */}
      <ThemedCard variant="primary">
        <ThemedCardHeader>
          <ThemedCardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Data & Privacy
          </ThemedCardTitle>
          <ThemedCardDescription>
            Your data stays on your device
          </ThemedCardDescription>
        </ThemedCardHeader>
        <ThemedCardContent>
          <Alert>
            <Database className="h-4 w-4" />
            <AlertDescription>
              <strong>100% Local Storage.</strong> All your data is stored in your browser's local storage. 
              No cloud services, no servers, no tracking. Your planner data never leaves your device 
              unless you explicitly export it.
            </AlertDescription>
          </Alert>
          
          <Separator className="my-4" />

          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold mb-2">Backup & Restore</h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={exportData} variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Data
                </Button>
                <div>
                  <input
                    type="file"
                    accept="application/json"
                    onChange={importData}
                    className="hidden"
                    id="import-file"
                  />
                  <label htmlFor="import-file">
                    <Button asChild variant="outline" className="flex items-center gap-2 cursor-pointer">
                      <span>
                        <Upload className="w-4 h-4" />
                        Import Data
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Export your data as JSON to create backups or transfer to another device.
              </p>
            </div>
          </div>
        </ThemedCardContent>
      </ThemedCard>

      {/* Appearance */}
      <ThemedCard variant="glow">
        <ThemedCardHeader>
          <ThemedCardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Appearance
          </ThemedCardTitle>
          <ThemedCardDescription>
            Customise colours and themes
          </ThemedCardDescription>
        </ThemedCardHeader>
        <ThemedCardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="accent-color" className="text-sm font-semibold mb-2 block">
                Accent Colour
              </Label>
              <Select value={currentAccent} onValueChange={handleAccentChange}>
                <SelectTrigger id="accent-color">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCENT_COLORS.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border border-border" 
                          style={{ backgroundColor: `hsl(${color.hsl})` }}
                        />
                        {color.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                Choose your primary accent colour for buttons, links, and highlights.
              </p>
            </div>
          </div>
        </ThemedCardContent>
      </ThemedCard>

      {/* Room Customisation */}
      <ThemedCard variant="glow">
        <ThemedCardHeader>
          <ThemedCardTitle className="flex items-center gap-2">
            <HomeIcon className="w-5 h-5" />
            Custom Rooms
          </ThemedCardTitle>
          <ThemedCardDescription>
            Add or edit rooms beyond the default 11
          </ThemedCardDescription>
        </ThemedCardHeader>
        <ThemedCardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Default Rooms</h3>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_ROOMS.map((room) => (
                  <Badge key={room} variant="secondary">
                    {room}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-semibold mb-2">Your Custom Rooms</h3>
              {customRooms.length === 0 ? (
                <p className="text-sm text-muted-foreground mb-3">No custom rooms added yet.</p>
              ) : (
                <div className="space-y-2 mb-3">
                  {customRooms.map((room, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                      {editingRoom?.index === index ? (
                        <>
                          <Input
                            value={editingRoom.value}
                            onChange={(e) => setEditingRoom({ ...editingRoom, value: e.target.value })}
                            className="flex-1"
                          />
                          <Button size="sm" onClick={saveEditRoom}>
                            Save
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => setEditingRoom(null)}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 text-sm">{room}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditRoom(index)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteCustomRoom(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="Enter room name..."
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addCustomRoom()}
                />
                <Button onClick={addCustomRoom}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </ThemedCardContent>
      </ThemedCard>

      {/* Dashboard Customisation */}
      <ThemedCard variant="glow">
        <ThemedCardHeader>
          <ThemedCardTitle className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            Dashboard Layout
          </ThemedCardTitle>
          <ThemedCardDescription>
            Reorder widgets to match your workflow
          </ThemedCardDescription>
        </ThemedCardHeader>
        <ThemedCardContent>
          <div className="space-y-2">
            {widgetOrder.map((widget, index) => (
              <div key={widget} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                <span className="flex-1 text-sm">{widgetLabels[widget]}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => moveWidget(index, "up")}
                  disabled={index === 0}
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => moveWidget(index, "down")}
                  disabled={index === widgetOrder.length - 1}
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </ThemedCardContent>
      </ThemedCard>

      {/* Quick Actions */}
      <ThemedCard variant="glow">
        <ThemedCardHeader>
          <ThemedCardTitle className="flex items-center gap-2">
            <Copy className="w-5 h-5" />
            Quick Actions
          </ThemedCardTitle>
          <ThemedCardDescription>
            Time-saving shortcuts
          </ThemedCardDescription>
        </ThemedCardHeader>
        <ThemedCardContent>
          <div className="space-y-3">
            <Button onClick={copyPreviousDay} variant="outline" className="w-full">
              Copy Yesterday's Routine to Today
            </Button>
            <p className="text-xs text-muted-foreground">
              Quickly replicate yesterday's hourly schedule for today (tasks copied, completion reset).
            </p>
          </div>
        </ThemedCardContent>
      </ThemedCard>

      {/* Data Management */}
      <ThemedCard variant="glow">
        <ThemedCardHeader>
          <ThemedCardTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Data Management
          </ThemedCardTitle>
          <ThemedCardDescription>
            Clear specific sections or reset everything
          </ThemedCardDescription>
        </ThemedCardHeader>
        <ThemedCardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => resetSection("planner")}
                className="justify-start"
              >
                Clear Daily Planner Data
              </Button>
              <Button
                variant="outline"
                onClick={() => resetSection("meals")}
                className="justify-start"
              >
                Clear Meals & Grocery Lists
              </Button>
              <Button
                variant="outline"
                onClick={() => resetSection("cleaning")}
                className="justify-start"
              >
                Clear Cleaning & Chores
              </Button>
              <Button
                variant="outline"
                onClick={() => resetSection("dates")}
                className="justify-start"
              >
                Clear Birthdays & Dates
              </Button>
              <Button
                variant="outline"
                onClick={() => resetSection("declutter")}
                className="justify-start"
              >
                Reset Declutter Challenge
              </Button>
            </div>

            <Separator />

            <Button
              variant="destructive"
              onClick={() => resetSection("all")}
              className="w-full"
            >
              Clear All Data
            </Button>
            <p className="text-xs text-muted-foreground">
              ⚠️ This will permanently delete all your planner data. Export a backup first!
            </p>
          </div>
        </ThemedCardContent>
      </ThemedCard>
    </div>
  );
}