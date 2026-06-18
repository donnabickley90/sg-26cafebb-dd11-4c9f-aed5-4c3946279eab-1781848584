import Link from "next/link";
import { useRouter } from "next/router";
import { 
  Home, 
  Calendar, 
  CalendarRange,
  Utensils, 
  Sparkles, 
  Grid3x3,
  BroomIcon as Broom,
  Trash2,
  Cake,
  BarChart3,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/planner", label: "Planner", icon: Calendar },
  { href: "/calendar", label: "Calendar", icon: CalendarRange },
  { href: "/meals", label: "Meals", icon: Utensils },
  { href: "/chores", label: "Chores", icon: Sparkles },
  { href: "/rooms", label: "Rooms", icon: Grid3x3 },
  { href: "/deep-clean", label: "Deep Clean", icon: Broom },
  { href: "/declutter", label: "Declutter", icon: Trash2 },
  { href: "/birthdays", label: "Birthdays", icon: Cake },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Layout({ children }: LayoutProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col lg:flex-row">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-sidebar border-r border-sidebar-border">
          <div className="flex-1 flex flex-col pt-8 pb-4 overflow-y-auto">
            <div className="flex items-center justify-center px-6 mb-8">
              <h1 className="font-heading font-bold text-2xl text-primary">
                Kitten&apos;s Chaos Planner
              </h1>
            </div>
            <nav className="flex-1 px-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-3xl transition-all duration-200",
                      "hover:bg-sidebar-accent hover:scale-105",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
                        : "text-sidebar-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 pb-20 lg:pb-8">
          <div className="container py-8">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-sidebar border-t border-sidebar-border z-50">
          <div className="flex items-center justify-around px-2 py-3">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200",
                    isActive
                      ? "text-primary"
                      : "text-sidebar-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
            <Link
              href="/settings"
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200",
                router.pathname === "/settings"
                  ? "text-primary"
                  : "text-sidebar-foreground"
              )}
            >
              <Settings className="w-5 h-5" />
              <span className="text-xs font-medium">More</span>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}