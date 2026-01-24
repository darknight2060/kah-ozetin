import path from 'path';
import { promises as fs } from 'fs';

/**
 * Load and parse JSON data from public folder
 */
async function loadJsonData(filename) {
  try {
    const filePath = path.join(process.cwd(), 'public', filename);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Silently return null instead of logging errors for missing optional files
    return null;
  }
}

/**
 * Check if a user is deleted
 */
function isDeletedUser(username) {
  return username === 'Deleted User' || username === 'deleted';
}

/**
 * Filter out deleted users from a user object
 */
function filterDeletedUsers(users) {
  if (!users) return {};
  
  const filtered = {};
  for (const [id, user] of Object.entries(users)) {
    if (!isDeletedUser(user.username)) {
      filtered[id] = user;
    }
  }
  return filtered;
}

/**
 * Get user summary - combines all data sources for a specific user
 */
export async function getUserSummary(userId) {
  const [users, stats, social, leaderboardContext, searchUsers] = await Promise.all([
    loadJsonData('users.json'),
    loadJsonData('user_stats.json'),
    loadJsonData('user_social.json'),
    getUserRankingsWithContext(userId, 5),
    loadJsonData('search_users.json'),
  ]);

  if (!users || !users[userId]) {
    return null;
  }

  const userInfo = users[userId];
  
  // Check if user is deleted
  if (isDeletedUser(userInfo.username)) {
    return null;
  }
  
  // Get displayName from search_users.json
  let displayName = userInfo.username;
  if (Array.isArray(searchUsers)) {
    const searchUser = searchUsers.find(u => u.id === userId);
    if (searchUser && searchUser.displayName) {
      displayName = searchUser.displayName;
    }
  }
  
  const userStats = stats?.[userId] || {};
  const userSocial = social?.[userId] || {};

  // Calculate rankings for this user
  const rankings_data = calculateRankings(userId, stats, users);

  return {
    userId: userId,
    user: { ...userInfo, displayName },
    stats: userStats,
    social: userSocial,
    rankings: rankings_data,
    leaderboard: leaderboardContext,
  };
}

/**
 * Calculate user rankings and percentiles
 */
function calculateRankings(userId, statsData, usersData) {
  if (!statsData || !statsData[userId]) {
    return {};
  }

  const userStats = statsData[userId];
  // Filter out deleted users
  const allUserIds = Object.keys(statsData).filter(id => {
    const user = usersData?.[id];
    return user && !isDeletedUser(user.username);
  });
  const totalUsers = allUserIds.length;

  // Calculate message count rank
  const messageCountRank = allUserIds
    .filter(id => statsData[id].total > userStats.total)
    .length + 1;

  // Calculate active days rank
  const activeDaysRank = allUserIds
    .filter(id => statsData[id].active_days > userStats.active_days)
    .length + 1;

  // Calculate average message length
  const avgLength = userStats.len_sum && userStats.total 
    ? (userStats.len_sum / userStats.total).toFixed(1)
    : 0;

  const avgLengthRank = allUserIds
    .filter(id => {
      const otherStats = statsData[id];
      const otherAvg = otherStats.len_sum && otherStats.total
        ? otherStats.len_sum / otherStats.total
        : 0;
      return otherAvg > avgLength;
    })
    .length + 1;

  return {
    messageCountRank,
    messageCountPercentile: Math.round(((totalUsers - messageCountRank + 1) / totalUsers) * 100),
    activeDaysRank,
    activeDaysPercentile: Math.round(((totalUsers - activeDaysRank + 1) / totalUsers) * 100),
    avgLengthRank,
    avgLengthPercentile: Math.round(((totalUsers - avgLengthRank + 1) / totalUsers) * 100),
  };
}

/**
 * Get all rankings data
 */
