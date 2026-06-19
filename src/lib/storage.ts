// Local storage utilities for Kitten's 2026 Chaos Planner

export interface DailyPlannerData {
  date: string; // YYYY-MM-DD
  hourlyBlocks: {
    [hour: string]: {
      task: string;
      completed: boolean;
    };
  };
  priorities: string[];
  notes: string;
  mood: string;
  energy: number; // 1-5 spoons
  dailyReminder: string;
  brainDump: string;
  tomorrowReminder: string;
}

export interface MealData {
  date: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
}

export interface WeeklyMealPlan {
  weekStart: string; // YYYY-MM-DD (Monday)
  meals: {
    [day: string]: { // "monday", "tuesday", etc.
      breakfast: string;
      lunch: string;
      dinner: string;
      snacks: string;
      drinks: string;
    };
  };
  notes: string;
}

export interface GroceryItem {
  id: string;
  text: string;
  checked: boolean;
  addedAt: string;
}

export interface FavouriteMeal {
  id: string;
  name: string;
  category: "breakfast" | "lunch" | "dinner" | "snack" | "drink";
  description: string;
  ingredients: string[];
}

export interface BirthdayData {
  id: string;
  name: string;
  date: string; // MM-DD
  giftIdeas: string[];
  notes: string;
}

export interface ChoreData {
  id: string;
  room: string;
  task: string;
  frequency: "daily" | "weekly" | "deep";
  lastCompleted?: string;
  nextDue?: string;
}

// New enhanced Chaos Cleaner types
export interface CleaningTask {
  id: string;
  room: string;
  task: string;
  frequency: "daily" | "weekly" | "monthly" | "deep";
  lastCompleted?: string;
  nextDue?: string;
  priority?: "high" | "medium" | "low";
  notes?: string;
  createdAt: string;
}

export interface CleaningStreak {
  current: number;
  longest: number;
  lastCompletedDate?: string;
}

export interface RoomProgress {
  room: string;
  dailyComplete: number;
  dailyTotal: number;
  weeklyComplete: number;
  weeklyTotal: number;
  monthlyComplete: number;
  monthlyTotal: number;
  deepComplete: number;
  deepTotal: number;
}

export const PREDEFINED_ROOMS = [
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
] as const;

export interface DeepCleanTask {
  id: string;
  task: string;
  room: string;
  scheduledDate?: string; // YYYY-MM-DD, undefined if unscheduled
  completed: boolean;
  completedDate?: string;
  notes?: string;
}

// Daily Planner Storage
export const saveDailyPlan = (data: DailyPlannerData): void => {
  localStorage.setItem(`daily_${data.date}`, JSON.stringify(data));
};

export const getDailyPlan = (date: string): DailyPlannerData | null => {
  const stored = localStorage.getItem(`daily_${date}`);
  if (!stored) return null;
  return JSON.parse(stored);
};

export const getOrCreateDailyPlan = (date: string): DailyPlannerData => {
  const existing = getDailyPlan(date);
  if (existing) return existing;

  const hours = Array.from({ length: 19 }, (_, i) => i + 5); // 5 AM to 11 PM
  const hourlyBlocks: DailyPlannerData["hourlyBlocks"] = {};
  hours.forEach((h) => {
    const hour = h.toString().padStart(2, "0");
    hourlyBlocks[`${hour}:00`] = { task: "", completed: false };
  });

  return {
    date,
    hourlyBlocks,
    priorities: ["", "", ""],
    notes: "",
    mood: "",
    energy: 3,
    dailyReminder: "",
    brainDump: "",
    tomorrowReminder: "",
  };
};

// Meals Storage
export const saveMeal = (data: MealData): void => {
  localStorage.setItem(`meal_${data.date}`, JSON.stringify(data));
};

export const getMeal = (date: string): MealData | null => {
  const stored = localStorage.getItem(`meal_${date}`);
  if (!stored) return null;
  return JSON.parse(stored);
};

// Weekly Meal Plan Storage
export const saveWeeklyMealPlan = (plan: WeeklyMealPlan): void => {
  localStorage.setItem(`weekly_meal_${plan.weekStart}`, JSON.stringify(plan));
};

export const getWeeklyMealPlan = (weekStart: string): WeeklyMealPlan | null => {
  const stored = localStorage.getItem(`weekly_meal_${weekStart}`);
  if (!stored) return null;
  return JSON.parse(stored);
};

