import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ChevronLeft, Cog, Eye, EyeOff, Lock, Trash2 } from "lucide-react"; // Import Eye icons
import { invoke } from "@tauri-apps/api/core";
import { appDataDir } from "@tauri-apps/api/path";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useNavigate, useParams } from "react-router-dom";
import Notification from "../../Components/Notification";

// BotData and ErrorState Interfaces
interface BotData {
  token: string;
  plugins: string[];
}

interface ErrorState {
  message: string;
}

interface DiscordBotInfo {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
}

export default function EditPage() {
  const navigate = useNavigate();
  const { name } = useParams<{ name: string }>();
  const [botData, setBotData] = useState<BotData | null>(null);
  const [_error, setError] = useState<ErrorState | null>(null);
  const [discordBotInfo, setDiscordBotInfo] = useState<DiscordBotInfo | null>(
    null,
  );
  const [appDataDirectory, setAppDataDirectory] = useState<string>("");
  const [newPluginPath, setNewPluginPath] = useState<string>("");
  const [notification, setNotification] = useState<
    {
      message: string;
      type: "loading" | "success" | "error";
    } | null
  >(null);

  const [isTokenVisible, setIsTokenVisible] = useState(false); // State to toggle token visibility

  // Fetch app data directory
  useEffect(() => {
    const fetchAppDataDir = async () => {
      try {
        const dir = await appDataDir();
        setAppDataDirectory(dir);
      } catch (err) {
        setError({ message: "Failed to get app data directory" });
        console.error("Error fetching app data directory:", err);
      }
    };
    fetchAppDataDir();
  }, []);

  // Fetch Bot Data
  const fetchBotData = async () => {
    if (!appDataDirectory) return;

    try {
      const path = `${appDataDirectory}/bots/${name}`;
      const data = await invoke<BotData>("get_bot_data", { path });
      console.log(data);
      setBotData(data);
    } catch (err) {
      setError({ message: "Failed to fetch bot data" });
      console.error("Error fetching bot data:", err);
    }
  };

  // Fetch Discord Bot Info
  useEffect(() => {
    fetchBotData();
  }, [name, appDataDirectory]);

  useEffect(() => {
    const fetchDiscordBotInfo = async () => {
      if (!botData?.token) return;

      try {
        const response = await fetch("https://discord.com/api/v10/users/@me", {
          method: "GET",
          headers: {
            Authorization: `Bot ${botData.token}`,
          },
        });

        if (!response.ok) {
          throw new Error(
            `Error fetching Discord bot info: ${response.statusText}`,
          );
        }

        const data: DiscordBotInfo = await response.json();
        setDiscordBotInfo(data);
      } catch (err) {
        setError({ message: "Failed to fetch Discord bot info" });
        console.error("Error fetching Discord bot info:", err);
      }
    };

    fetchDiscordBotInfo();
  }, [botData]);

  // Handle plugin uninstallation
  const handleDeletePlugin = async (plugin: string) => {
    if (!botData) return;

    try {
      await invoke("delete_dir", { path: plugin });
      const updatedPlugins = botData.plugins.filter((p) => p !== plugin);
      setBotData({ ...botData, plugins: updatedPlugins });
    } catch (err) {
      setError({ message: "Failed to delete plugin" });
      console.error("Error deleting plugin:", err);
    }
  };

  // Handle adding a new plugin
  const handleAddPlugin = async () => {
    if (!botData || !newPluginPath.trim()) return;

    // Show loading notification while adding the plugin
    setNotification({ message: "Adding new plugin...", type: "loading" });

    try {
      await invoke("install_plugin", {
        path: `${appDataDirectory}/bots/${name}`,
        pluginName: newPluginPath.trim(),
      });

      // Re-fetch updated bot data after installing the plugin
      const updatedBotData = await invoke<BotData>("get_bot_data", {
        path: `${appDataDirectory}/bots/${name}`,
      });

      setBotData(updatedBotData);
      setNewPluginPath(""); // Clear input

      // Show success notification
      setNotification({
        message: "Plugin installed successfully!",
        type: "success",
      });
    } catch (err) {
      setError({ message: "Failed to add plugin" });
      console.error("Error installing plugin:", err);

      // Show error notification
      setNotification({ message: "Failed to install plugin", type: "error" });
    }
  };

  // Handle hiding notification after 2 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null); // Hide the notification after 2 seconds
      }, 2000);

      // Cleanup timer when the component unmounts or when notification changes
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Toggle token visibility
  const toggleTokenVisibility = () => setIsTokenVisible((prev) => !prev);

  return (
    <div className="max-w-4xl mx-auto mt-[100px]">
      {/* Back Button */}
      <motion.button
        onClick={() => navigate(-1)} // Go back to the previous page
        className="flex items-center text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition duration-300 ease-in-out mb-6"
      >
        <ChevronLeft className="w-5 h-5 mr-2" /> {/* Adjust icon size */}
        <span>Back</span>
      </motion.button>

      {/* Bot Info */}
      <motion.div
        className="bg-blitz-pink/10 border-blitz-pink/60 border p-6 rounded-lg shadow-md mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {discordBotInfo
          ? (
            <div className="flex items-center justify-between space-x-6">
              <div className="flex items-center space-x-6">
                <img
                  src={`https://cdn.discordapp.com/avatars/${discordBotInfo.id}/${discordBotInfo.avatar}.png`}
                  alt="Bot Avatar"
                  className="w-20 h-20 rounded-full"
                />
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {discordBotInfo.username}#{discordBotInfo.discriminator}
                  </h1>
                  <p className="text-sm text-gray-400">
                    ID: {discordBotInfo.id}
                  </p>
                </div>
              </div>
            </div>
          )
          : <Skeleton circle height={80} width={80} />}
      </motion.div>

      {/* Token Section */}
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
          <input
            type={isTokenVisible ? "text" : "password"} // Toggle between text and password
            value={botData?.token}
            disabled={true}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#FF30A0]"
            placeholder="Enter new token"
          />
          <button
            onClick={toggleTokenVisibility}
            className="text-white bg-transparent border-none flex items-center justify-center"
          >
            {isTokenVisible
              ? <EyeOff className="w-5 h-5" />
              : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </motion.div>

      {/* Add New Plugin Section */}
      <motion.div
        className="bg-white/5 p-6 rounded-lg shadow-md mt-8 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-semibold mb-4 text-white">
          Add New Plugin
        </h2>
        <div className="flex space-x-4 items-center">
          <input
            type="text"
            value={newPluginPath}
            onChange={(e) => setNewPluginPath(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#FF30A0]"
            placeholder="Enter plugin name"
          />
          <button
            onClick={handleAddPlugin}
            className="bg-gradient-to-r from-[#DD2832] to-[#FF30A0] text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90"
          >
            Add
          </button>
        </div>
      </motion.div>

      {/* Plugins Section */}
      <motion.div
        className="bg-white/5 p-6 rounded-lg shadow-md mt-8 mb-[60px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-semibold mb-4 text-white">Plugins</h2>
        {botData?.plugins.length === 0
          ? <p className="text-white">No plugins added</p>
          : (
            botData?.plugins.map((plugin_path, index) => (
              <div
                key={index}
                className="bg-white/5 p-4 rounded-lg shadow-md mb-4"
              >
                <div className="flex justify-between items-center">
                  <h1 className="text-white font-bold">
                    {plugin_path.split("/").pop()?.split("\\").pop()
                      ?.toLocaleUpperCase()}
                  </h1>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleDeletePlugin(plugin_path)}
                      className="text-red-500 py-2 px-4 rounded-md bg-red-500/20 hover:bg-red-500/40 h-[50px] flex items-center justify-center"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() =>
                        window.location.href = `/${name}/${
                          plugin_path.split("/").pop()?.split("\\").pop()
                        }`}
                      className="items-center py-2 px-4 rounded-md bg-[#ffffff]/10 hover:bg-[#ffffff]/20 transition duration-200 h-[50px]"
                    >
                      <Cog />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
      </motion.div>

      {/* Show the notification if present */}
      {notification && (
        <Notification message={notification.message} type={notification.type} />
      )}
    </div>
  );
}
