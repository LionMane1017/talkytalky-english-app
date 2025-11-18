import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TalkyLogo from "@/components/TalkyLogo";
import { getLoginUrl } from "@/const";
import { Mic, Sparkles, Trophy, Users } from "lucide-react";

export default function Login() {
  const handleLogin = () => {
    window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Logo */}
        <div className="mb-8">
          <TalkyLogo />
        </div>

        {/* Main Login Card */}
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-3xl border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold text-white">
              Welcome to TalkyTalky
            </CardTitle>
            <CardDescription className="text-gray-200 text-base">
              Your AI-powered English pronunciation coach
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Login Button */}
            <Button
              onClick={handleLogin}
              size="lg"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-lg py-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Sign In to Start Learning
            </Button>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center p-4 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
                <Mic className="w-8 h-8 text-purple-300 mx-auto mb-2" />
                <p className="text-white text-sm font-medium">AI Voice Coach</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
                <Trophy className="w-8 h-8 text-pink-300 mx-auto mb-2" />
                <p className="text-white text-sm font-medium">IELTS Practice</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
                <Sparkles className="w-8 h-8 text-indigo-300 mx-auto mb-2" />
                <p className="text-white text-sm font-medium">Progress Tracking</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
                <Users className="w-8 h-8 text-purple-300 mx-auto mb-2" />
                <p className="text-white text-sm font-medium">Personalized</p>
              </div>
            </div>

            {/* Info Text */}
            <p className="text-center text-gray-300 text-sm pt-2">
              Sign in to save your progress, track your improvement, and get personalized coaching from TalkyTalky.
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-white/60 text-sm mt-8 text-center max-w-md">
          TalkyTalky uses advanced AI to help you master English pronunciation and ace your IELTS speaking test.
        </p>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -50px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(50px, 50px) scale(1.05);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
