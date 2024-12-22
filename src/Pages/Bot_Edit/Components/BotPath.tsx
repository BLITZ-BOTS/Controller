// Packages
import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { join, appLocalDataDir } from '@tauri-apps/api/path';

// Components
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';

export function BotPath({ name }: { name: string }) {
  const [copied, setCopied] = useState(false);
  const [fullPath, setFullPath] = useState<string | null>(null);

  useEffect(() => {
    const getFullPath = async () => {
      try {
        const localDataDir = await appLocalDataDir();
        const fullPath = await join(localDataDir, 'bots', name);
        setFullPath(fullPath);
      } catch (error) {
        console.error('Error resolving path:', error);
      }
    };

    getFullPath();
  }, [name]);

  // Function to handle the copy action
  const handleCopy = () => {
    if (fullPath) {
      navigator.clipboard.writeText(fullPath).then(() => {
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 1000);
      });
    }
  };

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-md p-6 mt-4">
      <h2 className="text-xl font-semibold text-white mb-4">Bot Directory</h2>

      <div className="flex items-center space-x-4">
        {/* Disabled input to show the path */}
        <Input
          value={fullPath || ''}
          disabled
          className="w-full bg-white/5 text-white border border-white/20 rounded-md px-4 py-2"
        />

        {/* Copy Button */}
        <Button
          size="icon"
          variant="ghost"
          onClick={handleCopy}
          className="flex items-center justify-center p-2 bg-primary/20 rounded-md text-white"
        >
          {copied ? (
            <Check className="w-5 h-5 text-green-500" />
          ) : (
            <Copy className="w-5 h-5 text-white" />
          )}
        </Button>
      </div>
    </div>
  );
}
