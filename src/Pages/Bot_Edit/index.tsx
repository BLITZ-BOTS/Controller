// Packages
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  EyeIcon,
  EyeClosed,
  Lock,
  Pencil,
  Trash2,
  Pen,
  Trash,
} from 'lucide-react';

// Components
import { useNotification } from '../../Backend/Hooks/NotificationContext';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Skeleton } from '@/Components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/Components/ui/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Switch } from '@/Components/ui/switch';

// Backend Functions
import { fetch_local_bot_data } from '@/Backend/API/Commands/File System/fetch_local_bot_data';
import { fetchDiscordBotInfo } from '@/Backend/API/Fetch/Discord/FetchBot';

// Types
import { LocalBotData } from '@/Backend/Types/LocalBotData';
import { InstalledPlugin } from '@/Backend/Types/InstalledPlugin';

// Intent Mapping
import { linkMap } from '@/Backend/Types/Intents';

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
  const [intents, setIntents] = useState<Record<string, boolean>>({});

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

      // Initialize intents state
      const initialIntents: Record<string, boolean> = {};
      Object.keys(linkMap).forEach((key) => {
        initialIntents[key] = fetchedData?.intents?.includes(key) || false;
      });
      setIntents(initialIntents);
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

      // Update intents state
      const updatedIntents: Record<string, boolean> = {};
      Object.keys(linkMap).forEach((key) => {
        updatedIntents[key] = updatedData?.intents?.includes(key) || false;
      });
      setIntents(updatedIntents);
    } catch (error) {
      addNotification('Error Refreshing Bot Data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Toggle Token Visibility
  const toggleTokenVisibility = () => setIsTokenVisible((prev) => !prev);

  // Toggle Intent
  const handleToggleIntent = (intentKey: string) => {
    setIntents((prevIntents) => ({
      ...prevIntents,
      [intentKey]: !prevIntents[intentKey],
    }));
  };

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

      {/* Page Breadcrumbs */}
      <div className="mb-[30px]">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Bots</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {discordBotData ? (
              <BreadcrumbItem>
                {discordBotData ? (
                  discordBotData.username
                ) : (
                  <Skeleton className="w-24 h-6 rounded-md" />
                )}
              </BreadcrumbItem>
            ) : (
              <Skeleton className="w-24 h-6 rounded-md" />
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

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
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="flex flex-col space-y-3">
              <Skeleton className="w-40 h-6 rounded-md" />
              <Skeleton className="w-32 h-4 rounded-sm" />
            </div>
          </div>
        )}
      </motion.div>

      {/* Token Input */}
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
            disabled={!isTokenVisible}
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

      {/* Settings Tabs */}
      <Tabs defaultValue="intents" className="mt-[50px] pb-[30px]">
        <TabsList>
          <TabsTrigger value="intents">Bot Intents</TabsTrigger>
          <TabsTrigger value="installed-plugins">Installed Plugins</TabsTrigger>
        </TabsList>

        {/* Intents List */}
        <TabsContent value="intents">
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
                />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="installed-plugins">
          <div className="space-y-4 mt-4">
            {botData?.installed_plugins?.length > 0 ? (
              botData?.installed_plugins.map(
                (plugin: InstalledPlugin, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-md"
                  >
                    <div>
                      <h1 className="text-white text-lg font-medium">
                        {plugin.metadata?.name}@{plugin.metadata?.version}
                      </h1>
                      <span className="text-xs text-gray-500">
                        {plugin.path}
                      </span>
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
                        onClick={() => console.log('test')}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                )
              )
            ) : (
              <h1 className="text-white text-lg font-medium">
                No Installed Plugins.
              </h1>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Edit;
