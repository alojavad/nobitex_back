class FearAndGreedService {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  // ==================== LATEST FEAR AND GREED INDEX ENDPOINT ====================
  async getLatestFearAndGreedIndex(options = {}) {
    return this.apiClient.makeRequest('/v3/fear-and-greed/latest', params);
  }

  // ==================== HISTORICAL FEAR AND GREED INDEX ENDPOINT ====================
  async getHistoricalFearAndGreedIndex(options = {}) {
    const params = {
      start: options.start || 1,
      limit: options.limit || 50,
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v3/fear-and-greed/historical', params);
  }
}

module.exports = FearAndGreedService;