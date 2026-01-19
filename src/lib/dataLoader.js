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
    console.error(`Failed to load ${filename}:`, error);
    return null;
  }
}

/**
 * Get user summary - combines all data sources for a specific user
 */
export async function getUserSummary(userId) {
  const [users, stats, social, rankings] = await Promise.all([
    loadJsonData('users.json'),
    loadJsonData('user_stats.json'),
    loadJsonData('user_social.json'),
    loadJsonData('rankings.json'),
  ]);

  if (!users || !users[userId]) {
    return null;
  }

  const userInfo = users[userId];
  const userStats = stats?.[userId] || {};
  const userSocial = social?.[userId] || {};

  // Calculate rankings for this user
  const rankings_data = calculateRankings(userId, stats, rankings);

  return {
    user: userInfo,
    stats: userStats,
    social: userSocial,
    rankings: rankings_data,
  };
}

/**
 * Calculate user rankings and percentiles
 */
function calculateRankings(userId, statsData, rankingsData) {
  if (!statsData || !statsData[userId]) {
    return {};
  }

  const userStats = statsData[userId];
  const allUserIds = Object.keys(statsData);
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
  const [stats, rankings] = await Promise.all([
    loadJsonData('user_stats.json'),
    loadJsonData('rankings.json'),
  ]);

  if (!stats) return null;

  const userIds = Object.keys(stats);
  
  // Build message count ranking
  const messageCountRanking = userIds
    .map(id => ({
      user_id: id,
      value: stats[id].total || 0,
    }))
    .sort((a, b) => b.value - a.value);

  // Build active days ranking
  const activeDaysRanking = userIds
    .map(id => ({
      user_id: id,
      value: stats[id].active_days || 0,
    }))
    .sort((a, b) => b.value - a.value);

  // Build average message length ranking
  const avgLengthRanking = userIds
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
  return users || {};
}
