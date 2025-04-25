class DexScanService {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  // ==================== DEX LISTINGS ENDPOINTS ====================
  async getDexListingsQuotes(options = {}) {
    const params = {
      start: options.start || 1,
      limit: options.limit || 100,
      type: options.type || 'all',
      convert_id: options.convert_id,
      sort: options.sort || 'volume_24h',
      sort_dir: options.sort_dir || 'desc',
      aux: options.aux || "",
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v4/dex/listings/quotes', params);
  }

  async getDexListingsInfo(options = {}) {
    const params = {
      id: options.id,
      aux: options.aux || "",
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v4/dex/listings/info', params);
  }

  // ==================== NETWORKS ENDPOINT ====================
  async getNetworksList(options = {}) {
    const params = {
        start: options.start || 1,
        limit: options.limit || 100,
        aux: options.aux || '',
        sort: options.sort || 'id',
        sort_dir: options.sort_dir || 'desc',
      };
  
      // Remove undefined parameters
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v4/dex/networks/list', params);
  }

  // ==================== SPOT PAIRS ENDPOINT ====================
  async getSpotPairsLatest(options = {}) {
    const params = {
      network_id: options.network_id,
      network_slug: options.network_slug,
      dex_id: options.dex_id,
      dex_slug: options.dex_slug,
      base_asset_id: options.base_asset_id,
      base_asset_symbol: options.base_asset_symbol,
      base_asset_contract_address: options.base_asset_contract_address,
      base_asset_ucid: options.base_asset_ucid,
      quote_asset_id: options.quote_asset_id,
      quote_asset_symbol: options.quote_asset_symbol,
      quote_asset_contract_address: options.quote_asset_contract_address,
      quote_asset_ucid: options.quote_asset_ucid,
      scroll_id: options.scroll_id,
      limit: options.limit,
      liquidity_min: options.liquidity_min,
      liquidity_max: options.liquidity_max,
      volume_24h_min: options.volume_24h_min,
      volume_24h_max: options.volume_24h_max,
      no_of_transactions_24h_min: options.no_of_transactions_24h_min,
      percent_change_24h_min: options.percent_change_24h_min,
      percent_change_24h_max: options.percent_change_24h_max,
      sort: options.sort || 'volume_24h',
      sort_dir: options.sort_dir || 'desc',
      aux: options.aux || "",
      convert_id: options.convert_id,
      reverse_order: options.reverse_order,
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v4/dex/spot-pairs/latest', params);
  }

  // ==================== PAIRS QUOTES ENDPOINT ====================
  async getPairsQuotesLatest(options = {}) {
    const params = {
        contract_address: options.contract_address,
        network_id: options.network_id,
        network_slug: options.network_slug,
        aux: options.aux || "",
        convert_id: options.convert_id,
        skip_invalid: options.skip_invalid,
        reverse_order: options.reverse_order,
      };
  
      // Remove undefined parameters
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v4/dex/pairs/quotes/latest', params);
  }

  // ==================== OHLCV ENDPOINTS ====================
  async getPairsOHLCVLatest(options = {}) {
    const params = {
      network_id: options.network_id,
      network_slug: options.network_slug,
      skip_interval: options.skip_interval,
      aux: options.aux || "",
      convert_id: options.convert_id,
      reverse_order: options.reverse_order,
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v4/dex/pairs/ohlcv/latest', params);
  }

  async getPairsOHLCVHistorical(options = {}) {
    const params = {
      contract_address: options.contract_address,
      network_id: options.network_id,
      network_slug: options.network_slug,
      time_period: options.time_period || 'daily',
      time_start: options.time_start,
      time_end: options.time_end,
      count: options.count || 5000,
      interval: options.interval || 'daily',
      aux: options.aux || "",
      convert_id: options.convert_id,
      skip_interval: options.skip_interval,
      reverse_order: options.reverse_order,
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v4/dex/pairs/ohlcv/historical', params);
  }

  // ==================== TRADES ENDPOINT ====================
  async getPairsTradeLatest(options = {}) {
    const params = {
      contract_address: options.contract_address,
      network_id: options.network_id,
      network_slug: options.network_slug,
      aux: options.aux || "",
      convert_id: options.convert_id,
      skip_invalid: options.skip_invalid,
      reverse_order: options.reverse_order,
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v4/dex/pairs/trade/latest', params);
  }
}

module.exports = DexScanService;