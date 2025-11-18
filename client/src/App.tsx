import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Practice from "@/pages/Practice";
import MatchCards from "@/pages/MatchCards";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import IELTSPractice from "@/pages/IELTSPractice";
import Modules from "@/pages/Modules";
import LearningPaths from "@/pages/LearningPaths";
import LearningPathDetail from "@/pages/LearningPathDetail";
import Leaderboard from "@/pages/Leaderboard";
import AdminDashboard from "@/pages/AdminDashboard";
import AICoach from "@/pages/AICoach";
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TalkyTalkyProvider } from "./contexts/TalkyTalkyContext";


function Router() {
  const [location] = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <>
      <div className="pb-16">
        <Switch>
          <Route path={"/"} component={Dashboard} />
          <Route path={"/practice"} component={Practice} />
          <Route path={"/ai-coach"} component={AICoach} />
          <Route path={"/match"} component={MatchCards} />
          <Route path={"/dashboard"} component={Dashboard} />
          <Route path={"/profile"} component={Profile} />
          <Route path={"/ielts"} component={IELTSPractice} />
          <Route path={"/modules"} component={Modules} />
          <Route path={"/learning-paths"} component={LearningPaths} />
          <Route path={"/learning-paths/:pathId"} component={LearningPathDetail} />
          <Route path={"/leaderboard"} component={Leaderboard} />
          <Route path={"/admin"} component={AdminDashboard} />
          <Route path={"/404"} component={NotFound} />
          {/* Final fallback route */}
          <Route component={NotFound} />
        </Switch>
      </div>
      <BottomNav />
    </>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <TalkyTalkyProvider>
        <ThemeProvider
          defaultTheme="light"
          switchable
        >
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </TalkyTalkyProvider>
    </ErrorBoundary>
  );
}

export default App;
