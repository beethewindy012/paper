// index.js (v5.4 - Full Feature Integration & Fix Daily & Fix Shop Interaction - ĐÃ FIX LỖI UUID)

require('dotenv').config();
const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    StringSelectMenuBuilder, 
    Events 
} = require('discord.js');
const { v4: uuidv4 } = require('uuid'); // Đảm bảo đã import uuidv4
const { GoogleGenerativeAI } = require('@google/generative-ai'); 
const fetch = require('node-fetch');
const { Player } = require('discord-player');
const { joinVoiceChannel } = require('@discordjs/voice');
// Import Utils
const { 
    loadUserData, saveUserData, getUserData, formatMoney, getRandomResult, performTransaction, getItemData, 
    SHOP_ITEMS, ALL_SHOP_ITEMS, ALL_HARVEST_ITEMS, COMMAND_TO_TOOL_TYPE, 
    FISH_RATES, MINERAL_RATES, HUNT_RATES, CURRENCY_EMOJI, CURRENCY_NAME 
} = require('./utils'); // Đảm bảo file utils.js của bạn có đủ các exports này

// --- CẤU HÌNH BOT ---
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
    ] 
});
// --- KHỞI TẠO DISCORD-PLAYER ---
const player = new Player(client, {
    ytdlOptions: {
        quality: 'highestaudio',
        highWaterMark: 1 << 25
    }
});
player.on('error', (queue, error) => {
    console.log(`[${queue.guild.name}] Lỗi hàng đợi: ${error.message}`);
});
player.on('trackStart', (queue, track) => {
    queue.metadata.channel.send(`🎶 **Đang phát:** **${track.title}** \`${track.duration}\``);
});

const token = process.env.DISCORD_TOKEN; 
const prefix = process.env.BOT_PREFIX || 'a'; 

// --- CẤU HÌNH AI (GEMINI) ---
const geminiApiKey = process.env.GEMINI_API_KEY; 
let geminiModel;
const BOT_PERSONA = "Bạn là Arisuki, một bot Discord vui tính, hữu ích và hơi 'lầy lội'. Bạn thích dùng emoji khi nói chuyện. Bạn sử dụng tiền tệ là Alluminium.";

if (geminiApiKey) {
    try {
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        geminiModel = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            systemInstruction: BOT_PERSONA
        });
        console.log("✅ Gemini AI (v2.5-flash) đã kích hoạt.");
    } catch (e) {
        console.error("❌ Lỗi cấu hình Gemini:", e.message);
    }
} else {
    console.warn("⚠️ Thiếu GEMINI_API_KEY trong file .env");
}

// =================================================================================================
// HẰNG SỐ & CONFIG
// =================================================================================================

const COOLDOWNS = {
    daily: 86400000, // 24 giờ
    fish: 30000, mine: 30000, hunt: 30000,
    slot: 10000, coinflip: 5000, dice: 5000, blackjack: 5000,
    rob: 3600000, smuggle: 3600000, work: 3600000,
    beg: 300000, cook: 1800000, exercise: 1800000, quest: 60000,
};

const REWARDS = {
    daily: { min: 50000, max: 100000 },
    rob: { min: 100000, max: 500000 }, 
};

// Animations, Emojis & GIFs
const ANIMATIONS = {
    fish: '<a:Minecraft_Fish7_1398953138211524:1440570905288773632>',
    mine: '<a:yb_mine_1306274187375018024:1440571233266827274>',
    hunt: '<:hunting:1448274240469073973>',
    slot: '<a:slots:1448273244531458241>', 
    dice: '<a:dice:1448159179528343596>', 
    coin: '<a:coinflip:1448158671111585893>', 
    cook: '<a:cooking:1448517416161378406>',
    shop: '<a:store:1448273829049798798>',
};

// CẬP NHẬT/THÊM GIFS MỚI
const INTERACTION_GIFS = {
    kiss: ['https://i.pinimg.com/originals/6c/05/e5/6c05e58405258b50711b84ac9db7441a.gif', 'https://i.pinimg.com/originals/9c/be/bf/9cbebfb852e76c2b8d9c3b72ae08e68f.gif'],
    hug: ['https://i.pinimg.com/originals/df/19/60/df19606f757f1fae5b948b733500aed7.gif', 'https://i.pinimg.com/originals/16/f4/ef/16f4ef8659534c88264670265e2a1626.gif'],
    slap: ['https://i.pinimg.com/originals/e8/f8/80/e8f880b13c17d61810ac381b2f6a93c3.gif', 'https://i.pinimg.com/originals/8f/52/09/8f52096d6a1a333ece0fcc501eec106c.gif'],
    holdhand: ['https://i.pinimg.com/originals/90/ed/e4/90ede4e5c1f8f422bb110c34289177f0.gif', 'https://i.pinimg.com/originals/b9/7c/3b/b97c3bf7842833f7a735db8df9503eec.gif'],
};

const GIVE_GIFS = [
    'https://i.pinimg.com/originals/c2/1f/ae/c21fae9669a0cee6becc052bc29ce2d4.gif',
    'https://i.pinimg.com/originals/28/e3/74/28e3740536608f9d4aa86a4d8b6d57ae.gif',
];

const PROFILE_GIFS = [
    'https://i.pinimg.com/originals/ad/b1/36/adb1369ef666bf42fd3d9308bac97e5d.gif',
    'https://i.pinimg.com/originals/7f/26/95/7f2695dcff03e836112f8ff76a832a82.gif',
];

const DIVORCE_GIFS = [
    'https://i.pinimg.com/originals/6b/d7/38/6bd73801b4f4eff060238e39a523505f.gif',
    'https://i.pinimg.com/originals/36/25/06/362506108c27897e87b08096372180f3.gif',
];

const MARRY_GIFS = [
    'https://i.pinimg.com/originals/e0/fd/89/e0fd8906b1b9c1e6909a6e1c535c4230.gif',
    'https://i.pinimg.com/originals/48/6f/af/486faf25abd095ece04994a805e565c2.gif',
];

