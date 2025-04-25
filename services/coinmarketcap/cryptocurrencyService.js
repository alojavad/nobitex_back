class CryptocurrencyService {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  // ==================== MAP ENDPOINT ====================
  async getMap(options = {}) {
    const params = {
      listing_status: options.listing_status || 'active',
      start: options.start || 1,
      limit: options.limit || 5000,
      sort: options.sort || 'id',
      symbol: options.symbol, // Comma-separated symbols
      aux: options.aux || 'platform,first_historical_data,last_historical_data,is_active'
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
    return this.apiClient.makeRequest('/v1/cryptocurrency/map', params);
  }

  // ==================== METADATA ENDPOINT ====================
  async getInfo(options = {}) {
    if (!options.id && !options.slug && !options.symbol && !options.address) {
      throw new Error('At least one of id, slug, symbol, or address is required');
    }

    const params = {
      id: options.id,
      slug: options.slug,
      symbol: options.symbol,
      address: options.address,
      skip_invalid: options.skip_invalid || false,
      aux: options.aux || 'urls,logo,description,tags,platform,date_added,notice'
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v2/cryptocurrency/info', params);
  }

  // ==================== LISTINGS ENDPOINTS ====================
  async getListingsLatest(options = {}) {
    const params = {
      start: options.start || 1,
      limit: options.limit || 100,
      price_min: options.price_min,
      price_max: options.price_max,
      market_cap_min: options.market_cap_min,
      market_cap_max: options.market_cap_max,
      volume_24h_min: options.volume_24h_min,
      volume_24h_max: options.volume_24h_max,
      circulating_supply_min: options.circulating_supply_min,
      circulating_supply_max: options.circulating_supply_max,
      percent_change_24h_min: options.percent_change_24h_min,
      percent_change_24h_max: options.percent_change_24h_max,
      convert: options.convert || 'USD',
      convert_id: options.convert_id,
      sort: options.sort || 'market_cap',
      sort_dir: options.sort_dir || 'desc',
      cryptocurrency_type: options.cryptocurrency_type || 'all',
      tag: options.tag || 'all',
      aux: options.aux || 'num_market_pairs,cmc_rank,date_added,tags,platform,max_supply,circulating_supply,total_supply'
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v1/cryptocurrency/listings/latest', params);
  }

  async getListingsNew(options = {}) {
    const params = {
      start: options.start || 1,
      limit: options.limit || 100,
      convert: options.convert || 'USD',
      convert_id: options.convert_id,
      sort_dir: options.sort_dir || 'desc'
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v1/cryptocurrency/listings/new', params);
  }

  async getListingsHistorical(options = {}) {
    // Validate options.id  
    if (options.date === undefined ) {  
      throw new Error('The "id" option is mandatory and must be a number.');  
    } 

    const params = {
      date: options.date,        // CoinMarketCap cryptocurrency ID
      start: options.start || 1,
      limit: options.limit || 100,
      convert: options.convert,
      convert_id: options.convert_id,
      sort: options.sort || "cmc_rank",
      sort_dir: options.sort_dir,
      cryptocurrency_type: options.cryptocurrency_type || "all",
      aux: options.aux || "platform,tags,date_added,circulating_supply,total_supply,max_supply,cmc_rank,num_market_pairs"
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
    return this.apiClient.makeRequest('/v1/cryptocurrency/listings/historical', params);
  }

  // ==================== QUOTES ENDPOINTS ====================
  async getQuotesLatest(options = {}) {
    const params = {
      id: options.id,
      slug: options.slug,
      symbol: options.symbol,
      convert: options.convert || 'USD',
      convert_id: options.convert_id,
      aux: options.aux || 'num_market_pairs,cmc_rank,date_added,tags,platform,max_supply,circulating_supply,total_supply,is_active,is_fiat',
      skip_invalid: options.skip_invalid || false,
    };
  
    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v2/cryptocurrency/quotes/latest', params);
  }

  async getQuotesHistorical(options = {}) {
    const params = {
      id: options.id,
      symbol: options.symbol,
      time_start: options.time_start,
      time_end: options.time_end,
      count: options.count || 10,
      interval: options.interval || '5m',
      convert: options.convert || 'USD',
      convert_id: options.convert_id,
      aux: options.aux || 'price,volume,market_cap,circulating_supply,total_supply,quote_timestamp,is_active,is_fiat',
      skip_invalid: options.skip_invalid || false,
    };
  
    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v2/cryptocurrency/quotes/historical', params);
  }

  // ==================== MARKET PAIRS ENDPOINT ====================
  async getMarketPairsLatest(options = {}) {
    const params = {
      id: options.id,
      slug: options.slug,
      symbol: options.symbol,
      start: options.start || 1,
      limit: options.limit || 100,
      sort_dir: options.sort_dir || 'desc',
      sort: options.sort || 'volume_24h_strict',
      aux: options.aux || 'num_market_pairs,category,fee_type',
      matched_id: options.matched_id,
      matched_symbol: options.matched_symbol,
      category: options.category || 'all',
      fee_type: options.fee_type || 'all',
      convert: options.convert || 'USD',
      convert_id: options.convert_id,
    };
  
    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v2/cryptocurrency/market-pairs/latest', params);
  }

  // ==================== OHLCV ENDPOINTS ====================
  async getOHLCVLatest(options = {}) {
    const params = {
      id: options.id,
      symbol: options.symbol,
      convert: options.convert || 'USD',
      convert_id: options.convert_id,
      skip_invalid: options.skip_invalid || false,
    };
  
    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v2/cryptocurrency/ohlcv/latest', params);
  }

  async getOHLCVHistorical(options = {}) { const params = {
    id: options.id,
    slug: options.slug,
    symbol: options.symbol,
    time_period: options.time_period || 'daily',
    time_start: options.time_start,
    time_end: options.time_end,
    count: options.count || 10,
    interval: options.interval || 'daily',
    convert: options.convert || 'USD',
    convert_id: options.convert_id,
    skip_invalid: options.skip_invalid || false,
  };

  // Remove undefined parameters
  Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v2/cryptocurrency/ohlcv/historical', params);
  }

  // ==================== PRICE PERFORMANCE STATS ENDPOINT ====================
  async getPricePerformanceStats(options = {}) {
    const params = {
      id: options.id,
      slug: options.slug,
      symbol: options.symbol,
      time_period: options.time_period || 'all_time',
      convert: options.convert || 'USD',
      convert_id: options.convert_id,
      skip_invalid: options.skip_invalid || false,
    };
  
    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v2/cryptocurrency/price-performance-stats/latest', params);
  }

  // ==================== CATEGORIES ENDPOINTS ====================
  async getCategories(options = {}) {
    const params = {
      id: options.id,
      start: options.start || 1,
      limit: options.limit || 100,
      slug: options.slug,       // Comma-separated currency symbols
      symbol: options.symbol  // Comma-separated currency IDs
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v1/cryptocurrency/categories', params);
  }

  async getCategory(options = {}) {
    const params = {
      id: options.id,
      start: options.start || 1,
      limit: options.limit || 100,
      convert: options.convert,       // Comma-separated currency symbols
      convert_id: options.convert_id  // Comma-separated currency IDs
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
    return this.apiClient.makeRequest('/v1/cryptocurrency/category', params);
  }

  // ==================== AIRDROPS ENDPOINTS ====================
  async getAirdrops(options = {}) {
    const params = {
      start: options.start || 1,
      limit: options.limit || 100,
      status: options.status, // "UPCOMING", "ONGOING", or "ENDED"
      id: options.id,        // CoinMarketCap cryptocurrency ID
      slug: options.slug,    // Cryptocurrency slug
      symbol: options.symbol // Cryptocurrency symbol
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

     return this.apiClient.makeRequest('/v1/cryptocurrency/airdrops',  params);
  }

  async getAirdrop(options = {}) {
      // Validate options.id  
    if (options.id === undefined || typeof options.id !== 'number') {  
      throw new Error('The "id" option is mandatory and must be a number.');  
    } 

    const params = {
      id: options.id        // CoinMarketCap cryptocurrency ID
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v1/cryptocurrency/airdrop', params);
  }

  // ==================== TRENDING ENDPOINTS ====================
  async getTrendingLatest(options = {}) {
    const params = {
      start: options.start || 1,
      limit: options.limit || 100,
      time_period: options.time_period || '24h',
      convert: options.convert || 'USD',
      convert_id: options.convert_id
    };
    return this.apiClient.makeRequest('/v1/cryptocurrency/trending/latest', params);
  }

  async getTrendingMostVisited(options = {}) {
    const params = {
      start: options.start || 1,
      limit: options.limit || 100,
      time_period: options.time_period || '24h',
      convert: options.convert || 'USD',
      convert_id: options.convert_id
    };
    return this.apiClient.makeRequest('/v1/cryptocurrency/trending/most-visited', params);
  }

  async getTrendingGainersLosers(options = {}) {
    const params = {
      start: options.start || 1,
      limit: options.limit || 100,
      time_period: options.time_period || '24h',
      convert: options.convert || 'USD',
      convert_id: options.convert_id,
      sort: options.sort || 'percent_change_24h',
      sort_dir: options.sort_dir || 'desc'
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v1/cryptocurrency/trending/gainers-losers', params);
  }
}

module.exports = CryptocurrencyService;