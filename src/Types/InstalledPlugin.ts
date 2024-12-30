export interface InstalledPlugin {
  path?: string;
  metadata?: InstalledPluginMetadata;
}

export interface InstalledPluginMetadata {
  name?: string;
  description?: string;
  version?: string;
  config?: { [key: string]: any };
}