// =================================================================================================
// HÀM HỖ TRỢ (HELPER FUNCTIONS)
// =================================================================================================

function createEmbed(author, title, description, color = 0x3498db) {
    return new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setDescription(String(description || '...'))
        .setFooter({ text: `Yêu cầu bởi ${author.username}`, iconURL: author.displayAvatarURL() })
        .setTimestamp();
}

function checkCooldown(userData, command) {
    const lastUsed = userData[`${command}LastUsed`] || 0;
    const cooldownTime = COOLDOWNS[command] || 0;
    const timeElapsed = Date.now() - lastUsed;
    if (timeElapsed < cooldownTime) return cooldownTime - timeElapsed;
    return null;
}

function formatTime(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor((s % 3600) / 60);
    const h = Math.floor(s / 3600);
    if (h > 0) return `${h} giờ ${m} phút`;
    if (m > 0) return `${m} phút ${s % 60} giây`;
    return `${s} giây`;
}

// Lấy 1 item từ Shop hoặc Harvest
function findItem(identifier) {
    return ALL_SHOP_ITEMS.find(i => String(i.id) === identifier || i.name.toLowerCase() === identifier.toLowerCase().replace(/_/g, ' ')) ||
           ALL_HARVEST_ITEMS.find(i => String(i.id) === identifier || i.name.toLowerCase() === identifier.toLowerCase().replace(/_/g, ' '));
}

// =================================================================================================
// XỬ LÝ LỆNH (COMMAND HANDLERS)
// =================================================================================================

// 1. BALANCE (COINS, CASH)
async function handleBalance(message, usersData) {
    let target = message.mentions.users.first() || message.author;
    let data = getUserData(target.id, usersData);
    
    const embed = new EmbedBuilder()
        .setColor(0xFFD700)
        .setAuthor({ name: `Ví tiền của ${target.username}`, iconURL: target.displayAvatarURL() })
        .setDescription(`Hiện đang sở hữu:\n# **${formatMoney(data.cash)}** ${CURRENCY_EMOJI}\n*(${CURRENCY_NAME})*`)
        .addFields(
            { name: '💰 Ví Tiền', value: `\`${formatMoney(data.cash)}\``, inline: true },
            { name: '🎒 Túi đồ', value: `Gõ \`${prefix}inv\` để kiểm tra`, inline: true }
        );

    message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
}

// 2. DAILY REWARD
async function handleDaily(message, userData, usersData) {
    const cd = checkCooldown(userData, 'daily');
    if (cd) return message.reply(`⏳ Đừng tham lam! Đợi **${formatTime(cd)}** nữa để nhận Daily.`);

    const reward = Math.floor(Math.random() * (REWARDS.daily.max - REWARDS.daily.min + 1)) + REWARDS.daily.min;
    
    performTransaction(userData, reward);
    userData.dailyLastUsed = Date.now();
    saveUserData(usersData);

    message.reply({ 
        embeds: [createEmbed(message.author, '🎁 Phần Thưởng Hàng Ngày', 
        `Bạn nhận được **${formatMoney(reward)}** ${CURRENCY_EMOJI} từ Daily!`, 
        0xf1c40f)] 
    });
}

// 3. SERVER LIST
async function handleServers(message) {
    const guilds = [...client.guilds.cache.values()];
    const totalMembers = guilds.reduce((acc, g) => acc + (g.memberCount || 0), 0);
    
    const sortedGuilds = guilds.sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0)).slice(0, 10);
    
    let desc = `🤖 **Tổng quan hệ thống**\n` +
               `• Số lượng Server: \`${guilds.length}\`\n` +
               `• Tổng cư dân: \`${totalMembers.toLocaleString()}\`\n\n` +
               `**🏆 Top 10 Server đông nhất:**\n`;

    sortedGuilds.forEach((g, i) => {
        desc += `**${i + 1}. ${g.name}** — 👥 ${g.memberCount || 0}\n`;
    });

    if (guilds.length > 10) desc += `\n*...và ${guilds.length - 10} server khác.*`;

    message.reply({ embeds: [createEmbed(message.author, '🌐 Danh Sách Máy Chủ', desc, 0x5865F2)] });
}

