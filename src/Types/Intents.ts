export function linkIntents(
  linkMap: Record<string, string>,
  inputString: string
): string | null {
  if (inputString in linkMap) {
    return linkMap[inputString];
  }

  for (const [key, value] of Object.entries(linkMap)) {
    if (inputString === value) {
      return key;
    }
  }
  return null;
}

export const linkMap: Record<string, string> = {
  AutoModerationConfiguration: 'Auto-Moderation Configuration',
  AutoModerationExecution: 'Auto-Moderation Execution',
  DirectMessagePolls: 'Direct-Message Polls',
  DirectMessageReactions: 'Direct-Message Reactions',
  DirectMessageTyping: 'Direct-Message Typing',
  DirectMessages: 'Direct Messages',
  GuildBans: 'Guild Bans',
  GuildEmojisAndStickers: 'Guild Emojis And Stickers',
  GuildExpressions: 'Guild Expressions',
  GuildIntegrations: 'Guild Integrations',
  GuildInvites: 'Guild Invites',
  GuildMembers: 'Guild Members',
  GuildMessagePolls: 'Guild Message Polls',
  GuildMessageReactions: 'Guild Message Reactions',
  GuildMessageTyping: 'Guild Message Typing',
  GuildMessages: 'Guild Messages',
  GuildModeration: 'Guild Moderation',
  GuildPresences: 'Guild Presences',
  GuildScheduledEvents: 'Guild Scheduled Events',
  GuildVoiceStates: 'Guild Voice States',
  GuildWebhooks: 'Guild Webhooks',
  Guilds: 'Guilds',
  MessageContent: 'Message Content',
};
