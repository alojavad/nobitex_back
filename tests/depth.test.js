const mongoose = require('mongoose');  
const nobitexService = require('../services/nobitexService');  
const Depth = require('../models/Depth');  

describe('Depth API and Database Tests', () => {  
  beforeAll(async () => {  
    // Connect to test database  
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nobitex_test', {  
      useNewUrlParser: true,  
      useUnifiedTopology: true  
    });  
  });  

  afterAll(async () => {  
    // Cleanup and close connection  
    await Depth.deleteMany({});  
    await mongoose.connection.close();  
  });  

  beforeEach(async () => {  
    // Clear the collection before each test  
    await Depth.deleteMany({});  
  });  

  it('should fetch market depth from API and save to database', async () => {  
    // Test data  
    const symbol = 'BTCIRT';  

    // Fetch data from API  
    const depthData = await nobitexService.getDepth(symbol);  

    // Verify API response  
    expect(depthData).toBeDefined();  
    expect(depthData.status).toBe('ok');  
    expect(depthData.bids).toBeDefined();  
    expect(depthData.asks).toBeDefined();  
    expect(Array.isArray(depthData.bids)).toBe(true);  
    expect(Array.isArray(depthData.asks)).toBe(true);  

    // Create database entry  
    const savedDepth = await Depth.create({  
      symbol,  
      lastUpdate: depthData.lastUpdate,  
      lastTradePrice: depthData.lastTradePrice,  
      bids: depthData.bids,  
      asks: depthData.asks  
    });  

    // Verify database entry  
    expect(savedDepth).toBeDefined();  
    expect(savedDepth.symbol).toBe(symbol);  
    expect(savedDepth.lastTradePrice).toBe(depthData.lastTradePrice);  
    expect(savedDepth.bids.length).toBe(depthData.bids.length);  
    expect(savedDepth.asks.length).toBe(depthData.asks.length);  

    // Verify data types  
    expect(typeof savedDepth.lastTradePrice).toBe('number');  
    expect(savedDepth.lastUpdate instanceof Date).toBe(true);  
    expect(typeof savedDepth.bids[0].price).toBe('number');  
    expect(typeof savedDepth.bids[0].amount).toBe('number');  
    expect(typeof savedDepth.asks[0].price).toBe('number');  
    expect(typeof savedDepth.asks[0].amount).toBe('number');  
  });  

  it('should handle API errors gracefully', async () => {  
    // Test with invalid symbol  
    const symbol = 'INVALID';  

    await expect(nobitexService.getDepth(symbol))  
      .rejects  
      .toThrow('Failed to fetch market depth');  
  });  
});