// 4. AI CHAT (GEMINI)
async function handleGPT(message, args) {
    // 💥 FIX LỖI: Kiểm tra args có tồn tại và có nội dung không
    if (!args || args.length === 0 || args.join(' ').trim() === '') { // <<<<<< ĐÃ SỬA: Thêm kiểm tra nội dung rỗng
        return message.reply(`Sử dụng: \`${prefix}ai <câu hỏi>\` hoặc tag bot để hỏi.`);
    }

    if (!geminiModel) { // <<<<<< ĐÃ SỬA: Thay 'ai' bằng 'geminiModel'
        return message.reply('❌ Gemini AI chưa được cấu hình. Vui lòng thêm GEMINI_API_KEY vào file .env.');
    }

    const prompt = args.join(' ');
    
    // Giới hạn độ dài prompt để tránh lạm dụng
    if (prompt.length > 500) {
        return message.reply('Vui lòng giới hạn câu hỏi dưới 500 ký tự.');
    }

    try {
        await message.channel.sendTyping();

        // Xóa logic cũ (lỗi ReferenceError: ai is not defined)
        // const chat = ai.getGenerativeModel({ model: aiModel }).startChat();
        // const response = await chat.sendMessage({ message: prompt });
        
        // <<<<<< ĐÃ SỬA: Dùng generateContent trực tiếp trên geminiModel đã cấu hình
        const response = await geminiModel.generateContent(prompt); 

        let responseText = response.text.trim();

        if (responseText.length > 2000) {
            responseText = responseText.substring(0, 1997) + '...';
        }

        const embed = new EmbedBuilder()
            .setColor(0x34A853) // Màu xanh Google
            .setTitle('🧠 Trợ lý Gemini AI')
            .setDescription(responseText)
            .setFooter({ text: `Yêu cầu bởi ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        message.reply({ embeds: [embed] });

    } catch (error) {
        console.error('Gemini Error:', error);
        message.reply('❌ Đã xảy ra lỗi khi liên hệ với Gemini AI.');
    }
}

// 5. CÔNG VIỆC (WORK, COOK, EXERCISE)
async function handleWork(message, cmd, userData, usersData) {
    const cd = checkCooldown(userData, cmd);
    if (cd) return message.reply(`⏳ Đang mệt! Nghỉ ngơi thêm **${formatTime(cd)}**.`);

    let amount = 0, text = '', emoji = '';
    
    switch (cmd) {
        case 'work':
            amount = Math.floor(Math.random() * 5000) + 1000;
            text = `Bạn làm việc cật lực tại văn phòng và nhận lương **${formatMoney(amount)}** ${CURRENCY_EMOJI}.`;
            emoji = '💼';
            break;
        case 'cook':
            amount = Math.floor(Math.random() * 3000) + 500;
            text = `${ANIMATIONS.cook} Bạn đã nấu một món ăn tuyệt hảo! Khách hàng thưởng nóng **${formatMoney(amount)}** ${CURRENCY_EMOJI}.`;
            emoji = '🍳';
            break;
        case 'exercise':
            amount = Math.floor(Math.random() * 2000) + 500;
            text = `Bạn tập gym hăng say và tìm thấy **${formatMoney(amount)}** ${CURRENCY_EMOJI} ai đó làm rơi.`;
            emoji = '🏋️';
            break;
    }

    performTransaction(userData, amount);
    userData[`${cmd}LastUsed`] = Date.now();
    
    // Giả định logic Quest Check
    if (userData.questData && userData.questData.active && userData.questData.type === cmd) {
        userData.questData.progress++;
        // ... (xử lý hoàn thành quest nếu cần)
    }
    
    saveUserData(usersData);
    message.reply({ embeds: [createEmbed(message.author, `${emoji} Kết quả`, text, 0x2ecc71)] });
}

// 6. THU HOẠCH (FISH, MINE, HUNT)
async function handleHarvest(message, cmd, userData, usersData) {
    const cd = checkCooldown(userData, cmd);
    if (cd) return message.reply(`⏳ Đợi **${formatTime(cd)}** để hồi phục năng lượng.`);

    const toolType = COMMAND_TO_TOOL_TYPE[cmd];
    const equippedId = userData.equipped[toolType];
    
    if (!equippedId || !userData.uniqueItems[equippedId]) {
        return message.reply(`❌ Bạn chưa trang bị công cụ loại **${toolType}**! Dùng \`${prefix}shop\` để mua và \`${prefix}equip\` để đeo.`);
    }

    const toolData = userData.uniqueItems[equippedId];
    if (toolData.currentDurability <= 0) {
        delete userData.uniqueItems[equippedId];
        userData.equipped[toolType] = null;
        saveUserData(usersData);
        return message.reply('⚠️ Công cụ đã hỏng và bị loại bỏ! Hãy mua cái mới.');
    }

    const toolInfo = getItemData(toolData.itemId);
    const rates = cmd === 'fish' ? FISH_RATES : (cmd === 'mine' ? MINERAL_RATES : HUNT_RATES);
    
    const animMsg = await message.reply(`${ANIMATIONS[cmd]} Đang thực hiện...`);
    await new Promise(r => setTimeout(r, 2000));

    const result = getRandomResult(rates, toolInfo.effect || 0);

    toolData.currentDurability--;
    if (toolData.currentDurability <= 0) {
        // Cập nhật tình trạng hỏng
        delete userData.uniqueItems[equippedId];
        userData.equipped[toolType] = null;
    }
    
    userData.inventory[result.id] = (userData.inventory[result.id] || 0) + 1;
    userData[`${cmd}LastUsed`] = Date.now();
    saveUserData(usersData);

    let durabilityText = `Độ bền công cụ: \`${toolData.currentDurability}/${toolData.maxDurability}\``;
    if (toolData.currentDurability <= 0) durabilityText = '⚠️ Công cụ đã **hỏng**!';

    const embed = createEmbed(message.author, `Thu hoạch thành công!`, 
        `Bạn nhận được: **1x ${result.name}** (${result.rarity})\n` + durabilityText, 
        0x00ff00);
    
    animMsg.edit({ content: null, embeds: [embed] });
}

// 7. INVENTORY
async function handleInventory(message, userData) {
    let inventoryItems = Object.keys(userData.inventory)
        .filter(id => userData.inventory[id] > 0)
        .map(id => {
            const item = getItemData(parseInt(id));
            return `\`[${id}]\` **${item?.name || 'Item Lỗi'}**: x${formatMoney(userData.inventory[id])}`;
        });
    
    let equippedItems = Object.keys(userData.equipped)
        .filter(type => userData.equipped[type])
        .map(type => {
            const uuid = userData.equipped[type];
            const uniqueItem = userData.uniqueItems[uuid];
            const itemInfo = getItemData(uniqueItem.itemId);
            return `\`${type}\`: **${itemInfo.name}** (ĐB: ${uniqueItem.currentDurability}/${uniqueItem.maxDurability})`;
        });

    const embed = createEmbed(message.author, '🎒 Túi Đồ và Công Cụ', '', 0x9b59b6)
        .addFields(
            { name: '🛠️ Công Cụ Đang Đeo', value: equippedItems.join('\n') || 'Không có.', inline: false },
            { name: '📦 Vật Phẩm Thu Hoạch', value: inventoryItems.join('\n') || 'Không có.', inline: false }
        );

    message.reply({ embeds: [embed] });
}

// 8. EQUIP
async function handleEquip(message, args, userData, usersData) {
    if (args.length < 1) return message.reply(`Sử dụng: \`${prefix}equip <UUID>\`.`);
    const uuid = args[0];

    const itemToEquip = userData.uniqueItems[uuid];
    if (!itemToEquip) return message.reply('❌ Không tìm thấy công cụ với ID này.');

    const itemInfo = getItemData(itemToEquip.itemId);
    if (!['rod', 'pickaxe', 'tool'].includes(itemInfo.type)) return message.reply('❌ Vật phẩm này không phải công cụ để trang bị.');

    userData.equipped[itemInfo.type] = uuid;
    saveUserData(usersData);
    message.reply(`✅ Đã trang bị **${itemInfo.name}** thành công!`);
}

// 9. BUY (ĐÃ FIX LỖI UUID)
async function handleBuy(message, args, userData, usersData) {
    if (args.length < 2) return message.reply(`Sử dụng: \`${prefix}buy <ID> <số lượng>\`.`);
    const itemIdArg = args[0];
    const quantity = parseInt(args[1]);

    if (isNaN(quantity) || quantity <= 0) return message.reply('❌ Số lượng phải là số dương.');

    const itemInfo = findItem(itemIdArg);
    if (!itemInfo || !itemInfo.price) return message.reply('❌ ID vật phẩm không hợp lệ hoặc không bán.');
    if (!['rod', 'pickaxe', 'tool', 'charm'].includes(itemInfo.type)) return message.reply('❌ Chỉ có thể mua công cụ hoặc bùa.');

    const totalCost = itemInfo.price * quantity;
    if (userData.cash < totalCost) return message.reply(`❌ Bạn không đủ tiền. Cần **${formatMoney(totalCost)}** ${CURRENCY_EMOJI}.`);

    performTransaction(userData, -totalCost);

    let lastUuid = null; // Khai báo biến để lưu UUID cuối cùng
    for (let i = 0; i < quantity; i++) {
        const uuid = uuidv4();
        lastUuid = uuid; // Lưu UUID mới nhất
        userData.uniqueItems[uuid] = {
            itemId: itemInfo.id,
            maxDurability: itemInfo.durability || 1,
            currentDurability: itemInfo.durability || 1,
        };
    }
    
    saveUserData(usersData);
    // Sử dụng lastUuid thay cho uuid (fix ReferenceError)
    message.reply(`✅ Đã mua **${formatMoney(quantity)}x ${itemInfo.name}** với giá **${formatMoney(totalCost)}** ${CURRENCY_EMOJI}. ID công cụ: ${quantity > 1 ? `Xem \`${prefix}inv\`` : `\`${lastUuid}\``}`);
}

// 10. SELL
async function handleSell(message, args, userData, usersData) {
    if (args.length < 2) return message.reply(`Sử dụng: \`${prefix}sell <ID> <số lượng>\`.`);
    const itemIdArg = args[0];
    let quantity = parseInt(args[1]);

    if (isNaN(quantity) || quantity <= 0) return message.reply('❌ Số lượng phải là số dương.');
    
    const itemInfo = findItem(itemIdArg);
    if (!itemInfo) return message.reply('❌ ID vật phẩm không hợp lệ.');
    if (!itemInfo.price) return message.reply('❌ Vật phẩm này không bán được.');

    const currentCount = userData.inventory[itemInfo.id] || 0;
    if (currentCount < quantity) {
        quantity = currentCount; 
    }
    if (quantity === 0) return message.reply(`❌ Bạn không có **${itemInfo.name}** để bán.`);

    const sellPrice = Math.floor(itemInfo.price * 0.5); // Bán 50% giá mua
    const totalEarnings = sellPrice * quantity;

    performTransaction(userData, totalEarnings);
    userData.inventory[itemInfo.id] = currentCount - quantity;
    if (userData.inventory[itemInfo.id] <= 0) delete userData.inventory[itemInfo.id];
    
    saveUserData(usersData);
    message.reply(`✅ Đã bán **${formatMoney(quantity)}x ${itemInfo.name}** với giá **${formatMoney(totalEarnings)}** ${CURRENCY_EMOJI}.`);
}

