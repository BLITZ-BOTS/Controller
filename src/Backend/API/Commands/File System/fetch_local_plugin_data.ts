// Packages
import { exists, readTextFile } from '@tauri-apps/plugin-fs';
import { appLocalDataDir, join } from '@tauri-apps/api/path';
import * as yaml from 'js-yaml';

interface PluginConfig {
  name: string;
  description: string;
  version: string;
  config?: Record<string, any>;
}

export async function fetch_local_plugin_config(
  bot: string,
  name: string
): Promise<PluginConfig | null> {
  try {
    // Get the apps directory and construct the path to the plugin config
    const appsDirectory = await appLocalDataDir();
    const pluginPath = await join(appsDirectory, 'bots', bot, 'plugins', name);
    const configPath = await join(pluginPath, 'blitz.config.yaml');

    // Check if the config file exists
    const configExists = await exists(configPath);
    if (!configExists) {
      return null;
    }

    // Read and parse the config file
    const configContent = await readTextFile(configPath);
    const parsedConfig = yaml.load(configContent) as PluginConfig;

    // Return the parsed config with optional config field
    return {
      name: parsedConfig.name || '',
      description: parsedConfig.description || '',
      version: parsedConfig.version || '',
      config: parsedConfig.config || {},
    };
  } catch (error) {
    console.error('Error fetching plugin config:', error);
    return null;
  }
}
