require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const OrderBook = require('../models/OrderBook');
const Trade = require('../models/Trade');
const MarketStat = require('../models/MarketStat');
const UDFHistory = require('../models/UDFHistory');

const BASE_URL = 'http://localhost:3000/api';
const SYMBOLS = ['BTCIRT', 'ETHIRT', 'LTCIRT', 'XRPIRT', 'DOGEIRT', 'ADAIRT', 'TRXIRT', 'XLMIRT', 'DOTIRT', 'BNBIRT'];

async function testOrderBook(symbol) {
  try {
    console.log(`\n🔄 تست API سفارش‌ها برای ${symbol}...`);
    const response = await axios.get(`${BASE_URL}/orderbook/${symbol}`);
    await OrderBook.create({
      symbol,
      version: 'v2',
      lastUpdate: new Date(parseInt(response.data.lastUpdate)),
      lastTradePrice: parseFloat(response.data.lastTradePrice),
      asks: response.data.asks.map(([price, amount]) => ({
        price: parseFloat(price),
        amount: parseFloat(amount)
      })),
      bids: response.data.bids.map(([price, amount]) => ({
        price: parseFloat(price),
        amount: parseFloat(amount)
      }))
    });
    console.log(`✅ سفارش‌های ${symbol} با موفقیت ذخیره شد`);
    return response.data;
  } catch (error) {
    console.error(`❌ خطا در دریافت سفارش‌های ${symbol}:`, error.message);
    return null;
  }
}

async function testDepth(symbol) {
  try {
    console.log(`\n🔄 تست API عمق بازار برای ${symbol}...`);
    const response = await axios.get(`${BASE_URL}/depth/${symbol}`);
    console.log(`✅ عمق بازار ${symbol} با موفقیت دریافت شد`);
    return response.data;
  } catch (error) {
    console.error(`❌ خطا در دریافت عمق بازار ${symbol}:`, error.message);
    return null;
  }
}

async function testTrades(symbol) {
  try {
    console.log(`\n🔄 تست API معاملات برای ${symbol}...`);
    const response = await axios.get(`${BASE_URL}/trades/${symbol}`);
    await Trade.insertMany(response.data.trades.map(trade => ({
      symbol,
      time: new Date(parseInt(trade.time)),
      price: parseFloat(trade.price),
      volume: parseFloat(trade.volume),
      type: trade.type
    })));
    console.log(`✅ معاملات ${symbol} با موفقیت ذخیره شد`);
    return response.data;
  } catch (error) {
    console.error(`❌ خطا در دریافت معاملات ${symbol}:`, error.message);
    return null;
  }
}

async function testMarketStats() {
  try {
    console.log('\n🔄 تست API آمار بازار...');
    const response = await axios.get(`${BASE_URL}/market/stats`);
    const marketStat = response.data.stats['btc-rls'];
    await MarketStat.create({
      symbol: 'BTCRLS',
      isClosed: marketStat.isClosed,
      bestSell: parseFloat(marketStat.bestSell),
      bestBuy: parseFloat(marketStat.bestBuy),
      volumeSrc: parseFloat(marketStat.volumeSrc),
      volumeDst: parseFloat(marketStat.volumeDst),
      latest: parseFloat(marketStat.latest),
      mark: parseFloat(marketStat.mark),
      dayLow: parseFloat(marketStat.dayLow),
      dayHigh: parseFloat(marketStat.dayHigh),
      dayOpen: parseFloat(marketStat.dayOpen),
      dayClose: parseFloat(marketStat.dayClose),
      dayChange: parseFloat(marketStat.dayChange)
    });
    console.log('✅ آمار بازار با موفقیت ذخیره شد');
    return response.data;
  } catch (error) {
    console.error('❌ خطا در دریافت آمار بازار:', error.message);
    return null;
  }
}

async function testUDFHistory() {
  try {
    console.log('\n🔄 تست API تاریخچه OHLC...');
    const from = Math.floor(Date.now() / 1000) - 86400; // 24 ساعت قبل
    const to = Math.floor(Date.now() / 1000);
    const response = await axios.get(`${BASE_URL}/udf/history`, {
      params: {
        symbol: 'BTCIRT',
        resolution: 'D',
        from,
        to
      }
    });
    if (response.data.s === 'ok') {
      await UDFHistory.create({
        symbol: 'BTCIRT',
        resolution: 'D',
        from: new Date(from * 1000),
        to: new Date(to * 1000),
        timestamps: response.data.t.map(t => new Date(t * 1000)),
        open: response.data.o.map(parseFloat),
        high: response.data.h.map(parseFloat),
        low: response.data.l.map(parseFloat),
        close: response.data.c.map(parseFloat),
        volume: response.data.v.map(parseFloat)
      });
      console.log('✅ تاریخچه OHLC با موفقیت ذخیره شد');
    }
    return response.data;
  } catch (error) {
    console.error('❌ خطا در دریافت تاریخچه OHLC:', error.message);
    return null;
  }
}

async function testGlobalStats() {
  try {
    console.log('\n🔄 تست API آمار جهانی...');
    const response = await axios.get(`${BASE_URL}/global/stats`);
    console.log('✅ آمار جهانی با موفقیت دریافت شد');
    return response.data;
  } catch (error) {
    console.error('❌ خطا در دریافت آمار جهانی:', error.message);
    return null;
  }
}

async function testAllApis() {
  try {
    // اتصال به دیتابیس
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ اتصال به دیتابیس برقرار شد');

    // تست API‌های مختلف
    const results = {
      orderbook: {},
      depth: {},
      trades: {},
      marketStats: null,
      udfHistory: null,
      globalStats: null
    };

    // تست API‌های مرتبط با نمادها
    for (const symbol of SYMBOLS) {
      results.orderbook[symbol] = await testOrderBook(symbol);
      results.depth[symbol] = await testDepth(symbol);
      results.trades[symbol] = await testTrades(symbol);
    }

    // تست API‌های عمومی
    results.marketStats = await testMarketStats();
    results.udfHistory = await testUDFHistory();
    results.globalStats = await testGlobalStats();

    console.log('\n✨ نتایج تست API‌ها:');
    console.log(JSON.stringify(results, null, 2));

  } catch (error) {
    console.error('❌ خطا در تست API‌ها:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 اتصال به دیتابیس قطع شد');
  }
}

testAllApis(); 