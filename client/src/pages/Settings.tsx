import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Volume2, Eye, Palette, Bell } from "lucide-react";
import { Link } from "wouter";
import { sounds } from "@/lib/sounds";
import TalkyLogo from "@/components/TalkyLogo";

export default function Settings() {
  const [soundEnabled, setSoundEnabled] = useState(sounds.isEnabled());
  const [mascotVisible, setMascotVisible] = useState(() => 
    localStorage.getItem('mascotVisible') !== 'false'
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(() =>
    localStorage.getItem('notificationsEnabled') === 'true'
  );

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    sounds.toggle(enabled);
  };

  const handleMascotToggle = (visible: boolean) => {
    setMascotVisible(visible);
    localStorage.setItem('mascotVisible', String(visible));
    window.dispatchEvent(new CustomEvent('mascot:toggle', { detail: { visible } }));
  };

  const handleNotificationsToggle = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    localStorage.setItem('notificationsEnabled', String(enabled));
  };

  const settings = [
    {
      icon: Eye,
      title: "Mascot Visibility",
      description: "Show or hide TalkyTalky mascot companion",
      value: mascotVisible,
      onChange: handleMascotToggle,
    },
    {
      icon: Volume2,
      title: "Sound Effects",
      description: "Enable retro 8-bit sound effects",
      value: soundEnabled,
      onChange: handleSoundToggle,
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Receive achievement and streak reminders",
      value: notificationsEnabled,
      onChange: handleNotificationsToggle,
    },
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section - Same style as Home */}
      <div className="bg-gradient-to-b from-primary/5 to-transparent py-16 px-4">
        <div className="container max-w-4xl">
          {/* Back Button + Logo */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <div className="scale-75">
              <TalkyLogo />
            </div>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>

          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Customize your learning experience
            </p>
          </div>
        </div>
      </div>

      {/* Settings Cards */}
      <div className="container py-12 max-w-3xl">
        <div className="grid gap-4">
          {settings.map((setting) => (
            <Card key={setting.title} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <setting.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{setting.title}</CardTitle>
                      <CardDescription>{setting.description}</CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={setting.value}
                    onCheckedChange={setting.onChange}
                  />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <Card className="mt-8 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Palette className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Theme</CardTitle>
                <CardDescription>
                  Toggle theme using the moon/sun icon in the header
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
