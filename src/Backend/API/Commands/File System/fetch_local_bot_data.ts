// Packages
import { exists, readDir, readTextFile } from "@tauri-apps/plugin-fs";
import { appLocalDataDir, join } from "@tauri-apps/api/path";
import * as yaml from "js-yaml";

// Functions

// Types
import { LocalBotData } from "../../../Types/LocalBotData";
import {
  InstalledPlugin,
  InstalledPluginMetadata,
} from "../../../Types/InstalledPlugin";

export async function fetch_local_bot_data(name: string) {
  const appsDirectory = await appLocalDataDir();
  const botFolderPath = await join(appsDirectory, "bots", name);

  const botFolderExists = await exists(botFolderPath);
  if (!botFolderExists) return false;

  var bot_data: LocalBotData = {};

  // Fetch Token From .env

  const envFileContent = await readTextFile(await join(botFolderPath, ".env"));
  const TokenRegex = /"([^"]*)"/;
  const envSplit = envFileContent.match(TokenRegex);
  if (envSplit) {
    bot_data.token = envSplit[1];
  } else return false;

  // Fetch Intents From intents.ts

  const intentsFileContent = await readTextFile(
    await join(botFolderPath, "intents.ts"),
  );
  const IntentsRegex = /\[([^\]]+)\]/;
  const IntentsSplit = intentsFileContent.match(IntentsRegex);
  if (IntentsSplit) {
    const IntentsArray = IntentsSplit[1].split(",");
    const cleanedIntentsArray = IntentsArray.map((item) => {
      return item.replace("IntentsBitField.Flags.", "").trim();
    });

    bot_data.intents = cleanedIntentsArray;
  } else {
    bot_data.intents = [];
  }

  // Fetch All Plugins
  const installed_plugins = await readDir(await join(botFolderPath, "plugins"));

  var bot_plugins: InstalledPlugin[] = [];

  installed_plugins.forEach(async (plugin) => {
    if (plugin.isDirectory) {
      var plugin_data: InstalledPlugin = {
        path: await join(botFolderPath, "plugins", plugin.name),
        metadata: {},
      };

      if (!plugin_data.metadata) {
        plugin_data.metadata = {};
      }

      // Fetch Local Plugin Config
      const plugin_config_exists = await exists(
        await join(botFolderPath, "plugins", plugin.name, "blitz.config.yaml"),
      );
      if (plugin_config_exists) {
        const plugin_config = await readTextFile(
          await join(
            botFolderPath,
            "plugins",
            plugin.name,
            "blitz.config.yaml",
          ),
        );

        const parsedConfig = yaml.load(
          plugin_config,
        ) as InstalledPluginMetadata;

        plugin_data.metadata.name = parsedConfig.name;
        plugin_data.metadata.description = parsedConfig.description;
        plugin_data.metadata.version = parsedConfig.version;
        plugin_data.metadata.config = parsedConfig.config;

        bot_plugins.push(plugin_data);
      }
    }
  });

  bot_data.installed_plugins = bot_plugins;

  return bot_data;
}
