import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, useCallback } from 'react';
import { formatNumber } from '@/lib/formatters';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

const CHUNK_SIZE = 15;

export default function LeaderboardPage({ initialData }) {
  const [data, setData] = useState({
    message_count: initialData?.items || [],
    active_days: [],
    avg_message_length: [],
  });
  const [activeTab, setActiveTab] = useState('message_count');
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState({
    message_count: initialData?.pagination?.hasMore || true,
    active_days: true,
    avg_message_length: true,
  });
  const [page, setPage] = useState({
    message_count: 2,
    active_days: 2,
    avg_message_length: 2,
  });
  const observerTarget = useRef(null);

  const fetchMore = useCallback(async () => {
    if (loading || !hasMore[activeTab]) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/leaderboard?type=${activeTab}&page=${page[activeTab]}&limit=${CHUNK_SIZE}`
      );
      const result = await response.json();

      if (result.items) {
        setData(prev => ({
          ...prev,
          [activeTab]: [...prev[activeTab], ...result.items],
        }));
        setHasMore(prev => ({
          ...prev,
          [activeTab]: result.pagination.hasMore,
        }));
        setPage(prev => ({
          ...prev,
          [activeTab]: result.pagination.currentPage + 1,
        }));
      }
    } catch (error) {
      console.error('Error loading more items:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, hasMore, loading]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore[activeTab] && !loading) {
          fetchMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [fetchMore, hasMore, activeTab, loading]);

  // Reset pagination when tab changes
  useEffect(() => {
    if (!data[activeTab] || data[activeTab].length === 0) {
      const loadFirstPage = async () => {
        setLoading(true);
        try {
          const response = await fetch(
            `/api/leaderboard?type=${activeTab}&page=1&limit=${CHUNK_SIZE}`
          );
          const result = await response.json();
          if (result.items) {
            setData(prev => ({
              ...prev,
              [activeTab]: result.items,
            }));
            setHasMore(prev => ({
              ...prev,
              [activeTab]: result.pagination.hasMore,
            }));
            setPage(prev => ({
              ...prev,
              [activeTab]: 2,
            }));
          }
        } catch (error) {
          console.error('Error loading first page:', error);
        } finally {
          setLoading(false);
        }
      };
      loadFirstPage();
    }
  }, [activeTab]);

  if (!initialData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center text-white">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold">
          Sıralama yüklenemedi
        </motion.div>
      </div>
    );
  }

  const RankingItem = ({ item, metric }) => {
    const isTopThree = item.rank <= 3;
    const medals = ['🥇', '🥈', '🥉'];
    const avatarUrl = item.user?.avatar_url 
      ? item.user.avatar_url.replace('?size=512', '?size=64')
      : 'https://cdn.discordapp.com/embed/avatars/0.png';

    return (
      <motion.div
        className={`flex items-center gap-4 p-4 rounded-2xl backdrop-blur-sm transition-all ${
          isTopThree
            ? 'bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 hover:border-yellow-500/50'
            : 'bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 hover:border-blue-500/40'
        }`}
        variants={itemVariants}
      >
        <span className={`text-3xl font-black w-10 text-center ${
          isTopThree ? 'text-yellow-400' : 'text-gray-400'
        }`}>
          {isTopThree ? medals[item.rank - 1] : `#${item.rank}`}
        </span>

        <Image
          src={avatarUrl}
          alt={item.user?.username || 'User avatar'}
          width={40}
          height={40}
          className="rounded-full object-cover flex-shrink-0 border border-blue-400/30"
          unoptimized={true}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
          }}
        />

        <Link href={`/summary/${item.user_id}`}>
          <div className="flex-1 hover:text-blue-300 transition-colors cursor-pointer">
            <p className="font-semibold text-white group-hover:text-blue-300">{item.user?.username || item.user_id}</p>
            <p className="text-xs text-gray-500">{item.user?.id}</p>
          </div>
        </Link>

        <div className="text-right">
          <p className={`font-bold text-lg ${
            isTopThree ? 'text-yellow-300' : 'text-blue-300'
          }`}>
            {formatNumber(item.value)}
          </p>
          <p className="text-xs text-gray-500">{metric}</p>
        </div>
      </motion.div>
    );
  };

  const tabConfig = [
    { id: 'message_count', label: '💬 Mesaj Sayısı', metric: 'mesaj', gradient: 'from-blue-600 to-blue-400' },
    { id: 'active_days', label: '📅 Aktif Günler', metric: 'gün', gradient: 'from-purple-600 to-purple-400' },
    { id: 'avg_message_length', label: '📝 Ort. Mesaj Uzunluğu', metric: 'karakter', gradient: 'from-pink-600 to-pink-400' },
  ];

  const activeTabConfig = tabConfig.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white overflow-hidden">
      <style>{`
        @keyframes aurora {
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
        .glassmorphism {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>

      {/* Header */}
      <motion.div
        className="min-h-[50vh] flex flex-col items-center justify-center relative overflow-hidden aurora-bg pt-20"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 z-0"
          animate={{ y: [0, 50, 0], x: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 z-0"
          animate={{ y: [0, -50, 0], x: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative z-10 text-center space-y-4">
          <motion.h1
            className="text-6xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
            variants={itemVariants}
          >
            Sıralama
          </motion.h1>

          <motion.p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto" variants={itemVariants}>
            Sunucudaki en aktif kullanıcılar
          </motion.p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <motion.div 
          className="flex flex-wrap gap-3 justify-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {tabConfig.map((tab, idx) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg`
                  : 'glassmorphism text-gray-300 hover:text-white'
              }`}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tab.label}
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Main Content */}
      <motion.div
        className="max-w-3xl mx-auto px-4 pb-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Tab Title Card */}
        <motion.div
          className="glassmorphism rounded-2xl p-6 mb-8"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-3xl font-bold bg-gradient-to-r ${activeTabConfig.gradient} bg-clip-text text-transparent`}>
                {activeTabConfig.label}
              </h2>
              <p className="text-gray-400 mt-2">
                Sonsuz kaydırma ile tüm sıralamayı keşfedin
              </p>
            </div>
          </div>
        </motion.div>

        {/* Rankings List */}
        <motion.div
          className="space-y-3"
          initial={false}
          animate="visible"
          variants={containerVariants}
        >
          {data[activeTab].map((item) => (
            <RankingItem
              key={`${item.user_id}-${item.rank}`}
              item={item}
              metric={activeTabConfig.metric}
            />
          ))}
        </motion.div>

        {/* Loading indicator */}
        {loading && (
          <motion.div 
            className="flex justify-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`w-10 h-10 border-4 bg-gradient-to-r ${activeTabConfig.gradient} rounded-full`}
              style={{
                borderImage: `linear-gradient(to right, rgb(59, 130, 246), rgb(168, 85, 247)) 1`,
              }}
            />
          </motion.div>
        )}

        {/* Intersection observer target */}
        <motion.div 
          ref={observerTarget} 
          className="py-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {!hasMore[activeTab] && data[activeTab].length > 0 && (
            <p className="text-gray-500 text-lg">✨ Tüm sıralamalar yüklendi ✨</p>
          )}
          {!loading && data[activeTab].length === 0 && (
            <p className="text-gray-500 text-lg">Veri yükleniyor...</p>
          )}
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.div
        className="flex items-center justify-center py-12 border-t border-gray-700/30"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Link href="/">
          <motion.div 
            className="text-gray-400 hover:text-blue-400 transition-colors text-sm cursor-pointer flex items-center gap-2"
            whileHover={{ x: -5 }}
          >
            ← Ana Sayfaya Dön
          </motion.div>
        </Link>
      </motion.div>
    </div>
  );
}

export async function getStaticProps() {
  try {
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.VERCEL_URL || 'localhost:3000';
    
    const response = await fetch(
      `${protocol}://${host}/api/leaderboard?type=message_count&page=1&limit=15`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch initial data');
    }

    const initialData = await response.json();

    return {
      props: {
        initialData,
      },
      revalidate: 3600,
    };
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    return {
      props: {
        initialData: null,
      },
      revalidate: 60,
    };
  }
}
