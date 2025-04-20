require('dotenv').config();
const mongoose = require('mongoose');
const OrderBook = require('../models/OrderBook');
const Trade = require('../models/Trade');
const MarketStat = require('../models/MarketStat');
const UDFHistory = require('../models/UDFHistory');

async function checkDatabase() {
  try {
    // اتصال به دیتابیس
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ اتصال به دیتابیس برقرار شد\n');

    // بررسی OrderBook
    console.log('📊 بررسی داده‌های OrderBook:');
    const orderBookCount = await OrderBook.countDocuments();
    const latestOrderBook = await OrderBook.findOne().sort({ lastUpdate: -1 });
    console.log(`تعداد کل رکوردها: ${orderBookCount}`);
    if (latestOrderBook) {
      console.log('آخرین به‌روزرسانی:', new Date(latestOrderBook.lastUpdate).toLocaleString('fa-IR'));
      console.log('نماد:', latestOrderBook.symbol);
      console.log('تعداد سفارش‌های خرید:', latestOrderBook.bids.length);
      console.log('تعداد سفارش‌های فروش:', latestOrderBook.asks.length);
      console.log('آخرین قیمت معامله:', latestOrderBook.lastTradePrice);
    }

    // بررسی Trade
    console.log('\n📈 بررسی داده‌های Trade:');
    const tradeCount = await Trade.countDocuments();
    const latestTrade = await Trade.findOne().sort({ time: -1 });
    console.log(`تعداد کل رکوردها: ${tradeCount}`);
    if (latestTrade) {
      console.log('آخرین معامله:', new Date(latestTrade.time).toLocaleString('fa-IR'));
      console.log('نماد:', latestTrade.symbol);
      console.log('قیمت:', latestTrade.price);
      console.log('حجم:', latestTrade.volume);
      console.log('نوع:', latestTrade.type);
    }

    // بررسی MarketStat
    console.log('\n📉 بررسی داده‌های MarketStat:');
    const marketStatCount = await MarketStat.countDocuments();
    const latestMarketStat = await MarketStat.findOne().sort({ _id: -1 });
    console.log(`تعداد کل رکوردها: ${marketStatCount}`);
    if (latestMarketStat) {
      console.log('نماد:', latestMarketStat.symbol);
      console.log('وضعیت بازار:', latestMarketStat.isClosed ? 'بسته' : 'باز');
      console.log('بهترین قیمت فروش:', latestMarketStat.bestSell);
      console.log('بهترین قیمت خرید:', latestMarketStat.bestBuy);
      console.log('حجم معاملات (ارز مبدا):', latestMarketStat.volumeSrc);
      console.log('حجم معاملات (ارز مقصد):', latestMarketStat.volumeDst);
      console.log('آخرین قیمت:', latestMarketStat.latest);
      console.log('تغییرات روزانه:', latestMarketStat.dayChange + '%');
    }

    // بررسی UDFHistory
    console.log('\n📊 بررسی داده‌های UDFHistory:');
    const udfHistoryCount = await UDFHistory.countDocuments();
    const latestUDFHistory = await UDFHistory.findOne().sort({ to: -1 });
    console.log(`تعداد کل رکوردها: ${udfHistoryCount}`);
    if (latestUDFHistory) {
      console.log('نماد:', latestUDFHistory.symbol);
      console.log('رزولوشن:', latestUDFHistory.resolution);
      console.log('از تاریخ:', new Date(latestUDFHistory.from).toLocaleString('fa-IR'));
      console.log('تا تاریخ:', new Date(latestUDFHistory.to).toLocaleString('fa-IR'));
      console.log('تعداد کندل‌ها:', latestUDFHistory.timestamps.length);
      
      // محاسبه میانگین قیمت‌ها
      const avgOpen = latestUDFHistory.open.reduce((a, b) => a + b, 0) / latestUDFHistory.open.length;
      const avgHigh = latestUDFHistory.high.reduce((a, b) => a + b, 0) / latestUDFHistory.high.length;
      const avgLow = latestUDFHistory.low.reduce((a, b) => a + b, 0) / latestUDFHistory.low.length;
      const avgClose = latestUDFHistory.close.reduce((a, b) => a + b, 0) / latestUDFHistory.close.length;
      const avgVolume = latestUDFHistory.volume.reduce((a, b) => a + b, 0) / latestUDFHistory.volume.length;

      console.log('میانگین قیمت باز شدن:', avgOpen.toLocaleString('fa-IR'));
      console.log('میانگین قیمت بالا:', avgHigh.toLocaleString('fa-IR'));
      console.log('میانگین قیمت پایین:', avgLow.toLocaleString('fa-IR'));
      console.log('میانگین قیمت بسته شدن:', avgClose.toLocaleString('fa-IR'));
      console.log('میانگین حجم:', avgVolume.toLocaleString('fa-IR'));
    }

    // آمار کلی
    console.log('\n📈 آمار کلی:');
    console.log(`تعداد کل رکوردهای OrderBook: ${orderBookCount}`);
    console.log(`تعداد کل رکوردهای Trade: ${tradeCount}`);
    console.log(`تعداد کل رکوردهای MarketStat: ${marketStatCount}`);
    console.log(`تعداد کل رکوردهای UDFHistory: ${udfHistoryCount}`);
    console.log(`مجموع کل رکوردها: ${orderBookCount + tradeCount + marketStatCount + udfHistoryCount}`);

  } catch (error) {
    console.error('❌ خطا در بررسی دیتابیس:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 اتصال به دیتابیس قطع شد');
  }
}

checkDatabase(); 