export const getOrCreateWeeklyMealPlan = (weekStart: string): WeeklyMealPlan => {
  const existing = getWeeklyMealPlan(weekStart);
  if (existing) return existing;

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const meals: WeeklyMealPlan["meals"] = {};
  
  days.forEach(day => {
    meals[day] = {
      breakfast: "",
      lunch: "",
      dinner: "",
      snacks: "",
      drinks: "",
    };
  });

  return {
    weekStart,
    meals,
    notes: "",
  };
};

// Get all weekly meal plans for history
export const getAllWeeklyMealPlans = (): WeeklyMealPlan[] => {
  const plans: WeeklyMealPlan[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("weekly_meal_")) {
      const plan = localStorage.getItem(key);
      if (plan) plans.push(JSON.parse(plan));
    }
  }
  return plans.sort((a, b) => b.weekStart.localeCompare(a.weekStart));
};

// Grocery List Storage
export const saveGroceryList = (items: GroceryItem[]): void => {
  localStorage.setItem("grocery_list", JSON.stringify(items));
};

export const getGroceryList = (): GroceryItem[] => {
  const stored = localStorage.getItem("grocery_list");
  if (!stored) return [];
  return JSON.parse(stored);
};

// Favourite Meals Storage
export const saveFavouriteMeals = (meals: FavouriteMeal[]): void => {
  localStorage.setItem("favourite_meals", JSON.stringify(meals));
};

export const getFavouriteMeals = (): FavouriteMeal[] => {
  const stored = localStorage.getItem("favourite_meals");
  if (!stored) return [];
  return JSON.parse(stored);
};

// Birthdays Storage
export const saveBirthdays = (birthdays: BirthdayData[]): void => {
  localStorage.setItem("birthdays", JSON.stringify(birthdays));
};

export const getBirthdays = (): BirthdayData[] => {
  const stored = localStorage.getItem("birthdays");
  if (!stored) return [];
  return JSON.parse(stored);
};

export const getBirthdaysForDate = (date: string): BirthdayData[] => {
  const allBirthdays = getBirthdays();
  const mmdd = date.substring(5); // Extract MM-DD from YYYY-MM-DD
  return allBirthdays.filter((b) => b.date === mmdd);
};

// Chores Storage
export const saveChores = (chores: ChoreData[]): void => {
  localStorage.setItem("chores", JSON.stringify(chores));
};

export const getChores = (): ChoreData[] => {
  const stored = localStorage.getItem("chores");
  if (!stored) return [];
  return JSON.parse(stored);
};

export const getChoresForDate = (date: string): ChoreData[] => {
  const allChores = getChores();
  return allChores.filter((c) => c.nextDue === date);
};

// Deep Clean Tasks Storage
export const saveDeepCleanTasks = (tasks: DeepCleanTask[]): void => {
  localStorage.setItem("deep_clean_tasks", JSON.stringify(tasks));
};

export const getDeepCleanTasks = (): DeepCleanTask[] => {
  const stored = localStorage.getItem("deep_clean_tasks");
  if (!stored) {
    // Initialize with default tasks
    const defaultTasks: DeepCleanTask[] = [
      { id: crypto.randomUUID(), task: "Clean oven", room: "Kitchen", completed: false },
      { id: crypto.randomUUID(), task: "Wash curtains", room: "Living Room", completed: false },
      { id: crypto.randomUUID(), task: "Rotate mattress", room: "Bedroom", completed: false },
      { id: crypto.randomUUID(), task: "Scrub grout", room: "Bathroom", completed: false },
      { id: crypto.randomUUID(), task: "Clean exhaust fan", room: "Kitchen", completed: false },
      { id: crypto.randomUUID(), task: "Deep clean refrigerator", room: "Kitchen", completed: false },
      { id: crypto.randomUUID(), task: "Organize closet", room: "Bedroom", completed: false },
      { id: crypto.randomUUID(), task: "Clean windows inside & out", room: "Living Room", completed: false },
      { id: crypto.randomUUID(), task: "Descale kettle & coffee maker", room: "Kitchen", completed: false },
      { id: crypto.randomUUID(), task: "Vacuum under furniture", room: "Living Room", completed: false },
    ];
    saveDeepCleanTasks(defaultTasks);
    return defaultTasks;
  }
  return JSON.parse(stored);
};

