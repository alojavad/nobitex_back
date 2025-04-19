require('dotenv').config();
const mongoose = require('mongoose');
const OrderBook = require('../models/OrderBook');
const MarketStats = require('../models/MarketStats');
const UDFHistory = require('../models/UDFHistory');
const Order = require('../models/Order');
const Trade = require('../models/Trade');
const Market = require('../models/Market');
const User = require('../models/User');

// تنظیمات مانیتورینگ
const MONITOR_INTERVAL = 60000; // 1 دقیقه
const ALERT_THRESHOLD = 1000; // تعداد رکورد برای هشدار

// متغیرهای برای ذخیره وضعیت قبلی
let previousCounts = {
  orderBook: 0,
  marketStats: 0,
  udfHistory: 0,
  order: 0,
  trade: 0,
  market: 0,
  user: 0
};

async function monitorDatabase() {
  try {
    // اتصال به پایگاه داده
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ اتصال به پایگاه داده برقرار شد');
    console.log(`🔄 مانیتورینگ پایگاه داده هر ${MONITOR_INTERVAL / 1000} ثانیه...\n`);

    // تابع مانیتورینگ
    const checkDatabase = async () => {
      try {
        // بررسی تعداد رکوردها
        const orderBookCount = await OrderBook.countDocuments();
        const marketStatsCount = await MarketStats.countDocuments();
        const udfHistoryCount = await UDFHistory.countDocuments();
        const orderCount = await Order.countDocuments();
        const tradeCount = await Trade.countDocuments();
        const marketCount = await Market.countDocuments();
        const userCount = await User.countDocuments();

        // محاسبه تغییرات
        const orderBookChange = orderBookCount - previousCounts.orderBook;
        const marketStatsChange = marketStatsCount - previousCounts.marketStats;
        const udfHistoryChange = udfHistoryCount - previousCounts.udfHistory;
        const orderChange = orderCount - previousCounts.order;
        const tradeChange = tradeCount - previousCounts.trade;
        const marketChange = marketCount - previousCounts.market;
        const userChange = userCount - previousCounts.user;

        // نمایش وضعیت
        const now = new Date().toLocaleTimeString();
        console.log(`\n📊 وضعیت پایگاه داده در ${now}:`);
        console.log(`- سفارشات (OrderBook): ${orderBookCount} رکورد (${orderBookChange >= 0 ? '+' : ''}${orderBookChange})`);
        console.log(`- آمار بازار (MarketStats): ${marketStatsCount} رکورد (${marketStatsChange >= 0 ? '+' : ''}${marketStatsChange})`);
        console.log(`- تاریخچه (UDFHistory): ${udfHistoryCount} رکورد (${udfHistoryChange >= 0 ? '+' : ''}${udfHistoryChange})`);
        console.log(`- سفارش‌ها (Order): ${orderCount} رکورد (${orderChange >= 0 ? '+' : ''}${orderChange})`);
        console.log(`- معاملات (Trade): ${tradeCount} رکورد (${tradeChange >= 0 ? '+' : ''}${tradeChange})`);
        console.log(`- بازارها (Market): ${marketCount} رکورد (${marketChange >= 0 ? '+' : ''}${marketChange})`);
        console.log(`- کاربران (User): ${userCount} رکورد (${userChange >= 0 ? '+' : ''}${userChange})`);

        // بررسی هشدارها
        if (orderBookCount > ALERT_THRESHOLD) {
          console.log(`⚠️ هشدار: تعداد رکوردهای OrderBook (${orderBookCount}) از حد مجاز (${ALERT_THRESHOLD}) بیشتر است!`);
        }
        if (marketStatsCount > ALERT_THRESHOLD) {
          console.log(`⚠️ هشدار: تعداد رکوردهای MarketStats (${marketStatsCount}) از حد مجاز (${ALERT_THRESHOLD}) بیشتر است!`);
        }
        if (udfHistoryCount > ALERT_THRESHOLD) {
          console.log(`⚠️ هشدار: تعداد رکوردهای UDFHistory (${udfHistoryCount}) از حد مجاز (${ALERT_THRESHOLD}) بیشتر است!`);
        }
        if (orderCount > ALERT_THRESHOLD) {
          console.log(`⚠️ هشدار: تعداد رکوردهای Order (${orderCount}) از حد مجاز (${ALERT_THRESHOLD}) بیشتر است!`);
        }
        if (tradeCount > ALERT_THRESHOLD) {
          console.log(`⚠️ هشدار: تعداد رکوردهای Trade (${tradeCount}) از حد مجاز (${ALERT_THRESHOLD}) بیشتر است!`);
        }

        // ذخیره وضعیت فعلی
        previousCounts = {
          orderBook: orderBookCount,
          marketStats: marketStatsCount,
          udfHistory: udfHistoryCount,
          order: orderCount,
          trade: tradeCount,
          market: marketCount,
          user: userCount
        };
      } catch (error) {
        console.error('❌ خطا در بررسی پایگاه داده:', error);
      }
    };

    // اجرای اولیه
    await checkDatabase();

    // تنظیم تایمر برای اجرای دوره‌ای
    setInterval(checkDatabase, MONITOR_INTERVAL);

    // جلوگیری از بسته شدن برنامه
    process.on('SIGINT', async () => {
      console.log('\n👋 بستن مانیتورینگ پایگاه داده...');
      await mongoose.disconnect();
      console.log('✅ اتصال به پایگاه داده بسته شد');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ خطا در مانیتورینگ پایگاه داده:', error);
  }
}

// اجرای تابع
monitorDatabase(); 