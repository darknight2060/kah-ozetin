import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { getAllRankings, getUsersForLeaderboard } from '@/lib/dataLoader';
import { formatNumber } from '@/lib/formatters';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function LeaderboardPage({ rankings, users }) {
  if (!rankings || !users) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center text-white">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold">
          Sıralama yüklenemedi
        </motion.div>
      </div>
    );
  }

  const RankingCard = ({ title, icon, data, metric }) => (
    <motion.div
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 border-opacity-50"
      variants={itemVariants}
    >
      <div className="flex items-center gap-3 mb-8">
        <span className="text-4xl">{icon}</span>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>

      <div className="space-y-4">
        {data.slice(0, 10).map((item, index) => {
          const user = users[item.user_id];
          const isTopThree = index < 3;
          const medals = ['🥇', '🥈', '🥉'];

          return (
            <motion.div
              key={item.user_id}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                isTopThree
                  ? 'bg-gradient-to-r from-yellow-900 to-yellow-800 border border-yellow-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              whileHover={{ x: 5 }}
            >
              <span className="text-2xl font-bold text-gray-400 w-8">
                {isTopThree ? medals[index] : `#${index + 1}`}
              </span>

              {user?.avatar_url && (
                <Image
                  src={user.avatar_url.replace('?size=512', '?size=64')}
                  alt={user.username}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}

              <Link href={`/summary/${item.user_id}`}>
                <div className="flex-1 hover:text-blue-400 transition-colors cursor-pointer">
                  <p className="font-semibold text-white">{user?.username || item.user_id}</p>
                  <p className="text-xs text-gray-400">{user?.id}</p>
                </div>
              </Link>

              <div className="text-right">
                <p className="font-bold text-lg text-white">{formatNumber(item.value)}</p>
                <p className="text-xs text-gray-400">{metric}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white overflow-hidden">
      <style>{`
        @keyframes aurora {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .aurora-bg {
          background: linear-gradient(-45deg, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1), rgba(59, 130, 246, 0.1));
          background-size: 400% 400%;
          animation: aurora 15s ease infinite;
        }
      `}</style>

      {/* Header */}
      <motion.div
        className="min-h-[60vh] flex flex-col items-center justify-center relative overflow-hidden aurora-bg pt-20"
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

        <div className="relative z-10 text-center">
          <motion.h1
            className="text-7xl md:text-8xl font-black mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
            variants={itemVariants}
          >
            Sıralama
          </motion.h1>

          <motion.p className="text-2xl text-gray-300 max-w-2xl" variants={itemVariants}>
            Sunucudaki en aktif kullanıcılar
          </motion.p>
        </div>
      </motion.div>

      {/* Rankings Grid */}
      <motion.div
        className="max-w-7xl mx-auto px-4 py-24 grid grid-cols-1 lg:grid-cols-3 gap-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.1 }}
        variants={containerVariants}
      >
        <RankingCard
          title="Mesaj Sayısı"
          icon="💬"
          data={rankings.message_count}
          metric="mesaj"
        />

        <RankingCard
          title="Aktif Günler"
          icon="📅"
          data={rankings.active_days}
          metric="gün"
        />

        <RankingCard
          title="Ort. Mesaj Uzunluğu"
          icon="📝"
          data={rankings.avg_message_length}
          metric="karakter"
        />
      </motion.div>

      {/* Footer */}
      <motion.div
        className="flex items-center justify-center py-12 border-t border-gray-700 border-opacity-50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Link href="/">
          <div className="text-gray-400 hover:text-blue-400 transition-colors text-sm cursor-pointer">
            ← Ana Sayfaya Dön
          </div>
        </Link>
      </motion.div>
    </div>
  );
}

export async function getStaticProps() {
  try {
    const [rankings, users] = await Promise.all([
      getAllRankings(),
      getUsersForLeaderboard(),
    ]);

    if (!rankings || !users) {
      return {
        notFound: true,
        revalidate: 3600,
      };
    }

    return {
      props: {
        rankings,
        users,
      },
      revalidate: 3600, // ISR - revalidate every hour
    };
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    return {
      notFound: true,
      revalidate: 60,
    };
  }
}
