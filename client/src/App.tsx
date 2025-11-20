import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import PracticeLive from "@/pages/PracticeLive";
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
import Settings from "@/pages/Settings";
import { Route, Switch, useLocation } from "wouter";

import BottomNav from "@/components/BottomNav";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TalkyTalkyProvider } from "./contexts/TalkyTalkyContext";
import { TalkyMascot } from "@/components/mascot/TalkyMascot";
import LoadingScreen from "@/components/LoadingScreen";
import { useState, useEffect } from "react";


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
          <Route path={"/practice"} component={PracticeLive} />
          <Route path={"/ai-coach"} component={AICoach} />
          <Route path={"/match"} component={MatchCards} />
          <Route path={"/dashboard"} component={Dashboard} />
          <Route path={"/profile"} component={Profile} />
          <Route path={"/ielts"} component={IELTSPractice} />
          <Route path={"/modules"} component={Modules} />
          <Route path={"/learning-paths"} component={LearningPaths} />
          <Route path={"/learning-paths/:pathId"} component={LearningPathDetail} />
          <Route path={"/leaderboard"} component={Leaderboard} />
          <Route path={"/settings"} component={Settings} />
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
  const [showLoading, setShowLoading] = useState(() => {
    // Only show loading screen on first visit
    const hasSeenIntro = sessionStorage.getItem('hasSeenMascotIntro');
    return !hasSeenIntro;
  });

  const handleLoadingComplete = () => {
    sessionStorage.setItem('hasSeenMascotIntro', 'true');
    setShowLoading(false);
  };

  return (
    <ErrorBoundary>
      <TalkyTalkyProvider>
        <ThemeProvider
          defaultTheme="light"
          switchable
        >
          <TooltipProvider>
            {showLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
            <Toaster />
            <Router />
            {/* TalkyTalky Mascot - Lives at app root level */}
            <TalkyMascot />
          </TooltipProvider>
        </ThemeProvider>
      </TalkyTalkyProvider>
    </ErrorBoundary>
  );
}

export default App;
