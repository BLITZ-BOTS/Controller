// Packages
import { create, mkdir, writeTextFile } from "@tauri-apps/plugin-fs";
import { appLocalDataDir, join } from "@tauri-apps/api/path";

// Types

export async function create_bot(token: string, name: string) {
  const appDirectory = await appLocalDataDir();

  // Define Project Paths
  const botsPath = await join(appDirectory, "bots", name);
  const botTSPath = await join(botsPath, "bot.ts");
  const envPath = await join(botsPath, ".env");
  const denoPath = await join(botsPath, "deno.json");
  const pluginsPath = await join(botsPath, "plugins");

  try {
    // Create Bots Base Folder
    await mkdir(botsPath);

    // Create deno.json
    const denoContents = JSON.stringify({
      tasks: {
        start:
          "deno run --allow-net --allow-read --allow-env --env=.env bot.ts",
      },
    });
    await writeTextFile(denoPath, denoContents);

    // Create .env
    const envContents = `DISCORD_TOKEN="${token}"`;
    await writeTextFile(envPath, envContents);

    // Create Bot.ts
    const botFileContents = `import { Bot } from "@blitz-bots/bot";

    const token = Deno.env.get("DISCORD_TOKEN");
    
    if (!token) {
      console.error("DISCORD_TOKEN is not defined in the environment variables.");
      Deno.exit(1);
    }
    
    const bot = new Bot(token);
    
    try {
      await bot.start();
    } catch (error) {
      console.error("Failed to start the bot:", error);
    }`;

    await writeTextFile(botTSPath, botFileContents);

    return true;
  } catch (error) {
    return false;
  }
}
