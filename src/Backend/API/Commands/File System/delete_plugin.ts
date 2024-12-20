// Packages
import { remove } from '@tauri-apps/plugin-fs';
import { join, appLocalDataDir } from '@tauri-apps/api/path';

export async function delete_plugin(name: string, plugin: string) {
  try {
    const pluginFilePath = await join(
      await appLocalDataDir(),
      'bots',
      name,
      'plugins',
      plugin
    );

    await remove(pluginFilePath, { recursive: true });

    return true;
  } catch (error) {
    console.error('Error toggling intent:', error);
    return false;
  }
}
