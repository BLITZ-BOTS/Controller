// Packages
import React from 'react';
import { X } from 'lucide-react';

// Types
import { Bot } from '@/Backend/Types/Responses/Bot';

// Backend Functions
import { delete_bot } from '@/Backend/API/Commands/File System/delete_bot';

// Components
import { Button } from '@/Components/ui/button';

interface DeleteBotModalProps {
  bot: Bot;
  onClose: () => void;
  onCompleted: (data: { error: boolean }) => void;
}

const DeleteBotModal: React.FC<DeleteBotModalProps> = ({
  bot,
  onClose,
  onCompleted,
}) => {
  const handleDelete = async () => {
    var delete_try = false;
    try {
      const delete_attempt = await delete_bot(bot);
      delete_try = delete_attempt;
    } catch (error) {
      console.log(error);
      delete_try = false;
    }
    onCompleted({ error: !delete_try });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black border border-white/10 rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold">Delete Bot</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <p className="text-gray-300 mb-6">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-white">{bot.name}</span>? This
          action cannot be undone.
        </p>

        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete Bot
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteBotModal;
