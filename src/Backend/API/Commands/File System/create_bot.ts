// Packages
import { mkdir, writeTextFile } from '@tauri-apps/plugin-fs';
import { appLocalDataDir, join } from '@tauri-apps/api/path';

// Types

export async function create_bot(token: string, name: string) {
  const appDirectory = await appLocalDataDir();

  // Define Project Paths
  const botsPath = await join(appDirectory, 'bots', name);
  const botTSPath = await join(botsPath, 'bot.ts');
  const intentsPath = await join(botsPath, 'intents.ts');
  const envPath = await join(botsPath, '.env');
  const denoPath = await join(botsPath, 'deno.json');
  const pluginsPath = await join(botsPath, 'plugins');

  try {
    // Create Bots Base Folder
    await mkdir(botsPath);

    // Create deno.json
    const denoContents = JSON.stringify({
      tasks: {
        start:
          'deno run --allow-net --allow-read --allow-env --env=.env bot.ts',
      },
    });
    await writeTextFile(denoPath, denoContents);

    // Create .env
    const envContents = `DISCORD_TOKEN="${token}"`;
    await writeTextFile(envPath, envContents);

    // Create Bot.ts
    const botFileContents = `import { Bot } from "jsr:@blitz-bots/bot";

    import { intentsArray } from "./intents.ts";

    const token = Deno.env.get("DISCORD_TOKEN");
    
    if (!token) {
      console.error("DISCORD_TOKEN is not defined in the environment variables.");
      Deno.exit(1);
    }
    
    const bot = new Bot({ token: token, intents: intentsArray, pluginsDir: ""});
    
    try {
      await bot.start();
    } catch (error) {
      console.error("Failed to start the bot:", error);
    }`;

    await writeTextFile(botTSPath, botFileContents);

    // Create Intents.ts
    const intentsFileContent = `import { IntentsBitField } from "npm:discord.js";
    export const intentsArray = [
      IntentsBitField.Flags.Guilds,
      IntentsBitField.Flags.GuildMessages,
      IntentsBitField.Flags.MessageContent
    ]`;

    await writeTextFile(intentsPath, intentsFileContent);

    // Create Plugins Dir
    await mkdir(pluginsPath);

    return true;
  } catch (error) {
    return false;
  }
}
