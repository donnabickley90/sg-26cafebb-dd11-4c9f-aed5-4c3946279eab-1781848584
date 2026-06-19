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