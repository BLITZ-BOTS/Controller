// Packages
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { debounce } from 'lodash';

// Components
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { useToast } from '@/hooks/use-toast';

// Backend
import { InstalledPlugin } from '@/Backend/Types/InstalledPlugin';
import { delete_plugin } from '@/Backend/API/Commands/File System/delete_plugin';
import { install_plugin } from '@/Backend/API/Commands/File System/install_plugin';

// Types
import { PluginSuggestion } from '@/Backend/Types/PluginSuggestion';
interface ApiResponse {
  data: PluginSuggestion[];
}

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
  const [suggestions, setSuggestions] = useState<PluginSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { toast } = useToast();
  const suggestionRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.blitz-bots.com/plugins/search?query=${encodeURIComponent(query)}&per_page=4`
      );
      const { data } = (await response.json()) as ApiResponse;
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  };

  const debouncedFetch = useCallback(
    debounce((query: string) => fetchSuggestions(query), 300),
    []
  );

  useEffect(() => {
    return () => {
      debouncedFetch.cancel();
    };
  }, [debouncedFetch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSelectedPlugin(value);
    debouncedFetch(value);
  };

  const handleSuggestionClick = (suggestion: PluginSuggestion) => {
    setSelectedPlugin(suggestion.name.toLowerCase());
    setSuggestions([]);
    setShowSuggestions(false);
  };

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
      description: `Installing ${selectedPlugin}...`,
      variant: 'default',
    });
    const success = await install_plugin(name, selectedPlugin);
    if (success) {
      onChange?.();
      toast({
        title: 'Success',
        description: `Installed ${selectedPlugin}`,
        variant: 'success',
      });
      setSelectedPlugin('');
    } else {
      toast({
        title: 'Error',
        description: `Unable to uninstall ${selectedPlugin}`,
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <div className="space-y-4 mt-4">
        <div className="flex items-center space-x-4 relative">
          <div className="flex-1 relative">
            <Input
              placeholder="Plugin Name"
              value={selectedPlugin}
              onChange={handleInputChange}
              onFocus={() => selectedPlugin && setShowSuggestions(true)}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionRef}
                className="absolute z-10 w-full mt-1 bg-black border border-primary/20 rounded-md shadow-lg"
              >
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-primary/10 cursor-pointer"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="font-medium">{suggestion.name}</div>
                    <div className="text-xs text-gray-500">
                      {suggestion.description}
                    </div>
                    {suggestion.versions.length > 0 && (
                      <div className="text-xs text-primary mt-1">
                        Latest: v{suggestion.versions[0]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button
            className="flex items-center space-x-2"
            onClick={() => {
              handleInstallPlugin(name);
            }}
          >
            <Plus className="w-5 h-5" />
            <span>Install Plugin</span>
          </Button>
        </div>

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
                    handleDeletePlugin(name, plugin.metadata?.name as string)
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

export default InstalledPlugins;
