// Packages
import { exists, readDir, readTextFile } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';
import * as yaml from 'js-yaml';

// Functions
import { FindBotPath, BotPath } from '@/Services/File Manager/Paths/Bots';

import { create_bots_directory } from '@/Services/File Manager/Paths/Bots/create';

// Types
import { LocalBotData } from '@/Types/LocalBotData';
import {
  InstalledPlugin,
  InstalledPluginMetadata,
} from '@/Types/InstalledPlugin';
import { Bot } from '@/Types/Responses/Bot';

export async function fetch_local_bot_data(name: string) {
  const botFolderPath = await FindBotPath(name);

  const botFolderExists = await exists(botFolderPath);
  if (!botFolderExists) return false;

  var bot_data: LocalBotData = {};

  // Fetch Token From .env

  const envFileContent = await readTextFile(await join(botFolderPath, '.env'));
  const TokenRegex = /"([^"]*)"/;
  const envSplit = envFileContent.match(TokenRegex);
  if (envSplit) {
    bot_data.token = envSplit[1];
  } else return false;

  // Fetch Intents From intents.ts

  const intentsFileContent = await readTextFile(
    await join(botFolderPath, 'intents.ts')
  );
  const IntentsRegex = /\[([^\]]+)\]/;
  const IntentsSplit = intentsFileContent.match(IntentsRegex);
  if (IntentsSplit) {
    const IntentsArray = IntentsSplit[1].split(',');
    const cleanedIntentsArray = IntentsArray.map((item) => {
      return item.replace('IntentsBitField.Flags.', '').trim();
    });

    bot_data.intents = cleanedIntentsArray;
  } else {
    bot_data.intents = [];
  }

  // Fetch All Plugins
  const installed_plugins = await readDir(await join(botFolderPath, 'plugins'));

  const bot_plugins: InstalledPlugin[] = [];

  for (const plugin of installed_plugins) {
    if (plugin.isDirectory) {
      const plugin_data: InstalledPlugin = {
        path: await join(botFolderPath, 'plugins', plugin.name),
        metadata: {},
      };

      // Check if the plugin has a config file
      const plugin_config_path = await join(
        botFolderPath,
        'plugins',
        plugin.name,
        'blitz.config.yaml'
      );
      const plugin_config_exists = await exists(plugin_config_path);

      if (plugin_config_exists) {
        const plugin_config = await readTextFile(plugin_config_path);

        // Parse the YAML config file
        const parsedConfig = yaml.load(
          plugin_config
        ) as InstalledPluginMetadata;

        plugin_data.metadata = {
          name: parsedConfig.name,
          description: parsedConfig.description,
          version: parsedConfig.version,
          config: parsedConfig.config,
        };
      }

      bot_plugins.push(plugin_data);
    }
  }

  bot_data.installed_plugins = bot_plugins;

  return bot_data;
}

export async function fetch_user_bots() {
  try {
    // Read the directory entries in the "bots" folder
    const entries = await readDir(await BotPath());

    // Initialize the bots array with the correct type
    const bots: Bot[] = [];

    for (const dir of entries) {
      if (dir.isDirectory && dir.name) {
        const locationPath = await FindBotPath(dir.name);
        bots.push({
          name: dir.name,
          locationPath,
        });
      }
    }

    return bots;
  } catch (error) {
    console.error('Error fetching user bots:', error);

    // Attempt to create the "bots" directory and return an empty array
    try {
      await create_bots_directory();
      return [];
    } catch (createError) {
      console.error('Error creating bots directory:', createError);
      throw createError;
    }
  }
}
