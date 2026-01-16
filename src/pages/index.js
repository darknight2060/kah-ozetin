import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { motion } from "framer-motion";
import { useState } from "react";

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

export default function Home() {
  const [userId, setUserId] = useState("");

  const handleInputChange = (e) => {
    setUserId(e.target.value);
  };

  const handleSubmit = () => {
    if (userId) {
      window.location.href = `/summary/${userId}`;
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
        className="flex flex-col items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        <input
          type="text"
          placeholder="Discord User ID"
          value={userId}
          onChange={handleInputChange}
          className="p-3 rounded bg-gray-800 text-white mb-4 w-64 text-center"
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded shadow-lg"
        >
          Özetini Gör
        </button>
      </motion.div>
    </motion.div>
  );
}
