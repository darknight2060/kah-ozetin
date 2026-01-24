import Head from 'next/head';
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
  const pageTitle = "Sıralama - Kah Özetin";
  const pageDescription = "Sunucu kullanıcılarının mesaj sayısı, aktivite günü ve ortalama mesaj uzunluğu sıralaması";
  
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
        <span className={`text-3xl font-black min-w-16 text-center ${
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
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Head>
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

      {/* Header / Navigation */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-gray-800 border-opacity-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative flex items-center justify-center">
          <Link href="/">
            <motion.div
              className="absolute left-4 sm:left-6 lg:left-8 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
              whileHover={{ x: -5 }}
            >
              <span className="text-2xl">←</span>
              <span className="hidden sm:inline">Ana Sayfa</span>
            </motion.div>
          </Link>
          <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Sıralama
          </h2>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        className="pt-32 pb-24"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-4 mb-12">
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
          className="max-w-3xl mx-auto px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >

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
      </motion.div>
    </div>
    </>
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
