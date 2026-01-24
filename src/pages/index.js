import { Geist, Geist_Mono } from "next/font/google";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Animation Variants
const blobVariants = {
  animate: {
    x: [0, 100, -50, 0],
    y: [0, -100, 50, 0],
    scale: [1, 1.2, 0.8, 1],
    opacity: [0.3, 0.5, 0.3, 0.3],
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const searchUsers = (query, users) => {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();

  return users
    .filter((user) => {
      if (user.username === "Deleted User" || user.displayName === "Deleted User") {
        return false;
      }

      const id = user.id.toLowerCase();
      const username = user.username.toLowerCase();
      const displayName = user.displayName.toLowerCase();
      const searchKey = user.searchKey.toLowerCase();

      if (
        id === lowerQuery ||
        username === lowerQuery ||
        displayName === lowerQuery ||
        searchKey === lowerQuery
      ) {
        return true;
      }

      return (
        id.includes(lowerQuery) ||
        username.includes(lowerQuery) ||
        displayName.includes(lowerQuery) ||
        searchKey.includes(lowerQuery)
      );
    })
    .slice(0, 10);
};

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    fetch("/search_users.json")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim()) {
      setSuggestions(searchUsers(value, users));
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSearchQuery("");
    setSuggestions([]);
    setIsFocused(false);
  };

  const handleSubmit = async () => {
    if (selectedUser) {
      setIsNavigating(true);
      await router.push(`/summary/${selectedUser.id}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className={`${geistSans.className} ${geistMono.className}`}>
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-black z-0"></div>

      {/* Aurora Blob Elements */}
      <motion.div
        className="fixed top-20 left-10 w-72 h-72 bg-purple-600 rounded-full blur-3xl opacity-20 mix-blend-multiply"
        animate={{
          x: [0, 50, -30, 0],
          y: [0, -80, 40, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="fixed top-40 right-20 w-80 h-80 bg-blue-600 rounded-full blur-3xl opacity-20 mix-blend-multiply"
        animate={{
          x: [0, -60, 40, 0],
          y: [0, 70, -50, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      <motion.div
        className="fixed bottom-40 left-1/3 w-96 h-96 bg-cyan-500 rounded-full blur-3xl opacity-20 mix-blend-multiply"
        animate={{
          x: [0, 80, -50, 0],
          y: [0, 60, -70, 0],
          scale: [1, 1.05, 0.95, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />

      {/* Fixed Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-gray-900/30 border-b border-gray-800/50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <motion.div
            className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"
            whileHover={{ scale: 1.05 }}
          >
            ✨ KAH Özetin
          </motion.div>

          {/* Navigation */}
          <Link href="/leaderboard">
            <motion.button
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🏆 Liderlik Tablosu
            </motion.button>
          </Link>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 min-h-screen flex flex-col">
        {/* Hero Section */}
        <motion.section
          className="flex-1 flex flex-col items-center justify-center pt-20 pb-12 px-4"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Main Title */}
          <motion.div
            className="text-center mb-8"
            variants={itemVariants}
          >
            <motion.h1
              className="text-6xl md:text-7xl font-black mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              Discord Yolculuğunu
            </motion.h1>
            <motion.h2
              className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              ✨ Keşfet ✨
            </motion.h2>
            <motion.p
              className="text-xl text-gray-300 max-w-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Kişisel KAH özetinizi oluşturun ve istatistiklerinizi görün
            </motion.p>
          </motion.div>

          {/* Search Section */}
          <motion.div
            className="w-full max-w-2xl mx-auto"
            variants={itemVariants}
          >
            {!selectedUser ? (
              <>
                {/* Search Container */}
                <motion.div
                  className="relative backdrop-blur-xl bg-gray-900/40 rounded-2xl p-8 border border-gray-700/50 shadow-2xl hover:border-gray-600/50 transition"
                  whileHover={{ borderColor: "rgba(147, 51, 234, 0.3)" }}
                >
                  {/* Input Wrapper */}
                  <div className="relative mb-4">
                    <motion.input
                      type="text"
                      placeholder="Kullanıcı adı, ID, görünen ad veya arama anahtarı..."
                      value={searchQuery}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                      className="w-full px-6 py-4 rounded-xl bg-gray-800/50 text-white placeholder-gray-400 border-2 border-gray-700 focus:border-purple-500 focus:outline-none transition text-lg"
                      whileFocus={{ scale: 1.02 }}
                    />
                    <motion.div
                      className="absolute right-4 top-1/2 transform -translate-y-1/2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      🔍
                    </motion.div>
                  </div>

                  {/* Suggestions Dropdown */}
                  {isFocused && suggestions.length > 0 && (
                    <motion.div
                      className="absolute top-full left-8 right-8 mt-2 bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {suggestions.map((user, index) => (
                        <motion.div
                          key={user.id}
                          className="px-6 py-3 border-b border-gray-700/30 last:border-b-0 hover:bg-purple-600/20 cursor-pointer flex items-center gap-4 transition group"
                          onClick={() => handleSelectUser(user)}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ x: 10 }}
                        >
                          <img
                            src={user.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                            alt={user.displayName}
                            className="w-10 h-10 rounded-full border border-purple-500/50"
                            onError={(e) => {
                              e.currentTarget.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
                            }}
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-white group-hover:text-purple-300 transition">
                              {user.displayName}
                            </div>
                            <div className="text-sm text-gray-400">@{user.username}</div>
                          </div>
                          <div className="text-gray-500">→</div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}

                  {/* Empty State */}
                  {isFocused && searchQuery.trim() && suggestions.length === 0 && (
                    <motion.div
                      className="absolute top-full left-8 right-8 mt-2 bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl z-50 p-6 text-center"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <p className="text-gray-400">Kullanıcı bulunamadı</p>
                    </motion.div>
                  )}
                </motion.div>
              </>
            ) : null}

            {/* Selected User Card */}
            {selectedUser && (
              <motion.div
                className="mt-6 backdrop-blur-xl bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-xl p-4 border border-purple-500/50 flex items-center gap-4"
                initial={{ opacity: 0, y: -10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={selectedUser.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                  alt={selectedUser.displayName}
                  className="w-12 h-12 rounded-full border border-purple-500/50"
                  onError={(e) => {
                    e.currentTarget.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
                  }}
                />
                <div className="flex-1">
                  <div className="font-semibold text-white">{selectedUser.displayName}</div>
                  <div className="text-sm text-gray-400">@{selectedUser.username}</div>
                </div>
                <motion.button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-white transition"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>
              </motion.div>
            )}

            {/* Search Button */}
            <motion.button
              onClick={handleSubmit}
              disabled={!selectedUser || isNavigating}
              className={`w-full mt-6 px-8 py-4 rounded-xl font-bold text-lg transition transform ${
                selectedUser && !isNavigating
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:shadow-2xl hover:shadow-purple-500/50'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
              whileHover={selectedUser && !isNavigating ? { scale: 1.05 } : {}}
              whileTap={selectedUser && !isNavigating ? { scale: 0.95 } : {}}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {isNavigating ? (
                <motion.div
                  className="flex items-center justify-center gap-2"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <div className="w-4 h-4 border-2 border-purple-300 border-t-white rounded-full animate-spin" />
                  Yükleniyor...
                </motion.div>
              ) : '✨ Özetimi Oluştur'}
            </motion.button>
          </motion.div>

          {/* Info Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {/* Card 1 */}
            <motion.div
              className="backdrop-blur-xl bg-gradient-to-br from-purple-600/20 to-purple-600/5 rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/50 transition"
              whileHover={{ y: -10, borderColor: "rgba(168, 85, 247, 0.5)" }}
            >
              <div className="text-4xl mb-3">💬</div>
              <h3 className="text-xl font-bold text-white mb-2">Mesajlar</h3>
              <p className="text-gray-400">Gönderdiğin toplam mesajları ve istatistiklerini görüntüle</p>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              className="backdrop-blur-xl bg-gradient-to-br from-cyan-600/20 to-cyan-600/5 rounded-2xl p-6 border border-cyan-500/20 hover:border-cyan-500/50 transition"
              whileHover={{ y: -10, borderColor: "rgba(34, 211, 238, 0.5)" }}
            >
              <div className="text-4xl mb-3">⏰</div>
              <h3 className="text-xl font-bold text-white mb-2">Aktivite</h3>
              <p className="text-gray-400">En aktif saatlerini ve günlerini analiz et</p>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              className="backdrop-blur-xl bg-gradient-to-br from-pink-600/20 to-pink-600/5 rounded-2xl p-6 border border-pink-500/20 hover:border-pink-500/50 transition"
              whileHover={{ y: -10, borderColor: "rgba(236, 72, 153, 0.5)" }}
            >
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-xl font-bold text-white mb-2">İstatistikler</h3>
              <p className="text-gray-400">Detaylı veriler ve çıkarımlarla sunucudaki rolünü keşfet</p>
            </motion.div>
          </motion.div>
        </motion.section>
      </main>
    </div>
  );
}
