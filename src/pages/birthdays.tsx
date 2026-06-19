import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { ThemedCard, ThemedCardHeader, ThemedCardTitle, ThemedCardContent } from "@/components/ui/themed-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Cake, 
  Heart, 
  Plus, 
  Edit, 
  Trash2, 
  Gift, 
  Mail, 
  MessageSquare,
  Calendar as CalendarIcon,
  Sparkles,
  Check
} from "lucide-react";
import { 
  getImportantDates, 
  getImportantDatesByCategory, 
  getUpcomingImportantDates,
  getDaysUntilDate,
  addImportantDate,
  updateImportantDate,
  deleteImportantDate,
  toggleGiftStatus,
  type ImportantDate 
} from "@/lib/storage";

export default function BirthdaysPage() {
  const [dates, setDates] = useState<ImportantDate[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDate, setEditingDate] = useState<ImportantDate | null>(null);
  
  // Form state
  const [formName, setFormName] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formYear, setFormYear] = useState("");
  const [formCategory, setFormCategory] = useState<ImportantDate["category"]>("birthday");
  const [formRelationship, setFormRelationship] = useState("");
  const [formYearlyRepeat, setFormYearlyRepeat] = useState(true);
  const [formReminderEnabled, setFormReminderEnabled] = useState(true);
  const [formReminderDays, setFormReminderDays] = useState("7");
  const [formGiftIdeas, setFormGiftIdeas] = useState("");
  const [formNotes, setFormNotes] = useState("");

  useEffect(() => {
    loadDates();
  }, []);

  const loadDates = () => {
    setDates(getImportantDates());
  };

  const resetForm = () => {
    setFormName("");
    setFormDate("");
    setFormYear("");
    setFormCategory("birthday");
    setFormRelationship("");
    setFormYearlyRepeat(true);
    setFormReminderEnabled(true);
    setFormReminderDays("7");
    setFormGiftIdeas("");
    setFormNotes("");
    setEditingDate(null);
  };

  const handleSubmit = () => {
    if (!formName || !formDate) return;

    const giftIdeasArray = formGiftIdeas.split("\n").filter(idea => idea.trim());
    
    const dateData = {
      name: formName,
      date: formDate,
      year: formYear ? parseInt(formYear) : undefined,
      category: formCategory,
      relationship: formRelationship,
      yearlyRepeat: formYearlyRepeat,
      reminderEnabled: formReminderEnabled,
      reminderDays: formReminderEnabled ? parseInt(formReminderDays) : undefined,
      giftIdeas: giftIdeasArray,
      giftPurchased: false,
      messageSent: false,
      cardSent: false,
      notes: formNotes,
    };

    if (editingDate) {
      updateImportantDate(editingDate.id, dateData);
    } else {
      addImportantDate(dateData);
    }

    loadDates();
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEdit = (date: ImportantDate) => {
    setEditingDate(date);
    setFormName(date.name);
    setFormDate(date.date);
    setFormYear(date.year?.toString() || "");
    setFormCategory(date.category);
    setFormRelationship(date.relationship || "");
    setFormYearlyRepeat(date.yearlyRepeat);
    setFormReminderEnabled(date.reminderEnabled);
    setFormReminderDays(date.reminderDays?.toString() || "7");
    setFormGiftIdeas(date.giftIdeas.join("\n"));
    setFormNotes(date.notes);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this date?")) {
      deleteImportantDate(id);
      loadDates();
    }
  };

  const handleToggleGift = (id: string, field: "giftPurchased" | "messageSent" | "cardSent") => {
    toggleGiftStatus(id, field);
    loadDates();
  };

  const formatDateDisplay = (dateStr: string) => {
    const [month, day] = dateStr.split("-");
    return new Date(2026, parseInt(month) - 1, parseInt(day)).toLocaleDateString("en-US", { 
      month: "long", 
      day: "numeric" 
    });
  };

  const DateCard = ({ date }: { date: ImportantDate }) => {
    const daysUntil = getDaysUntilDate(date.date, date.year);
    
    return (
      <ThemedCard variant="glow" className="relative">
        <ThemedCardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <ThemedCardTitle className="flex items-center gap-2">
                {date.category === "birthday" && <Cake className="w-5 h-5 text-primary" />}
                {date.category === "anniversary" && <Heart className="w-5 h-5 text-accent" />}
                {date.category === "holiday" && <Sparkles className="w-5 h-5 text-secondary" />}
                {date.category === "other" && <CalendarIcon className="w-5 h-5 text-muted-foreground" />}
                {date.name}
              </ThemedCardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">{formatDateDisplay(date.date)}</Badge>
                {date.relationship && (
                  <Badge variant="outline">{date.relationship}</Badge>
                )}
                {daysUntil === 0 && <Badge className="bg-primary">Today!</Badge>}
                {daysUntil === 1 && <Badge className="bg-accent">Tomorrow</Badge>}
                {daysUntil > 1 && daysUntil <= 30 && (
                  <Badge variant="outline">{daysUntil} days</Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" onClick={() => handleEdit(date)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => handleDelete(date.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </ThemedCardHeader>
        <ThemedCardContent>
          <div className="space-y-3">
            {/* Gift Planning Section */}
            {date.giftIdeas.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  Gift Ideas:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {date.giftIdeas.map((idea, idx) => (
                    <li key={idx}>{idea}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Gift Status Checkboxes */}
            <div className="space-y-2">
              <p className="text-sm font-semibold">Preparation:</p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={date.giftPurchased}
                    onCheckedChange={() => handleToggleGift(date.id, "giftPurchased")}
                  />
                  <label className="text-sm flex items-center gap-2">
                    <Gift className="w-4 h-4" />
                    Gift purchased
                    {date.giftPurchased && <Check className="w-4 h-4 text-primary" />}
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={date.messageSent}
                    onCheckedChange={() => handleToggleGift(date.id, "messageSent")}
                  />
                  <label className="text-sm flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Message sent
                    {date.messageSent && <Check className="w-4 h-4 text-primary" />}
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={date.cardSent}
                    onCheckedChange={() => handleToggleGift(date.id, "cardSent")}
                  />
                  <label className="text-sm flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Card sent
                    {date.cardSent && <Check className="w-4 h-4 text-primary" />}
                  </label>
                </div>
              </div>
            </div>

            {date.notes && (
              <div className="space-y-2">
                <p className="text-sm font-semibold">Notes:</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{date.notes}</p>
              </div>
            )}

            {date.reminderEnabled && date.reminderDays && (
              <Badge variant="outline" className="text-xs">
                Reminder: {date.reminderDays} days before
              </Badge>
            )}
          </div>
        </ThemedCardContent>
      </ThemedCard>
    );
  };

  const upcomingDates = getUpcomingImportantDates(90);
  const birthdays = getImportantDatesByCategory("birthday");
  const anniversaries = getImportantDatesByCategory("anniversary");
  const holidays = getImportantDatesByCategory("holiday");
  const otherDates = getImportantDatesByCategory("other");

  return (
    <Layout>
      <SEO
        title="Birthdays & Important Dates - Kitten's 2026 Chaos Planner"
        description="Track birthdays, anniversaries, and special events with gift planning"
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cake className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-heading font-bold">Birthdays & Dates</h1>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Date
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingDate ? "Edit" : "Add"} Important Date</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input 
                      id="name" 
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g., Alex's Birthday"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formCategory} onValueChange={(v: any) => setFormCategory(v)}>
                      <SelectTrigger id="category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="birthday">Birthday</SelectItem>
                        <SelectItem value="anniversary">Anniversary</SelectItem>
                        <SelectItem value="holiday">Holiday</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date (MM-DD) *</Label>
                    <Input 
                      id="date" 
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      placeholder="06-25"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year (optional)</Label>
                    <Input 
                      id="year" 
                      value={formYear}
                      onChange={(e) => setFormYear(e.target.value)}
                      placeholder="2026"
                      type="number"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="relationship">Relationship/Category</Label>
                  <Input 
                    id="relationship" 
                    value={formRelationship}
                    onChange={(e) => setFormRelationship(e.target.value)}
                    placeholder="e.g., Friend, Family, Colleague"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="yearly"
                      checked={formYearlyRepeat}
                      onCheckedChange={(checked) => setFormYearlyRepeat(checked as boolean)}
                    />
                    <Label htmlFor="yearly">Repeat yearly</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="reminder"
                      checked={formReminderEnabled}
                      onCheckedChange={(checked) => setFormReminderEnabled(checked as boolean)}
                    />
                    <Label htmlFor="reminder">Enable reminder</Label>
                  </div>
                </div>

                {formReminderEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="reminderDays">Remind me (days before)</Label>
                    <Select value={formReminderDays} onValueChange={setFormReminderDays}>
                      <SelectTrigger id="reminderDays">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 day</SelectItem>
                        <SelectItem value="3">3 days</SelectItem>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="14">2 weeks</SelectItem>
                        <SelectItem value="30">1 month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="giftIdeas">Gift Ideas (one per line)</Label>
                  <Textarea 
                    id="giftIdeas" 
                    value={formGiftIdeas}
                    onChange={(e) => setFormGiftIdeas(e.target.value)}
                    placeholder="Book&#10;Coffee mug&#10;Gift card"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea 
                    id="notes" 
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Additional notes or preferences..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!formName || !formDate}>
                  {editingDate ? "Update" : "Add"} Date
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-5">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="birthdays">Birthdays</TabsTrigger>
            <TabsTrigger value="anniversaries">Anniversaries</TabsTrigger>
            <TabsTrigger value="holidays">Holidays</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingDates.length === 0 ? (
              <ThemedCard>
                <ThemedCardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No upcoming dates in the next 90 days</p>
                </ThemedCardContent>
              </ThemedCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingDates.map(date => (
                  <DateCard key={date.id} date={date} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="birthdays" className="space-y-4">
            {birthdays.length === 0 ? (
              <ThemedCard>
                <ThemedCardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No birthdays added yet</p>
                </ThemedCardContent>
              </ThemedCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {birthdays.map(date => (
                  <DateCard key={date.id} date={date} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="anniversaries" className="space-y-4">
            {anniversaries.length === 0 ? (
              <ThemedCard>
                <ThemedCardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No anniversaries added yet</p>
                </ThemedCardContent>
              </ThemedCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {anniversaries.map(date => (
                  <DateCard key={date.id} date={date} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="holidays" className="space-y-4">
            {holidays.length === 0 ? (
              <ThemedCard>
                <ThemedCardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No holidays added yet</p>
                </ThemedCardContent>
              </ThemedCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {holidays.map(date => (
                  <DateCard key={date.id} date={date} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {dates.length === 0 ? (
              <ThemedCard>
                <ThemedCardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No dates added yet</p>
                  <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Date
                  </Button>
                </ThemedCardContent>
              </ThemedCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dates.map(date => (
                  <DateCard key={date.id} date={date} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}