require('dotenv').config();
const mongoose = require('mongoose');
const OrderBook = require('../models/OrderBook');
const MarketStats = require('../models/MarketStats');
const UDFHistory = require('../models/UDFHistory');
const Order = require('../models/Order');
const Trade = require('../models/Trade');
const Market = require('../models/Market');
const User = require('../models/User');

async function checkDatabase() {
  try {
    // اتصال به پایگاه داده
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ اتصال به پایگاه داده برقرار شد');

    // بررسی تعداد رکوردها در هر مدل
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

    // نمایش نمونه‌ای از داده‌ها
    if (orderBookCount > 0) {
      const sampleOrderBook = await OrderBook.findOne();
      console.log('\n📝 نمونه‌ای از داده‌های OrderBook:');
      console.log(JSON.stringify(sampleOrderBook, null, 2));
    }

    if (marketStatsCount > 0) {
      const sampleMarketStats = await MarketStats.findOne();
      console.log('\n📝 نمونه‌ای از داده‌های MarketStats:');
      console.log(JSON.stringify(sampleMarketStats, null, 2));
    }

    // بستن اتصال
    await mongoose.disconnect();
    console.log('\n✅ اتصال به پایگاه داده بسته شد');
  } catch (error) {
    console.error('❌ خطا در بررسی پایگاه داده:', error);
  }
}

// اجرای تابع
checkDatabase(); 