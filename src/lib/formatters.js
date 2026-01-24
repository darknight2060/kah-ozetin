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
  
  const enrichedStats = {
    ...stats,
    avg_len: avgLen,
  };

  const roles = [
    {
      title: '@Mojang',
      description: 'Oyunun kurucusu gibi liderlik yaparsın ve herkes seni takip eder',
      condition: (stats) => stats.total > 10000 && stats.active_days > 300,
    },
    {
      title: '@Ejderha',
      description: 'Efsanevi varlık! En güçlülerinden birisin, nadirsin ve çok özelsin',
      condition: (stats) => stats.total > 8000 && stats.active_days > 280,
    },
    {
      title: '@Herobrine',
      description: 'Gizemli ve efsanevi! Kimse tam olarak neredesin bilmiyor ama hepsi senden bahsediyor',
      condition: (stats) => stats.active_days > 250 && stats.total > 5000,
    },
    {
      title: '@Warden',
      description: 'Sessizce güçlü korumacı! Tehditkâr görünüşün altında iyiliğin var',
      condition: (stats) => stats.total > 7000 && stats.question < stats.total * 0.15,
    },
    {
      title: '@Yaşlı Gardiyan',
      description: 'Sunucunun bilge kişisi! Deneyimli ve herkese rehberlik edersin',
      condition: (stats) => stats.active_days > 200,
    },
    {
      title: '@Golem',
      description: 'Güçlü ve koruyucu! Dostça tavırların herkesi rahatlatıyor',
      condition: (stats) => stats.avg_len > 100,
    },
    {
      title: '@Blaze',
      description: 'Ateşli ve enerjik! Hızlı konuşur, hızlı hareketsiz... her zaman hareket halinde',
      condition: (stats) => stats.total > 3000 && stats.avg_len < 50,
    },
    {
      title: '@Creeper',
      description: 'Sessiz ve tehlikeli! Beklenmedik anda parlayıp herkesi şaşırtırsın',
      condition: (stats) => stats.total > 2000 && stats.active_days > 150,
    },
    {
      title: '@Ahtapot',
      description: 'Çok yeterli! Bir seferde pek çok şey yapabilirsin, meraklı ve çok beceriklsin',
      condition: (stats) => stats.question > stats.total * 0.3,
    },
    {
      title: '@Kurbağa',
      description: 'Zıplayıcı ve dostça! Yanında olmak eğlenceli ve keyifli',
      condition: (stats) => stats.total > 1000 && stats.active_days > 100,
    },
    {
      title: '@Aksolotl',
      description: 'Nadir ve eğlenceli! Etkileşimlerinde orijinal ve neşelisin',
      condition: (stats) => stats.total > 500 && stats.active_days > 50,
    },
    {
      title: '@Wither',
      description: 'Yıkıcı ve tehlikeli! Etrafında işler değişir, etkili bir varlıksın',
      condition: (stats) => true, // Default fallback
    },
  ];

  // Hash the userId deterministically
  const hash = userId
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // Calculate role based on stats first, then hash if no match
  for (const role of roles.slice(0, -1)) {
    if (role.condition(enrichedStats)) {
      return role;
    }
  }

  // If no condition matches, use hash to pick from remaining roles
  const roleIndex = hash % (roles.length - 1);
  return roles[roleIndex];
}
