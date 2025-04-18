// services/nobitexService.js
const axios = require('axios');

class NobitexService {
  constructor() {
    this.baseURL = 'https://api.nobitex.ir';
    this.token = process.env.NOBITEX_TOKEN || null;
  }

  async login() {
    try {
      if (this.token) {
        return this.token;
      }
      
      const response = await axios.post(`${this.baseURL}/auth/login/`, {
        username: process.env.NOBITEX_USERNAME,
        password: process.env.NOBITEX_PASSWORD
      });
      this.token = response.data.key;
      return this.token;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async getOrders() {
    try {
      if (!this.token) {
        await this.login();
      }
      
      const response = await axios.post(`${this.baseURL}/market/orders/list`, {
        order: '-price',
        type: 'sell',
        dstCurrency: 'usdt'
      }, {
        headers: { 'Authorization': `Token ${this.token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Get orders error:', error);
      throw error;
    }
  }

  async getTrades(srcCurrency = 'btc', dstCurrency = 'rls') {
    try {
      if (!this.token) {
        await this.login();
      }
      
      const response = await axios.post(`${this.baseURL}/market/trades/list`, {
        srcCurrency,
        dstCurrency
      }, {
        headers: { 'Authorization': `Token ${this.token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Get trades error:', error);
      throw error;
    }
  }

  async getMarketStats(srcCurrency = 'btc', dstCurrency = 'rls') {
    try {
      if (!this.token) {
        await this.login();
      }
      
      const response = await axios.post(`${this.baseURL}/market/stats`, {
        srcCurrency,
        dstCurrency
      }, {
        headers: { 'Authorization': `Token ${this.token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Get market stats error:', error);
      throw error;
    }
  }
}

module.exports = new NobitexService();
