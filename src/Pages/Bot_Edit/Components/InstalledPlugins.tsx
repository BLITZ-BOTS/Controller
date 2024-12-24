// Packages
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

// Components
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { useToast } from '@/hooks/use-toast';

// Types
import { InstalledPlugin } from '@/Backend/Types/InstalledPlugin';

// Backend
import { delete_plugin } from '@/Backend/API/Commands/File System/delete_plugin';
import { install_plugin } from '@/Backend/API/Commands/File System/install_plugin';

export function InstalledPlugins({
  name,
  plugins,
  onChange,
}: {
  name: string;
  plugins: InstalledPlugin[];
  onChange: () => void;
}) {
  const [selectedPlugin, setSelectedPlugin] = useState<string>('');
  const { toast } = useToast();

  const handleDeletePlugin = async (name: string, plugin: string) => {
    try {
      const success = await delete_plugin(name, plugin);
      if (success) {
        toast({
          title: 'Success',
          description: `Deleted ${plugin}`,
          variant: 'success',
        });
        if (plugins) {
          onChange?.();
        }
      } else {
        toast({
          title: 'Error',
          description: `Unable to uninstall ${plugin}`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Unable to uninstall ${plugin}`,
        variant: 'destructive',
      });
    }
  };

  const handleInstallPlugin = async (name: string) => {
    toast({
      title: 'Loading',
      description: `Installing ${selectedPlugin as string}...`,
      variant: 'default',
    });
    const success = await install_plugin(name, selectedPlugin);
    if (success) {
      onChange?.();
      toast({
        title: 'Success',
        description: `Installed ${selectedPlugin as string}`,
        variant: 'success',
      });
      setSelectedPlugin('');
    } else {
      toast({
        title: 'Error',
        description: `Unable to uninstall ${selectedPlugin as string}`,
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <div className="space-y-4 mt-4">
        {/* Install Plugin Input and Button */}
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Plugin Name"
            value={selectedPlugin}
            onChange={(e) => {
              setSelectedPlugin(e.target.value);
            }}
          />
          <Button
            className="flex items-center space-x-2"
            onClick={() => {
              handleInstallPlugin(name as string);
            }}
          >
            <Plus className="w-5 h-5" />
            <span>Install Plugin</span>
          </Button>
        </div>

        {/* Installed Plugins List */}
        {plugins.length ? (
          plugins.map((plugin: InstalledPlugin, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-md"
            >
              <div>
                <h1 className="text-white text-lg font-medium opacity-80 hover:opacity-100">
                  <a
                    href={`https://blitz-bots.com/plugins/${plugin.metadata?.name?.toUpperCase()}/${plugin.metadata?.version}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {plugin.metadata?.name}@
                    <span className="text-primary">
                      {plugin.metadata?.version}
                    </span>
                  </a>
                </h1>
                <span className="text-xs text-gray-500">{plugin.path}</span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => console.log('test')}
                >
                  <Pencil />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    handleDeletePlugin(
                      name as string,
                      plugin.metadata?.name as string
                    )
                  }
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <h1 className="text-white text-lg font-medium">
            No Installed Plugins.
          </h1>
        )}
      </div>
    </>
  );
}
