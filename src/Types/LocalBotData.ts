import { InstalledPlugin } from './InstalledPlugin';
export interface LocalBotData {
  token?: string;
  intents?: string[];
  installed_plugins?: InstalledPlugin[];
}
