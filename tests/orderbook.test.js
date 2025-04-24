const mongoose = require('mongoose');
const nobitexService = require('../services/nobitexService');
const OrderBook = require('../models/OrderBook');

describe('OrderBook API and Database Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nobitex_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  afterAll(async () => {
    // Cleanup and close connection
    await OrderBook.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear the collection before each test
    await OrderBook.deleteMany({});
  });

  it('should fetch orderbook data from API and save to database', async () => {
    // Test data
    const symbol = 'BTCIRT';
    const version = 'v3';

    // Fetch data from API
    const orderbook = await nobitexService.getOrderBook(symbol, version);

    // Verify API response
    expect(orderbook).toBeDefined();
    expect(orderbook.status).toBe('ok');
    expect(Array.isArray(orderbook.asks)).toBe(true);
    expect(Array.isArray(orderbook.bids)).toBe(true);

    // Create database entry
    const savedOrderBook = await OrderBook.create({
      symbol,
      version,
      lastUpdate: new Date(parseInt(orderbook.lastUpdate)),
      lastTradePrice: parseFloat(orderbook.lastTradePrice),
      asks: orderbook.asks.map(([price, amount]) => ({
        price: parseFloat(price),
        amount: parseFloat(amount)
      })),
      bids: orderbook.bids.map(([price, amount]) => ({
        price: parseFloat(price),
        amount: parseFloat(amount)
      }))
    });

    // Verify database entry
    expect(savedOrderBook).toBeDefined();
    expect(savedOrderBook.symbol).toBe(symbol);
    expect(savedOrderBook.version).toBe(version);
    expect(savedOrderBook.asks.length).toBe(orderbook.asks.length);
    expect(savedOrderBook.bids.length).toBe(orderbook.bids.length);

    // Verify data types
    expect(typeof savedOrderBook.lastTradePrice).toBe('number');
    expect(savedOrderBook.lastUpdate instanceof Date).toBe(true);
    expect(typeof savedOrderBook.asks[0].price).toBe('number');
    expect(typeof savedOrderBook.asks[0].amount).toBe('number');
    expect(typeof savedOrderBook.bids[0].price).toBe('number');
    expect(typeof savedOrderBook.bids[0].amount).toBe('number');
  });

  it('should handle API errors gracefully', async () => {
    // Test with invalid symbol
    const symbol = 'INVALID';
    const version = 'v3';

    await expect(nobitexService.getOrderBook(symbol, version))
      .rejects
      .toThrow('Failed to fetch order book');
  });
});