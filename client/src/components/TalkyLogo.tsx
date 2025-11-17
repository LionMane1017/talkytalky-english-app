import { Mic } from "lucide-react";

export default function TalkyLogo() {
  return (
    <div className="flex items-center gap-3 group">
      {/* Animated microphone icon with glow effect */}
      <div className="relative">
        <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse" />
        <div className="relative bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-md border border-primary/30 rounded-2xl p-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
          <Mic className="h-6 w-6 text-primary animate-pulse" />
        </div>
      </div>

      {/* Talky Talky text with gradient and glassmorphism */}
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-400 to-accent bg-clip-text text-transparent animate-gradient">
            Talky
          </span>
          <span className="text-2xl font-bold bg-gradient-to-r from-accent via-purple-400 to-primary bg-clip-text text-transparent animate-gradient-reverse">
            Talky
          </span>
        </div>
        <span className="text-xs text-muted-foreground tracking-wider uppercase">
          IELTS Speaking Practice
        </span>
      </div>
    </div>
  );
}
