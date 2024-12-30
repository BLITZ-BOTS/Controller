// Packages
import { FindBotPath } from '@/Services/File Manager/Paths/Bots';

// Functions
import { join } from '@tauri-apps/api/path';

export async function PluginsPath(botName: string) {
  const botDirectory = await FindBotPath(botName);
  return await join(botDirectory, 'plugins');
}

export async function FindPluginPath(botName: string, pluginName: string) {
  const botsPath = await PluginsPath(botName);
  return await join(botsPath, pluginName);
}
