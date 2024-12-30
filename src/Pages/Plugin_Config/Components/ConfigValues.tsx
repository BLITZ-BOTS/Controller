import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

import { Skeleton } from '@/Components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Label } from '@/Components/ui/label';

import { fetch_local_plugin_config } from '@/Services/Bot Manager/Plugins/fetch';

export function PluginConfigValues({
  name,
  bot,
}: {
  name: string;
  bot: string;
}) {
  const [loading, setLoading] = useState(true);
  const [configValues, setConfigValues] = useState<
    Record<string, string | string[]>
  >({});
  const [newConfigKey, setNewConfigKey] = useState('');
  const [newArrayItem, setNewArrayItem] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    async function fetchPluginData() {
      try {
        setLoading(true);
        const data = await fetch_local_plugin_config(bot, name);
        if (data?.config) {
          setConfigValues(
            Object.entries(data.config).reduce(
              (acc, [key, value]) => ({
                ...acc,
                [key]: Array.isArray(value) ? value : String(value),
              }),
              {}
            )
          );
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch plugin data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchPluginData();
  }, [bot, name, toast]);

  const handleValueChange = (key: string, value: string) => {
    setConfigValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleAddConfig = () => {
    if (!newConfigKey.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a config key',
        variant: 'destructive',
      });
      return;
    }

    if (configValues[newConfigKey]) {
      toast({
        title: 'Error',
        description: 'This config key already exists',
        variant: 'destructive',
      });
      return;
    }

    setConfigValues((prev) => ({
      ...prev,
      [newConfigKey]: '',
    }));
    setNewConfigKey('');
  };

  const handleAddArrayItem = (key: string) => {
    if (!newArrayItem.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a value for the new item',
        variant: 'destructive',
      });
      return;
    }

    setConfigValues((prev) => {
      const updatedConfig = { ...prev };
      if (Array.isArray(updatedConfig[key])) {
        updatedConfig[key] = [...updatedConfig[key], newArrayItem];
      }
      return updatedConfig;
    });
    setNewArrayItem('');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Add New Config Section */}
      <div className="flex items-end space-x-4">
        <div className="flex-1">
          <Label htmlFor="new-config">Add New Config</Label>
          <Input
            id="new-config"
            placeholder="Enter config key"
            value={newConfigKey}
            onChange={(e) => setNewConfigKey(e.target.value)}
          />
        </div>
        <Button
          onClick={handleAddConfig}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </Button>
      </div>

      {/* Existing Config Values */}
      <div className="space-y-4">
        {Object.entries(configValues).map(([key, value]) => {
          if (Array.isArray(value)) {
            return (
              <motion.div
                key={key}
                className="space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Label>{key}</Label>
                <div className="space-y-2">
                  {value.map((item, index) => (
                    <Input
                      key={`${key}-${index}`}
                      value={item}
                      onChange={(e) => {
                        const updatedValue = [...value];
                        updatedValue[index] = e.target.value;
                        setConfigValues((prev) => ({
                          ...prev,
                          [key]: updatedValue,
                        }));
                      }}
                      placeholder={`Enter value for ${key} item ${index + 1}`}
                    />
                  ))}
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="New item"
                      value={newArrayItem}
                      onChange={(e) => setNewArrayItem(e.target.value)}
                    />
                    <Button
                      onClick={() => handleAddArrayItem(key)}
                      className="flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Item</span>
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          } else {
            return (
              <motion.div
                key={key}
                className="space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Label htmlFor={key}>{key}</Label>
                <Input
                  id={key}
                  value={value}
                  onChange={(e) => handleValueChange(key, e.target.value)}
                  placeholder={`Enter value for ${key}`}
                />
              </motion.div>
            );
          }
        })}

        {Object.keys(configValues).length === 0 && (
          <div className="text-center text-gray-500 py-4">
            No config values available. Add some above!
          </div>
        )}
      </div>
    </motion.div>
  );
}
