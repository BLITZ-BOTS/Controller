// Packages
import { useEffect, useState } from 'react';

// Components
import { Switch } from '@/Components/ui/switch';
import { useToast } from '@/hooks/use-toast';

// Types
import { linkMap } from '@/Types/Intents';

// Backend
import { toggle_intent } from '@/Services/Bot Manager/intents';

interface BotIntentsProps {
  name: string;
  passedIntents: Record<string, boolean>;
}

export function BotIntents({ name, passedIntents }: BotIntentsProps) {
  const { toast } = useToast();
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

        toast({
          title: 'Success',
          description: 'Updated Intents',
          variant: 'success',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error Updating Intents',
        variant: 'destructive',
      });
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
