import Image from 'next/image';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { useEffect, useState } from 'react';

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
        link.download = 'sunucu-ozetin.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

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
          {userData.discord?.avatar && (
            <motion.div
              className="glow-text rounded-full overflow-hidden"
              whileHover={{ scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Image
                src={userData.discord.avatar}
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
          {userData.discord?.displayName || userData.discord?.username || userData.user.username}
        </motion.h1>

        <motion.p
          className="text-2xl text-gray-400 mt-4 font-light"
          variants={itemVariants}
        >
          @{userData.discord?.username || userData.user.username}
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
              {userData.activity.total_messages}
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
              {userData.time_patterns.most_active_hour}:00
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
              {userData.time_patterns.most_active_day}
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
              {userData.message_style.average_length}
              <span className="text-3xl text-gray-400 ml-2">karakter</span>
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-12">
            <p className="text-2xl text-gray-400 mb-4">En Çok Kullandığın Kelimeler</p>
            <div className="flex flex-wrap gap-4">
              {userData.message_style.top_words.map((word, idx) => (
                <motion.span
                  key={idx}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full text-xl font-bold"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring' }}
                >
                  {word}
                </motion.span>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <p className="text-2xl text-gray-400 mb-4">En Çok Kullandığın Emojiler</p>
            <div className="flex flex-wrap gap-4">
              {userData.message_style.top_emojis.map((emoji, idx) => (
                <motion.span
                  key={idx}
                  className="text-6xl"
                  whileHover={{ scale: 1.3, rotate: 10 }}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
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
              %{userData.comparison.activity_percentile}
            </span>
          </motion.h2>

          <motion.p
            className="text-3xl text-gray-200 leading-relaxed"
            variants={itemVariants}
          >
            Sunucudaki kullanıcıların <span className="text-green-400 font-bold">daha aktif</span>'sin
          </motion.p>
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

export async function getServerSideProps(context) {
  const { userId } = context.params;

  // Fetch user data (replace with actual API call)
  const res = await fetch(`http://localhost:3000/api/summary/${userId}`);
  const userData = await res.json();

  return {
    props: {
      userData,
    },
  };
}