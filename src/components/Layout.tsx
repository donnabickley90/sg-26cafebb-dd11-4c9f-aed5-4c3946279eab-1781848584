import Link from "next/link";
import { useRouter } from "next/router";
import { 
  Home, 
  Calendar, 
  CalendarRange,
  Utensils, 
  Sparkles, 
  Grid3x3,
  Wand2,
  Trash2,
  Cake,
  BarChart3,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeSwitch } from "@/components/ThemeSwitch";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const router = useRouter();
  
  // Generate today's date for the planner link
  const today = new Date().toISOString().split("T")[0];

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: `/daily/${today}`, label: "Planner", icon: Calendar },
    { href: "/calendar", label: "Calendar", icon: CalendarRange },
    { href: "/meals", label: "Meals", icon: Utensils },
    { href: "/cleaning", label: "Chores", icon: Sparkles },
    { href: "/rooms", label: "Rooms", icon: Grid3x3 },
    { href: "/deep-clean", label: "Deep Clean", icon: Wand2 },
    { href: "/declutter", label: "Declutter", icon: Trash2 },
    { href: "/birthdays", label: "Birthdays", icon: Cake },
    { href: "/stats", label: "Stats", icon: BarChart3 },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col lg:flex-row">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-sidebar border-r border-sidebar-border">
          <div className="flex-1 flex flex-col pt-8 pb-4 overflow-y-auto">
            <div className="flex items-center justify-between px-6 mb-8">
              <h1 className="font-heading font-bold text-2xl text-primary">
                Chaos Planner
              </h1>
              <ThemeSwitch />
            </div>
            <nav className="flex-1 px-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                // Enhanced active state detection for routes with sub-pages
                const isActive = 
                  item.label === "Planner" 
                    ? router.pathname.startsWith("/daily")
                    : item.label === "Chores"
                    ? router.pathname.startsWith("/cleaning")
                    : item.label === "Deep Clean"
                    ? router.pathname.startsWith("/deep-clean")
                    : item.label === "Calendar"
                    ? router.pathname.startsWith("/calendar")
                    : router.pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-3xl transition-all duration-200",
                      "hover:bg-sidebar-accent hover:scale-105",
                      isActive
                        ? "bg-gradient-to-r from-primary/20 to-accent/20 text-primary shadow-lg border-l-4 border-primary font-semibold"
                        : "text-sidebar-foreground hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", isActive && "animate-pulse")} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Mobile Top Bar */}
        <div className="lg:hidden sticky top-0 z-40 bg-sidebar/95 backdrop-blur-sm border-b border-sidebar-border">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="font-heading font-bold text-lg text-primary">
              Chaos Planner
            </h1>
            <ThemeSwitch />
          </div>
        </div>

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
              // Enhanced active state detection for routes with sub-pages
              const isActive = 
                item.label === "Planner"
                  ? router.pathname.startsWith("/daily")
                  : item.label === "Chores"
                  ? router.pathname.startsWith("/cleaning")
                  : item.label === "Calendar"
                  ? router.pathname.startsWith("/calendar")
                  : router.pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200",
                    isActive
                      ? "text-primary bg-primary/10 scale-110 font-semibold"
                      : "text-sidebar-foreground hover:text-primary"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive && "drop-shadow-glow")} />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
            <Link
              href="/settings"
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200",
                router.pathname === "/settings"
                  ? "text-primary bg-primary/10 scale-110 font-semibold"
                  : "text-sidebar-foreground hover:text-primary"
              )}
            >
              <Settings className={cn("w-5 h-5", router.pathname === "/settings" && "drop-shadow-glow")} />
              <span className="text-xs font-medium">More</span>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}