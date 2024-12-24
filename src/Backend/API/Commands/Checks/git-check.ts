import { Command } from '@tauri-apps/plugin-shell';

export async function checkGitInstalled() {
  const command = Command.create('git-check', ['git', 'version']);
  const output = await command.execute();
  return output;
}
