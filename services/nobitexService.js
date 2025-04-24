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
      lastUpdate: new Date(parseInt(response.data.lastUpdate)), // Convert to Date  
      lastTradePrice: parseFloat(response.data.lastTradePrice), // Convert to Number  
      bids: response.data.bids.map(([price, amount]) => ({  
        price: parseFloat(price), // Convert to Number  
        amount: parseFloat(amount) // Convert to Number  
      })),  
      asks: response.data.asks.map(([price, amount]) => ({  
        price: parseFloat(price), // Convert to Number  
        amount: parseFloat(amount) // Convert to Number  
      }))  
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
        time: new Date(trade.time), // Convert to Date  
        price: parseFloat(trade.price), // Convert to Number  
        volume: parseFloat(trade.volume), // Convert to Number  
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
      params: { srcCurrency, dstCurrency },
    });

    const statsKey = `${srcCurrency}-${dstCurrency}`;
    const stats = response.data.stats[statsKey];

    if (!stats) {
      throw new Error(`No stats found for ${statsKey}`);
    }

    return {
      symbol: statsKey,
      isClosed: stats.isClosed,
      bestSell: stats.bestSell,
      bestBuy: stats.bestBuy,
      volumeSrc: stats.volumeSrc,
      volumeDst: stats.volumeDst,
      latest: stats.latest,
      mark: stats.mark,
      dayLow: stats.dayLow,
      dayHigh: stats.dayHigh,
      dayOpen: stats.dayOpen,
      dayClose: stats.dayClose,
      dayChange: stats.dayChange,
    };
  } catch (error) {
    throw new Error(`Failed to fetch market stats: ${error.message}`);
  }
}

  // دریافت آمار OHLC بازار (UDF History)
  async getUDFHistory(symbol, resolution, from, to) {
    try {
      const response = await axios.get(`${this.baseURL}/market/udf/history`, {
        params: { symbol, resolution, from, to },
      });

      if (!response.data || response.data.s !== 'ok') {
        throw new Error(`Invalid UDF history data for ${symbol}`);
      }

      return {
        timestamps: response.data.t,
        open: response.data.o,
        high: response.data.h,
        low: response.data.l,
        close: response.data.c,
        volume: response.data.v,
      };
    } catch (error) {
      throw new Error(`Failed to fetch UDF history: ${error.message}`);
    }
  }
}

module.exports = new NobitexService();
