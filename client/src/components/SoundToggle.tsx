import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { sounds } from '@/lib/sounds';
import { Button } from './ui/button';

export default function SoundToggle() {
  const [enabled, setEnabled] = useState(sounds.isEnabled());

  const toggle = () => {
    const newState = !enabled;
    sounds.toggle(newState);
    setEnabled(newState);
    if (newState) sounds.click();
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="fixed top-4 right-4 z-40"
      title={enabled ? 'Mute sounds' : 'Enable sounds'}
    >
      {enabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
    </Button>
  );
}
