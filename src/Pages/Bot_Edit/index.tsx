// Packages
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, EyeIcon, EyeClosed, Lock } from 'lucide-react';

// Components
import { useNotification } from '../../Backend/Hooks/NotificationContext';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Skeleton } from '@/Components/ui/skeleton';

// Backend Functions
import { fetch_local_bot_data } from '../../Backend/API/Commands/File System/fetch_local_bot_data';
import { fetchDiscordBotInfo } from '../../Backend/API/Fetch/Discord/FetchBot';

// Types
import { LocalBotData } from '../../Backend/Types/LocalBotData';

const Edit = () => {
  // Hooks
  const { addNotification } = useNotification();
  const { name } = useParams();
  const navigate = useNavigate();

  // States
  const [botData, setBotData] = useState<LocalBotData | null>(null);
  const [discordBotData, setDiscordBotData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTokenVisible, setIsTokenVisible] = useState(false);

  // Fetch Local Bot Data
  const fetchBotData = async () => {
    try {
      const fetchedData = await fetch_local_bot_data(name as string);
      setBotData((prevData) => {
        if (JSON.stringify(prevData) !== JSON.stringify(fetchedData)) {
          return fetchedData;
        }
        return prevData;
      });
    } catch (error) {
      addNotification('Error Fetching Bot Data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Discord Bot Data (only after botData is available)
  const fetchDiscordData = async () => {
    if (botData && botData.token) {
      try {
        const data = await fetchDiscordBotInfo(botData.token);
        setDiscordBotData(data);
      } catch (error) {
        addNotification('Error Fetching Discord Bot Data', 'error');
      }
    }
  };

  // Load Data On Page Load
  useEffect(() => {
    fetchBotData();
  }, []);

  // Trigger fetchDiscordData when botData is available
  useEffect(() => {
    if (botData) {
      fetchDiscordData();
    }
  }, [botData]);

  // Refresh Data
  const refreshData = async () => {
    setLoading(true);
    try {
      const updatedData = await fetch_local_bot_data(name as string);
      setBotData(updatedData);
      if (updatedData.token) {
        const discordData = await fetchDiscordBotInfo(updatedData.token);
        setDiscordBotData(discordData);
      }
    } catch (error) {
      addNotification('Error Refreshing Bot Data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Buttons

  // Toggle Token Visibility
  const toggleTokenVisibility = () => setIsTokenVisible((prev) => !prev);

  // If Loading
  if (loading) {
    return <h1>Loading...</h1>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-[100px]">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="mt-[40px] mb-[20px]"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="w-5 h-5 mr-2" />
        <span>Back</span>
      </Button>

      {/* Bot Info */}
      <motion.div
        className="bg-primary/10 border-primary/60 border p-6 rounded-md shadow-md mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {discordBotData ? (
          <div className="flex items-center justify-between space-x-6">
            <div className="flex items-center space-x-6">
              <img
                src={`https://cdn.discordapp.com/avatars/${discordBotData.id}/${discordBotData.avatar}.png`}
                alt="Bot Avatar"
                className="w-20 h-20 rounded-full"
              />
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {discordBotData.username}#{discordBotData.discriminator}
                </h1>
                <p className="text-sm text-gray-400">ID: {discordBotData.id}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-6">
            {/* Avatar Skeleton */}
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="flex flex-col space-y-3">
              {/* Username Skeleton */}
              <Skeleton className="w-40 h-6 rounded-md" />
              {/* ID Skeleton */}
              <Skeleton className="w-32 h-4 rounded-sm" />
            </div>
          </div>
        )}
      </motion.div>

      <motion.div
        className="bg-white/5 p-6 rounded-lg shadow-md mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
          <Lock className="mr-2" />
          Token
        </h2>
        <div className="flex space-x-4 items-center">
          <Input
            type={isTokenVisible ? 'text' : 'password'}
            value={botData?.token}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#FF30A0]"
            placeholder="Enter new token"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTokenVisibility}
            className="text-white bg-transparent border-none flex items-center justify-center"
          >
            {isTokenVisible ? (
              <EyeIcon className="w-5 h-5" />
            ) : (
              <EyeClosed className="w-5 h-5" />
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Edit;
