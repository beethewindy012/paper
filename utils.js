// utils.js (v5.4 - Final Data Structure & Updated HUNT_RATES)
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'users.json');

// --- CẤU HÌNH CHUNG & TIỀN TỆ ---
const CURRENCY_NAME = 'Alluminium';
const CURRENCY_EMOJI = '<:ycoin:1440571695810216089>'; 

// --- DỮ LIỆU TỈ LỆ & ITEM ---
const FISH_RATES = [
    { id: 101, name: 'Cá rô phi', price: 100, rate: 50.0, rarity: 'Phổ biến' },
    { id: 102, name: 'Cá trắm cỏ', price: 200, rate: 25.0, rarity: 'Phổ biến' },
    { id: 103, name: 'Cá chép', price: 500, rate: 12.5, rarity: 'Không phổ biến' },
    { id: 104, name: 'Cá lóc', price: 750, rate: 7.5, rarity: 'Không phổ biến' },
    { id: 105, name: 'Cá tra', price: 1500, rate: 3.5, rarity: 'Hiếm' },
    { id: 106, name: 'Cá hồi', price: 3000, rate: 1.0, rarity: 'Siêu hiếm' },
    { id: 107, name: 'Cá Vàng', price: 10000, rate: 0.5, rarity: 'Cực hiếm' },
];

const MINERAL_RATES = [
    { id: 201, name: 'Đá cuội', price: 50, rate: 60.0, rarity: 'Phổ biến' },
    { id: 202, name: 'Sắt', price: 300, rate: 25.0, rarity: 'Phổ biến' },
    { id: 203, name: 'Đồng', price: 600, rate: 10.0, rarity: 'Không phổ biến' },
    { id: 204, name: 'Bạc', price: 2500, rate: 3.5, rarity: 'Hiếm' },
    { id: 205, name: 'Vàng', price: 7000, rate: 1.0, rarity: 'Siêu hiếm' },
    { id: 206, name: 'Kim cương', price: 15000, rate: 0.5, rarity: 'Cực hiếm' },
];

// DỮ LIỆU HUNT_RATES ĐÃ ĐƯỢC CẬP NHẬT THEO YÊU CẦU
const HUNT_RATES = [
    { id: 301, name: 'Lợn rừng', price: 5000, rate: 50.0, rarity: 'Phổ biến' },
    { id: 302, name: 'Thỏ rừng', price: 6000, rate: 50.0, rarity: 'Phổ biến' },
    { id: 303, name: 'Gà rừng', price: 7000, rate: 50.0, rarity: 'Phổ biến' },
    { id: 304, name: 'Dê núi', price: 10000, rate: 25.0, rarity: 'Không phổ biến' },
    { id: 305, name: 'Chó sói', price: 125000, rate: 25.0, rarity: 'Hiếm' },
    { id: 306, name: 'Gấu nâu', price: 20000, rate: 12.0, rarity: 'Không phổ biến' },
    { id: 307, name: 'Gấu đen', price: 30000, rate: 12.0, rarity: 'Không phổ biến' },
    { id: 308, name: 'Gấu trắng', price: 50000, rate: 10.0, rarity: 'Hiếm' },
    { id: 309, name: 'Cáo thường', price: 75000, rate: 5.0, rarity: 'Siêu hiếm' },
    { id: 310, name: 'Cáo trắng', price: 100000, rate: 3.0, rarity: 'Siêu hiếm' },
    { id: 311, name: 'Phượng hoàng lửa', price: 250000, rate: 1.0, rarity: 'Cực hiếm' },
    { id: 312, name: 'Rồng phương Đông', price: 500000, rate: 0.5, rarity: 'Huyền thoại' },
    { id: 313, name: 'Rồng phương Tây', price: 750000, rate: 0.3, rarity: 'Huyền thoại' },
    { id: 314, name: 'Rồng Ấn Độ', price: 1000000, rate: 0.1, rarity: 'Thần thoại' },
];

const SHOP_ITEMS = {
    RODS: [
        { id: 401, name: 'Cần Câu Gỗ', type: 'rod', price: 5000, durability: 10, effect: 0, description: 'Cần câu cơ bản.' },
        { id: 402, name: 'Cần Câu Đồng', type: 'rod', price: 25000, durability: 25, effect: 5, description: '+5% cơ hội ra đồ Hiếm.' },
        { id: 403, name: 'Cần Câu Bạc', type: 'rod', price: 100000, durability: 50, effect: 10, description: '+10% cơ hội ra đồ Hiếm.' },
    ],
    PICKAXES: [
        { id: 411, name: 'Cúp Đá', type: 'pickaxe', price: 5000, durability: 10, effect: 0, description: 'Cúp cơ bản.' },
        { id: 412, name: 'Cúp Sắt', type: 'pickaxe', price: 25000, durability: 25, effect: 5, description: '+5% cơ hội ra đồ Hiếm.' },
        { id: 413, name: 'Cúp Kim Cương', type: 'pickaxe', price: 100000, durability: 50, effect: 10, description: '+10% cơ hội ra đồ Hiếm.' },
    ],
    HUNTING_TOOLS: [
        { id: 421, name: 'Dao Găm', type: 'tool', price: 5000, durability: 10, effect: 0, description: 'Dao cơ bản.' },
        { id: 422, name: 'Cung Tên', type: 'tool', price: 25000, durability: 25, effect: 5, description: '+5% cơ hội ra đồ Hiếm.' },
        { id: 423, name: 'Súng Săn', type: 'tool', price: 100000, durability: 50, effect: 10, description: '+10% cơ hội ra đồ Hiếm.' },
    ],
    CHARMS: [
        { id: 501, name: 'Bùa May Mắn', type: 'charm', price: 50000, uses: 1, effect: 10, description: 'Tăng may mắn cực đại (1 lần).' },
        { id: 502, name: 'Bùa Bền Vững', type: 'charm', price: 100000, uses: 5, effect: 0, description: 'Giảm tỷ lệ hỏng đồ (5 lần).' },
    ]
};

