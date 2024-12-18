// Packages
import { Pencil, Trash2 } from "lucide-react";

// Types
import { Bot } from "../../../Backend/Types/Responses/Bot";

interface BotCardProps {
  bot: Bot;
  onEdit: (name: string) => void;
  onDelete: (bot: Bot) => void;
}

export default function BotCard({ bot, onEdit, onDelete }: BotCardProps) {
  return (
    <div className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-[#FF30A0]/50 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-r from-[#FF30A0]/0 to-[#FF30A0]/0" />

      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div>
              <h3 className="text-lg font-semibold">{bot.name}</h3>
              <div className="flex flex-col space-y-1 mt-2">
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <span>{bot.locationPath}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={() => onEdit(bot.name)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Edit Bot"
          >
            <Pencil className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
          </button>
          <button
            onClick={() => onDelete(bot)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Delete Bot"
          >
            <Trash2 className="h-5 w-5 text-gray-400 hover:text-red-500 transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
}
