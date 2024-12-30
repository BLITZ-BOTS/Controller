// Packages
import { AppPath } from '@/Services/File Manager/Paths/AppPath';

// Functions
import { join } from '@tauri-apps/api/path';

export async function BotPath() {
  const appDirectory = await AppPath();
  return await join(appDirectory, 'bots');
}

export async function FindBotPath(name: string) {
  const botsPath = await BotPath();
  return await join(botsPath, name);
}