export async function getAllRankings() {
  const [stats, rankings, users] = await Promise.all([
    loadJsonData('user_stats.json'),
    loadJsonData('rankings.json'),
    loadJsonData('users.json'),
  ]);

  if (!stats || !users) return null;

  // Filter out deleted users
  const filteredUserIds = Object.keys(stats).filter(id => {
    const user = users[id];
    return user && !isDeletedUser(user.username);
  });
  
  // Build message count ranking
  const messageCountRanking = filteredUserIds
    .map(id => ({
      user_id: id,
      value: stats[id].total || 0,
    }))
    .sort((a, b) => b.value - a.value);

  // Build active days ranking
  const activeDaysRanking = filteredUserIds
    .map(id => ({
      user_id: id,
      value: stats[id].active_days || 0,
    }))
    .sort((a, b) => b.value - a.value);

  // Build average message length ranking
  const avgLengthRanking = filteredUserIds
    .map(id => ({
      user_id: id,
      value: stats[id].total > 0 ? Number((stats[id].len_sum / stats[id].total).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.value - a.value);

  return {
    message_count: messageCountRanking,
    active_days: activeDaysRanking,
    avg_message_length: avgLengthRanking,
  };
}

/**
 * Get users data for leaderboard
 */
export async function getUsersForLeaderboard() {
  const users = await loadJsonData('users.json');
  return filterDeletedUsers(users) || {};
}

/**
 * Get user rankings with surrounding context (rank ±2)
 */
export async function getUserRankingsWithContext(userId, limit = 5) {
  const [stats, users, searchUsers] = await Promise.all([
    loadJsonData('user_stats.json'),
    loadJsonData('users.json'),
    loadJsonData('search_users.json'),
  ]);

  if (!stats || !users) return null;

  // Create a map of displayNames
  const displayNameMap = {};
  if (Array.isArray(searchUsers)) {
    searchUsers.forEach(u => {
      displayNameMap[u.id] = u.displayName;
    });
  }

  // Filter out deleted users
  const filteredUserIds = Object.keys(stats).filter(id => {
    const user = users[id];
    return user && !isDeletedUser(user.username);
  });

  // Build message count ranking
  const messageCountRanking = filteredUserIds
    .map(id => ({
      user_id: id,
      value: stats[id].total || 0,
    }))
    .sort((a, b) => b.value - a.value);

  // Build active days ranking
  const activeDaysRanking = filteredUserIds
    .map(id => ({
      user_id: id,
      value: stats[id].active_days || 0,
    }))
    .sort((a, b) => b.value - a.value);

  // Build average message length ranking
  const avgLengthRanking = filteredUserIds
    .map(id => ({
      user_id: id,
      value: stats[id].total > 0 ? Number((stats[id].len_sum / stats[id].total).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.value - a.value);

  // Find user's position in each ranking
  const messageCountIndex = messageCountRanking.findIndex(item => item.user_id === userId);
  const activeDaysIndex = activeDaysRanking.findIndex(item => item.user_id === userId);
  const avgLengthIndex = avgLengthRanking.findIndex(item => item.user_id === userId);

  // Get context (surrounding entries)
  const getContext = (ranking, userIndex, count = 5) => {
    if (userIndex === -1) return [];
    const start = Math.max(0, userIndex - Math.floor(count / 2));
    const end = Math.min(ranking.length, start + count);
    return ranking.slice(start, end).map((item, idx) => ({
      ...item,
      rank: start + idx + 1,
      isUser: item.user_id === userId,
      user: {
        ...users[item.user_id],
        displayName: displayNameMap[item.user_id] || users[item.user_id].username,
      },
    }));
  };

  return {
    message_count: {
      userRank: messageCountIndex + 1,
      userValue: messageCountIndex !== -1 ? messageCountRanking[messageCountIndex].value : 0,
      context: getContext(messageCountRanking, messageCountIndex, limit),
    },
    active_days: {
      userRank: activeDaysIndex + 1,
      userValue: activeDaysIndex !== -1 ? activeDaysRanking[activeDaysIndex].value : 0,
      context: getContext(activeDaysRanking, activeDaysIndex, limit),
    },
    avg_message_length: {
      userRank: avgLengthIndex + 1,
      userValue: avgLengthIndex !== -1 ? avgLengthRanking[avgLengthIndex].value : 0,
      context: getContext(avgLengthRanking, avgLengthIndex, limit),
    },
  };
}
