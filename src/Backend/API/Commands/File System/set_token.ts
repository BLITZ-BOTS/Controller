// Packages
import { writeTextFile } from '@tauri-apps/plugin-fs';
import { join, appLocalDataDir } from '@tauri-apps/api/path';

export async function set_token(name: string, token: string) {
  try {
    const appDirectory = await appLocalDataDir();
    const envFile = await join(appDirectory, 'bots', name, '.env');

    await writeTextFile(envFile, `DISCORD_TOKEN="${token}"`);

    return true;
  } catch (error) {
    return false;
  }
}
