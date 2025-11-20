import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';

export default function MascotToggle() {
  const [visible, setVisible] = useState(() => {
    return localStorage.getItem('mascotVisible') !== 'false';
  });

  const toggle = () => {
    const newValue = !visible;
    setVisible(newValue);
    localStorage.setItem('mascotVisible', String(newValue));
    window.dispatchEvent(new CustomEvent('mascot:toggle', { detail: { visible: newValue } }));
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="rounded-full"
      title={visible ? 'Hide mascot' : 'Show mascot'}
    >
      {visible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
    </Button>
  );
}
