export const fetchDiscordBotInfo = async (botToken: string) => {
  const url = 'https://discord.com/api/v10/users/@me';

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bot ${botToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Error fetching bot data: ${response.status} - ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in fetchBotData:', error);
    throw error;
  }
};
