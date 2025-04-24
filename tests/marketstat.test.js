const mongoose = require('mongoose');  
const nobitexService = require('../services/nobitexService');  
const MarketStat = require('../models/MarketStat');  

describe('MarketStat API and Database Tests', () => {  
  beforeAll(async () => {  
    // Connect to test database  
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nobitex_test', {  
      useNewUrlParser: true,  
      useUnifiedTopology: true  
    });  
  });  

  afterAll(async () => {  
    // Cleanup and close connection  
    await MarketStat.deleteMany({});  
    await mongoose.connection.close();  
  });  

  beforeEach(async () => {  
    // Clear the collection before each test  
    await MarketStat.deleteMany({});  
  });  

  it('should fetch market stats from API and save to database', async () => {  
    // Test data  
    const srcCurrency = 'btc';  
    const dstCurrency = 'rls';  

    // Fetch data from API  
    const marketStats = await nobitexService.getMarketStats(srcCurrency, dstCurrency);  

    // Verify API response  
    expect(marketStats).toBeDefined();  
    expect(marketStats.symbol).toBe(`${srcCurrency}-${dstCurrency}`);  
    expect(typeof marketStats.bestSell).toBe('number');  
    expect(typeof marketStats.bestBuy).toBe('number');  
    expect(Array.isArray([])).toBe(true); // Just to illustrate we can check arrays even though there are none in marketStats  

    // Create database entry  
    const savedMarketStat = await MarketStat.create({  
      symbol: marketStats.symbol,  
      isClosed: marketStats.isClosed,  
      bestSell: marketStats.bestSell,  
      bestBuy: marketStats.bestBuy,  
      volumeSrc: marketStats.volumeSrc,  
      volumeDst: marketStats.volumeDst,  
      latest: marketStats.latest,  
      mark: marketStats.mark,  
      dayLow: marketStats.dayLow,  
      dayHigh: marketStats.dayHigh,  
      dayOpen: marketStats.dayOpen,  
      dayClose: marketStats.dayClose,  
      dayChange: marketStats.dayChange,  
      lastUpdate: marketStats.lastUpdate, // already a Date  
    });  

    // Verify database entry  
    expect(savedMarketStat).toBeDefined();  
    expect(savedMarketStat.symbol).toBe(marketStats.symbol);  
    expect(savedMarketStat.bestSell).toBe(marketStats.bestSell);  
    expect(savedMarketStat.bestBuy).toBe(marketStats.bestBuy);  

    // Verify data types  
    expect(typeof savedMarketStat.bestSell).toBe('number');  
    expect(typeof savedMarketStat.bestBuy).toBe('number');  
    expect(savedMarketStat.lastUpdate instanceof Date).toBe(true);  
  });  

  it('should handle API errors gracefully', async () => {  
    // Test with invalid srcCurrency or dstCurrency  
    const srcCurrency = 'INVALID';  
    const dstCurrency = 'rls';  

    await expect(nobitexService.getMarketStats(srcCurrency, dstCurrency))  
      .rejects  
      .toThrow('Failed to fetch market stats');  
  });  

  it('should save market statistics with the correct data structure', async () => {  
    const srcCurrency = 'btc';  
    const dstCurrency = 'rls';  
    const marketStats = await nobitexService.getMarketStats(srcCurrency, dstCurrency);  

    const savedMarketStat = await MarketStat.create(marketStats);  

    expect(savedMarketStat).toHaveProperty('symbol', marketStats.symbol);  
    expect(savedMarketStat).toHaveProperty('bestSell', marketStats.bestSell);  
    expect(savedMarketStat).toHaveProperty('bestBuy', marketStats.bestBuy);  
    expect(savedMarketStat).toHaveProperty('lastUpdate'); // Ensure lastUpdate exists  
    expect(savedMarketStat.lastUpdate).toBeInstanceOf(Date); // Ensure it's a Date instance  
  });  
});