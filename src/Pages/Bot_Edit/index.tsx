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
  Copy,
  Plus, // Add this import for the 'Install Plugin' icon
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
import { Checkbox } from '@/Components/ui/checkbox';

// Backend Functions
import { fetch_local_bot_data } from '@/Backend/API/Commands/File System/fetch_local_bot_data';
import { fetchDiscordBotInfo } from '@/Backend/API/Fetch/Discord/FetchBot';
import { toggle_intent } from '@/Backend/API/Commands/File System/toggle_intent';
import { delete_plugin } from '@/Backend/API/Commands/File System/delete_plugin';
// import { install_plugin } from '@/Backend/API/Commands/File System/install_plugin'; // Make sure to import the install_plugin function

// Types
import { LocalBotData } from '@/Backend/Types/LocalBotData';
import { InstalledPlugin } from '@/Backend/Types/InstalledPlugin';
import { DiscordBotData } from '@/Backend/Types/DiscordBotData';
import { permissions } from '@/Backend/Types/BotInvite';

// Intent Mapping
import { linkMap } from '@/Backend/Types/Intents';

const Edit = () => {
  // Hooks
  const { addNotification } = useNotification();
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();

  // States
  const [botData, setBotData] = useState<LocalBotData | null>(null);
  const [discordBotData, setDiscordBotData] = useState<DiscordBotData | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [isTokenVisible, setIsTokenVisible] = useState<boolean>(false);
  const [intents, setIntents] = useState<Record<string, boolean>>({});
  const [inviteLink, setInviteLink] = useState<string>('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Fetch Local Bot Data
  const fetchBotData = async () => {
    try {
      const fetchedData = await fetch_local_bot_data(name as string);
      setBotData((prevData) => {
        if (JSON.stringify(prevData) !== JSON.stringify(fetchedData)) {
          if (fetchedData) {
            return fetchedData;
          }
        }
        return prevData;
      });

      // Initialize intents state
      const initialIntents: Record<string, boolean> = {};
      Object.keys(linkMap).forEach((key) => {
        if (fetchedData) {
          initialIntents[key] = fetchedData?.intents?.includes(key) || false;
        }
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

  // Toggle Token Visibility
  const toggleTokenVisibility = () => setIsTokenVisible((prev) => !prev);

  // Toggle Intent
  const handleToggleIntent = async (name: string, intentKey: string) => {
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

  // Handle Plugin Delete
  const handleDeletePlugin = async (name: string, plugin: string) => {
    try {
      const success = await delete_plugin(name, plugin);
      if (success) {
        addNotification(`Uninstalled ${plugin}`, 'success');
        if (botData) {
          const updatedPlugins = botData.installed_plugins?.filter(
            (installedPlugin) => installedPlugin.metadata?.name !== plugin
          );
          setBotData((prevData) => ({
            ...prevData,
            installed_plugins: updatedPlugins,
          }));
        }
      } else {
        addNotification(`Unable to uninstall ${plugin}`, 'error');
      }
    } catch (error) {
      addNotification(`Unable to uninstall ${plugin}`, 'error');
    }
  };

  // Handle Plugin Installation

  // Handle permission toggle using checkboxes
  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions((prev) => {
      if (prev.includes(permissionId)) {
        return prev.filter((p) => p !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  // Handle Copy Invite
  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
  };

  // Generate the invite link
  useEffect(() => {
    if (discordBotData) {
      const botId = discordBotData.id;
      const permissionsParam = selectedPermissions.join(',');
      const generatedLink = `https://discord.com/oauth2/authorize?client_id=${botId}&scope=bot+applications.commands&permissions=${permissionsParam}`;
      setInviteLink(generatedLink);
    }
  }, [selectedPermissions, discordBotData]);

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
                alt="Bot Avatar"
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
          <TabsTrigger value="other">Other</TabsTrigger>
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
                  onCheckedChange={() =>
                    handleToggleIntent(name as string, key)
                  }
                />
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Installed Plugins */}
        <TabsContent value="installed-plugins">
          <div className="space-y-4 mt-4">
            {/* Install Plugin Input and Button */}
            <div className="flex items-center space-x-4">
              <Input className="" />
              <Button className="flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Install Plugin</span>
              </Button>
            </div>

            {/* Installed Plugins List */}
            {botData?.installed_plugins?.length ? (
              botData?.installed_plugins.map(
                (plugin: InstalledPlugin, index) => (
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
                )
              )
            ) : (
              <h1 className="text-white text-lg font-medium">
                No Installed Plugins.
              </h1>
            )}
          </div>
        </TabsContent>

        {/* Other Tab */}
        <TabsContent value="other">
          <div className="bg-white/5 p-6 rounded-lg shadow-md mt-8">
            <h2 className="text-xl font-semibold mb-4 text-white">
              Invite Bot
            </h2>

            {/* Permissions Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-white mb-3">
                Select Permissions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {permissions.map((perm) => (
                  <div
                    key={perm.id}
                    className="flex items-center justify-start p-4 bg-primary/10 border border-primary/20 rounded-lg flex-grow"
                  >
                    <Checkbox
                      checked={selectedPermissions.includes(perm.id)}
                      onCheckedChange={() => handlePermissionToggle(perm.id)}
                      className="bg-primary/20"
                    />
                    <span className="text-white text-sm ml-3">{perm.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Display Generated Invite Link */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-white mb-2">
                Generated Invite Link
              </h3>
              <div className="flex items-center">
                <Input
                  value={inviteLink}
                  disabled
                  className="w-full bg-white/5 text-white border border-white/20 rounded-md px-4 py-2"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyInviteLink}
                  className="ml-2 text-white bg-transparent"
                >
                  <Copy className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Edit;
