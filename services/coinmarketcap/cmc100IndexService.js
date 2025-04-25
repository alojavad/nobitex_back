class CMC100IndexService {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  // ==================== LATEST CMC100 INDEX ENDPOINT ====================
  async getLatestCMC100Index(options = {}) {
    return this.apiClient.makeRequest('/v3/index/cmc100-latest', params);
  }

  // ==================== HISTORICAL CMC100 INDEX ENDPOINT ====================
  async getHistoricalCMC100Index(options = {}) {
    const params = {
      time_start: options.time_start,
      time_end: options.time_end,
      count: options.count || 10,
      interval: options.interval || 'daily',
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v3/index/cmc100-historical', params);
  }
}

module.exports = CMC100IndexService;