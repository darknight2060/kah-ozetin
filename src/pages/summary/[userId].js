import Image from 'next/image';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
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
  getEmojiStats,
  getMostActiveMonth,
  getAverageMessagesPerDay,
  getPeakActivityCombo,
  getMonthName,
  getTotalUniqueWords,
  getTotalUniqueEmojis,
  getTopDays,
  isNightOwl,
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
      repeatDelay: 4,
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

  const handleShare = () => {
    const summaryElement = document.getElementById('summary-section');
    if (summaryElement) {
      html2canvas(summaryElement).then((canvas) => {
        const link = document.createElement('a');
        link.download = `${userData.user.username}-wrapped.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
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

  const topWords = getWordStats(stats.words, 5);
  const topEmojis = getEmojiStats(stats.emojis, 6);
  
  const daysSince = getDaysSinceFirstMessage(stats.first, stats.last);
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
  const totalUniqueEmojis = getTotalUniqueEmojis(stats.emojis);
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
        .aurora-bg {
          background: linear-gradient(-45deg, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1), rgba(59, 130, 246, 0.1));
          background-size: 400% 400%;
          animation: aurora 15s ease infinite;
        }
        .glow-text {
          animation: pulse-glow 3s ease-in-out infinite;
        }
      `}</style>

      {/* Section 1: Welcome */}
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden aurora-bg"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        variants={containerVariants}
      >
        {/* Floating background elements */}
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 z-0"
          animate={{
            y: [0, 50, 0],
            x: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 z-0"
          animate={{
            y: [0, -50, 0],
            x: [0, -30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          className="relative z-20"
          variants={floatingVariants}
          animate="float"
        >
          {user.avatar_url && (
            <motion.div
              className="glow-text rounded-full overflow-hidden"
              whileHover={{ scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Image
                src={user.avatar_url}
                alt="User Avatar"
                width={180}
                height={180}
                className="rounded-full mb-4 border-4 border-blue-500 shadow-2xl"
              />
            </motion.div>
          )}
        </motion.div>

        <motion.h1
          className="text-6xl md:text-7xl font-black text-center mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
          variants={itemVariants}
        >
          {user.username}
        </motion.h1>

        <motion.p
          className="text-2xl text-gray-400 mt-4 font-light"
          variants={itemVariants}
        >
          @{user.username}
        </motion.p>

        <motion.p
          className="text-xl text-gray-500 mt-8 max-w-2xl text-center"
          variants={itemVariants}
        >
          Sunucudaki hikâyen burada başlıyor
        </motion.p>
      </motion.div>

      {/* Section 2: Volume */}
      <motion.div
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        variants={containerVariants}
      >
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />

        <div className="relative z-10 text-center">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="mb-8"
          >
            <div className="text-9xl font-black text-blue-400 glow-text">
              {formatNumber(stats.total)}
            </div>
          </motion.div>

          <motion.h2
            className="text-5xl font-bold text-center mb-4"
            variants={slideInVariants}
          >
            Toplam <span className="text-accent text-blue-400">Mesaj</span> Gönderdin
          </motion.h2>
        </div>
      </motion.div>

      {/* Section 3: Time */}
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center relative"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        variants={containerVariants}
      >
        <motion.div
          className="absolute inset-0 opacity-5 aurora-bg"
        />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl px-8">
          <motion.div
            className="bg-gradient-to-br from-blue-900 to-blue-800 p-8 rounded-2xl border border-blue-500 border-opacity-30"
            variants={itemVariants}
            whileHover={{
              scale: 1.05,
              boxShadow: '0 0 30px rgba(59, 130, 246, 0.6)',
            }}
          >
            <p className="text-xl text-gray-300 mb-4">En aktif olduğun saat</p>
            <p className="text-6xl font-black text-blue-300">
              {parseInt(mostActiveHour)}:00
            </p>
            <p className="text-sm text-gray-400 mt-2">
              {getMostActiveHourDescription(mostActiveHour)}
            </p>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-purple-900 to-purple-800 p-8 rounded-2xl border border-purple-500 border-opacity-30"
            variants={itemVariants}
            whileHover={{
              scale: 1.05,
              boxShadow: '0 0 30px rgba(168, 85, 247, 0.6)',
            }}
          >
            <p className="text-xl text-gray-300 mb-4">En aktif gün</p>
            <p className="text-6xl font-black text-purple-300">
              {mostActiveDay}
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Section 4: Style */}
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        variants={containerVariants}
      >
        <motion.div
          className="absolute inset-0 opacity-5"
          animate={{
            background: [
              'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
              'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)',
              'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <div className="relative z-10 max-w-4xl px-8">
          <motion.div variants={itemVariants} className="mb-12">
            <p className="text-2xl text-gray-400 mb-2">Mesaj Uzunluğu</p>
            <p className="text-6xl font-black text-blue-400">
              {formatNumber(avgMessageLength)}
              <span className="text-3xl text-gray-400 ml-2">karakter</span>
            </p>
            <p className="text-gray-500 mt-2">
              Min: {formatNumber(stats.min_len)} | Max: {formatNumber(stats.max_len)}
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-12">
            <p className="text-2xl text-gray-400 mb-4">Soru Oranı</p>
            <p className="text-5xl font-black text-purple-400">
              %{questionRatio}
            </p>
            <p className="text-gray-500 mt-2">
              ({formatNumber(stats.question)} soru / {formatNumber(stats.total)} mesaj)
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-12">
            <p className="text-2xl text-gray-400 mb-4">En Çok Kullandığın Kelimeler</p>
            <div className="flex flex-wrap gap-4">
              {topWords.map((item, idx) => (
                <motion.div
                  key={idx}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring' }}
                >
                  <p className="font-bold text-lg">{item.word}</p>
                  <p className="text-xs text-blue-100">{formatNumber(item.count)}x</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <p className="text-2xl text-gray-400 mb-4">En Çok Kullandığın Emojiler</p>
            <div className="flex flex-wrap gap-4">
              {topEmojis.map((item, idx) => (
                <motion.div
                  key={idx}
                  className="flex flex-col items-center"
                  whileHover={{ scale: 1.3, rotate: 10 }}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
                >
                  <span className="text-6xl">{item.emoji}</span>
                  <span className="text-xs text-gray-400 mt-1">{formatNumber(item.count)}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Section 4.5: Advanced Analytics */}
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        variants={containerVariants}
      >
        <motion.div
          className="absolute inset-0 opacity-5"
          animate={{
            background: [
              'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)',
              'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
              'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <div className="relative z-10 max-w-5xl px-8">
          <motion.h2
            className="text-5xl font-black mb-16 text-center bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent"
            variants={itemVariants}
          >
            İleri İstatistikler
          </motion.h2>

          {/* Row 1: Activity Metrics */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8"
            variants={containerVariants}
          >
            <motion.div
              className="bg-gradient-to-br from-cyan-900 to-cyan-800 p-8 rounded-2xl border border-cyan-500 border-opacity-30"
              variants={itemVariants}
              whileHover={{
                scale: 1.05,
                boxShadow: '0 0 30px rgba(34, 211, 238, 0.6)',
              }}
            >
              <p className="text-xl text-gray-300 mb-4">Günlük Ortalama Mesaj</p>
              <p className="text-6xl font-black text-cyan-300">{avgMessagesPerDay}</p>
              <p className="text-sm text-gray-400 mt-2">
                {formatNumber(stats.total)} mesaj / {stats.active_days} gün
              </p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-orange-900 to-orange-800 p-8 rounded-2xl border border-orange-500 border-opacity-30"
              variants={itemVariants}
              whileHover={{
                scale: 1.05,
                boxShadow: '0 0 30px rgba(249, 115, 22, 0.6)',
              }}
            >
              <p className="text-xl text-gray-300 mb-4">En Aktif Ay</p>
              <p className="text-5xl font-black text-orange-300">{formatNumber(mostActiveMonth.count)}</p>
              <p className="text-sm text-gray-400 mt-2">{getMonthName(mostActiveMonth.month)}</p>
            </motion.div>
          </motion.div>

          {/* Row 2: Peak Activity & Profile */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8"
            variants={containerVariants}
          >
            <motion.div
              className="bg-gradient-to-br from-rose-900 to-rose-800 p-8 rounded-2xl border border-rose-500 border-opacity-30"
              variants={itemVariants}
              whileHover={{
                scale: 1.05,
                boxShadow: '0 0 30px rgba(244, 63, 94, 0.6)',
              }}
            >
              <p className="text-xl text-gray-300 mb-4">Peak Aktivite Saati</p>
              <p className="text-5xl font-black text-rose-300">{peakActivityCombo.day}</p>
              <p className="text-sm text-gray-400 mt-2">
                {peakActivityCombo.hour}:00 - {formatNumber(peakActivityCombo.count)} mesaj
              </p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-violet-900 to-violet-800 p-8 rounded-2xl border border-violet-500 border-opacity-30"
              variants={itemVariants}
              whileHover={{
                scale: 1.05,
                boxShadow: '0 0 30px rgba(168, 85, 247, 0.6)',
              }}
            >
              <p className="text-xl text-gray-300 mb-4">Profil Türü</p>
              <p className="text-5xl font-black text-violet-300">
                {nightOwl ? '🌙' : '☀️'}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {nightOwl ? 'Gece Baykuşu' : 'Gündüz Aktifi'}
              </p>
            </motion.div>
          </motion.div>

          {/* Row 3: Content Stats */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8"
            variants={containerVariants}
          >
            <motion.div
              className="bg-gradient-to-br from-indigo-900 to-indigo-800 p-8 rounded-2xl border border-indigo-500 border-opacity-30"
              variants={itemVariants}
              whileHover={{
                scale: 1.05,
                boxShadow: '0 0 30px rgba(99, 102, 241, 0.6)',
              }}
            >
              <p className="text-xl text-gray-300 mb-4">Benzersiz Kelimeler</p>
              <p className="text-5xl font-black text-indigo-300">{formatNumber(totalUniqueWords)}</p>
              <p className="text-xs text-gray-400 mt-2">farklı kelime kullanıldı</p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-emerald-900 to-emerald-800 p-8 rounded-2xl border border-emerald-500 border-opacity-30"
              variants={itemVariants}
              whileHover={{
                scale: 1.05,
                boxShadow: '0 0 30px rgba(16, 185, 129, 0.6)',
              }}
            >
              <p className="text-xl text-gray-300 mb-4">Benzersiz Emojiler</p>
              <p className="text-5xl font-black text-emerald-300">{formatNumber(totalUniqueEmojis)}</p>
              <p className="text-xs text-gray-400 mt-2">farklı emoji kullanıldı</p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-lime-900 to-lime-800 p-8 rounded-2xl border border-lime-500 border-opacity-30"
              variants={itemVariants}
              whileHover={{
                scale: 1.05,
                boxShadow: '0 0 30px rgba(132, 204, 22, 0.6)',
              }}
            >
              <p className="text-xl text-gray-300 mb-4">Mesaj Aralığı</p>
              <p className="text-4xl font-black text-lime-300">
                {formatNumber(stats.min_len)} - {formatNumber(stats.max_len)}
              </p>
              <p className="text-xs text-gray-400 mt-2">minimum - maksimum karakter</p>
            </motion.div>
          </motion.div>

          {/* Row 4: Top Days */}
          <motion.div 
            className="grid grid-cols-1 gap-8"
            variants={containerVariants}
          >
            <motion.h3
              className="text-3xl font-bold text-gray-300 mb-4"
              variants={itemVariants}
            >
              En Aktif Günler
            </motion.h3>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={containerVariants}
            >
              {topDays.map((dayInfo, idx) => (
                <motion.div
                  key={idx}
                  className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl border border-gray-600 border-opacity-50"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-center">
                    <p className="text-gray-400 text-sm mb-2">#{idx + 1}</p>
                    <p className="text-3xl font-black text-blue-400 mb-1">{dayInfo.day}</p>
                    <p className="text-xl text-gray-300">{formatNumber(dayInfo.count)} mesaj</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Section 5: Comparison */}
      <motion.div
        className="min-h-screen flex items-center justify-center relative overflow-hidden aurora-bg"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        variants={containerVariants}
      >
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />

        <motion.div
          className="relative z-10 text-center max-w-3xl px-8"
          variants={glitchVariants}
          initial="hidden"
          whileInView="visible"
          animate="animate"
          viewport={{ once: false, amount: 0.3 }}
        >
          <motion.h2
            className="text-6xl font-black mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              %{rankings.messageCountPercentile || '—'}
            </span>
          </motion.h2>

          <motion.p
            className="text-3xl text-gray-200 leading-relaxed"
            variants={itemVariants}
          >
            Sunucudaki kullanıcıların <span className="text-green-400 font-bold">daha aktif</span>'sin
          </motion.p>

          <motion.div
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
          >
            <motion.div
              className="bg-gradient-to-br from-blue-900 to-blue-800 p-6 rounded-xl border border-blue-500 border-opacity-30"
              variants={itemVariants}
            >
              <p className="text-gray-400 text-sm mb-2">Mesaj Sıralaması</p>
              <p className="text-4xl font-bold text-blue-300">#{rankings.messageCountRank || '—'}</p>
              <p className="text-xs text-gray-500 mt-2">{formatNumber(stats.total)} mesaj</p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-purple-900 to-purple-800 p-6 rounded-xl border border-purple-500 border-opacity-30"
              variants={itemVariants}
            >
              <p className="text-gray-400 text-sm mb-2">Aktif Günler</p>
              <p className="text-4xl font-bold text-purple-300">{formatNumber(stats.active_days)}</p>
              <p className="text-xs text-gray-500 mt-2">{activityPercentage}% işbirliği</p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-pink-900 to-pink-800 p-6 rounded-xl border border-pink-500 border-opacity-30"
              variants={itemVariants}
            >
              <p className="text-gray-400 text-sm mb-2">Ayakta Tutulan</p>
              <p className="text-4xl font-bold text-pink-300">{social.mentioned_by || 0}</p>
              <p className="text-xs text-gray-500 mt-2">kişi tarafından bahsedilmiş</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Section 6: Share */}
      <motion.div
        id="summary-section"
        className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        variants={containerVariants}
      >
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(59,130,246,0.2) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 80%, rgba(168,85,247,0.2) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(59,130,246,0.2) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        <div className="relative z-10 text-center">
          <motion.h2
            className="text-6xl font-black mb-12 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
            variants={itemVariants}
          >
            Bu Özeti Paylaş
          </motion.h2>

          <motion.button
            onClick={handleShare}
            className="px-12 py-6 text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 rounded-full border-2 border-blue-400 text-white shadow-2xl"
            whileHover={{
              scale: 1.1,
              boxShadow: '0 0 40px rgba(59, 130, 246, 0.8)',
            }}
            whileTap={{ scale: 0.95 }}
            variants={itemVariants}
          >
            🎬 Özeti İndir
          </motion.button>
        </div>
      </motion.div>
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