// 11. GAMBLING (SLOT, COINFLIP, DICE)
async function handleGambling(message, cmd, args, userData, usersData) {
    const cd = checkCooldown(userData, cmd);
    if (cd) return message.reply(`⏳ Đợi **${formatTime(cd)}** nữa.`);
    
    const bet = parseInt(args[0]);
    if (isNaN(bet) || bet <= 0) return message.reply('❌ Cần cược số tiền hợp lệ.');
    if (userData.cash < bet) return message.reply('❌ Bạn không đủ tiền cược.');

    userData[`${cmd}LastUsed`] = Date.now();
    
    let result = '';
    let winAmount = 0;
    let description = '';
    let color = 0xe74c3c; // Đỏ - Thua

    performTransaction(userData, -bet); // Trừ tiền cược trước

    if (cmd === 'slot') {
        const slots = ['🍒', '🔔', '✨', '🍀', '💰'];
        const outcome = Array(3).fill(0).map(() => slots[Math.floor(Math.random() * slots.length)]);
        result = outcome.join(' | ');

        if (outcome[0] === outcome[1] && outcome[1] === outcome[2]) { // 3 cái giống nhau
            winAmount = bet * 5;
            description = `${ANIMATIONS.slot} Bạn thắng lớn! X5 tiền cược.`;
            color = 0x2ecc71;
        } else if (outcome[0] === outcome[1] || outcome[1] === outcome[2] || outcome[0] === outcome[2]) { // 2 cái giống nhau
            winAmount = bet * 2;
            description = `${ANIMATIONS.slot} Bạn thắng! X2 tiền cược.`;
            color = 0xf39c12;
        } else {
            description = `${ANIMATIONS.slot} Thử lại lần sau nhé.`;
        }
    }
    // ... (Thêm logic CoinFlip, Dice nếu muốn)

    performTransaction(userData, winAmount);
    saveUserData(usersData);

    const embed = createEmbed(message.author, `🎰 ${cmd.toUpperCase()} - ${result}`, description, color)
        .addFields({ name: 'Kết quả', value: winAmount > 0 ? `+${formatMoney(winAmount)} ${CURRENCY_EMOJI}` : `-${formatMoney(bet)} ${CURRENCY_EMOJI}` });
    
    message.reply({ embeds: [embed] });
}

