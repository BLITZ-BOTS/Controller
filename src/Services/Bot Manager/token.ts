// Packages
import { writeTextFile } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';

import { FindBotPath } from '@/Services/File Manager/Paths/Bots';

export async function set_token(name: string, token: string) {
  try {
    const envFile = await join(await FindBotPath(name), '.env');

    await writeTextFile(envFile, `DISCORD_TOKEN="${token}"`);

    return true;
  } catch (error) {
    return false;
  }
}
