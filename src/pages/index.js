import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const searchUsers = (query, users) => {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();
  
  return users.filter((user) => {
    const id = user.id.toLowerCase();
    const username = user.username.toLowerCase();
    const displayName = user.displayName.toLowerCase();
    const searchKey = user.searchKey.toLowerCase();

    // Tam eşleşme önceliği
    if (
      id === lowerQuery ||
      username === lowerQuery ||
      displayName === lowerQuery ||
      searchKey === lowerQuery
    ) {
      return true;
    }

    // Kısmi eşleşme
    return (
      id.includes(lowerQuery) ||
      username.includes(lowerQuery) ||
      displayName.includes(lowerQuery) ||
      searchKey.includes(lowerQuery)
    );
  }).slice(0, 10); // En fazla 10 sonuç
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleSelectUser = (userId) => {
    window.location.href = `/summary/${userId}`;
  };

  const handleSubmit = () => {
    if (searchQuery.trim()) {
      const results = searchUsers(searchQuery, users);
      if (results.length > 0) {
        handleSelectUser(results[0].id);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <motion.div
      className={`${geistSans.className} ${geistMono.className} min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h1
        className="text-5xl font-extrabold mb-6 text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        Sunucu Özetin Hazır
      </motion.h1>
      <motion.p
        className="text-lg mb-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        Discord’daki yolculuğunu keşfet.
      </motion.p>
      <motion.div
        className="flex flex-col items-center w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Kullanıcı adı, ID, görünen ad veya arama anahtarı"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className="p-3 rounded bg-gray-800 text-white w-full text-center border border-gray-700 focus:border-blue-500 outline-none transition"
          />
          
          {/* Öneriler Dropdown */}
          {suggestions.length > 0 && (
            <motion.div
              className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded shadow-lg z-50"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {suggestions.map((user) => (
                <motion.div
                  key={user.id}
                  className="p-3 border-b border-gray-700 last:border-b-0 hover:bg-gray-700 cursor-pointer flex items-center gap-3 transition"
                  onClick={() => handleSelectUser(user.id)}
                  whileHover={{ paddingLeft: "1rem" }}
                >
                  {user.avatar && (
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div className="flex-1 text-left">
                    <div className="font-semibold">{user.displayName}</div>
                    <div className="text-sm text-gray-400">@{user.username}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded shadow-lg transition"
        >
          Özetini Gör
        </button>
      </motion.div>
    </motion.div>
  );
}
