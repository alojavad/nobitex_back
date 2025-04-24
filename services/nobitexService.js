// services/nobitexService.js
const axios = require('axios');

class NobitexService {
  constructor() {
    this.baseURL = 'https://api.nobitex.ir';
    this.token = null;
  }

  // تنظیم توکن برای API‌های نیازمند احراز هویت
  setToken(token) {
    this.token = token;
  }

  // تنظیم هدرهای درخواست
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (this.token) {
      headers['Authorization'] = `Token ${this.token}`;
    }
    
    return headers;
  }

  // ===== API‌های عمومی بازار =====

  // دریافت لیست سفارش‌ها (Order Book)
  async getOrderBook(symbol = 'all', version = 'v3') {
    try {
      const response = await axios.get(`${this.baseURL}/${version}/orderbook/${symbol}`);
      return {
        status: response.data.status,
        lastUpdate: response.data.lastUpdate,
        lastTradePrice: response.data.lastTradePrice,
        asks: response.data.asks,
        bids: response.data.bids
      };
    } catch (error) {
      throw new Error(`Failed to fetch order book: ${error.message}`);
    }
  }

  // دریافت نمودار عمق (Depth)
  async getDepth(symbol = 'BTCIRT') {
    try {
      const response = await axios.get(`${this.baseURL}/v2/depth/${symbol}`);
      return {
        status: response.data.status,
        lastUpdate: response.data.lastUpdate,
        lastTradePrice: response.data.lastTradePrice,
        bids: response.data.bids,
        asks: response.data.asks
      };
    } catch (error) {
      throw new Error(`Failed to fetch market depth: ${error.message}`);
    }
  }

  // دریافت لیست معاملات (Trades)
  async getTrades(symbol = 'BTCIRT') {
    try {
      const response = await axios.get(`${this.baseURL}/v2/trades/${symbol}`);
      console.log(`${this.baseURL}/v2/trades/${symbol}`);
      return {
        status: response.data.status,
        trades: response.data.trades.map(trade => ({
          time: trade.time,
          price: trade.price,
          volume: trade.volume,
          type: trade.type
        }))
      };
    } catch (error) {
      throw new Error(`Failed to fetch trades: ${error.message}`);
    }
  }

  // دریافت آمار بازار (Market Stats)
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
      throw new Error(`Failed to fetch market stats: ${error.message}`);
    }
  }

  // دریافت آمار OHLC بازار (UDF History)
  async getUDFHistory(symbol = 'BTCIRT', resolution = 'D', from, to) {
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
      throw new Error(`Failed to fetch UDF history: ${error.message}`);
    }
  }
}

module.exports = new NobitexService();
