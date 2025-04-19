require('dotenv').config();
const mongoose = require('mongoose');
const OrderBook = require('../models/OrderBook');
const MarketStats = require('../models/MarketStats');
const UDFHistory = require('../models/UDFHistory');
const Order = require('../models/Order');
const Trade = require('../models/Trade');
const Market = require('../models/Market');
const User = require('../models/User');

// داده‌های نمونه
const sampleOrderBook = {
  symbol: 'BTCIRT',
  bids: [
    { price: 120000000, amount: 0.5, orderId: '12345' },
    { price: 119000000, amount: 1.2, orderId: '12346' }
  ],
  asks: [
    { price: 121000000, amount: 0.3, orderId: '12347' },
    { price: 122000000, amount: 0.8, orderId: '12348' }
  ],
  lastUpdate: new Date()
};

const sampleMarketStats = {
  symbol: 'BTCIRT',
  isClosed: false,
  bestSell: 121000000,
  bestBuy: 120000000,
  volumeSrc: 15.5,
  volumeDst: 1875500000,
  latest: 120500000,
  mark: 120500000,
  dayLow: 119000000,
  dayHigh: 122000000,
  dayOpen: 119500000,
  dayClose: 120500000,
  dayChange: 1000000
};

const sampleUDFHistory = {
  symbol: 'BTCIRT',
  resolution: '1D',
  from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 روز پیش
  to: new Date(),
  data: [
    {
      time: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      open: 119000000,
      high: 121000000,
      low: 118000000,
      close: 120000000,
      volume: 5.5
    },
    {
      time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      open: 120000000,
      high: 122000000,
      low: 119000000,
      close: 121000000,
      volume: 6.2
    }
  ]
};

const sampleOrder = {
  id: '12345',
  symbol: 'BTCIRT',
  type: 'buy',
  price: 120000000,
  amount: 0.5,
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date()
};

const sampleTrade = {
  id: '67890',
  orderId: '12345',
  symbol: 'BTCIRT',
  type: 'buy',
  price: 120000000,
  amount: 0.5,
  fee: 60000,
  feeCurrency: 'IRT',
  createdAt: new Date()
};

const sampleMarket = {
  symbol: 'BTCIRT',
  baseCurrency: 'BTC',
  quoteCurrency: 'IRT',
  minPrice: 100000000,
  maxPrice: 200000000,
  minAmount: 0.0001,
  maxAmount: 10,
  priceStep: 1000000,
  amountStep: 0.0001,
  isActive: true,
  lastUpdate: new Date()
};

const sampleUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'hashedpassword123',
  apiKey: 'testapikey123',
  apiSecret: 'testapisecret123',
  isActive: true,
  lastLogin: new Date()
};

async function seedDatabase() {
  try {
    // اتصال به پایگاه داده
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ اتصال به پایگاه داده برقرار شد');

    // پاک کردن داده‌های قبلی
    await OrderBook.deleteMany({});
    await MarketStats.deleteMany({});
    await UDFHistory.deleteMany({});
    await Order.deleteMany({});
    await Trade.deleteMany({});
    await Market.deleteMany({});
    await User.deleteMany({});
    console.log('✅ داده‌های قبلی پاک شدند');

    // اضافه کردن داده‌های نمونه
    await OrderBook.create(sampleOrderBook);
    await MarketStats.create(sampleMarketStats);
    await UDFHistory.create(sampleUDFHistory);
    await Order.create(sampleOrder);
    await Trade.create(sampleTrade);
    await Market.create(sampleMarket);
    await User.create(sampleUser);
    console.log('✅ داده‌های نمونه اضافه شدند');

    // بررسی تعداد رکوردها
    const orderBookCount = await OrderBook.countDocuments();
    const marketStatsCount = await MarketStats.countDocuments();
    const udfHistoryCount = await UDFHistory.countDocuments();
    const orderCount = await Order.countDocuments();
    const tradeCount = await Trade.countDocuments();
    const marketCount = await Market.countDocuments();
    const userCount = await User.countDocuments();

    console.log('\n📊 آمار داده‌های موجود در پایگاه داده:');
    console.log(`- سفارشات (OrderBook): ${orderBookCount} رکورد`);
    console.log(`- آمار بازار (MarketStats): ${marketStatsCount} رکورد`);
    console.log(`- تاریخچه (UDFHistory): ${udfHistoryCount} رکورد`);
    console.log(`- سفارش‌ها (Order): ${orderCount} رکورد`);
    console.log(`- معاملات (Trade): ${tradeCount} رکورد`);
    console.log(`- بازارها (Market): ${marketCount} رکورد`);
    console.log(`- کاربران (User): ${userCount} رکورد`);

    // بستن اتصال
    await mongoose.disconnect();
    console.log('\n✅ اتصال به پایگاه داده بسته شد');
  } catch (error) {
    console.error('❌ خطا در پر کردن پایگاه داده:', error);
  }
}

// اجرای تابع
seedDatabase(); 