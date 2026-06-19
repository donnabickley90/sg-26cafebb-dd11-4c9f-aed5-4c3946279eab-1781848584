import { useState, useEffect } from "react";
import { ThemedCard, ThemedCardHeader, ThemedCardTitle, ThemedCardDescription, ThemedCardContent } from "@/components/ui/themed-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Utensils,
  Plus,
  Copy,
  Trash2,
  Heart,
  ShoppingCart,
  Check,
  X,
  Edit2,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ShoppingBasket,
} from "lucide-react";
import {
  WeeklyMealPlan,
  GroceryItem,
  FavouriteMeal,
  saveWeeklyMealPlan,
  getWeeklyMealPlan,
  getOrCreateWeeklyMealPlan,
  getAllWeeklyMealPlans,
  saveGroceryList,
  getGroceryList,
  saveFavouriteMeals,
  getFavouriteMeals,
} from "@/lib/storage";

// Helper to get Monday of current week
function getMondayOfWeek(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

// Helper to format week display
function formatWeekDisplay(weekStart: string): string {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

export default function MealsPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState<string>(() => getMondayOfWeek(new Date()));
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyMealPlan>(() => getOrCreateWeeklyMealPlan(getMondayOfWeek(new Date())));
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [favouriteMeals, setFavouriteMeals] = useState<FavouriteMeal[]>([]);
  const [newGroceryItem, setNewGroceryItem] = useState("");
  const [showFavouriteDialog, setShowFavouriteDialog] = useState(false);
  const [editingFavourite, setEditingFavourite] = useState<FavouriteMeal | null>(null);

  const days = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

  // Load data on mount
  useEffect(() => {
    setGroceryList(getGroceryList());
    setFavouriteMeals(getFavouriteMeals());
  }, []);

  // Load week data when week changes
  useEffect(() => {
    const plan = getOrCreateWeeklyMealPlan(currentWeekStart);
    setWeeklyPlan(plan);
  }, [currentWeekStart]);

  // Save changes
  const handleSave = () => {
    saveWeeklyMealPlan(weeklyPlan);
  };

  const handleMealChange = (day: string, mealType: string, value: string) => {
    setWeeklyPlan(prev => ({
      ...prev,
      meals: {
        ...prev.meals,
        [day]: {
          ...prev.meals[day],
          [mealType]: value,
        },
      },
    }));
  };

  const handleNotesChange = (value: string) => {
    setWeeklyPlan(prev => ({ ...prev, notes: value }));
  };

  const handlePreviousWeek = () => {
    const prevWeek = new Date(currentWeekStart);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setCurrentWeekStart(prevWeek.toISOString().split("T")[0]);
  };

  const handleNextWeek = () => {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setCurrentWeekStart(nextWeek.toISOString().split("T")[0]);
  };

  const handleCopyPreviousWeek = () => {
    const prevWeekStart = new Date(currentWeekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekStartStr = prevWeekStart.toISOString().split("T")[0];
    const prevPlan = getWeeklyMealPlan(prevWeekStartStr);
    
    if (prevPlan) {
      setWeeklyPlan(prev => ({
        ...prev,
        meals: prevPlan.meals,
      }));
    }
  };

  const handleClearWeek = () => {
    const clearedPlan = getOrCreateWeeklyMealPlan(currentWeekStart);
    setWeeklyPlan(clearedPlan);
  };

  // Grocery list functions
  const handleAddGroceryItem = () => {
    if (!newGroceryItem.trim()) return;
    
    const newItem: GroceryItem = {
      id: Date.now().toString(),
      text: newGroceryItem,
      checked: false,
      addedAt: new Date().toISOString(),
    };
    
    const updated = [...groceryList, newItem];
    setGroceryList(updated);
    saveGroceryList(updated);
    setNewGroceryItem("");
  };

  const handleToggleGroceryItem = (id: string) => {
    const updated = groceryList.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setGroceryList(updated);
    saveGroceryList(updated);
  };

  const handleDeleteGroceryItem = (id: string) => {
    const updated = groceryList.filter(item => item.id !== id);
    setGroceryList(updated);
    saveGroceryList(updated);
  };

  const handleClearCheckedItems = () => {
    const updated = groceryList.filter(item => !item.checked);
    setGroceryList(updated);
    saveGroceryList(updated);
  };

  // Favourite meals functions
  const handleSaveFavourite = (meal: Omit<FavouriteMeal, "id">) => {
    let updated: FavouriteMeal[];
    
    if (editingFavourite) {
      updated = favouriteMeals.map(m =>
        m.id === editingFavourite.id ? { ...meal, id: m.id } : m
      );
    } else {
      const newMeal: FavouriteMeal = {
        ...meal,
        id: Date.now().toString(),
      };
      updated = [...favouriteMeals, newMeal];
    }
    
    setFavouriteMeals(updated);
    saveFavouriteMeals(updated);
    setShowFavouriteDialog(false);
    setEditingFavourite(null);
  };

  const handleDeleteFavourite = (id: string) => {
    const updated = favouriteMeals.filter(m => m.id !== id);
    setFavouriteMeals(updated);
    saveFavouriteMeals(updated);
  };

  const handleAddMealToWeek = (meal: FavouriteMeal, day: string, mealType: string) => {
    handleMealChange(day, mealType, meal.name);
  };

  const handleAddMealToGroceryList = (mealText: string) => {
    if (!mealText.trim()) return;
    
    const newItem: GroceryItem = {
      id: Date.now().toString(),
      text: mealText,
      checked: false,
      addedAt: new Date().toISOString(),
    };
    
    const updated = [...groceryList, newItem];
    setGroceryList(updated);
    saveGroceryList(updated);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary flex items-center gap-2">
            <Utensils className="w-8 h-8" />
            Weekly Meal Planner
          </h1>
          <p className="text-muted-foreground mt-1">Plan your meals and manage your grocery list</p>
        </div>
        <Button onClick={handleSave} size="lg" className="gap-2">
          <Check className="w-4 h-4" />
          Save Changes
        </Button>
      </div>

      {/* Week Navigation */}
      <ThemedCard variant="primary">
        <ThemedCardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handlePreviousWeek} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Previous Week
            </Button>
            <div className="text-center">
              <div className="flex items-center gap-2 justify-center">
                <Calendar className="w-5 h-5 text-primary" />
                <p className="text-lg font-semibold">{formatWeekDisplay(currentWeekStart)}</p>
              </div>
              <p className="text-sm text-muted-foreground">Week starting {new Date(currentWeekStart).toLocaleDateString()}</p>
            </div>
            <Button variant="outline" onClick={handleNextWeek} className="gap-2">
              Next Week
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2 mt-4 justify-center">
            <Button variant="secondary" onClick={handleCopyPreviousWeek} className="gap-2">
              <Copy className="w-4 h-4" />
              Copy Last Week
            </Button>
            <Button variant="outline" onClick={handleClearWeek} className="gap-2">
              <Trash2 className="w-4 h-4" />
              Clear Week
            </Button>
          </div>
        </ThemedCardContent>
      </ThemedCard>

      <Tabs defaultValue="planner" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="planner">Meal Planner</TabsTrigger>
          <TabsTrigger value="grocery">Grocery List</TabsTrigger>
          <TabsTrigger value="favourites">Favourites</TabsTrigger>
        </TabsList>

        {/* Meal Planner Tab */}
        <TabsContent value="planner" className="space-y-4 mt-6">
          <div className="grid gap-4">
            {days.map(({ key, label }) => (
              <ThemedCard key={key} variant="glow">
                <ThemedCardHeader>
                  <ThemedCardTitle className="text-xl">{label}</ThemedCardTitle>
                </ThemedCardHeader>
                <ThemedCardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Breakfast</Label>
                      <div className="flex gap-2">
                        <Input
                          value={weeklyPlan.meals[key]?.breakfast || ""}
                          onChange={(e) => handleMealChange(key, "breakfast", e.target.value)}
                          placeholder="e.g., Oatmeal with berries"
                          className="flex-1"
                        />
                        {weeklyPlan.meals[key]?.breakfast && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleAddMealToGroceryList(weeklyPlan.meals[key].breakfast)}
                            title="Add to grocery list"
                          >
                            <ShoppingBasket className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Lunch</Label>
                      <div className="flex gap-2">
                        <Input
                          value={weeklyPlan.meals[key]?.lunch || ""}
                          onChange={(e) => handleMealChange(key, "lunch", e.target.value)}
                          placeholder="e.g., Chicken salad"
                          className="flex-1"
                        />
                        {weeklyPlan.meals[key]?.lunch && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleAddMealToGroceryList(weeklyPlan.meals[key].lunch)}
                            title="Add to grocery list"
                          >
                            <ShoppingBasket className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Dinner</Label>
                      <div className="flex gap-2">
                        <Input
                          value={weeklyPlan.meals[key]?.dinner || ""}
                          onChange={(e) => handleMealChange(key, "dinner", e.target.value)}
                          placeholder="e.g., Pasta with vegetables"
                          className="flex-1"
                        />
                        {weeklyPlan.meals[key]?.dinner && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleAddMealToGroceryList(weeklyPlan.meals[key].dinner)}
                            title="Add to grocery list"
                          >
                            <ShoppingBasket className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Snacks</Label>
                      <div className="flex gap-2">
                        <Input
                          value={weeklyPlan.meals[key]?.snacks || ""}
                          onChange={(e) => handleMealChange(key, "snacks", e.target.value)}
                          placeholder="e.g., Apple, nuts"
                          className="flex-1"
                        />
                        {weeklyPlan.meals[key]?.snacks && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleAddMealToGroceryList(weeklyPlan.meals[key].snacks)}
                            title="Add to grocery list"
                          >
                            <ShoppingBasket className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Drinks/Shakes</Label>
                      <div className="flex gap-2">
                        <Input
                          value={weeklyPlan.meals[key]?.drinks || ""}
                          onChange={(e) => handleMealChange(key, "drinks", e.target.value)}
                          placeholder="e.g., Protein shake"
                          className="flex-1"
                        />
                        {weeklyPlan.meals[key]?.drinks && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleAddMealToGroceryList(weeklyPlan.meals[key].drinks)}
                            title="Add to grocery list"
                          >
                            <ShoppingBasket className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </ThemedCardContent>
              </ThemedCard>
            ))}
          </div>

          {/* Weekly Notes */}
          <ThemedCard variant="glow">
            <ThemedCardHeader>
              <ThemedCardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                Weekly Notes
              </ThemedCardTitle>
            </ThemedCardHeader>
            <ThemedCardContent>
              <Textarea
                value={weeklyPlan.notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Add notes about this week's meal plan, prep ideas, or shopping reminders..."
                className="min-h-[100px]"
              />
            </ThemedCardContent>
          </ThemedCard>
        </TabsContent>

        {/* Grocery List Tab */}
        <TabsContent value="grocery" className="space-y-4 mt-6">
          <ThemedCard variant="primary">
            <ThemedCardHeader>
              <ThemedCardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Grocery List
              </ThemedCardTitle>
              <ThemedCardDescription>
                Add items and check them off while shopping
              </ThemedCardDescription>
            </ThemedCardHeader>
            <ThemedCardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newGroceryItem}
                    onChange={(e) => setNewGroceryItem(e.target.value)}
                    placeholder="Add grocery item..."
                    onKeyPress={(e) => e.key === "Enter" && handleAddGroceryItem()}
                  />
                  <Button onClick={handleAddGroceryItem} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add
                  </Button>
                </div>

                {groceryList.length > 0 && (
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearCheckedItems}
                      className="gap-2"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear Checked
                    </Button>
                  </div>
                )}

                <div className="space-y-2">
                  {groceryList.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 group"
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => handleToggleGroceryItem(item.id)}
                        className="w-5 h-5 cursor-pointer"
                      />
                      <span
                        className={`flex-1 ${
                          item.checked ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        {item.text}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteGroceryItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {groceryList.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No items yet. Add items above to get started.
                    </p>
                  )}
                </div>
              </div>
            </ThemedCardContent>
          </ThemedCard>
        </TabsContent>

        {/* Favourites Tab */}
        <TabsContent value="favourites" className="space-y-4 mt-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Your Favourite Meals</h3>
            <Dialog open={showFavouriteDialog} onOpenChange={setShowFavouriteDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2" onClick={() => setEditingFavourite(null)}>
                  <Plus className="w-4 h-4" />
                  Add Favourite
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingFavourite ? "Edit Favourite Meal" : "Add Favourite Meal"}
                  </DialogTitle>
                  <DialogDescription>
                    Save your favourite meals for quick access
                  </DialogDescription>
                </DialogHeader>
                <FavouriteMealForm
                  meal={editingFavourite}
                  onSave={handleSaveFavourite}
                  onCancel={() => {
                    setShowFavouriteDialog(false);
                    setEditingFavourite(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favouriteMeals.map((meal) => (
              <ThemedCard key={meal.id} variant="glow">
                <ThemedCardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <ThemedCardTitle className="text-lg">{meal.name}</ThemedCardTitle>
                      <Badge variant="outline" className="mt-2">
                        {meal.category}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingFavourite(meal);
                          setShowFavouriteDialog(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFavourite(meal.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </ThemedCardHeader>
                <ThemedCardContent>
                  <p className="text-sm text-muted-foreground mb-3">{meal.description}</p>
                  {meal.ingredients.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium mb-1">Ingredients:</p>
                      <div className="flex flex-wrap gap-1">
                        {meal.ingredients.slice(0, 3).map((ing, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {ing}
                          </Badge>
                        ))}
                        {meal.ingredients.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{meal.ingredients.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </ThemedCardContent>
              </ThemedCard>
            ))}
            {favouriteMeals.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No favourite meals yet.</p>
                <p className="text-sm text-muted-foreground">
                  Add your go-to meals for quick planning.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Favourite Meal Form Component
interface FavouriteMealFormProps {
  meal: FavouriteMeal | null;
  onSave: (meal: Omit<FavouriteMeal, "id">) => void;
  onCancel: () => void;
}

function FavouriteMealForm({ meal, onSave, onCancel }: FavouriteMealFormProps) {
  const [name, setName] = useState(meal?.name || "");
  const [category, setCategory] = useState<FavouriteMeal["category"]>(meal?.category || "breakfast");
  const [description, setDescription] = useState(meal?.description || "");
  const [ingredients, setIngredients] = useState(meal?.ingredients.join(", ") || "");

  const handleSubmit = () => {
    if (!name.trim()) return;

    onSave({
      name,
      category,
      description,
      ingredients: ingredients.split(",").map(i => i.trim()).filter(Boolean),
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Meal Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Overnight Oats"
        />
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={category} onValueChange={(v) => setCategory(v as FavouriteMeal["category"])}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="breakfast">Breakfast</SelectItem>
            <SelectItem value="lunch">Lunch</SelectItem>
            <SelectItem value="dinner">Dinner</SelectItem>
            <SelectItem value="snack">Snack</SelectItem>
            <SelectItem value="drink">Drink</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the meal"
        />
      </div>

      <div className="space-y-2">
        <Label>Ingredients (comma-separated)</Label>
        <Textarea
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="oats, milk, berries, honey"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          Save Favourite
        </Button>
      </div>
    </div>
  );
}