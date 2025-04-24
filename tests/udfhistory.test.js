const mongoose = require('mongoose');  
const nobitexService = require('../services/nobitexService');  
const UDFHistory = require('../models/UDFHistory');  

describe('UDF History API and Database Tests', () => {  
  beforeAll(async () => {  
    // Connect to test database  
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nobitex_test', {  
      useNewUrlParser: true,  
      useUnifiedTopology: true  
    });  
  });  

  afterAll(async () => {  
    // Cleanup and close connection  
    await UDFHistory.deleteMany({});  
    await mongoose.connection.close();  
  });  

  beforeEach(async () => {  
    // Clear the collection before each test  
    await UDFHistory.deleteMany({});  
  });  

  it('should fetch UDF history from API and save to database', async () => {  
    // Test data  
    const symbol = 'BTCIRT';  
    const resolution = 'D';  
    const from = 1562058167; // Example timestamp  
    const to = 1562230967; // Example timestamp  

    // Fetch data from API  
    const udfHistoryData = await nobitexService.getUDFHistory(symbol, resolution, from, to);  

    // Verify API response  
    expect(udfHistoryData).toBeDefined();  
    expect(udfHistoryData.symbol).toBe(symbol);  
    expect(udfHistoryData.resolution).toBe(resolution);  
    expect(udfHistoryData.from).toBeInstanceOf(Date);  
    expect(udfHistoryData.to).toBeInstanceOf(Date);  
    expect(Array.isArray(udfHistoryData.timestamps)).toBe(true);  
    expect(Array.isArray(udfHistoryData.open)).toBe(true);  
    expect(Array.isArray(udfHistoryData.high)).toBe(true);  
    expect(Array.isArray(udfHistoryData.low)).toBe(true);  
    expect(Array.isArray(udfHistoryData.close)).toBe(true);  
    expect(Array.isArray(udfHistoryData.volume)).toBe(true);  

    // Create database entry  
    const savedUDFHistory = await UDFHistory.create({  
      symbol,  
      resolution,  
      from: udfHistoryData.from,  
      to: udfHistoryData.to,  
      timestamps: udfHistoryData.timestamps,  
      open: udfHistoryData.open,  
      high: udfHistoryData.high,  
      low: udfHistoryData.low,  
      close: udfHistoryData.close,  
      volume: udfHistoryData.volume  
    });  

    // Verify database entry  
    expect(savedUDFHistory).toBeDefined();  
    expect(savedUDFHistory.symbol).toBe(symbol);  
    expect(savedUDFHistory.resolution).toBe(resolution);  
    expect(savedUDFHistory.from).toEqual(udfHistoryData.from);  
    expect(savedUDFHistory.to).toEqual(udfHistoryData.to);  
    expect(savedUDFHistory.timestamps.length).toBe(udfHistoryData.timestamps.length);  
    expect(savedUDFHistory.open.length).toBe(udfHistoryData.open.length);  
    expect(savedUDFHistory.high.length).toBe(udfHistoryData.high.length);  
    expect(savedUDFHistory.low.length).toBe(udfHistoryData.low.length);  
    expect(savedUDFHistory.close.length).toBe(udfHistoryData.close.length);  
    expect(savedUDFHistory.volume.length).toBe(udfHistoryData.volume.length);  
  });  

  it('should handle API errors gracefully', async () => {  
    // Test with invalid parameters  
    const symbol = 'INVALID';  
    const resolution = 'D';  
    const from = 1562058167;  
    const to = 1562230967;  

    await expect(nobitexService.getUDFHistory(symbol, resolution, from, to))  
      .rejects  
      .toThrow('Failed to fetch UDF history');  
  });  
});