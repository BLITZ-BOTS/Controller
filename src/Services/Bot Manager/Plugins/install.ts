// Packages
import { mkdir, writeTextFile } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';

import { FindPluginPath } from '@/Services/File Manager/Paths/Plugins';

interface PluginContent {
  name: string;
  type: 'file' | 'dir';
  download_url?: string;
  url?: string;
}

export async function install_plugin(name: string, plugin: string) {
  try {
    const parts = plugin.split('@');
    const version = parts[1];
    const pluginName = parts[0];

    let url = `https://api.blitz-bots.com/plugins/get/${pluginName}`;
    if (version) {
      url = `https://api.blitz-bots.com/plugins/get/${pluginName}/${version}`;
    }

    const response = await fetch(url);

    if (!response.ok) return false;

    const data = await response.json();

    if (!data) return false;
    if (!data.data.repoUrl) return false;

    const contentsUrl = `https://api.github.com/repos/BLITZ-BOTS-REGISTRY/${pluginName.toUpperCase()}/contents?ref=${
      version || data.data.versions[0]
    }`;

    const contentsResponse = await fetch(contentsUrl);

    if (!contentsResponse.ok) return false;

    const contents: PluginContent[] = await contentsResponse.json();

    const pluginDirPath = await FindPluginPath(name, pluginName);

    await mkdir(pluginDirPath, { recursive: true });
    await download(contents, pluginDirPath);
    return true;
  } catch (error) {
    return false;
  }
}

async function download(contents: PluginContent[], path: string) {
  // Create each file for plugin
  for (const item of contents) {
    // Ignore README.md
    if (item.name === 'README.md') {
      continue;
    }

    const filePath = await join(path, item.name);

    if (item.type === 'file' && item.download_url) {
      const fileResponse = await fetch(item.download_url);
      if (!fileResponse.ok) return false;
      const fileData = await fileResponse.text();
      await writeTextFile(filePath, fileData);
    } else if (item.type === 'dir' && item.url) {
      await mkdir(filePath, { recursive: true });
      const dirContentsResponse = await fetch(item.url);
      if (!dirContentsResponse.ok) return false;

      const dirContents: PluginContent[] = await dirContentsResponse.json();
      await download(dirContents, filePath);
    }
  }
}