// 12. INTERACTION (KISS, HUG, SLAP, HOLDHAND)
async function handleInteraction(message, cmd, args) {
    const target = message.mentions.users.first();
    if (!target) return message.reply('❌ Bạn cần tag người bạn muốn tương tác.');
    if (target.id === message.author.id) return message.reply('❌ Bạn không thể tự làm điều đó.');

    const gifUrl = INTERACTION_GIFS[cmd][Math.floor(Math.random() * INTERACTION_GIFS[cmd].length)];
    let actionText = '';

    if (cmd === 'kiss') actionText = `đã hôn`;
    else if (cmd === 'hug') actionText = `đã ôm`;
    else if (cmd === 'slap') actionText = `đã tát`;
    else if (cmd === 'holdhand') actionText = `đã nắm tay`;

    const embed = new EmbedBuilder()
        .setColor(0xffc0cb)
        .setDescription(`**${message.author.username}** ${actionText} **${target.username}**!`)
        .setImage(gifUrl)
        .setFooter({ text: `/${cmd}` });

    message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
}


// 13. GIVE (TẶNG TIỀN)
async function handleGive(message, args, userData, usersData) {
    const target = message.mentions.users.first();
    const amount = parseInt(args[1]);

    if (!target) return message.reply('❌ Hãy tag người bạn muốn tặng tiền.');
    if (target.id === message.author.id) return message.reply('❌ Bạn không thể tự tặng tiền cho mình.');
    if (isNaN(amount) || amount <= 0) return message.reply('❌ Số tiền tặng phải là số dương hợp lệ.');

    if (userData.cash < amount) return message.reply('❌ Bạn không đủ tiền mặt để tặng.');

    const targetData = getUserData(target.id, usersData);

    performTransaction(userData, -amount);
    performTransaction(targetData, amount);
    saveUserData(usersData);

    const gifUrl = GIVE_GIFS[Math.floor(Math.random() * GIVE_GIFS.length)];
    
    const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setDescription(`💸 **${message.author.username}** đã tặng **${target.username}** **${formatMoney(amount)}** ${CURRENCY_EMOJI}!`)
        .setImage(gifUrl);

    message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
}

// 14. PROFILE (TRANG CÁ NHÂN)
async function handleProfile(message, usersData) {
    let target = message.mentions.users.first() || message.author;
    let data = getUserData(target.id, usersData);
    
    // Tên bạn đời
    let spouseName = 'Chưa kết hôn';
    if (data.marriage) {
        const spouse = client.users.cache.get(data.marriage);
        spouseName = spouse ? `**${spouse.username}**` : 'Người dùng không còn tồn tại';
    }

    const gifUrl = PROFILE_GIFS[Math.floor(Math.random() * PROFILE_GIFS.length)];

    const embed = new EmbedBuilder()
        .setColor(0x9b59b6)
        .setTitle(`👤 Trang Cá Nhân của ${target.username}`)
        .setThumbnail(target.displayAvatarURL())
        .setDescription(`*Xin chào, tôi là ${target.username}*`)
        .addFields(
            { name: '💰 Số dư', value: `**${formatMoney(data.cash)}** ${CURRENCY_EMOJI}`, inline: true },
            { name: '❤️ Hôn nhân', value: spouseName, inline: true },
            { name: '\u200B', value: '\u200B', inline: true }
        )
        .setImage(gifUrl)
        .setFooter({ text: `ID: ${target.id}` })
        .setTimestamp();

    message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
}

// 15. MARRY
async function handleMarry(message, usersData) {
    const target = message.mentions.users.first();
    const userData = getUserData(message.author.id, usersData);
    if (!target || target.id === message.author.id) return message.reply('❌ Hãy tag người bạn muốn cầu hôn.');
    if (userData.marriage) return message.reply('❌ Bạn đã kết hôn rồi.');

    const targetData = getUserData(target.id, usersData);
    if (targetData.marriage) return message.reply(`❌ **${target.username}** đã có gia đình.`);

    const gifUrl = MARRY_GIFS[Math.floor(Math.random() * MARRY_GIFS.length)];

    // Logic cơ bản: Tạo nút chấp nhận
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`marry_accept_${message.author.id}`).setLabel('Đồng ý').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`marry_reject_${message.author.id}`).setLabel('Từ chối').setStyle(ButtonStyle.Danger)
    );

    const marryEmbed = new EmbedBuilder()
        .setColor(0xffc0cb)
        .setDescription(`💍 **${message.author.username}** đang cầu hôn **${target.username}**! Bạn có đồng ý không?`)
        .setImage(gifUrl)
        .setFooter({ text: `Yêu cầu bởi ${message.author.username}` });

    const reply = await message.reply({ 
        content: target.toString(), // Mention thẳng người nhận
        embeds: [marryEmbed],
        components: [row] 
    });

    // Tạo bộ lọc tương tác
    const filter = i => (i.customId.startsWith('marry_') && i.user.id === target.id);
    const collector = message.channel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
        collector.stop();
        if (i.customId === `marry_accept_${message.author.id}`) {
            userData.marriage = target.id;
            targetData.marriage = message.author.id;
            saveUserData(usersData);
            await i.update({ content: `🎉 **CHÚC MỪNG!** ${message.author.username} và ${target.username} đã chính thức kết hôn! ❤️`, embeds: [], components: [] });
        } else {
            await i.update({ content: `💔 ${target.username} đã từ chối lời cầu hôn của ${message.author.username}.`, embeds: [], components: [] });
        }
    });

    collector.on('end', collected => {
        if (collected.size === 0) {
            reply.edit({ content: 'Hết thời gian chờ phản hồi.', embeds: [marryEmbed.setDescription(`Cầu hôn đã hết hạn.`)], components: [] }).catch(() => {});
        }
    });
}

