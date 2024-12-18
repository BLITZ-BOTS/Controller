// Packages
import { BaseDirectory, mkdir } from "@tauri-apps/plugin-fs";

export async function create_bots_directory() {
  try {
    // Create the bots directory
    await mkdir("bots", { baseDir: BaseDirectory.AppLocalData });
  } catch (error) {
    // Log the error
    console.log(error);
  }
}
