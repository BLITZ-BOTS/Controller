// Packages
import { remove } from "@tauri-apps/plugin-fs";

// Types
import { Bot } from "../../../Types/Responses/Bot";

export async function delete_bot(bot: Bot) {
  try {
    // Delete the bots directory
    await remove(bot.locationPath, { recursive: true });
    return true;
  } catch (error) {
    // Log the error
    console.log(error);
    return false;
  }
}
