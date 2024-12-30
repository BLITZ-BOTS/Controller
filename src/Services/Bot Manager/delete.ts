// Packages
import { remove } from '@tauri-apps/plugin-fs';

// Types
import { Bot } from '@/Types/Responses/Bot';

export async function delete_bot(bot: Bot) {
  try {
    await remove(bot.locationPath, { recursive: true });
    return true;
  } catch (error) {
    return false;
  }
}
