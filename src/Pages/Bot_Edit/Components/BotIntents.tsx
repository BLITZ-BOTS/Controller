// Packages
import { useEffect, useState } from 'react';

// Components
import { Switch } from '@/Components/ui/switch';
import { useNotification } from '@/Backend/Hooks/NotificationContext';

// Types
import { linkMap } from '@/Backend/Types/Intents';

// Backend
import { toggle_intent } from '@/Backend/API/Commands/File System/toggle_intent';

interface BotIntentsProps {
  name: string;
  passedIntents: Record<string, boolean>;
}

export function BotIntents({ name, passedIntents }: BotIntentsProps) {
  const { addNotification } = useNotification();
  const [intents, setIntents] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setIntents(passedIntents);
  }, [passedIntents]);

  const handleToggleIntent = async (intentKey: string) => {
    try {
      const success = await toggle_intent(name, intentKey);
      if (success) {
        setIntents((prevIntents) => ({
          ...prevIntents,
          [intentKey]: !prevIntents[intentKey],
        }));
        addNotification('Updated Intents', 'success');
      }
    } catch (error) {
      addNotification('Error toggling intent', 'error');
    }
  };

  return (
    <div className="space-y-4 mt-4">
      {Object.entries(linkMap).map(([key, label]) => (
        <div
          key={key}
          className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-md"
        >
          <span className="text-white text-sm font-medium">{label}</span>
          <Switch
            checked={intents[key]}
            onCheckedChange={() => handleToggleIntent(key)}
            aria-label={`Toggle ${label}`}
          />
        </div>
      ))}
    </div>
  );
}