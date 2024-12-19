// Packages
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Backend Functions
import { fetch_user_bots } from '@/Backend/API/Commands/File System/fetch_user_bots';

// Types
import { Bot } from '@/Backend/Types/Responses/Bot';

// Components
import BotCard from './Components/BotCard';
import { useNotification } from '@/Backend/Hooks/NotificationContext';
import { useModal } from '@/Backend/Hooks/Modal/ModalContext';
import { Button } from '@/Components/ui/button';

const Home = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  const { addNotification } = useNotification();
  const { showModal } = useModal();

  // Load Bots Function
  const loadBots = async () => {
    try {
      const returnedBots = await fetch_user_bots();
      setBots(returnedBots);
    } catch (error) {
      console.error('Error fetching bots:', error);
      addNotification('Error Fetching Bots', 'error');
    }
  };

  // Load Bots On Initial Load
  useEffect(() => {
    loadBots();
  }, []);

  // Button Handlers

  // Delete Bot
  const deleteBotBTNHandler = async (bot: Bot) => {
    showModal('delete_bot', { bot }, async (data) => {
      if (data?.error) {
        addNotification(`Error Deleting ${bot.name}`, 'error');
      } else {
        addNotification(`Deleted ${bot.name}`, 'success');
        loadBots();
      }
    });
  };

  // Create Bot
  const createBotBTNHandler = async () => {
    showModal('create_bot', {}, (data) => {
      if (data?.error) {
        addNotification('Error Creating Bot', 'error');
      } else {
        addNotification('Created Bot', 'success');
        loadBots();
      }
    });
  };

  // Edit Bot
  const editBotBTNHandler = (bot: Bot) => {
    window.location.href = `/bots/edit/${bot.name}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <h1 className="text-3xl font-bold">Your Bots</h1>
        <div className="flex space-x-4">
          <Button onClick={() => createBotBTNHandler()}>Create New Bot</Button>
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
            key={bot.name}
            variants={{
              hidden: { opacity: 0, scale: 0.8 },
              visible: { opacity: 1, scale: 1 },
            }}
            transition={{ duration: 0.5 }}
          >
            <BotCard
              bot={bot}
              onEdit={() => editBotBTNHandler(bot)}
              onDelete={() => deleteBotBTNHandler(bot)}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Home;
