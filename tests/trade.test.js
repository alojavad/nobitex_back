const mongoose = require('mongoose');  
const nobitexService = require('../services/nobitexService');  
const Trade = require('../models/Trade');  

describe('Trade API and Database Tests', () => {  
  beforeAll(async () => {  
    // Connect to test database  
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nobitex_test', {  
      useNewUrlParser: true,  
      useUnifiedTopology: true  
    });  
  });  

  afterAll(async () => {  
    // Cleanup and close connection  
    await Trade.deleteMany({});  
    await mongoose.connection.close();  
  });  

  beforeEach(async () => {  
    // Clear the collection before each test  
    await Trade.deleteMany({});  
  });  

  it('should fetch trades from API and save to database', async () => {  
    // Test data  
    const symbol = 'BCHIRT';  

    // Fetch data from API  
    const tradeData = await nobitexService.getTrades(symbol);  

    // Verify API response  
    expect(tradeData).toBeDefined();  
    expect(tradeData.status).toBe('ok');  
    expect(Array.isArray(tradeData.trades)).toBe(true);  
    expect(tradeData.trades.length).toBeGreaterThan(0); // Ensure there are trades  

    // Create database entries  
    const savedTrades = await Trade.insertMany(  
      tradeData.trades.map(trade => ({  
        symbol,  
        time: trade.time,  
        price: trade.price,  
        volume: trade.volume,  
        type: trade.type  
      }))  
    );  

    // Verify database entries  
    expect(savedTrades).toBeDefined();  
    expect(savedTrades.length).toBe(tradeData.trades.length);  

    // Verify data types and values  
    savedTrades.forEach((savedTrade, index) => {  
      expect(savedTrade.symbol).toBe(symbol);  
      expect(savedTrade.time instanceof Date).toBe(true);  
      expect(typeof savedTrade.price).toBe('number');  
      expect(typeof savedTrade.volume).toBe('number');  
      expect(savedTrade.type).toBe(tradeData.trades[index].type);  
    });  
  });  

  it('should handle API errors gracefully', async () => {  
    // Test with invalid symbol  
    const symbol = 'INVALID';  

    await expect(nobitexService.getTrades(symbol))  
      .rejects  
      .toThrow('Failed to fetch trades');  
  });  
});