const ALL_SHOP_ITEMS = [
    ...SHOP_ITEMS.RODS,
    ...SHOP_ITEMS.PICKAXES,
    ...SHOP_ITEMS.HUNTING_TOOLS,
    ...SHOP_ITEMS.CHARMS
];

const ALL_HARVEST_ITEMS = [...FISH_RATES, ...MINERAL_RATES, ...HUNT_RATES];

const COMMAND_TO_TOOL_TYPE = {
    fish: 'rod',
    mine: 'pickaxe',
    hunt: 'tool',
};

// --- HÀM HỆ THỐNG ---

function loadUserData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        }
    } catch (error) {
        console.error("Lỗi tải data:", error);
    }
    return {};
}

function saveUserData(usersData) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(usersData, null, 4), 'utf8');
    } catch (error) {
        console.error("Lỗi lưu data:", error);
    }
}

function getUserData(userId, usersData) {
    // Cấu trúc mặc định
    const defaultData = {
        cash: 0,
        marriage: null,
        lovePoints: 0, 
        inventory: {},
        consumables: {},
        uniqueItems: {},
        equipped: { rod: null, pickaxe: null, tool: null },
        questData: { active: false, type: null, target: 0, progress: 0, reward: 0 },
        dailyLastUsed: 0, weeklyLastUsed: 0, mineLastUsed: 0, fishLastUsed: 0, huntLastUsed: 0, slotLastUsed: 0, coinflipLastUsed: 0, blackjackLastUsed: 0, robLastUsed: 0, smuggleLastUsed: 0, begLastUsed: 0, cookLastUsed: 0, exerciseLastUsed: 0, workLastUsed: 0, questLastUsed: 0
    };

    if (!usersData[userId]) {
        usersData[userId] = defaultData;
    }
    
    // Data Migration (Đảm bảo tất cả các field đều tồn tại)
    const userData = usersData[userId];
    Object.keys(defaultData).forEach(key => {
        if (typeof userData[key] === 'undefined') {
            userData[key] = defaultData[key];
        } else if (typeof defaultData[key] === 'object' && defaultData[key] !== null && !Array.isArray(defaultData[key])) {
            // Merge objects (ví dụ: equipped, questData)
            userData[key] = { ...defaultData[key], ...userData[key] };
        }
    });

    return userData;
}

function formatMoney(amount) {
    return Math.floor(amount || 0).toLocaleString('vi-VN'); 
}

function getItemData(identifier) {
    if (typeof identifier === 'number') {
        return [...ALL_SHOP_ITEMS, ...ALL_HARVEST_ITEMS].find(item => item.id === identifier);
    }
    const normalizedIdentifier = String(identifier).toLowerCase();
    let item = [...ALL_SHOP_ITEMS, ...ALL_HARVEST_ITEMS].find(item => 
        String(item.id) === normalizedIdentifier || 
        item.name.toLowerCase() === normalizedIdentifier.replace(/_/g, ' ') 
    );
    return item || null;
}

function getRandomResult(rates, toolEffect = 0) {
    let modifiedRates = JSON.parse(JSON.stringify(rates));
    
    if (toolEffect > 0) {
        const boostPercentage = toolEffect / 100;
        const lowRarityItems = modifiedRates.filter(i => ['Phổ biến', 'Không phổ biến'].includes(i.rarity));
        const highRarityItems = modifiedRates.filter(i => ['Siêu hiếm', 'Cực hiếm', 'Huyền thoại', 'Thần thoại'].includes(i.rarity));

        let transferAmount = 0;
        lowRarityItems.forEach(item => {
            const deduction = item.rate * boostPercentage;
            item.rate = Math.max(0.01, item.rate - deduction);
            transferAmount += deduction;
        });

        if (highRarityItems.length > 0) {
            const boostPerItem = transferAmount / highRarityItems.length;
            highRarityItems.forEach(item => item.rate += boostPerItem);
        }
    }
    
    const totalRate = modifiedRates.reduce((sum, item) => sum + item.rate, 0);
    let randomValue = Math.random() * totalRate;
    
    for (const item of modifiedRates) {
        randomValue -= item.rate;
        if (randomValue <= 0) return item;
    }
    return modifiedRates[0]; 
}

function performTransaction(userData, amount) {
    if (isNaN(amount)) return;
    userData.cash += amount;
    if (userData.cash < 0) userData.cash = 0;
}

module.exports = {
    loadUserData, saveUserData, getUserData,
    formatMoney, getItemData, getRandomResult, performTransaction,
    SHOP_ITEMS, ALL_SHOP_ITEMS: [...SHOP_ITEMS.RODS, ...SHOP_ITEMS.PICKAXES, ...SHOP_ITEMS.HUNTING_TOOLS, ...SHOP_ITEMS.CHARMS], 
    ALL_HARVEST_ITEMS: [...FISH_RATES, ...MINERAL_RATES, ...HUNT_RATES], 
    COMMAND_TO_TOOL_TYPE,
    FISH_RATES, MINERAL_RATES, HUNT_RATES,
    CURRENCY_EMOJI, CURRENCY_NAME 
};