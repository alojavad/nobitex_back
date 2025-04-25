class ExchangeService {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  // ==================== MAP ENDPOINT ====================
  async getExchangeMap(options = {}) {
    const params = {
      listing_status: options.listing_status || 'active',
      start: options.start || 1,
      limit: options.limit || 5000,
      sort: options.sort || 'id',
      aux: options.aux || "first_historical_data,last_historical_data,is_active",
      slug: options.slug,
      crypto_id: options.crypto_id,
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v1/exchange/map', params);
  }

  // ==================== METADATA ENDPOINT ====================
  async getExchangeInfo(options = {}) {
    const params = {
      id: options.id,
      slug: options.slug,
      aux: options.aux || 'urls,logo,description,date_launched,notice',
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v1/exchange/info', params);
  }

  // ==================== LISTINGS ENDPOINT ====================
  async getExchangeListingsLatest(options = {}) {
    const params = {
      start: options.start || 1,
      limit: options.limit || 100,
      sort: options.sort || 'volume_24h',
      sort_dir: options.sort_dir || 'desc',
      aux: options.aux || "num_market_pairs,traffic_score,rank,exchange_score,effective_liquidity_24h",
      market_type: options.market_type || 'all',
      category: options.category || 'all',
      convert: options.convert,
      convert_id: options.convert_id,
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v1/exchange/listings/latest', params);
  }

  // ==================== QUOTES ENDPOINTS ====================
  async getExchangeQuotesLatest(options = {}) {
    const params = {
      id: options.id,
      slug: options.slug,
      convert: options.convert,
      convert_id: options.convert_id,
      aux: options.aux || "num_market_pairs,traffic_score,rank,exchange_score,liquidity_score,effective_liquidity_24h",
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v1/exchange/quotes/latest', params);
  }

  async getExchangeQuotesHistorical(options = {}) {
    const params = {
      id: options.id,
      slug: options.slug,
      count: options.count,
      time_start: options.time_start,
      time_end: options.time_end,
      interval: options.interval || '5m',
      convert: options.convert,
      convert_id: options.convert_id,
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v1/exchange/quotes/historical', params);
  }

  // ==================== MARKET PAIRS ENDPOINT ====================
  async getExchangeMarketPairsLatest(options = {}) {
    const params = {
      id: options.id,
      slug: options.slug,
      matched_id: options.matched_id,
      start: options.start || 1,
      limit: options.limit || 100,
      matched_symbol: options.matched_symbol,
      category: options.category || 'all',
      aux: options.aux || "num_market_pairs,category,fee_type",
      free_type: options.free_type || 'all',
      convert: options.convert,
      convert_id: options.convert_id,
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v1/exchange/market-pairs/latest', params);
  }

  // ==================== ASSETS ENDPOINT ====================
  async getExchangeAssets(options = {}) {
    const params = {
      id: options.id,
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v1/exchange/assets', params);
  }
}

module.exports = ExchangeService;