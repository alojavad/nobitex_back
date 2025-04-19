// services/nobitexService.js
const axios = require('axios');

class NobitexService {
  constructor() {
    this.baseURL = 'https://api.nobitex.ir';
  }

  // Get order book (v2 and v3)
  async getOrderBook(symbol, version = 'v2') {
    try {
      const response = await axios.get(`${this.baseURL}/${version}/orderbook/${symbol}`);
      return response.data;
    } catch (error) {
      console.error('Get order book error:', error);
      throw error;
    }
  }

  // Get market depth
  async getDepth(symbol) {
    try {
      const response = await axios.get(`${this.baseURL}/v2/depth/${symbol}`);
      return response.data;
    } catch (error) {
      console.error('Get depth error:', error);
      throw error;
    }
  }

  // Get recent trades
  async getTrades(symbol) {
    try {
      const response = await axios.get(`${this.baseURL}/v2/trades/${symbol}`);
      return response.data;
    } catch (error) {
      console.error('Get trades error:', error);
      throw error;
    }
  }

  // Get market stats
  async getMarketStats(srcCurrency = 'btc', dstCurrency = 'rls') {
    try {
      const response = await axios.get(`${this.baseURL}/market/stats`, {
        params: {
          srcCurrency,
          dstCurrency
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get market stats error:', error);
      throw error;
    }
  }

  // Get UDF history
  async getUDFHistory(symbol, resolution, from, to) {
    try {
      const response = await axios.get(`${this.baseURL}/market/udf/history`, {
        params: {
          symbol,
          resolution,
          from,
          to
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get UDF history error:', error);
      throw error;
    }
  }

  // Get global stats
  async getGlobalStats() {
    try {
      const response = await axios.post(`${this.baseURL}/market/global-stats`);
      return response.data;
    } catch (error) {
      console.error('Get global stats error:', error);
      throw error;
    }
  }
}

module.exports = new NobitexService();
