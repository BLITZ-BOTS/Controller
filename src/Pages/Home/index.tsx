import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import BotCard from "./Components/BotCard";
import CreateBot from "../../Components/Actions/CreateBot";
import DeleteConfirm from "../../Components/Actions/DeleteBot";
import Notification from "../../Components/Notification";
import { invoke } from "@tauri-apps/api/core";
import { appDataDir } from "@tauri-apps/api/path";
import { FaFolderOpen } from "react-icons/fa";
import { open } from "@tauri-apps/plugin-shell";

export default function Home() {
  const [isCreateBotOpen, setIsCreateBotOpen] = useState(false);
  const [isDeleteBotOpen, setIsDeleteBotOpen] = useState(false);
  const [selectedBot, setSelectedBot] = useState<any>(null);
  const [bots, setBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: "loading" | "success" | "error" } | null>(null);

  const showNotification = (message: string, type: "loading" | "success" | "error", duration = 3000) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), duration);
  };

  const fetchBots = async () => {
    try {
      const result = await invoke("fetch_bots", {
        path: `${await appDataDir()}/bots`,
      });
      setBots(result as any[]);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching bots:", error);
      showNotification("Failed to fetch bots.", "error");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBots();
  }, []);

  const handleCreateButtonClick = () => setIsCreateBotOpen(true);

  const handleCreateBotClose = () => setIsCreateBotOpen(false);

  const handleBotCreated = () => {
    showNotification("Creating bot...", "loading");
    fetchBots().then(() => showNotification("Bot created successfully!", "success"));
  };

  const handleDeleteButtonClick = (bot: any) => {
    setSelectedBot(bot);
    setIsDeleteBotOpen(true);
  };

  const handleDeleteBotClose = () => {
    setIsDeleteBotOpen(false);
    setSelectedBot(null);
  };

  const handleDeleteBotConfirm = async () => {
    if (selectedBot?.path) {
      try {
        showNotification("Deleting bot...", "loading");
        await invoke("delete_dir", { path: selectedBot.path });
        fetchBots();
        showNotification("Bot deleted successfully!", "success");
      } catch (error) {
        console.error("Error deleting bot:", error);
        showNotification("Failed to delete bot.", "error");
      } finally {
        handleDeleteBotClose();
      }
    }
  };

  const openFolder = async () => {
    try {
      const filePath = `${await appDataDir()}/bots`;
      await open(filePath);
    } catch (error) {
      console.error("Error opening folder:", error);
      showNotification("Failed to open folder.", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex justify-center items-center">
        <p>Loading bots...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      {notification && <Notification message={notification.message} type={notification.type} />}

      <CreateBot
        isOpen={isCreateBotOpen}
        onClose={handleCreateBotClose}
        onBotCreated={handleBotCreated}
      />

      <DeleteConfirm
        isOpen={isDeleteBotOpen}
        botName={selectedBot?.name || ""}
        path={selectedBot?.path || ""}
        onClose={handleDeleteBotClose}
        onConfirm={handleDeleteBotConfirm}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-3xl font-bold">Your Bots</h1>
          <div className="flex space-x-4">
            <button
              onClick={openFolder}
              className="bg-blitz-pink/20 text-blitz-pink border-blitz-pink p-2 rounded-lg hover:bg-blitz-pink/30"
            >
              <FaFolderOpen size={20} />
            </button>
            <button
              onClick={handleCreateButtonClick}
              className="bg-gradient-to-r from-[#DD2832] to-[#FF30A0] text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90"
            >
              Create New Bot
            </button>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.2 },
            },
          }}
        >
          {bots.map((bot) => (
            <motion.div
              key={bot.id}
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: { opacity: 1, scale: 1 },
              }}
              transition={{ duration: 0.5 }}
            >
              <BotCard
                bot={bot}
                onEdit={() => (window.location.href = `/edit/${bot.name}`)}
                onDelete={() => handleDeleteButtonClick(bot)}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
