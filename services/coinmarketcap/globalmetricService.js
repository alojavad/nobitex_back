class GlobalMetricService {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  // ==================== LATEST GLOBAL METRICS ENDPOINT ====================
  async getLatestGlobalMetrics(options = {}) {
    const params = {
      convert: options.convert || 'USD',
      convert_id: options.convert_id,
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v1/global-metrics/quotes/latest', params);
  }

  // ==================== HISTORICAL GLOBAL METRICS ENDPOINT ====================
  async getHistoricalGlobalMetrics(options = {}) {
    const params = {
      time_start: options.time_start,
      time_end: options.time_end,
      count: options.count || 10,
      interval: options.interval || 'daily',
      convert: options.convert || 'USD',
      convert_id: options.convert_id,
      aux: options.aux || 'btc_dominance,eth_dominance,active_cryptocurrencies,active_market_pairs,active_exchanges',
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v1/global-metrics/quotes/historical', params);
  }
}

module.exports = GlobalMetricService;