// 16. DIVORCE (LY HÔN)
async function handleDivorce(message, userData, usersData) {
    if (!userData.marriage) return message.reply('❌ Bạn chưa kết hôn, không thể ly hôn.');

    const spouseId = userData.marriage;
    const spouse = client.users.cache.get(spouseId);
    const spouseData = getUserData(spouseId, usersData);

    const spouseName = spouse ? spouse.username : 'người cũ';

    // Xóa liên kết hôn nhân
    userData.marriage = null;
    if (spouseData) spouseData.marriage = null;
    
    saveUserData(usersData);

    const gifUrl = DIVORCE_GIFS[Math.floor(Math.random() * DIVORCE_GIFS.length)];
    
    const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setDescription(`💔 **${message.author.username}** đã chính thức ly hôn với **${spouseName}**.\n*Mọi thứ đã kết thúc...*`)
        .setImage(gifUrl);

    message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
}
// 17. MINECRAFT PROFILE CHECK (ĐÃ SỬA: Dùng API NameMC)
async function handleMCProfile(message, args) {
    const username = args[0];
    if (!username) return message.reply(`❌ Vui lòng nhập tên tài khoản Minecraft: \`${prefix}mcprofile <username>\`.`);
    
    // Đảm bảo thư viện 'node-fetch' đã được cài đặt và import ở đầu file.
    if (typeof fetch === 'undefined') {
        // Nếu không có node-fetch (dành cho Node.js cũ hơn v18)
        return message.reply('⚠️ Lỗi: Thư viện node-fetch chưa được import/cài đặt. Hãy chạy: npm install node-fetch và thêm const fetch = require(\'node-fetch\'); vào đầu file.');
    }
    await message.channel.sendTyping();

    try {
        // Bước 1: Lấy UUID từ Username (Mojang API - vẫn cần để xác nhận Premium và lấy UUID)
        const profileResponse = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`);
        
        if (profileResponse.status === 204 || profileResponse.status === 404) {
            return message.reply(`⚠️ Không tìm thấy tài khoản Minecraft Premium nào có tên **${username}**.`);
        }
        
        if (!profileResponse.ok) {
            console.error(`Mojang API error (Profile): ${profileResponse.statusText}`);
            return message.reply(`⚠️ Lỗi khi kết nối đến API Mojang (Lỗi ${profileResponse.status}).`);
        }
        
        const profileData = await profileResponse.json();
        const uuid = profileData.id;
        const currentName = profileData.name;

        // Bước 2: Lấy thông tin Skin/Head và liên kết từ NAMEMC
        // NameMC sử dụng UUID trong URL hình ảnh
        const namemcProfileUrl = `https://namemc.com/profile/${currentName}`;
        
        // Sử dụng NameMC API cho hình ảnh 3D skin render
        // Dùng URL 3D: https://namemc.com/skin/UUID.png
        // Dùng URL Head: https://namemc.com/head/UUID
        const skin3DRenderUrl = `https://namemc.com/skin/${uuid}.png`;
        const headUrl = `https://namemc.com/head/${uuid}`; 
        
        // Bước 3: Lấy lịch sử đổi tên (vẫn dùng Mojang API)
        const nameHistoryResponse = await fetch(`https://api.mojang.com/user/profiles/${uuid}/names`);
        let nameHistory = [];
        if (nameHistoryResponse.ok) {
            const history = await nameHistoryResponse.json();
            // Lấy 5 tên cũ gần nhất (bỏ tên hiện tại)
            nameHistory = history.slice(0, -1).reverse().slice(0, 5).map(entry => entry.name); 
        }

        const embed = new EmbedBuilder()
            .setColor(0x3498db) // Màu NameMC
            .setTitle(`⛏️ Hồ Sơ Minecraft: ${currentName}`)
            .setURL(namemcProfileUrl) // Liên kết đến trang NameMC
            .setThumbnail(headUrl) // Hình ảnh đầu
            .addFields(
                { name: 'Tên Hiện Tại', value: `\`${currentName}\``, inline: true },
                { name: 'UUID', value: `\`${uuid}\``, inline: true },
                { name: 'Trạng thái', value: '✅ **Premium**', inline: true },
                { name: 'Liên kết Profile', value: `[Xem trên NameMC](${namemcProfileUrl})`, inline: false },
                { name: 'Lịch sử đổi tên (Gần nhất)', value: nameHistory.length > 0 ? nameHistory.join(', ') : 'Chưa từng đổi tên.', inline: false }
            )
            .setImage(skin3DRenderUrl) // Hình ảnh 3D Skin
            .setFooter({ text: `Dữ liệu từ Mojang/NameMC` });

        message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });

    } catch (error) {
        console.error('Minecraft Profile Error:', error);
        message.reply('❌ Đã xảy ra lỗi hệ thống khi kiểm tra tài khoản.');
    }
}
// 18. MUSIC BOT - PLAY
async function handlePlay(message, args) {
    if (!args.length) {
        return message.reply(`Sử dụng: \`${prefix}play <tên bài hát/link>\`.`);
    }

    // 1. KIỂM TRA KÊNH THOẠI (VOICE CHANNEL)
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
        return message.reply('❌ Bạn phải ở trong một kênh thoại để tôi có thể phát nhạc.');
    }

    // 2. KIỂM TRA QUYỀN HẠN
    const permissions = voiceChannel.permissionsFor(client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
        return message.reply('❌ Tôi cần quyền **Kết Nối (Connect)** và **Nói (Speak)** trong kênh thoại này.');
    }

    const query = args.join(' ');

    try {
        await message.channel.sendTyping();
        
        // 3. TÌM KIẾM BÀI HÁT
        const result = await player.search(query, {
            requestedBy: message.author,
            searchEngine: 'youtube', // Ưu tiên YouTube
        });

        if (!result.tracks.length) {
            return message.reply(`🔍 Không tìm thấy bài hát nào cho từ khóa: **${query}**.`);
        }

        // 4. TẠO HOẶC LẤY HÀNG ĐỢI (QUEUE)
        const queue = await player.createQueue(message.guild, {
            metadata: message.channel,
            leaveOnEmpty: true,
            leaveOnStop: true,
            leaveOnEnd: true,
        });

        // 5. KẾT NỐI VÀO KÊNH THOẠI
        try {
            if (!queue.connection) {
                await queue.connect(voiceChannel);
            }
        } catch (error) {
            queue.destroy();
            console.error('Lỗi khi kết nối kênh thoại:', error);
            return message.reply('❌ Không thể kết nối vào kênh thoại của bạn.');
        }

        // 6. THÊM VÀO HÀNG ĐỢI VÀ PHÁT
        const track = result.tracks[0];
        
        // Dùng addTracks cho playlist/tracklist hoặc addTrack cho track đơn
        if (result.playlist) {
            await queue.addTracks(result.tracks);
            message.reply({
                embeds: [createEmbed(
                    message.author,
                    '🎶 Đã Thêm Playlist',
                    `Đã thêm **${result.tracks.length}** bài hát từ playlist **[${result.playlist.title}]** vào hàng đợi!`
                ).setColor(0x00FF00)]
            });
        } else {
            await queue.addTrack(track);
            message.reply({
                embeds: [createEmbed(
                    message.author,
                    '🎶 Đã Thêm Bài Hát',
                    `Đã thêm **[${track.title}](${track.url})** vào hàng đợi.`
                ).setColor(0x00FF00)]
            });
        }

        // 7. BẮT ĐẦU PHÁT (Nếu hàng đợi đang dừng)
        if (!queue.playing) {
            await queue.play();
        }

    } catch (error) {
        console.error('Lỗi trong lệnh Play:', error);
        return message.reply('❌ Đã xảy ra lỗi khi tìm kiếm hoặc phát nhạc.');
    }
}

