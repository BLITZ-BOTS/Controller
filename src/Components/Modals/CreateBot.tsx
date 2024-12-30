// Packages
import { useState } from 'react';
import { X } from 'lucide-react';

// Backend Functions
import { create_bot } from '@/Services/Bot Manager/create';

// Components
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';

interface CreateBotModalProps {
  onClose: () => void;
  onCompleted: (data: { error: boolean }) => void;
}

const CreateBotModal: React.FC<CreateBotModalProps> = ({
  onClose,
  onCompleted,
}) => {
  const [name, setName] = useState('');
  const [token, setToken] = useState('');
  const [runtime, setRuntime] = useState('Node.js');

  const handleCreate = async () => {
    var create_try: boolean = false;
    try {
      const create_attempt = await create_bot(token, name, runtime);
      create_try = create_attempt as boolean;
    } catch (error) {
      create_try = false;
    }
    onCompleted({ error: !create_try });
  };

  return (
    <div className="fixed mt-[30px] inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black border border-white/10 rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold">Create Bot</h3>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="mb-4">
          <label htmlFor="bot-name" className="block text-sm font-medium mb-2">
            Bot Name
          </label>
          <Input
            id="bot-name"
            type="text"
            value={name}
            autoComplete="off"
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter bot name"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="bot-token" className="block text-sm font-medium mb-2">
            Token
          </label>
          <Input
            id="bot-token"
            type="text"
            value={token}
            autoComplete="off"
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter bot token"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="runtime" className="block text-sm font-medium mb-2">
            Runtime
          </label>
          <Select
            onValueChange={(value) => setRuntime(value)}
            defaultValue="Node.js"
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select runtime" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Node.js">Node.js</SelectItem>
              <SelectItem value="Deno">Deno</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="default" onClick={handleCreate}>
            Create Bot
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateBotModal;
