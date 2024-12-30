// Packages
import { BaseDirectory, mkdir } from '@tauri-apps/plugin-fs';

export async function create_bots_directory() {
  try {
    await mkdir('bots', { baseDir: BaseDirectory.AppLocalData });
  } catch (error) {
    console.log(error);
  }
}