// 19. MUSIC BOT - STOP
async function handleStop(message) {
    if (!message.member.voice.channel) {
        return message.reply('❌ Bạn phải ở trong một kênh thoại để sử dụng lệnh này!');
    }
    const queue = player.getQueue(message.guild.id);
    if (!queue || !queue.playing) {
        return message.reply('⚠️ Không có nhạc nào đang phát.');
    }

    queue.destroy();
    return message.reply('⏹️ Đã dừng phát nhạc và rời kênh thoại.');
}

// 20. MUSIC BOT - SKIP
async function handleSkip(message) {
    if (!message.member.voice.channel) {
        return message.reply('❌ Bạn phải ở trong một kênh thoại để sử dụng lệnh này!');
    }
    const queue = player.getQueue(message.guild.id);
    if (!queue || !queue.playing) {
        return message.reply('⚠️ Không có nhạc nào đang phát.');
    }

    const skipped = queue.skip();
    return message.reply(skipped ? `⏭️ Đã bỏ qua bài hát hiện tại.` : '⚠️ Không có bài hát nào trong hàng đợi để bỏ qua.');
}

// 21. MUSIC BOT - QUEUE/PLAYLIST
async function handleQueue(message) {
    const queue = player.getQueue(message.guild.id);
    if (!queue || !queue.playing) {
        return message.reply('⚠️ Không có nhạc nào đang phát.');
    }

    const currentTrack = queue.current;
    const tracks = queue.tracks.slice(0, 10).map((t, i) => `**${i + 1}.** ${t.title} \`${t.duration}\``).join('\n');

    const embed = new EmbedBuilder()
        .setColor(0xffa500)
        .setTitle('🎧 Hàng Đợi Phát Nhạc')
        .setDescription(`**Đang phát:** [${currentTrack.title}](${currentTrack.url}) \`${currentTrack.duration}\`\n\n**Bài hát tiếp theo:**\n${tracks || 'Không có bài hát nào trong hàng đợi.'}`)
        .setFooter({ text: `Tổng cộng ${queue.tracks.length} bài hát trong hàng đợi.` });
        
    return message.reply({ embeds: [embed] });
}
// Hàm giả định handleShop
async function handleShop(message) {
    const shopMenu = new StringSelectMenuBuilder()
        .setCustomId('shop_menu')
        .setPlaceholder('Chọn danh mục')
        .addOptions(
            { label: 'Cần Câu', value: 'rod', emoji: '🎣' }, // Thêm icon
            { label: 'Cuốc Chim', value: 'pickaxe', emoji: '⛏️' }, // Thêm icon
            { label: 'Công Cụ Săn', value: 'tool', emoji: '🔪' }, // Thêm icon
            { label: 'Bùa', value: 'charm', emoji: '✨' } // Thêm icon
        );

    const row = new ActionRowBuilder().addComponents(shopMenu);

    message.reply({
        embeds: [createEmbed(message.author, '🛍️ Cửa Hàng Arisuki', 'Chọn một danh mục để xem vật phẩm.', 0x1abc9c)],
        components: [row]
    });
}


// =================================================================================================
// MAIN EVENT LOOP
// =================================================================================================

client.on(Events.ClientReady, () => {
    console.log(`✅ Bot ${client.user.tag} đã online!`);
    client.user.setActivity(`${prefix}help | @me | Bot v5.4`);
});

