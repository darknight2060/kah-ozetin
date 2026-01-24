/**
 * Format date strings
 */
export function formatDate(dateString) {
  if (!dateString) return 'Unknown';
  try {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Get most active hour as string with daylight description
 */
export function getMostActiveHourDescription(hour) {
  const h = parseInt(hour);
  if (h >= 5 && h < 12) return `${h}:00 - 🌅 Sabah`; 
  if (h >= 12 && h < 17) return `${h}:00 - ☀️ Öğleden sonra`;
  if (h >= 17 && h < 21) return `${h}:00 - 🌆 Akşam`;
  return `${h}:00 - 🌙 Gece`;
}

/**
 * Sort object by value descending and get top N
 */
export function getTopItems(obj, count = 5) {
  if (!obj || typeof obj !== 'object') return [];
  
  return Object.entries(obj)
    .map(([key, value]) => ({ key, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, count)
    .map(item => item.key);
}

/**
 * Calculate days since first activity
 */
export function getDaysSinceFirstMessage(firstDate, lastDate) {
  if (!firstDate) return 0;
  
  const start = new Date(firstDate);
  const end = lastDate ? new Date(lastDate) : new Date();
  
  return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Calculate server lifetime percentage
 */
export function getActivityPercentage(activeDays, daysSinceFirst) {
  if (daysSinceFirst === 0) return 0;
  return ((activeDays / daysSinceFirst) * 100).toFixed(1);
}

/**
 * Format large numbers with commas
 */
export function formatNumber(num) {
  return num?.toLocaleString('en-US') || '0';
}

/**
 * Get word frequency stats
 */
export function getWordStats(words, count = 10) {
  if (!words) return [];
  
  return Object.entries(words)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, count);
}

/**
 * Get emoji frequency stats
 */
export function getEmojiStats(emojis, count = 8) {
  if (!emojis) return [];
  
  return Object.entries(emojis)
    .map(([emoji, count]) => ({ emoji, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, count);
}

/**
 * Get most active month
 */
export function getMostActiveMonth(months) {
  if (!months || typeof months !== 'object' || Object.keys(months).length === 0) {
    return { month: 'Unknown', count: 0 };
  }
  
  const entries = Object.entries(months);
  const [month, count] = entries.reduce((a, b) => b[1] > a[1] ? b : a);
  
  return { month, count: parseInt(count) };
}

/**
 * Get average messages per day
 */
export function getAverageMessagesPerDay(totalMessages, activeDays) {
  if (!activeDays || activeDays === 0) return 0;
  return (totalMessages / activeDays).toFixed(1);
}

/**
 * Get peak activity time combo (day + hour)
 */
export function getPeakActivityCombo(combos) {
  if (!combos || typeof combos !== 'object' || Object.keys(combos).length === 0) {
    return { combo: 'Unknown', count: 0, day: 'Unknown', hour: '0' };
  }
  
  const [combo, count] = Object.entries(combos)
    .reduce((a, b) => b[1] > a[1] ? b : a);
  
  const [day, hour] = combo.split('-');
  return { combo, count: parseInt(count), day, hour };
}

/**
 * Get month name from YYYY-MM format
 */
export function getMonthName(monthStr) {
  if (!monthStr) return 'Unknown';
  const months = {
    '01': 'Ocak', '02': 'Şubat', '03': 'Mart', '04': 'Nisan',
    '05': 'Mayıs', '06': 'Haziran', '07': 'Temmuz', '08': 'Ağustos',
    '09': 'Eylül', '10': 'Ekim', '11': 'Kasım', '12': 'Aralık',
  };
  const [year, month] = monthStr.split('-');
  return `${months[month]} ${year}`;
}

/**
 * Calculate total unique words
 */
export function getTotalUniqueWords(words) {
  if (!words || typeof words !== 'object') return 0;
  return Object.keys(words).length;
}

/**
 * Calculate total unique emojis
 */
export function getTotalUniqueEmojis(emojis) {
  if (!emojis || typeof emojis !== 'object') return 0;
  return Object.keys(emojis).length;
}

/**
 * Get top days sorted by message count
 */
export function getTopDays(days, count = 3) {
  if (!days || typeof days !== 'object') return [];
  
  return Object.entries(days)
    .map(([day, msgCount]) => ({ day, count: parseInt(msgCount) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, count);
}

/**
 * Get total messages from day stats
 */
export function getTotalFromDays(days) {
  if (!days || typeof days !== 'object') return 0;
  return Object.values(days).reduce((sum, val) => sum + parseInt(val), 0);
}

/**
 * Check if user is a night owl (most messages between 22:00 - 06:00)
 */
export function isNightOwl(hours) {
  if (!hours || typeof hours !== 'object') return false;
  
  const nightHours = ['0', '1', '2', '3', '4', '5', '22', '23'].map(h => parseInt(h));
  const dayHours = Array.from({ length: 24 }, (_, i) => i);
  
  const nightMessages = nightHours.reduce((sum, h) => sum + (parseInt(hours[h]) || 0), 0);
  const totalMessages = Object.values(hours).reduce((sum, val) => sum + parseInt(val), 0);
  
  const nightPercentage = (nightMessages / totalMessages) * 100;
  return nightPercentage > 40;
}

/**
 * Get a unique role/nickname based on user statistics
 */
export function getUserRole(userId, stats) {
  // Calculate average message length if not already there
  const avgLen = stats.len_sum && stats.total ? Math.round(stats.len_sum / stats.total) : 0;
  const questionRatio = stats.total ? (stats.question / stats.total) : 0;
  
  const enrichedStats = {
    ...stats,
    avg_len: avgLen,
    question_ratio: questionRatio,
  };

  // Score-based role assignment for better distribution
  const roleScores = [];
  
  // @Mojang - Ultimate leader (highest activity)
  roleScores.push({
    title: '@Mojang',
    description: 'Oyunun kurucusu gibi liderlik yaparsın ve herkes seni takip eder',
    score: (enrichedStats.total > 8000 ? 100 : 0) + 
           (enrichedStats.active_days > 280 ? 100 : 0),
  });

  // @Ejderha - Legendary and rare
  roleScores.push({
    title: '@Ejderha',
    description: 'Efsanevi varlık! En güçlülerinden birisin, nadirsin ve çok özelsin',
    score: (enrichedStats.total > 6000 && enrichedStats.total <= 8000 ? 150 : 0) +
           (enrichedStats.active_days > 250 ? 80 : 0),
  });

  // @Herobrine - Mysterious
  roleScores.push({
    title: '@Herobrine',
    description: 'Gizemli ve efsanevi! Kimse tam olarak neredesin bilmiyor ama hepsi senden bahsediyor',
    score: (enrichedStats.active_days > 200 && enrichedStats.active_days <= 250 ? 120 : 0) +
           (enrichedStats.total > 4000 && enrichedStats.total <= 6000 ? 100 : 0),
  });

  // @Warden - Quiet but strong
  roleScores.push({
    title: '@Warden',
    description: 'Sessizce güçlü korumacı! Tehditkâr görünüşün altında iyiliğin var',
    score: (enrichedStats.avg_len > 120 ? 100 : 0) +
           (enrichedStats.question_ratio < 0.1 ? 80 : 0) +
           (enrichedStats.total > 3000 && enrichedStats.total <= 6000 ? 60 : 0),
  });

  // @Yaşlı Gardiyan - Wise and experienced
  roleScores.push({
    title: '@Yaşlı Gardiyan',
    description: 'Sunucunun bilge kişisi! Deneyimli ve herkese rehberlik edersin',
    score: (enrichedStats.active_days > 180 && enrichedStats.active_days <= 250 ? 130 : 0) +
           (enrichedStats.total > 2000 && enrichedStats.total <= 5000 ? 70 : 0),
  });

  // @Golem - Big and protective
  roleScores.push({
    title: '@Golem',
    description: 'Güçlü ve koruyucu! Dostça tavırların herkesi rahatlatıyor',
    score: (enrichedStats.avg_len > 100 && enrichedStats.avg_len <= 150 ? 140 : 0) +
           (enrichedStats.total > 1500 && enrichedStats.total <= 4000 ? 80 : 0),
  });

  // @Blaze - Fast and energetic
  roleScores.push({
    title: '@Blaze',
    description: 'Ateşli ve enerjik! Hızlı konuşur, hızlı hareketsiz... her zaman hareket halinde',
    score: (enrichedStats.total > 2500 && enrichedStats.total <= 5000 ? 110 : 0) +
           (enrichedStats.avg_len < 60 ? 100 : 0),
  });

  // @Creeper - Unexpected and impactful
  roleScores.push({
    title: '@Creeper',
    description: 'Sessiz ve tehlikeli! Beklenmedik anda parlayıp herkesi şaşırtırsın',
    score: (enrichedStats.total > 1500 && enrichedStats.total <= 3500 ? 120 : 0) +
           (enrichedStats.active_days > 120 && enrichedStats.active_days <= 200 ? 100 : 0),
  });

  // @Ahtapot - Curious and multi-talented
  roleScores.push({
    title: '@Ahtapot',
    description: 'Çok yeterli! Bir seferde pek çok şey yapabilirsin, meraklı ve çok beceriklsin',
    score: (enrichedStats.question_ratio > 0.25 ? 150 : 0) +
           (enrichedStats.total > 1000 ? 60 : 0),
  });

  // @Kurbağa - Playful and friendly
  roleScores.push({
    title: '@Kurbağa',
    description: 'Zıplayıcı ve dostça! Yanında olmak eğlenceli ve keyifli',
    score: (enrichedStats.total > 800 && enrichedStats.total <= 2500 ? 130 : 0) +
           (enrichedStats.active_days > 80 && enrichedStats.active_days <= 180 ? 110 : 0),
  });

  // @Aksolotl - Rare and unique
  roleScores.push({
    title: '@Aksolotl',
    description: 'Nadir ve eğlenceli! Etkileşimlerinde orijinal ve neşelisin',
    score: (enrichedStats.total > 300 && enrichedStats.total <= 1200 ? 140 : 0) +
           (enrichedStats.active_days > 40 && enrichedStats.active_days <= 120 ? 120 : 0),
  });

  // @Wither - Destructive and impactful
  roleScores.push({
    title: '@Wither',
    description: 'Yıkıcı ve tehlikeli! Etrafında işler değişir, etkili bir varlıksın',
    score: (enrichedStats.total > 100 && enrichedStats.total <= 800 ? 140 : 0) +
           (enrichedStats.active_days > 20 && enrichedStats.active_days <= 100 ? 130 : 0),
  });

  // Find the role with highest score
  const maxScore = Math.max(...roleScores.map(r => r.score));
  
  // If a clear winner exists, use it
  if (maxScore > 0) {
    // Get all roles with max score and use userId hash to pick one deterministically
    const winningRoles = roleScores.filter(r => r.score === maxScore);
    if (winningRoles.length === 1) {
      return winningRoles[0];
    }
    // If multiple roles tie, use hash to pick one
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return winningRoles[hash % winningRoles.length];
  }

  // Fallback: use hash to pick any role for new/very inactive users
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return roleScores[hash % roleScores.length];
}
