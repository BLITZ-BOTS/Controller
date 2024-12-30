// Packages
import { remove } from '@tauri-apps/plugin-fs';

import { FindPluginPath } from '@/Services/File Manager/Paths/Plugins';

export async function delete_plugin(name: string, plugin: string) {
  try {
    const pluginFilePath = await FindPluginPath(name, plugin);
    await remove(pluginFilePath, { recursive: true });

    return true;
  } catch (error) {
    console.error('Error toggling intent:', error);
    return false;
  }
}
