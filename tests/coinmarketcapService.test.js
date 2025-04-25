const CoinmarketcapService = require('./coinmarketcapService');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');

describe('CoinmarketcapService', () => {
  let mock;

  beforeAll(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  afterAll(() => {
    mock.restore();
  });

  describe('_makeRequest', () => {
    it('should return data on successful API call', async () => {
      const mockResponse = { data: { status: { error_code: 0 }, data: { key: 'value' } } };
      mock.onGet('https://pro-api.coinmarketcap.com/v1/test-endpoint').reply(200, mockResponse);

      const result = await CoinmarketcapService._makeRequest('/test-endpoint');
      expect(result).toEqual({ key: 'value' });
    });

    it('should throw an error on API failure', async () => {
      const mockError = { status: { error_code: 1001, error_message: 'Invalid API Key' } };
      mock.onGet('https://pro-api.coinmarketcap.com/v1/test-endpoint').reply(401, { data: mockError });

      await expect(CoinmarketcapService._makeRequest('/test-endpoint')).rejects.toThrow('Invalid API Key');
    });
  });

  describe('getCryptocurrencyQuotesLatest', () => {
    it('should fetch cryptocurrency quotes', async () => {
      const mockResponse = {
        data: {
          1: {
            id: 1,
            name: 'Bitcoin',
            symbol: 'BTC',
            quote: { USD: { price: 50000 } },
          },
        },
      };
      mock.onGet('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest').reply(200, mockResponse);

      const result = await CoinmarketcapService.getCryptocurrencyQuotesLatest({ id: 1 });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('saveCryptocurrencyQuotes', () => {
    it('should save cryptocurrency quotes to the database', async () => {
      const mockData = {
        1: {
          id: 1,
          name: 'Bitcoin',
          symbol: 'BTC',
          quote: { USD: { price: 50000 } },
        },
      };

      const bulkWriteMock = jest.fn();
      jest.spyOn(require('../models/coinmarketcap/CryptocurrencyQuote'), 'bulkWrite').mockImplementation(bulkWriteMock);

      await CoinmarketcapService.saveCryptocurrencyQuotes(mockData);

      expect(bulkWriteMock).toHaveBeenCalled();
    });
  });

  describe('fetchAndSaveCryptocurrencyQuotes', () => {
    it('should fetch and save cryptocurrency quotes', async () => {
      const mockResponse = {
        data: {
          1: {
            id: 1,
            name: 'Bitcoin',
            symbol: 'BTC',
            quote: { USD: { price: 50000 } },
          },
        },
      };
      mock.onGet('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest').reply(200, mockResponse);

      const saveMock = jest.spyOn(CoinmarketcapService, 'saveCryptocurrencyQuotes').mockResolvedValue();

      await CoinmarketcapService.fetchAndSaveCryptocurrencyQuotes({ id: 1 });

      expect(saveMock).toHaveBeenCalledWith(mockResponse.data);
    });
  });

  describe('getOHLCVHistorical', () => {
    it('should fetch OHLCV historical data', async () => {
      const mockResponse = {
        data: {
          id: 1,
          name: 'Bitcoin',
          quotes: [{ time_open: '2023-01-01T00:00:00Z', quote: { USD: { open: 50000 } } }],
        },
      };
      mock.onGet('https://pro-api.coinmarketcap.com/v1/cryptocurrency/ohlcv/historical').reply(200, mockResponse);

      const result = await CoinmarketcapService.getOHLCVHistorical({ id: 1 });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('saveOHLCVData', () => {
    it('should save OHLCV data to the database', async () => {
      const mockData = {
        id: 1,
        name: 'Bitcoin',
        quotes: [{ time_open: '2023-01-01T00:00:00Z', quote: { USD: { open: 50000 } } }],
      };

      const bulkWriteMock = jest.fn();
      jest.spyOn(require('../models/coinmarketcap/OHLCV'), 'bulkWrite').mockImplementation(bulkWriteMock);

      await CoinmarketcapService.saveOHLCVData(mockData);

      expect(bulkWriteMock).toHaveBeenCalled();
    });
  });

  describe('fetchAndSaveOHLCVData', () => {
    it('should fetch and save OHLCV data', async () => {
      const mockResponse = {
        data: {
          id: 1,
          name: 'Bitcoin',
          quotes: [{ time_open: '2023-01-01T00:00:00Z', quote: { USD: { open: 50000 } } }],
        },
      };
      mock.onGet('https://pro-api.coinmarketcap.com/v1/cryptocurrency/ohlcv/historical').reply(200, mockResponse);

      const saveMock = jest.spyOn(CoinmarketcapService, 'saveOHLCVData').mockResolvedValue();

      await CoinmarketcapService.fetchAndSaveOHLCVData({ id: 1 });

      expect(saveMock).toHaveBeenCalledWith(mockResponse.data);
    });
  });

  describe('getPricePerformanceStats', () => {
    it('should fetch price performance stats', async () => {
      const mockResponse = {
        data: {
          1: {
            id: 1,
            name: 'Bitcoin',
            periods: { all_time: { quote: { USD: { open: 100, close: 50000 } } } },
          },
        },
      };
      mock.onGet('https://pro-api.coinmarketcap.com/v1/cryptocurrency/price-performance-stats/latest').reply(200, mockResponse);

      const result = await CoinmarketcapService.getPricePerformanceStats({ id: 1 });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('savePricePerformanceStats', () => {
    it('should save price performance stats to the database', async () => {
      const mockData = {
        1: {
          id: 1,
          name: 'Bitcoin',
          periods: { all_time: { quote: { USD: { open: 100, close: 50000 } } } },
        },
      };

      const bulkWriteMock = jest.fn();
      jest.spyOn(require('../models/coinmarketcap/PricePerformanceStats'), 'bulkWrite').mockImplementation(bulkWriteMock);

      await CoinmarketcapService.savePricePerformanceStats(mockData);

      expect(bulkWriteMock).toHaveBeenCalled();
    });
  });

  describe('fetchAndSavePricePerformanceStats', () => {
    it('should fetch and save price performance stats', async () => {
      const mockResponse = {
        data: {
          1: {
            id: 1,
            name: 'Bitcoin',
            periods: { all_time: { quote: { USD: { open: 100, close: 50000 } } } },
          },
        },
      };
      mock.onGet('https://pro-api.coinmarketcap.com/v1/cryptocurrency/price-performance-stats/latest').reply(200, mockResponse);

      const saveMock = jest.spyOn(CoinmarketcapService, 'savePricePerformanceStats').mockResolvedValue();

      await CoinmarketcapService.fetchAndSavePricePerformanceStats({ id: 1 });

      expect(saveMock).toHaveBeenCalledWith(mockResponse.data);
    });
  });
});