export const getUnscheduledDeepCleanTasks = (): DeepCleanTask[] => {
  return getDeepCleanTasks().filter(task => !task.scheduledDate && !task.completed);
};

export const getScheduledDeepCleanTasks = (): DeepCleanTask[] => {
  return getDeepCleanTasks().filter(task => task.scheduledDate && !task.completed);
};

export const getDeepCleanTasksForDate = (date: string): DeepCleanTask[] => {
  return getDeepCleanTasks().filter(task => task.scheduledDate === date && !task.completed);
};

export const getOverdueDeepCleanTasks = (): DeepCleanTask[] => {
  const today = new Date().toISOString().split("T")[0];
  return getDeepCleanTasks().filter(
    task => task.scheduledDate && task.scheduledDate < today && !task.completed
  );
};

export const scheduleDeepCleanTask = (taskId: string, date: string): void => {
  const tasks = getDeepCleanTasks();
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.scheduledDate = date;
    saveDeepCleanTasks(tasks);
  }
};

export const completeDeepCleanTask = (taskId: string): void => {
  const tasks = getDeepCleanTasks();
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = true;
    task.completedDate = new Date().toISOString().split("T")[0];
    saveDeepCleanTasks(tasks);
  }
};

export const addDeepCleanTask = (task: string, room: string): void => {
  const tasks = getDeepCleanTasks();
  tasks.push({
    id: crypto.randomUUID(),
    task,
    room,
    completed: false,
  });
  saveDeepCleanTasks(tasks);
};

export const deleteDeepCleanTask = (taskId: string): void => {
  const tasks = getDeepCleanTasks().filter(t => t.id !== taskId);
  saveDeepCleanTasks(tasks);
};

// Chaos Cleaner Storage Functions

export const saveCleaningTasks = (tasks: CleaningTask[]): void => {
  localStorage.setItem("cleaning_tasks", JSON.stringify(tasks));
};

export const getCleaningTasks = (): CleaningTask[] => {
  const stored = localStorage.getItem("cleaning_tasks");
  if (!stored) return [];
  return JSON.parse(stored);
};

export const getCleaningTasksByRoom = (room: string): CleaningTask[] => {
  return getCleaningTasks().filter(task => task.room === room);
};

export const getCleaningTasksByFrequency = (frequency: CleaningTask["frequency"]): CleaningTask[] => {
  return getCleaningTasks().filter(task => task.frequency === frequency);
};

export const getDailyTasksDueToday = (): CleaningTask[] => {
  const today = new Date().toISOString().split("T")[0];
  return getCleaningTasks().filter(task => 
    task.frequency === "daily" && (!task.lastCompleted || task.lastCompleted !== today)
  );
};

export const getWeeklyTasksDueThisWeek = (): CleaningTask[] => {
  const tasks = getCleaningTasks();
  const today = new Date();
  const weekStart = getMondayOfWeek(today);
  
  return tasks.filter(task => {
    if (task.frequency !== "weekly") return false;
    if (!task.lastCompleted) return true;
    
    const lastCompletedWeek = getMondayOfWeek(new Date(task.lastCompleted));
    return lastCompletedWeek !== weekStart;
  });
};

export const completeCleaningTask = (taskId: string): void => {
  const tasks = getCleaningTasks();
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  
  const today = new Date().toISOString().split("T")[0];
  task.lastCompleted = today;
  
  // Update streak
  const streak = getCleaningStreak();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  
  if (!streak.lastCompletedDate || streak.lastCompletedDate === yesterdayStr || streak.lastCompletedDate === today) {
    if (streak.lastCompletedDate !== today) {
      streak.current += 1;
    }
  } else {
    streak.current = 1;
  }
  
  if (streak.current > streak.longest) {
    streak.longest = streak.current;
  }
  
  streak.lastCompletedDate = today;
  saveCleaningStreak(streak);
  
  // Calculate next due date based on frequency
  if (task.frequency === "daily") {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    task.nextDue = tomorrow.toISOString().split("T")[0];
  } else if (task.frequency === "weekly") {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    task.nextDue = nextWeek.toISOString().split("T")[0];
  } else if (task.frequency === "monthly") {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    task.nextDue = nextMonth.toISOString().split("T")[0];
  }
  
  saveCleaningTasks(tasks);
};

