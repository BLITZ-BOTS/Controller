// Packages
import { appLocalDataDir } from '@tauri-apps/api/path';

export async function AppPath() {
  return await appLocalDataDir();
}
