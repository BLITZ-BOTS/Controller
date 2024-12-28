// Packages
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Types
import { DiscordBotData } from '@/Backend/Types/DiscordBotData';

// Components
import { Skeleton } from '@/Components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

// Backend
import { fetchDiscordBotInfo } from '@/Backend/API/Fetch/Discord/FetchBot';

export function BotInfo({ token }: { token: string }) {
  const [discordBotData, setDiscordBotData] = useState<DiscordBotData | null>(
    null
  );

  const { toast } = useToast();

  const fetchDiscordData = async () => {
    if (token) {
      try {
        const data = await fetchDiscordBotInfo(token);
        setDiscordBotData(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Unable to fetch bot data from Discord',
          variant: 'destructive',
        });
      }
    }
  };

  useEffect(() => {
    if (token) {
      fetchDiscordData();
    }
  }, [token]);
  return (
    <>
      {/* Bot Info */}
      <motion.div
        className="bg-primary/20 border-primary border p-6 rounded-md shadow-md mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {discordBotData ? (
          <div className="flex items-center justify-between space-x-6">
            <div className="flex items-center space-x-6">
              <img
                src={`https://cdn.discordapp.com/avatars/${discordBotData.id}/${discordBotData.avatar}.png`}
                alt={`${discordBotData.username}'s Avatar`}
                className="w-20 h-20 rounded-full"
              />
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {discordBotData.username}#{discordBotData.discriminator}
                </h1>
                <p className="text-sm text-gray-400">{discordBotData.id}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-6">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="flex flex-col space-y-3">
              <Skeleton className="w-40 h-6 rounded-md" />
              <Skeleton className="w-32 h-4 rounded-sm" />
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
}
