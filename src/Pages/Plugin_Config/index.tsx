// Packages
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

// Components
import { PluginBreadcrum } from './Components/BreadCrum';
import PluginInfo from './Components/PluginInfo';
import { Button } from '@/Components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { PluginConfigValues } from './Components/ConfigValues';

const Plugin_Config = () => {
  const { name = '', bot = '' } = useParams<{ name: string; bot: string }>();
  const navigate = useNavigate();

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

      <PluginBreadcrum name={name} bot={bot} />

      <PluginInfo bot={bot} name={name} />

      <Tabs defaultValue="config" className="mt-[50px] pb-[30px]">
        <TabsList>
          <TabsTrigger value="config">Config Values</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>

        {/* Config Values */}
        <TabsContent value="config">
          <PluginConfigValues name={name} bot={bot} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Plugin_Config;
