// Packages
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Components
import { Skeleton } from '@/Components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

// Backend
import { fetch_local_plugin_config } from '@/Services/Bot Manager/Plugins/fetch';

// Types
interface PluginConfig {
  name: string;
  description: string;
  version: string;
  config?: Record<string, any>;
}

export function PluginInfo({ bot, name }: { bot: string; name: string }) {
  const [pluginData, setPluginData] = useState<PluginConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchPluginData() {
      try {
        setLoading(true);
        const data = await fetch_local_plugin_config(bot, name);
        setPluginData(data);
        console.log(data);
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
  }, [bot, name]);

  return (
    <>
      <motion.div
        className="bg-primary/20 border-primary border p-6 rounded-md shadow-md mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {loading ? (
          <div className="flex items-center space-x-6">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="flex flex-col space-y-3">
              <Skeleton className="w-40 h-6 rounded-md" />
              <Skeleton className="w-32 h-4 rounded-sm" />
            </div>
          </div>
        ) : pluginData ? (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {pluginData.name}
                  <span className="text-primary text-sm">
                    @{pluginData.version}
                  </span>
                </h1>
                <p className="text-gray-400 mt-1">{pluginData.description}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            No plugin data available
          </div>
        )}
      </motion.div>
    </>
  );
}

export default PluginInfo;
