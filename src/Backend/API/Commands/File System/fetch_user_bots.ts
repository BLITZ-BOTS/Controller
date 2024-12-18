// Packages
import { BaseDirectory, readDir } from "@tauri-apps/plugin-fs";
import { appLocalDataDir, join } from "@tauri-apps/api/path";

// Functions
import { create_bots_directory } from "./create_bots_directory";

// Types
import { Bot } from "../../../Types/Responses/Bot.ts";

export async function fetch_user_bots() {
  try {
    // Read the directory entries in the "bots" folder
    const entries = await readDir("bots", {
      baseDir: BaseDirectory.AppLocalData,
    });
    const appsDirectory = await appLocalDataDir();

    // Initialize the bots array with the correct type
    const bots: Bot[] = [];

    for (const dir of entries) {
      if (dir.isDirectory && dir.name) {
        const locationPath = await join(appsDirectory, "bots", dir.name);
        bots.push({
          name: dir.name,
          locationPath,
        });
      }
    }

    return bots;
  } catch (error) {
    console.error("Error fetching user bots:", error);

    // Attempt to create the "bots" directory and return an empty array
    try {
      await create_bots_directory();
      return [];
    } catch (createError) {
      console.error("Error creating bots directory:", createError);
      throw createError;
    }
  }
}
