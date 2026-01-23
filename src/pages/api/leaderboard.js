import { getAllRankings, getUsersForLeaderboard } from '@/lib/dataLoader';

// Cache rankings to avoid recalculating on every request
let cachedRankings = null;
let cachedUsers = null;
let lastCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default async function handler(req, res) {
  const { type = 'message_count', page = 1, limit = 10 } = req.query;

  try {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit) || 10));

    // Check cache
    const now = Date.now();
    if (!cachedRankings || !cachedUsers || (now - lastCacheTime) > CACHE_DURATION) {
      cachedRankings = await getAllRankings();
      cachedUsers = await getUsersForLeaderboard();
      lastCacheTime = now;
    }

    const rankings = cachedRankings;
    const users = cachedUsers;

    if (!rankings || !users) {
      return res.status(500).json({ error: 'Failed to load rankings' });
    }

    // Get the requested ranking type
    const rankingData = rankings[type] || rankings.message_count;
    const totalItems = rankingData.length;

    // Calculate pagination
    const startIndex = (pageNum - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const items = rankingData.slice(startIndex, endIndex);

    // Enrich items with user data
    const enrichedItems = items.map((item, index) => ({
      ...item,
      rank: startIndex + index + 1,
      user: users[item.user_id],
    }));

    return res.status(200).json({
      items: enrichedItems,
      pagination: {
        currentPage: pageNum,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
        hasMore: endIndex < totalItems,
      },
    });
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
