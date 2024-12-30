import { mkdir, writeTextFile } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';

import { AppPath } from '@/Services/File Manager/Paths/AppPath';

export async function create_bot(token: string, name: string, runtime: string) {
  const appDirectory = await AppPath();

  console.log(runtime);

  if (runtime === 'Deno') {
    // Existing Deno implementation remains the same
    const botsPath = await join(appDirectory, 'bots', name);
    const botTSPath = await join(botsPath, 'bot.ts');
    const intentsPath = await join(botsPath, 'intents.ts');
    const envPath = await join(botsPath, '.env');
    const denoPath = await join(botsPath, 'deno.json');
    const pluginsPath = await join(botsPath, 'plugins');

    try {
      await mkdir(botsPath);

      const denoContents = JSON.stringify({
        tasks: {
          start:
            'deno run --allow-net --allow-read --allow-env --env=.env bot.ts',
        },
      });
      await writeTextFile(denoPath, denoContents);

      const envContents = `DISCORD_TOKEN="${token}"`;
      await writeTextFile(envPath, envContents);

      const botFileContents = `import { Bot } from "jsr:@blitz-bots/bot";

      import { intentsArray } from "./intents.ts";
  
      const token = Deno.env.get("DISCORD_TOKEN");
      
      if (!token) {
        console.error("DISCORD_TOKEN is not defined in the environment variables.");
        Deno.exit(1);
      }
      
      const bot = new Bot({ token: token, intents: intentsArray });
      
      try {
        await bot.start();
      } catch (error) {
        console.error("Failed to start the bot:", error);
      }`;

      await writeTextFile(botTSPath, botFileContents);

      const intentsFileContent = `import { IntentsBitField } from "npm:discord.js";
      export const intentsArray = [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
      ]`;

      await writeTextFile(intentsPath, intentsFileContent);

      await mkdir(pluginsPath);

      return true;
    } catch (error) {
      return false;
    }
  } else if (runtime === 'Node.js') {
    const botsPath = await join(appDirectory, 'bots', name);
    const botTSPath = await join(botsPath, 'bot.ts');
    const intentsPath = await join(botsPath, 'intents.ts');
    const envPath = await join(botsPath, '.env');
    const packagePath = await join(botsPath, 'package.json');
    const tsconfigPath = await join(botsPath, 'tsconfig.json');
    const pluginsPath = await join(botsPath, 'plugins');

    try {
      // Create base directory and plugins directory
      await mkdir(botsPath);
      await mkdir(pluginsPath);

      // Create package.json
      const packageJson = {
        name: name,
        version: '1.0.0',
        main: 'bot.js',
        scripts: {
          build: 'tsc',
          start: 'ts-node bot.ts',
          dev: 'nodemon --exec ts-node bot.ts',
        },
        dependencies: {
          '@blitz-botss/bot': 'latest',
          'discord.js': '^14.0.0',
          dotenv: '^16.0.0',
        },
        devDependencies: {
          '@types/node': '^20.0.0',
          typescript: '^5.0.0',
          'ts-node': '^10.0.0',
          nodemon: '^3.0.0',
        },
      };
      await writeTextFile(packagePath, JSON.stringify(packageJson, null, 2));

      // Create tsconfig.json
      const tsconfigJson = {
        compilerOptions: {
          target: 'ES2020',
          module: 'commonjs',
          outDir: './',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
        },
        include: ['*.ts'],
        exclude: ['node_modules'],
      };
      await writeTextFile(tsconfigPath, JSON.stringify(tsconfigJson, null, 2));

      // Create .env
      const envContents = `DISCORD_TOKEN="${token}"`;
      await writeTextFile(envPath, envContents);

      // Create bot.ts
      const botFileContents = `import { Bot } from "@blitz-botss/bot";
import { config } from 'dotenv';
import { intentsArray } from "./intents";

config();

const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.error("DISCORD_TOKEN is not defined in the environment variables.");
  process.exit(1);
}

const bot = new Bot({ token: token, intents: intentsArray });

try {
  bot.start();
} catch (error) {
  console.error("Failed to start the bot:", error);
}`;
      await writeTextFile(botTSPath, botFileContents);

      // Create intents.ts
      const intentsFileContent = `import { IntentsBitField } from "discord.js";

export const intentsArray = [
  IntentsBitField.Flags.Guilds,
  IntentsBitField.Flags.GuildMessages,
  IntentsBitField.Flags.MessageContent
];`;
      await writeTextFile(intentsPath, intentsFileContent);

      // Create .gitignore
      const gitignoreContent = `node_modules/
*.js
.env
`;
      await writeTextFile(await join(botsPath, '.gitignore'), gitignoreContent);

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
