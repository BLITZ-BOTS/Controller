// Packages
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

// Components
import { Button } from '@/Components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { BotInfo } from './Components/BotInfo';
import { TokenInput } from './Components/TokenInput';
import { BotIntents } from './Components/BotIntents';
import { InstalledPlugins } from './Components/InstalledPlugins';
import { BotPath } from './Components/BotPath';
import { BotBreadcrum } from './Components/BreadCrum';
import { useToast } from '@/hooks/use-toast';

// Backend Functions
import { fetch_local_bot_data } from '@/Backend/API/Commands/File System/fetch_local_bot_data';

// Types
import { LocalBotData } from '@/Backend/Types/LocalBotData';

// Intent Mapping
import { linkMap } from '@/Backend/Types/Intents';

const Edit = () => {
  // Hooks
  const { toast } = useToast();
  const { name = '' } = useParams<{ name: string }>();
  const navigate = useNavigate();

  // States
  const [botData, setBotData] = useState<LocalBotData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [intents, setIntents] = useState<Record<string, boolean>>({});
  const [token, setToken] = useState<string>('');

  // Fetch Local Bot Data
  const fetchBotData = async () => {
    try {
      const fetchedData = await fetch_local_bot_data(name);
      setBotData((prevData) => {
        if (JSON.stringify(prevData) !== JSON.stringify(fetchedData)) {
          if (fetchedData) {
            setToken(fetchedData?.token as string);
            return fetchedData;
          }
        }
        setToken(prevData?.token as string);
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
      toast({
        title: 'Error',
        description: 'Unable to fetch bot data from discord',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load Data On Page Load
  useEffect(() => {
    fetchBotData();
  }, []);

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

      <BotBreadcrum name={name} />

      {/* Bot Info */}
      <BotInfo token={botData?.token as string} />

      {/* Token Input */}
      <TokenInput token={token} name={name} onTokenChange={fetchBotData} />

      {/* Settings Tabs */}
      <Tabs defaultValue="intents" className="mt-[50px] pb-[30px]">
        <TabsList>
          <TabsTrigger value="intents">Bot Intents</TabsTrigger>
          <TabsTrigger value="installed-plugins">Installed Plugins</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>

        {/* Intents List */}
        <TabsContent value="intents">
          <BotIntents passedIntents={intents} name={name} />
        </TabsContent>

        {/* Installed Plugins */}
        <TabsContent value="installed-plugins">
          <InstalledPlugins
            name={name}
            plugins={botData?.installed_plugins as []}
            onChange={fetchBotData}
          />
        </TabsContent>

        {/* Other Tab */}
        <TabsContent value="other">
          <BotPath name={name} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Edit;
