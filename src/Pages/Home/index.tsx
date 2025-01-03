// Packages
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Backend Functions
import { fetch_user_bots } from '@/Services/Bot Manager/fetch';

// Types
import { Bot } from '@/Types/Responses/Bot';

// Components
import BotCard from './Components/BotCard';
import { useModal } from '@/hooks/Modal/ModalContext';
import { Button } from '@/Components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Home = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  const { toast } = useToast();
  const { showModal } = useModal();

  // Load Bots Function
  const loadBots = async () => {
    try {
      const returnedBots = await fetch_user_bots();
      setBots(returnedBots);
    } catch (error) {
      console.error('Error fetching bots:', error);
      toast({
        title: 'Error',
        description: `Unable to fetch bots`,
        variant: 'destructive',
      });
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
        toast({
          title: 'Error',
          description: `Unable to delete ${bot.name}`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: `Deleted ${bot.name}`,
          variant: 'success',
        });
        loadBots();
      }
    });
  };

  // Create Bot
  const createBotBTNHandler = async () => {
    showModal('create_bot', {}, (data) => {
      if (data?.error) {
        toast({
          title: 'Error',
          description: `Unable to create bot`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: `Created Bot`,
          variant: 'success',
        });
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
