const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const MarketStat = require('../models/MarketStat');
const nobitexService = require('../services/nobitexService');
const OrderBook = require('../models/OrderBook');

jest.mock('../services/nobitexService');
jest.mock('../models/OrderBook');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await MarketStat.deleteMany({});
});

describe('Market Controller Tests', () => {
  describe('GET /market/stats', () => {
    it('should fetch and store market stats successfully', async () => {
      const mockStats = {
        status: 'ok',
        stats: {
          'btc-rls': {
            isClosed: false,
            bestSell: '1000000000',
            bestBuy: '990000000',
            volumeSrc: '10.5',
            volumeDst: '10500000000',
            latest: '995000000',
            mark: '994000000',
            dayLow: '980000000',
            dayHigh: '1010000000',
            dayOpen: '1000000000',
            dayClose: '995000000',
            dayChange: '-0.5'
          }
        }
      };

      jest.spyOn(nobitexService, 'getMarketStats').mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/market/stats')
        .query({ srcCurrency: 'btc', dstCurrency: 'rls' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockStats.stats['btc-rls']);

      // Verify data was stored correctly
      const storedStat = await MarketStat.findOne({ symbol: 'BTCRLS' });
      expect(storedStat).toBeTruthy();
      expect(storedStat.isClosed).toBe(false);
      expect(storedStat.bestSell).toBe(1000000000);
      expect(storedStat.bestBuy).toBe(990000000);
      expect(storedStat.volumeSrc).toBe(10.5);
      expect(storedStat.volumeDst).toBe(10500000000);
      expect(storedStat.latest).toBe(995000000);
      expect(storedStat.mark).toBe(994000000);
      expect(storedStat.dayLow).toBe(980000000);
      expect(storedStat.dayHigh).toBe(1010000000);
      expect(storedStat.dayOpen).toBe(1000000000);
      expect(storedStat.dayClose).toBe(995000000);
      expect(storedStat.dayChange).toBe(-0.5);
    });

    it('should handle API errors gracefully', async () => {
      jest.spyOn(nobitexService, 'getMarketStats')
        .mockRejectedValue(new Error('API Error'));

      const response = await request(app)
        .get('/market/stats')
        .query({ srcCurrency: 'btc', dstCurrency: 'rls' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('API Error');

      // Verify no data was stored
      const count = await MarketStat.countDocuments();
      expect(count).toBe(0);
    });

    it('should handle invalid market stats data', async () => {
      const mockInvalidStats = {
        status: 'ok'
      };

      jest.spyOn(nobitexService, 'getMarketStats').mockResolvedValue(mockInvalidStats);

      const response = await request(app)
        .get('/market/stats')
        .query({ srcCurrency: 'btc', dstCurrency: 'rls' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Invalid market stats data received');

      // Verify no data was stored
      const count = await MarketStat.countDocuments();
      expect(count).toBe(0);
    });

    it('should handle missing symbol data', async () => {
      const mockStats = {
        status: 'ok',
        stats: {}
      };

      jest.spyOn(nobitexService, 'getMarketStats').mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/market/stats')
        .query({ srcCurrency: 'btc', dstCurrency: 'rls' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('No stats found for symbol BTCRLS');

      // Verify no data was stored
      const count = await MarketStat.countDocuments();
      expect(count).toBe(0);
    });

    it('should use default currency values when not provided', async () => {
      const mockStats = {
        status: 'ok',
        stats: {
          'btc-rls': {
            isClosed: false,
            bestSell: '1000000000',
            bestBuy: '990000000',
            volumeSrc: '10.5',
            volumeDst: '10500000000',
            latest: '995000000',
            mark: '994000000',
            dayLow: '980000000',
            dayHigh: '1010000000',
            dayOpen: '1000000000',
            dayClose: '995000000',
            dayChange: '-0.5'
          }
        }
      };

      jest.spyOn(nobitexService, 'getMarketStats').mockResolvedValue(mockStats);

      const response = await request(app).get('/market/stats');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockStats);

      const storedStat = await MarketStat.findOne({ symbol: 'BTCRLS' });
      expect(storedStat).toBeTruthy();
    });
  });
});

describe('Market Controller - getOrderBook', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and save order book data successfully', async () => {
    const mockOrderBook = {
      status: 'ok',
      lastUpdate: Date.now().toString(),
      lastTradePrice: '123456.78',
      asks: [['123457', '1.5']],
      bids: [['123456', '2.0']],
    };

    nobitexService.getOrderBook.mockResolvedValue(mockOrderBook);
    OrderBook.create.mockResolvedValue({});

    const response = await request(app)
      .get('/api/market/orderbook/BTCIRT?version=v3') // Assuming this is the endpoint
      .send();

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(OrderBook.create).toHaveBeenCalledWith({
      symbol: 'BTCIRT',
      version: 'v3',
      lastUpdate: expect.any(Date),
      lastTradePrice: 123456.78,
      asks: [{ price: 123457, amount: 1.5 }],
      bids: [{ price: 123456, amount: 2.0 }],
    });
  });

  it('should return 400 if symbol is missing', async () => {
    const response = await request(app)
      .get('/api/market/orderbook/') // Missing symbol
      .send();

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Symbol is required');
  });

  it('should return 500 if order book data is invalid', async () => {
    nobitexService.getOrderBook.mockResolvedValue(null);

    const response = await request(app)
      .get('/api/market/orderbook/BTCIRT?version=v3')
      .send();

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Invalid order book data received');
  });

  it('should return 500 if there is a server error', async () => {
    nobitexService.getOrderBook.mockRejectedValue(new Error('Service error'));

    const response = await request(app)
      .get('/api/market/orderbook/BTCIRT?version=v3')
      .send();

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Service error');
  });
});

describe('GET /market/trades', () => {
  it('should fetch and store trades successfully', async () => {
    const mockTrades = {
      status: 'ok',
      trades: [{
        price: '995000000',
        amount: '0.5',
        timestamp: '1625097600000',
        type: 'sell'
      }]
    };

    nobitexService.getTrades.mockResolvedValue(mockTrades);

    const response = await request(app)
      .get('/market/trades/btc-rls')
      .expect(200);

    expect(response.body).toEqual(mockTrades);
    
    const savedTrades = await Trade.find();
    expect(savedTrades).toHaveLength(1);
    expect(savedTrades[0]).toMatchObject({
      symbol: 'btc-rls',
      time: new Date(1625097600000),
      price: 995000000,
      volume: 0.5,
      type: 'sell'
    });
  });

  it('should handle API errors gracefully', async () => {
    nobitexService.getTrades.mockRejectedValue(new Error('API Error'));

    await request(app)
      .get('/market/trades/btc-rls')
      .expect(500)
      .expect({ error: 'API Error' });
  });
});