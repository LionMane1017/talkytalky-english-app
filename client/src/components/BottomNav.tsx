import { Home, Mic, Grid3x3, BarChart3, User, BookOpen, Trophy, Sparkles } from "lucide-react";
import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/ai-coach", icon: Sparkles, label: "AI Coach" },
  { path: "/practice", icon: Mic, label: "Practice" },
  { path: "/leaderboard", icon: Trophy, label: "Ranks" },
  { path: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-border/50 z-50 safe-area-inset-bottom backdrop-blur-xl">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all relative",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <div className="absolute inset-0 glow-cyan rounded-lg" />
              )}
              <Icon className="h-5 w-5 relative z-10" />
              <span className="text-xs font-medium relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
