import fs from 'fs';
import pkg from 'stream-json';  // Importing the default export from stream-json
const { parser } = pkg;

import pickPkg from 'stream-json/filters/Pick.js';  // Importing the default export from Pick.js
const { pick } = pickPkg;

import streamArrayPkg from 'stream-json/streamers/StreamArray.js';  // Importing the default export from StreamArray.js
const { streamArray } = streamArrayPkg;

import streamChainPkg from 'stream-chain';  // Importing the default export from stream-chain
const { chain } = streamChainPkg;

const pipeline = chain([
  fs.createReadStream("raw.json"),
  parser(),
  pick({ filter: "messages" }),
  streamArray()
]);

// =======================
// MAPS
// =======================
const users = {};
const stats = {};
const social = {};
const rankings = {
  message_count: [],
  active_days: [],
  avg_message_length: []
};

function initUser(id, author = {}) {
  if (users[id]) return;

  users[id] = {
    id,
    username: author.name || "unknown",
    avatar_url: author.avatarUrl || null,
    is_bot: author.isBot || false,
    first_seen: null
  };

  stats[id] = {
    total: 0,
    first: null,
    last: null,
    active_days: new Set(),
    hours: {},
    days: {},
    months: {},
    combos: {},
    len_sum: 0,
    max_len: 0,
    min_len: Infinity,
    word_sum: 0,
    question: 0,
    words: {},
    emojis: {}
  };

  social[id] = {
    pinned: [],
    attachments: [],
    reactions_given: {},
    mentions_given: {},
    mentioned_by: 0,
    inline_emojis: {}
  };
}

// =======================
// REGEX
// =======================
const emojiRegex = /\p{Extended_Pictographic}/gu;

// =======================
// LOOP
// =======================
let processed = 0;
const startedAt = Date.now();

pipeline.on("data", ({ value: msg }) => {
  processed++;

  const userId = msg.author?.id;
  if (!userId) return;

  initUser(userId, msg.author);

  const s = stats[userId];
  const so = social[userId];

  // BASIC
  s.total++;

  if (!s.first || msg.timestamp < s.first) s.first = msg.timestamp;
  if (!s.last || msg.timestamp > s.last) s.last = msg.timestamp;

  const d = new Date(msg.timestamp);
  const dayKey = d.toISOString().slice(0, 10);
  s.active_days.add(dayKey);

  const h = d.getHours();
  const day = d.toLocaleDateString("en-US", { weekday: "long" });
  const month = d.toISOString().slice(0, 7);
  const combo = `${day}-${h}`;

  s.hours[h] = (s.hours[h] || 0) + 1;
  s.days[day] = (s.days[day] || 0) + 1;
  s.months[month] = (s.months[month] || 0) + 1;
  s.combos[combo] = (s.combos[combo] || 0) + 1;

  // CONTENT
  if (msg.content) {
    const len = msg.content.length;
    s.len_sum += len;
    s.max_len = Math.max(s.max_len, len);
    s.min_len = Math.min(s.min_len, len);
    if (msg.content.includes("?")) s.question++;

    const words = msg.content
      .toLowerCase()
      .replace(/[^a-zğüşöçı ]/gi, "")
      .split(/\s+/);

    s.word_sum += words.length;
    for (const w of words) {
      if (w.length < 3) continue;
      s.words[w] = (s.words[w] || 0) + 1;
    }

    const emojis = msg.content.match(emojiRegex);
    if (emojis) {
      for (const e of emojis) {
        so.inline_emojis[e] = (so.inline_emojis[e] || 0) + 1;
      }
    }
  }

  // ATTACHMENTS
  if (msg.attachments?.length) {
    for (const a of msg.attachments) {
      if (a.url) so.attachments.push(a.url);
    }
  }

  // PIN
  if (msg.isPinned) so.pinned.push(msg.id);

  // REACTIONS
  if (msg.reactions?.length) {
    for (const r of msg.reactions) {
      const emoji = r.emoji?.name;
      if (!emoji) continue;
      so.reactions_given[emoji] =
        (so.reactions_given[emoji] || 0) + r.count;
    }
  }

  // MENTIONS
  if (msg.mentions?.length) {
    for (const m of msg.mentions) {
      so.mentions_given[m.id] =
        (so.mentions_given[m.id] || 0) + 1;

      initUser(m.id);
      social[m.id].mentioned_by++;
    }
  }

  // PROGRESS
  if (processed % 10000 === 0) {
    const elapsed = (Date.now() - startedAt) / 1000;
    const speed = processed / elapsed;
    process.stdout.write(
      `\r${processed} msg | ${speed.toFixed(0)} msg/s`
    );
  }
});

pipeline.on("end", () => {
  console.log("\nFinalize ediliyor...");

  for (const [id, s] of Object.entries(stats)) {
    rankings.message_count.push({ user_id: id, value: s.total });
    rankings.active_days.push({ user_id: id, value: s.active_days.size });
    rankings.avg_message_length.push({
      user_id: id,
      value: s.len_sum / Math.max(1, s.total)
    });

    s.active_days = s.active_days.size;
  }

  rankings.message_count.sort((a,b)=>b.value-a.value);
  rankings.active_days.sort((a,b)=>b.value-a.value);
  rankings.avg_message_length.sort((a,b)=>b.value-a.value);

  fs.writeFileSync("users.json", JSON.stringify(users));
  fs.writeFileSync("user_stats.json", JSON.stringify(stats));
  fs.writeFileSync("user_social.json", JSON.stringify(social));
  fs.writeFileSync("rankings.json", JSON.stringify(rankings));

  console.log("🚀 HER ŞEY TAMAM");
});