export const addCleaningTask = (task: Omit<CleaningTask, "id" | "createdAt">): void => {
  const tasks = getCleaningTasks();
  const newTask: CleaningTask = {
    ...task,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  saveCleaningTasks(tasks);
};

export const deleteCleaningTask = (taskId: string): void => {
  const tasks = getCleaningTasks().filter(t => t.id !== taskId);
  saveCleaningTasks(tasks);
};

export const getRoomProgress = (room: string): RoomProgress => {
  const tasks = getCleaningTasksByRoom(room);
  const today = new Date().toISOString().split("T")[0];
  const weekStart = getMondayOfWeek(new Date());
  
  const dailyTasks = tasks.filter(t => t.frequency === "daily");
  const weeklyTasks = tasks.filter(t => t.frequency === "weekly");
  const monthlyTasks = tasks.filter(t => t.frequency === "monthly");
  const deepTasks = tasks.filter(t => t.frequency === "deep");
  
  return {
    room,
    dailyComplete: dailyTasks.filter(t => t.lastCompleted === today).length,
    dailyTotal: dailyTasks.length,
    weeklyComplete: weeklyTasks.filter(t => t.lastCompleted && getMondayOfWeek(new Date(t.lastCompleted)) === weekStart).length,
    weeklyTotal: weeklyTasks.length,
    monthlyComplete: monthlyTasks.filter(t => t.lastCompleted?.startsWith(today.substring(0, 7))).length,
    monthlyTotal: monthlyTasks.length,
    deepComplete: deepTasks.filter(t => t.lastCompleted).length,
    deepTotal: deepTasks.length,
  };
};

export const getAllRoomsProgress = (): RoomProgress[] => {
  return PREDEFINED_ROOMS.map(room => getRoomProgress(room));
};

export const getTodaysCleaningProgress = (): { complete: number; total: number; percentage: number } => {
  const dailyTasks = getDailyTasksDueToday();
  const today = new Date().toISOString().split("T")[0];
  const completed = getCleaningTasks().filter(t => 
    t.frequency === "daily" && t.lastCompleted === today
  );
  
  const total = getCleaningTasks().filter(t => t.frequency === "daily").length;
  const complete = completed.length;
  const percentage = total > 0 ? Math.round((complete / total) * 100) : 0;
  
  return { complete, total, percentage };
};

// Cleaning Streak Storage
export const saveCleaningStreak = (streak: CleaningStreak): void => {
  localStorage.setItem("cleaning_streak", JSON.stringify(streak));
};

export const getCleaningStreak = (): CleaningStreak => {
  const stored = localStorage.getItem("cleaning_streak");
  if (!stored) {
    return { current: 0, longest: 0 };
  }
  return JSON.parse(stored);
};

// Reset daily tasks (called automatically or manually)
export const resetDailyTasks = (): void => {
  const tasks = getCleaningTasks();
  const today = new Date().toISOString().split("T")[0];
  
  tasks.forEach(task => {
    if (task.frequency === "daily") {
      if (task.lastCompleted !== today) {
        task.lastCompleted = undefined;
      }
    }
  });
  
  saveCleaningTasks(tasks);
};

// Calendar indicators - check if a date has events
export interface DateIndicators {
  hasBirthday: boolean;
  hasMeal: boolean;
  hasChores: boolean;
  hasPlan: boolean;
  hasNotes: boolean;
}

export const getDateIndicators = (date: string): DateIndicators => {
  return {
    hasBirthday: getBirthdaysForDate(date).length > 0,
    hasMeal: getMeal(date) !== null,
    hasChores: getChoresForDate(date).length > 0,
    hasPlan: getDailyPlan(date) !== null,
    hasNotes: getDailyPlan(date)?.notes ? true : false,
  };
};

// Get today's meals from the current week's meal plan
export const getTodaysMealsFromWeekly = (today: string): { breakfast: string; lunch: string; dinner: string; snacks: string; drinks: string } | null => {
  const dayOfWeek = new Date(today).getDay();
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const dayKey = dayNames[dayOfWeek];
  
  const weekStart = getMondayOfWeek(new Date(today));
  const weeklyPlan = getWeeklyMealPlan(weekStart);
  
  if (weeklyPlan && weeklyPlan.meals[dayKey]) {
    return weeklyPlan.meals[dayKey];
  }
  
  return null;
};

// Helper to get Monday of current week
function getMondayOfWeek(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}