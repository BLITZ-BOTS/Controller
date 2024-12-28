export interface PluginSuggestion {
  name: string;
  description: string;
  versions: string[];
  author_id: string;
  author: string | null;
  tags: string[];
  homepage: string | null;
  repoUrl: string;
}
