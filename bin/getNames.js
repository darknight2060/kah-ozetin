const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');

// Botunuzun gerekli izinleri
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

// --- AYARLAR ---
const CONFIG = {
    TOKEN: 'TOKEN',
    GUILD_ID: '678941546464280576', // Ortak sunucunuz varsa buraya girin (hızlandırır)
    INPUT_FILE: './users.json',    // Sendeki ID listesi
    OUTPUT_FILE: './search_users.json',
    DELAY_MS: 1200 // Her API isteği arası bekleme (Güvenli bölge: 1000ms+)
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

client.once('ready', async () => {
    console.log(`✅ ${client.user.tag} devrede!`);

    // 1. Dosyayı Oku
    let rawData;
    try {
        rawData = JSON.parse(fs.readFileSync(CONFIG.INPUT_FILE, 'utf8'));
    } catch (e) {
        console.error("❌ users.json okunamadı!");
        process.exit();
    }

    const userIds = Object.keys(rawData);
    // Veriyi Array (Liste) olarak tutacağız, Object değil.
    // Sebebi: Aynı DisplayName'e sahip birden fazla kişi olabilir.
    const validUsers = [];
    
    // 2. Sunucu Önbelleğini Çek (Varsa hızlandırır)
    let guildMembers = new Map();
    try {
        const guild = await client.guilds.fetch(CONFIG.GUILD_ID);
        console.log("📥 Sunucu üyeleri önbelleğe alınıyor...");
        guildMembers = await guild.members.fetch();
        console.log(`✅ ${guildMembers.size} sunucu üyesi önbellekte.`);
    } catch (e) {
        console.log("⚠️ Sunucu ID girilmedi veya bot sunucuda değil. Tamamı API'den çekilecek (Yavaş Mod).");
    }

    console.log(`🚀 Toplam ${userIds.length} ID taranacak...`);

    // 3. Döngü Başlasın
    for (let i = 0; i < userIds.length; i++) {
        const id = userIds[i];
        let userObj = null;
        let source = "";

        // A) Önce sunucuda var mı diye bak (Hızlı ve Sınırsız)
        if (guildMembers.has(id)) {
            const member = guildMembers.get(id);
            userObj = {
                user: member.user,
                displayName: member.displayName // Sunucu içi takma adı
            };
            source = "Cache";
        } 
        // B) Yoksa API'den çek (Yavaş ve Limitli)
        else {
            try {
                const user = await client.users.fetch(id);
                userObj = {
                    user: user,
                    displayName: user.globalName || user.username // Global görünen adı
                };
                source = "API";
                
                // Rate Limit yememek için bekle
                await sleep(CONFIG.DELAY_MS); 

            } catch (err) {
                // Eğer kullanıcı silinmişse veya bulunamazsa buraya düşer
                // err.code === 10013 (Unknown User) genelde silinenler içindir
                console.log(`Skipped (Deleted/Unknown): ${id}`);
                continue; // Döngünün başına dön, bu kişiyi kaydetme
            }
        }

        // C) Veriyi Formatla ve Listeye Ekle
        if (userObj) {
            const { user, displayName } = userObj;
            
            // Eğer display name yoksa username kullan
            const finalName = displayName || user.username;

            validUsers.push({
                id: user.id,
                username: user.username,
                displayName: finalName,
                // Arama için normalize edilmiş (küçük harfli) isim:
                searchKey: finalName.toLowerCase().replace(/\s+/g, ''), 
                avatar: user.displayAvatarURL({ extension: 'png', size: 512 }),
                isBot: user.bot
            });

            console.log(`[${i+1}/${userIds.length}] ${source} -> ${finalName}`);
        }

        // Her 50 kişide bir dosyaya yaz (Elektrik giderse veri kaybolmasın)
        if (i % 50 === 0) fs.writeFileSync(CONFIG.OUTPUT_FILE, JSON.stringify(validUsers, null, 2));
    }

    // Final Kayıt
    fs.writeFileSync(CONFIG.OUTPUT_FILE, JSON.stringify(validUsers, null, 2));
    console.log(`🎉 İşlem bitti! Toplam ${validUsers.length} geçerli kullanıcı kaydedildi.`);
    process.exit();
});

client.login(CONFIG.TOKEN);