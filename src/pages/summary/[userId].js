import Image from 'next/image';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas-pro';
import { useEffect, useState } from 'react';
import { getUserSummary } from '@/lib/dataLoader';
import {
  formatDate,
  getMostActiveHourDescription,
  getTopItems,
  getDaysSinceFirstMessage,
  getActivityPercentage,
  formatNumber,
  getWordStats,
  getMostActiveMonth,
  getAverageMessagesPerDay,
  getPeakActivityCombo,
  getMonthName,
  getTotalUniqueWords,
  getTopDays,
  isNightOwl,
  getUserRole,
} from '@/lib/formatters';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 100, scale: 0.8 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
    },
  },
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const floatingVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      ease: 'easeOut',
    },
  },
  float: {
    y: [0, -20, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const glitchVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6 },
  },
  animate: {
    textShadow: [
      '0 0 0px rgba(59, 130, 246, 0)',
      '2px 2px 0px rgba(59, 130, 246, 0.8)',
      '-2px -2px 0px rgba(239, 68, 68, 0.8)',
      '0 0 0px rgba(59, 130, 246, 0)',
    ],
    transition: {
      duration: 0.3,
      repeat: Infinity,
      repeatDelay: 2,
    },
  },
};

const slideInVariants = {
  hidden: { opacity: 0, x: -100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

export default function SummaryPage({ userData }) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = async () => {
    const cardElement = document.getElementById('share-card');
    if (cardElement) {
      try {
        // Wait a bit to ensure images are loaded
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const canvas = await html2canvas(cardElement, {
          backgroundColor: '#000000',
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
        });
        
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        
        // Try native share API first (for mobile)
        if (navigator.share) {
          const file = new File([blob], `${userData.user.username}-wrapped.png`, { type: 'image/png' });
          navigator.share({
            files: [file],
            title: `${userData.user.username} Sunucudaki Özeti`,
            text: `${userData.user.username} sunucuda ${formatNumber(userData.stats.total)} mesaj yazmış!`,
          }).catch(err => {
            // Fallback to download if share is cancelled
            const link = document.createElement('a');
            link.download = `${userData.user.username}-wrapped.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
          });
        } else {
          // Fallback to download for desktop
          const link = document.createElement('a');
          link.download = `${userData.user.username}-wrapped.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        }
      } catch (error) {
        console.error('Error capturing share card:', error);
      }
    }
  };

  if (!userData || !userData.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center text-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl font-bold text-center"
        >
          <p>Kullanıcı bulunamadı</p>
        </motion.div>
      </div>
    );
  }

  // Extract and format data
  const user = userData.user;
  const stats = userData.stats;
  const social = userData.social || {};
  const rankings = userData.rankings || {};

  const topWords = getWordStats(stats.words, 8);
  const userRole = getUserRole(userData.userId, stats);
  
  const daysSince = getDaysSinceFirstMessage(stats.first, stats.last);
  const yearsOnServer = (daysSince / 365).toFixed(1);
  const activityPercentage = getActivityPercentage(stats.active_days, daysSince);
  const avgMessageLength = stats.total > 0 
    ? Math.round(stats.len_sum / stats.total)
    : 0;
  const questionRatio = stats.total > 0 
    ? ((stats.question / stats.total) * 100).toFixed(1)
    : 0;

  const mostActiveHour = stats.hours 
    ? Object.keys(stats.hours).reduce((a, b) => 
        stats.hours[a] > stats.hours[b] ? a : b, '0')
    : '0';

  const mostActiveDay = stats.days
    ? Object.keys(stats.days).reduce((a, b) =>
        stats.days[a] > stats.days[b] ? a : b, 'Unknown')
    : 'Unknown';

  // New statistics
  const mostActiveMonth = getMostActiveMonth(stats.months);
  const avgMessagesPerDay = getAverageMessagesPerDay(stats.total, stats.active_days);
  const peakActivityCombo = getPeakActivityCombo(stats.combos);
  const topDays = getTopDays(stats.days, 3);
  const totalUniqueWords = getTotalUniqueWords(stats.words);
  const nightOwl = isNightOwl(stats.hours);

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center text-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl font-bold"
        >
          Yükleniyor...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white overflow-hidden">
      <style>{`
        @keyframes aurora {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float-up {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .aurora-bg {
          background: linear-gradient(-45deg, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1), rgba(59, 130, 246, 0.1));
          background-size: 400% 400%;
          animation: aurora 15s ease infinite;
        }
        .glow-text {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .glassmorphism {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .gradient-border {
          background-image: linear-gradient(to right, #3b82f6, #a855f7, #ec4899);
          padding: 3px;
          border-radius: 999px;
        }
        .gradient-border img {
          border-radius: 999px;
        }
        /* Custom scrollbar styling */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #a855f7);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #60a5fa, #c084fc);
        }
        .stat-card {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%);
          border: 1px solid rgba(59, 130, 246, 0.2);
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          border-color: rgba(59, 130, 246, 0.5);
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%);
        }
      `}</style>

      {/* Header / Navigation */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-gray-800 border-opacity-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative flex items-center justify-center">
          <motion.a
            href="/"
            className="absolute left-4 sm:left-6 lg:left-8 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            whileHover={{ x: -5 }}
          >
            <span className="text-2xl">←</span>
            <span className="hidden sm:inline">Ana Sayfa</span>
          </motion.a>
          <h2 className="text-lg sm:text-xl font-bold text-center">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {user.displayName || user.username}
            </span>
          </h2>
        </div>
      </motion.div>

      {/* Hero Section */}
      <motion.div
        className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center relative overflow-hidden aurora-bg"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        {/* Animated background blobs */}
        <motion.div
          className="absolute top-20 left-10 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 z-0"
          animate={{
            y: [0, 50, 0],
            x: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 right-10 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 z-0"
          animate={{
            y: [0, -50, 0],
            x: [0, -30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative z-20 space-y-8">
          {/* Avatar with gradient border */}
          <motion.div
            className="flex justify-center"
            variants={floatingVariants}
            animate="float"
          >
            <motion.div
              className="gradient-border"
              whileHover={{ scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Image
                src={user.avatar_url || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                alt="User Avatar"
                width={200}
                height={200}
                className="w-48 h-48 md:w-56 md:h-56"
                priority
                unoptimized={true}
                onError={(e) => {
                  e.currentTarget.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
                }}
              />
            </motion.div>
          </motion.div>

          {/* Username and display name */}
          <motion.div
            className="text-center space-y-4"
            variants={itemVariants}
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {user.displayName || user.username}
            </h1>
            {user.displayName && user.displayName !== user.username && (
              <p className="text-lg sm:text-xl text-gray-500">
                @{user.username}
              </p>
            )}
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-400 font-light">
              Sunucudaki Hikâyen
            </p>
          </motion.div>

          {/* Quick stats preview */}
          <motion.div
            className="grid grid-cols-3 gap-4 mt-8"
            variants={containerVariants}
          >
            <motion.div className="text-center" variants={itemVariants}>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-400">{formatNumber(stats.total)}</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-2">Mesaj</p>
            </motion.div>
            <motion.div className="text-center" variants={itemVariants}>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-400">{stats.active_days}</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-2">Gün</p>
            </motion.div>
            <motion.div className="text-center" variants={itemVariants}>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-pink-400">{avgMessageLength}</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-2">Karakter</p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Key Metrics Grid */}
      <motion.section
        className="relative py-20 px-4 sm:px-6 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-4xl sm:text-5xl font-black text-center mb-16 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"
            variants={itemVariants}
          >
            Temel Metriklerin
          </motion.h2>

          {/* User Role Card */}
          <motion.div
            className="mb-8 stat-card p-8 rounded-2xl backdrop-blur-sm border-2 border-yellow-400 bg-gradient-to-r from-yellow-900 from-20% via-blue-900 via-50% to-purple-900 to-80%"
            variants={itemVariants}
            whileHover={{ y: -5, boxShadow: '0 0 40px rgba(250, 204, 21, 0.4)' }}
          >
            <div className="text-center">
              <p className="text-gray-300 text-lg mb-2">👑 Sunucudaki Rolün</p>
              <p className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent mb-4">
                {userRole.title}
              </p>
              <p className="text-gray-200 text-lg italic">
                {userRole.description}
              </p>
            </div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
            variants={containerVariants}
          >
            {/* Total Messages */}
            <motion.div
              className="md:col-span-2 stat-card p-8 rounded-2xl backdrop-blur-sm"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <p className="text-gray-400 text-lg mb-4">📊 Toplam Mesaj</p>
              <p className="text-6xl sm:text-7xl font-black bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                {formatNumber(stats.total)}
              </p>
              <p className="text-gray-500 text-sm mt-4">
                {formatNumber(stats.active_days)} gün içinde gönderdin
              </p>
            </motion.div>

            {/* Most Active Hour */}
            <motion.div
              className="stat-card p-8 rounded-2xl backdrop-blur-sm"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <p className="text-gray-400 text-sm mb-4">🕐 En Aktif Saat</p>
              <p className="text-5xl font-black text-orange-400">{parseInt(mostActiveHour)}:00</p>
              <p className="text-gray-500 text-xs mt-4">
                {getMostActiveHourDescription(mostActiveHour)}
              </p>
            </motion.div>

            {/* Most Active Day */}
            <motion.div
              className="stat-card p-8 rounded-2xl backdrop-blur-sm"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <p className="text-gray-400 text-sm mb-4">📅 En Aktif Gün</p>
              <p className="text-5xl font-black text-purple-400">{mostActiveDay}</p>
              <p className="text-gray-500 text-xs mt-4">Haftanın Günü</p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Cards Section */}
      <motion.section
        className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-blue-900 via-opacity-5 to-transparent"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-4xl sm:text-5xl font-black text-center mb-16 bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent"
            variants={itemVariants}
          >
            Mesaj İstatistikleri
          </motion.h2>

          {/* Row 1: Message stats */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
            variants={containerVariants}
          >
            {/* Message Length */}
            <motion.div
              className="stat-card p-8 rounded-2xl backdrop-blur-sm"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <p className="text-gray-400 text-lg mb-4">📝 Ortalama Mesaj Uzunluğu</p>
              <p className="text-6xl font-black text-blue-400">{avgMessageLength}</p>
              <p className="text-gray-500 text-sm mt-4">
                Min: {stats.min_len} | Max: {stats.max_len}
              </p>
            </motion.div>

            {/* Question Ratio */}
            <motion.div
              className="stat-card p-8 rounded-2xl backdrop-blur-sm"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <p className="text-gray-400 text-lg mb-4">❓ Soru Oranı</p>
              <p className="text-6xl font-black text-purple-400">%{questionRatio}</p>
              <p className="text-gray-500 text-sm mt-4">
                {stats.question} soru / {stats.total} mesaj
              </p>
            </motion.div>
          </motion.div>

          {/* Row 2: Top Words */}
          <motion.div
            className="stat-card p-8 rounded-2xl backdrop-blur-sm mb-6"
            variants={itemVariants}
            whileHover={{ y: -5 }}
          >
            <p className="text-gray-400 text-lg mb-6">🔤 En Çok Kullanılan Kelimeler</p>
            <div className="flex flex-wrap gap-3">
              {topWords.map((item, idx) => (
                <motion.div
                  key={idx}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full font-semibold text-sm sm:text-base hover:from-blue-500 hover:to-blue-400 transition-all"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>{item.word}</span>
                  <span className="ml-2 opacity-75">×{item.count}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Row 3: Message Timeline */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={containerVariants}
          >
            {/* First Message */}
            <motion.div
              className="stat-card p-8 rounded-2xl backdrop-blur-sm"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <p className="text-gray-400 text-lg mb-4">📅 İlk Mesaj</p>
              <p className="text-3xl font-black text-cyan-400 mb-2">{formatDate(stats.first)}</p>
              <p className="text-gray-500 text-sm">Sunucudaki başlangıcın</p>
            </motion.div>

            {/* Last Message */}
            <motion.div
              className="stat-card p-8 rounded-2xl backdrop-blur-sm"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <p className="text-gray-400 text-lg mb-4">⏱️ Son Mesaj</p>
              <p className="text-3xl font-black text-teal-400 mb-2">{formatDate(stats.last)}</p>
              <p className="text-gray-500 text-sm">Son aktivite zamanı</p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Advanced Analytics Section */}
      <motion.section
        className="relative py-20 px-4 sm:px-6 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-4xl sm:text-5xl font-black text-center mb-16 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent"
            variants={itemVariants}
          >
            İleri Analitiği
          </motion.h2>

          {/* Row 1: Main metrics - 4 columns */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
            variants={containerVariants}
          >
            {/* Daily Average */}
            <motion.div
              className="stat-card p-6 rounded-2xl backdrop-blur-sm"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <p className="text-gray-400 text-xs sm:text-sm mb-3">📊 Günlük Ortalama</p>
              <p className="text-4xl sm:text-5xl font-black text-cyan-400">{avgMessagesPerDay}</p>
              <p className="text-gray-500 text-xs mt-3">mesaj/gün</p>
            </motion.div>

            {/* Most Active Month */}
            <motion.div
              className="stat-card p-6 rounded-2xl backdrop-blur-sm"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <p className="text-gray-400 text-xs sm:text-sm mb-3">📅 En Aktif Ay</p>
              <p className="text-4xl sm:text-5xl font-black text-orange-400">{formatNumber(mostActiveMonth.count)}</p>
              <p className="text-gray-500 text-xs mt-3">{getMonthName(mostActiveMonth.month)}</p>
            </motion.div>

            {/* Peak Activity */}
            <motion.div
              className="stat-card p-6 rounded-2xl backdrop-blur-sm"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <p className="text-gray-400 text-xs sm:text-sm mb-3">🔥 Peak Saati</p>
              <p className="text-4xl sm:text-5xl font-black text-rose-400">{peakActivityCombo.hour}:00</p>
              <p className="text-gray-500 text-xs mt-3">{peakActivityCombo.day}</p>
            </motion.div>

            {/* Profile Type */}
            <motion.div
              className="stat-card p-6 rounded-2xl backdrop-blur-sm"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <p className="text-gray-400 text-xs sm:text-sm mb-3">🌙 Profil Tipi</p>
              <p className="text-3xl font-black text-violet-400 mb-1">
                {nightOwl ? '🌙' : '☀️'}
              </p>
              <p className="text-gray-500 text-xs">
                {nightOwl ? 'Gece Baykuşu' : 'Gündüz Aktifi'}
              </p>
            </motion.div>
          </motion.div>

          {/* Row 2: Content stats - 3 columns */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-6"
            variants={containerVariants}
          >
            {/* Unique Words */}
            <motion.div
              className="stat-card p-6 rounded-2xl backdrop-blur-sm"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <p className="text-gray-400 text-xs sm:text-sm mb-3">📚 Benzersiz Kelimeler</p>
              <p className="text-5xl font-black text-indigo-400">{formatNumber(totalUniqueWords)}</p>
              <p className="text-gray-500 text-xs mt-3">farklı kelime</p>
            </motion.div>

            {/* Message Range */}
            <motion.div
              className="stat-card p-6 rounded-2xl backdrop-blur-sm"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <p className="text-gray-400 text-xs sm:text-sm mb-3">📏 Mesaj Aralığı</p>
              <p className="text-4xl font-black text-lime-400">
                {stats.min_len}-{stats.max_len}
              </p>
              <p className="text-gray-500 text-xs mt-3">karakter</p>
            </motion.div>

            {/* Message Range */}
            <motion.div
              className="stat-card p-6 rounded-2xl backdrop-blur-sm"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <p className="text-gray-400 text-xs sm:text-sm mb-3">⏳ Sunucuda Geçen Süre</p>
              <p className="text-4xl font-black text-lime-400">{yearsOnServer}</p>
              <p className="text-gray-500 text-xs mt-3">yıl ({daysSince} gün)</p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Rankings Section */}
      <motion.section
        className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-purple-900 via-opacity-5 to-transparent"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-4xl sm:text-5xl font-black text-center mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
            variants={itemVariants}
          >
            Sunucudaki Sıralaman
          </motion.h2>

          <motion.div
            className="text-center mb-12"
            variants={itemVariants}
          >
            <p className="text-6xl sm:text-7xl md:text-8xl font-black text-green-400 mb-2">
              %{rankings.messageCountPercentile || '—'}
            </p>
            <p className="text-gray-400">
              Aktif kullanıcılardan <span className="text-green-400 font-bold">daha aktif</span>'sin
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={containerVariants}
          >
            {/* Message Count Rank */}
            <motion.div
              className="stat-card p-8 rounded-2xl backdrop-blur-sm"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <p className="text-gray-400 text-sm mb-4">💬 Mesaj Sıralaması</p>
              <p className="text-5xl font-black text-blue-400 mb-2">#{rankings.messageCountRank || '—'}</p>
              <p className="text-gray-500 text-sm">{formatNumber(stats.total)} mesaj gönderdin</p>
            </motion.div>

            {/* Active Days */}
            <motion.div
              className="stat-card p-8 rounded-2xl backdrop-blur-sm"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <p className="text-gray-400 text-sm mb-4">📅 Aktif Günler</p>
              <p className="text-5xl font-black text-purple-400 mb-2">{formatNumber(stats.active_days)}</p>
              <p className="text-gray-500 text-sm">{activityPercentage}% tutarlı aktif</p>
            </motion.div>

            {/* Mentions */}
            <motion.div
              className="stat-card p-8 rounded-2xl backdrop-blur-sm"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <p className="text-gray-400 text-sm mb-4">👤 Bahsedilme</p>
              <p className="text-5xl font-black text-pink-400 mb-2">{social.mentioned_by || 0}</p>
              <p className="text-gray-500 text-sm">kişi tarafından anıldı</p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Leaderboard Section */}
      <motion.section
        className="relative py-20 px-4 sm:px-6 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-4xl sm:text-5xl font-black text-center mb-16 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent"
            variants={itemVariants}
          >
            🏆 Sıralamalar
          </motion.h2>

          {userData.leaderboard && (
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              variants={containerVariants}
            >
              {/* Message Count Leaderboard */}
              <motion.div
                className="stat-card p-6 rounded-2xl backdrop-blur-sm"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <div className="mb-6">
                  <p className="text-gray-400 text-sm mb-2">💬 Mesaj Sayısı</p>
                  <p className="text-4xl font-black text-blue-400">#{userData.leaderboard.message_count.userRank}</p>
                  <p className="text-gray-500 text-xs mt-2">{formatNumber(userData.leaderboard.message_count.userValue)} mesaj</p>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                  {userData.leaderboard.message_count.context.map((item) => (
                    <motion.div
                      key={item.user_id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all text-sm ${
                        item.isUser
                          ? 'bg-blue-700 border border-blue-400'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                      whileHover={{ x: 5 }}
                    >
                      <span className="font-bold text-gray-300 w-5 text-right text-xs">#{item.rank}</span>
                      <Image
                        src={item.user?.avatar_url?.replace('?size=512', '?size=32') || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                        alt={item.user?.username || 'User avatar'}
                        width={28}
                        height={28}
                        className="rounded-full flex-shrink-0"
                        unoptimized={true}
                        onError={(e) => {
                          e.currentTarget.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
                        }}
                      />
                      <div className="flex-1 truncate">
                        <span className="text-gray-100 font-medium">{item.user?.displayName || item.user?.username || 'Unknown'}</span>
                        {item.user?.displayName && item.user?.displayName !== item.user?.username && (
                          <span className="text-gray-500 text-xs ml-1">({item.user?.username})</span>
                        )}
                      </div>
                      <span className="font-bold text-gray-300 flex-shrink-0 text-xs">{formatNumber(item.value)}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Active Days Leaderboard */}
              <motion.div
                className="stat-card p-6 rounded-2xl backdrop-blur-sm"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <div className="mb-6">
                  <p className="text-gray-400 text-sm mb-2">📅 Aktif Günler</p>
                  <p className="text-4xl font-black text-purple-400">#{userData.leaderboard.active_days.userRank}</p>
                  <p className="text-gray-500 text-xs mt-2">{userData.leaderboard.active_days.userValue} gün</p>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                  {userData.leaderboard.active_days.context.map((item) => (
                    <motion.div
                      key={item.user_id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all text-sm ${
                        item.isUser
                          ? 'bg-purple-700 border border-purple-400'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                      whileHover={{ x: 5 }}
                    >
                      <span className="font-bold text-gray-300 w-5 text-right text-xs">#{item.rank}</span>
                      <Image
                        src={item.user?.avatar_url?.replace('?size=512', '?size=32') || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                        alt={item.user?.username || 'User avatar'}
                        width={28}
                        height={28}
                        className="rounded-full flex-shrink-0"
                        unoptimized={true}
                        onError={(e) => {
                          e.currentTarget.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
                        }}
                      />
                      <div className="flex-1 truncate">
                        <span className="text-gray-100 font-medium">{item.user?.displayName || item.user?.username || 'Unknown'}</span>
                        {item.user?.displayName && item.user?.displayName !== item.user?.username && (
                          <span className="text-gray-500 text-xs ml-1">({item.user?.username})</span>
                        )}
                      </div>
                      <span className="font-bold text-gray-300 flex-shrink-0 text-xs">{item.value}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Average Message Length Leaderboard */}
              <motion.div
                className="stat-card p-6 rounded-2xl backdrop-blur-sm"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <div className="mb-6">
                  <p className="text-gray-400 text-sm mb-2">📝 Ort. Mesaj Uzunluğu</p>
                  <p className="text-4xl font-black text-pink-400">#{userData.leaderboard.avg_message_length.userRank}</p>
                  <p className="text-gray-500 text-xs mt-2">{userData.leaderboard.avg_message_length.userValue} karakter</p>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                  {userData.leaderboard.avg_message_length.context.map((item) => (
                    <motion.div
                      key={item.user_id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all text-sm ${
                        item.isUser
                          ? 'bg-pink-700 border border-pink-400'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                      whileHover={{ x: 5 }}
                    >
                      <span className="font-bold text-gray-300 w-5 text-right text-xs">#{item.rank}</span>
                      <Image
                        src={item.user?.avatar_url?.replace('?size=512', '?size=32') || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                        alt={item.user?.username || 'User avatar'}
                        width={28}
                        height={28}
                        className="rounded-full flex-shrink-0"
                        unoptimized={true}
                        onError={(e) => {
                          e.currentTarget.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
                        }}
                      />
                      <div className="flex-1 truncate">
                        <span className="text-gray-100 font-medium">{item.user?.displayName || item.user?.username || 'Unknown'}</span>
                        {item.user?.displayName && item.user?.displayName !== item.user?.username && (
                          <span className="text-gray-500 text-xs ml-1">({item.user?.username})</span>
                        )}
                      </div>
                      <span className="font-bold text-gray-300 flex-shrink-0 text-xs">{item.value}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Share/Download Section */}
      <motion.section
        className="relative py-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <motion.h2
          className="text-4xl sm:text-5xl font-black text-center mb-16 bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent"
          variants={itemVariants}
        >
          Özeti Paylaş
        </motion.h2>

        <div className="flex flex-col lg:flex-row gap-12 items-center max-w-6xl">
          {/* Share Card */}
          <motion.div
            id="share-card"
            className="w-full max-w-xs bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-xl p-6 border-2 border-blue-500 shadow-2xl"
            variants={itemVariants}
          >
            <div className="text-center space-y-4">
              {/* Avatar */}
              <motion.div
                className="flex justify-center"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-blue-400 shadow-lg">
                  <Image
                    src={user.avatar_url || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                    alt="User Avatar"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    priority
                    unoptimized={true}
                    onError={(e) => {
                      e.currentTarget.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
                    }}
                  />
                </div>
              </motion.div>

              {/* Username */}
              <div>
                <h3 className="text-xl font-black text-white mb-1 break-words">{user.displayName || user.username}</h3>
                {user.displayName && user.displayName !== user.username && (
                  <p className="text-xs text-gray-400 mb-3">@{user.username}</p>
                )}
              </div>

              {/* Role Quote Section */}
              <div className="border-l-4 border-purple-500 bg-purple-950 bg-opacity-40 rounded pl-3 pr-3 py-2.5 space-y-1.5">
                <p className="text-xs font-bold text-purple-300 uppercase tracking-wide">Sunucudaki Rolü</p>
                <p className="text-sm font-black text-purple-200">{userRole.title}</p>
                <p className="text-xs text-purple-200 italic leading-relaxed">
                  "{userRole.description}"
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 my-4">
                <div className="bg-blue-600 bg-opacity-40 rounded p-1.5">
                  <p className="text-gray-300 text-xs mb-0.5">Mesaj</p>
                  <p className="text-lg font-black text-blue-300 truncate">{formatNumber(stats.total)}</p>
                </div>
                <div className="bg-purple-600 bg-opacity-40 rounded p-1.5">
                  <p className="text-gray-300 text-xs mb-0.5">Gün</p>
                  <p className="text-lg font-black text-purple-300">{stats.active_days}</p>
                </div>
                <div className="bg-pink-600 bg-opacity-40 rounded p-1.5">
                  <p className="text-gray-300 text-xs mb-0.5">Sıra</p>
                  <p className="text-lg font-black text-pink-300">#{rankings.messageCountRank || '—'}</p>
                </div>
                <div className="bg-cyan-600 bg-opacity-40 rounded p-1.5">
                  <p className="text-gray-300 text-xs mb-0.5">Yüzdelik</p>
                  <p className="text-lg font-black text-cyan-300">%{rankings.messageCountPercentile || '—'}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-2">
                <p className="text-xs font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  KAH Özetin — DarkNight
                </p>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col gap-4 w-full max-w-sm"
            variants={containerVariants}
          >
            <motion.button
              onClick={handleShare}
              className="px-8 py-6 text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl border-2 border-blue-400 text-white shadow-2xl"
              whileHover={{
                scale: 1.05,
                boxShadow: '0 0 50px rgba(59, 130, 246, 0.8)',
              }}
              whileTap={{ scale: 0.95 }}
              variants={itemVariants}
            >
              🎬 Paylaş / İndir
            </motion.button>

            <motion.a
              href="/"
              className="px-8 py-6 text-lg font-bold bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl border-2 border-gray-600 text-white text-center hover:border-gray-500 transition-all"
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{ scale: 0.95 }}
              variants={itemVariants}
            >
              ← Ana Sayfa
            </motion.a>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}

export async function getStaticProps(context) {
  const { userId } = context.params;

  try {
    const userData = await getUserSummary(userId);

    if (!userData) {
      return {
        notFound: true,
        revalidate: 3600, // Revalidate every hour
      };
    }

    return {
      props: {
        userData,
      },
      revalidate: 3600, // ISR - revalidate every hour
    };
  } catch (error) {
    console.error('Error loading user summary:', error);
    return {
      notFound: true,
      revalidate: 60,
    };
  }
}

export async function getStaticPaths() {
  // For now, return empty paths and let ISR handle the rest
  // This allows on-demand generation of pages
  return {
    paths: [],
    fallback: 'blocking',
  };
}