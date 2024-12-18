// Packages
import React, { useState } from 'react';
import { X } from 'lucide-react';

// Backend Functions
import { create_bot } from '../../Backend/API/Commands/File System/create_bot';

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

  const handleCreate = async () => {
    var create_try = false;
    try {
      const create_attempt = await create_bot(token, name);
      create_try = create_attempt;
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
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          <label htmlFor="bot-name" className="block text-sm font-medium mb-2">
            Bot Name
          </label>
          <input
            id="bot-name"
            type="text"
            value={name}
            autoComplete="off"
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#FF30A0]"
            placeholder="Enter bot name"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="bot-token" className="block text-sm font-medium mb-2">
            Token
          </label>
          <input
            id="bot-token"
            type="text"
            value={token}
            autoComplete="off"
            onChange={(e) => setToken(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#FF30A0]"
            placeholder="Enter bot token"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#DD2832] to-[#FF30A0] text-white hover:opacity-90"
          >
            Create Bot
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateBotModal;
