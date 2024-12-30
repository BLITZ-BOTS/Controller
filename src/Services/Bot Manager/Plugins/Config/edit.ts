import { FindPluginPath } from '@/Services/File Manager/Paths/Plugins';
import { join } from '@tauri-apps/api/path';
import { exists, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import * as yaml from 'js-yaml';

export async function edit_plugin_config(
  bot: string,
  plugin: string,
  key: string,
  value: string
) {}