client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return;
    
    let usersData = loadUserData();
    let userData = getUserData(message.author.id, usersData);

    try {
        // --- XỬ LÝ MENTION @BOT ---
        if (message.mentions.has(client.user.id) && message.mentions.users.first().id === client.user.id) {
            let content = message.content.replace(`<@${client.user.id}>`, '').trim();
            if (content.length > 0) {
                await handleGPT(message, content.split(/ +/)); // <<<<<< ĐÃ SỬA: Thay handleAI bằng handleGPT
                return;
            }
            return; // Đảm bảo không xử lý lệnh prefix nếu chỉ là mention trống
        }
        
        // --- XỬ LÝ LỆNH PREFIX ---
        if (!message.content.startsWith(prefix)) return;
        
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const cmd = args.shift().toLowerCase();
        
        // --- KINH TẾ & BALANCE ---
        if (['bal', 'balance', 'coin', 'coins', 'cash', 'tien'].includes(cmd)) 
            await handleBalance(message, usersData);
        else if (cmd === 'daily') await handleDaily(message, userData, usersData);
        else if (['work', 'lamviec'].includes(cmd)) await handleWork(message, 'work', userData, usersData);
        else if (['cook', 'nauan'].includes(cmd)) await handleWork(message, 'cook', userData, usersData);
        else if (['exercise', 'taptheduc'].includes(cmd)) await handleWork(message, 'exercise', userData, usersData);
        else if (['give', 'tang', 'pay'].includes(cmd)) await handleGive(message, args, userData, usersData);
        
        // --- THU HOẠCH ---
        else if (['fish', 'cauca'].includes(cmd)) await handleHarvest(message, 'fish', userData, usersData);
        else if (['mine', 'dao'].includes(cmd)) await handleHarvest(message, 'mine', userData, usersData);
        else if (['hunt', 'san'].includes(cmd)) await handleHarvest(message, 'hunt', userData, usersData);

        // --- ITEM & SHOP ---
        else if (cmd === 'shop') await handleShop(message);
        else if (['inv', 'inventory'].includes(cmd)) await handleInventory(message, userData);
        else if (cmd === 'equip') await handleEquip(message, args, userData, usersData);
        else if (cmd === 'buy') await handleBuy(message, args, userData, usersData);
        else if (cmd === 'sell') await handleSell(message, args, userData, usersData);

        // --- GIẢI TRÍ & CỜ BẠC ---
        else if (cmd === 'slot') await handleGambling(message, 'slot', args, userData, usersData);
        // ... (thêm coinflip, dice nếu có)

        // --- XÃ HỘI & TƯƠNG TÁC ---
        else if (cmd === 'marry') await handleMarry(message, usersData);
        else if (['divorce', 'lyhon'].includes(cmd)) await handleDivorce(message, userData, usersData);
        else if (['kiss', 'hug', 'slap', 'holdhand'].includes(cmd)) await handleInteraction(message, cmd, args);
        else if (['profile', 'pr', 'tcn'].includes(cmd)) await handleProfile(message, usersData);

        // --- TIỆN ÍCH & AI ---
        else if (['ai', 'gpt'].includes(cmd)) handleGPT(message, args);
        else if (['mcprofile', 'mcp', 'mc'].includes(cmd)) await handleMCProfile(message, args);
        else if (['sv', 'server', 'servers', 'list'].includes(cmd)) await handleServers(message);

        // --- MUSIC ---
        else if (['play', 'p'].includes(cmd)) await handlePlay(message, args);
        else if (['stop', 'leave', 'disconnect'].includes(cmd)) await handleStop(message);
        else if (['skip', 's'].includes(cmd)) await handleSkip(message);
        else if (['queue', 'q', 'playlist'].includes(cmd)) await handleQueue(message);
        
        // --- HELP ---
        else if (['help', 'h'].includes(cmd)) {
            const helpTxt = `
**🎧 Nghe Nhạc:** \`${prefix}play <tên/url>\` | \`${prefix}stop\` | \`${prefix}skip\` | \`${prefix}queue\`
**💰 Kinh Tế:** \`${prefix}bal\`, \`${prefix}daily\`, \`${prefix}work\`, \`${prefix}cook\`, \`${prefix}exercise\`
**💸 Chuyển Tiền:** \`${prefix}give <@user> <amount>\`
**🎣 Thu Hoạch:** \`${prefix}fish\`, \`${prefix}mine\`, \`${prefix}hunt\` (Cần \`${prefix}equip\`)
**🛍️ Cửa Hàng:** \`${prefix}shop\`, \`${prefix}buy\`, \`${prefix}sell\`, \`${prefix}inv\`, \`${prefix}equip\`
**🎲 Giải Trí:** \`${prefix}slot\`, \`${prefix}marry\`, \`${prefix}divorce\`, \`${prefix}kiss\`, \`${prefix}hug\`
**👤 Cá Nhân:** \`${prefix}profile\`
**🤖 Tiện Ích:** \`${prefix}ai <câu hỏi>\`, \`@tên bot <câu hỏi>\`, \`${prefix}servers\`
**⛏️ Minecraft:** \`${prefix}mcprofile <username>\`
            `;
            message.reply({ embeds: [createEmbed(message.author, '📜 Menu Lệnh', helpTxt)] });
        }

    } catch (err) {
        console.error(err);
        message.reply('❌ Có lỗi xảy ra trong quá trình xử lý lệnh.');
    }
});

// Xử lý Menu Shop (Interaction) - ĐÃ SỬA LỖI MAP
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId === 'shop_menu') {
        const category = interaction.values[0];
        // Đảm bảo tên thuộc tính SHOP_ITEMS khớp với value của shopMenu
        const categoryKey = category === 'rod' ? 'RODS' : 
                            category === 'pickaxe' ? 'PICKAXES' : 
                            category === 'tool' ? 'HUNTING_TOOLS' : 
                            category === 'charm' ? 'CHARMS' : null;
                            
        const items = SHOP_ITEMS[categoryKey]; // Lấy danh sách vật phẩm dựa trên key đã chuẩn hóa
        
        let desc = '❌ Không tìm thấy vật phẩm nào trong danh mục này.';
        
        if (Array.isArray(items) && items.length > 0) {
            desc = items.map(i => `**[ID: ${i.id}] ${i.name}**\n💵 ${formatMoney(i.price)} | ${i.description}`).join('\n\n');
        }

        await interaction.reply({ 
            embeds: [createEmbed(interaction.user, `🛍️ Danh mục: ${category.toUpperCase()}`, desc, 0x2ecc71)], 
            ephemeral: true 
        });
    }
});

client.login(token);