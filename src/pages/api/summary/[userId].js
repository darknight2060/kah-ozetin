import path from 'path';
import { promises as fs } from 'fs';

async function fetchDiscordUserProfile(userId) {
  try {
    const response = await fetch(`https://discord.com/api/v10/users/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Discord API error: ${response.status}`);
      return null;
    }

    const discordUser = await response.json();
    console.log('Fetched Discord user:', discordUser);


    return {
      displayName: discordUser.global_name || discordUser.username,
      username: discordUser.username,
      nickname: null, // Requires guild-specific data
      avatar: discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=1024` : null,
      id: discordUser.id,
      discriminator: discordUser.discriminator,
      publicFlags: discordUser.public_flags,
      accentColor: discordUser.accent_color,
      banner: discordUser.banner
        ? `https://cdn.discordapp.com/banners/${discordUser.id}/${discordUser.banner}.png?size=1024`
        : null,
    };
  } catch (error) {
    console.error('Failed to fetch Discord profile:', error);
    return null;
  }
}

export default async function handler(req, res) {
  const { userId } = req.query;

  // Path to the mock data file
  const filePath = path.join(process.cwd(), 'public', 'users.json');

  try {
    // Read and parse the mock data
    const data = await fs.readFile(filePath, 'utf-8');
    const users = JSON.parse(data);

    // Find the user data by userId
    const userData = users[userId];

    if (userData) {
      // Fetch Discord profile data
      const discordProfile = await fetchDiscordUserProfile(userId);

      // Merge Discord profile data with local statistics
      const enrichedUserData = {
        ...userData,
        discord: discordProfile,
      };

      res.status(200).json(enrichedUserData);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to load user data" });
  }
}
