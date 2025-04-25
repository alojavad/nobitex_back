const ApiClient = require('./apiClient');
const fs = require('fs');
const path = require('path');

class CoinmarketcapService {
  constructor() {
    const baseURL = 'https://pro-api.coinmarketcap.com';
    const apiKey = process.env.COINMARKETCAP_API_KEY;

    this.apiClient = new ApiClient(baseURL, apiKey);

    // Lazy-loaded services
    this.services = {};

    // Load coinmarketcapServices.json
    const filePath = path.join(__dirname, 'coinmarketcap', 'coinmarketcapServices.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    this.coinmarketcapServices = JSON.parse(rawData);
  }

  // ==================== LAZY LOADING SERVICES ====================
  _getService(serviceName) {
    if (!this.services[serviceName]) {
      const ServiceClass = require(`./coinmarketcap/${serviceName}`);
      this.services[serviceName] = new ServiceClass(this.apiClient);
    }
    return this.services[serviceName];
  }

  async fetchDataByService(serviceName, functionName, options = {}) {
    try {
      const serviceConfig = this.coinmarketcapServices[serviceName];
      if (!serviceConfig) {
        throw new Error(`Service ${serviceName} not found.`);
      }

      const functionConfig = serviceConfig.functions[functionName];
      if (!functionConfig) {
        throw new Error(`Function ${functionName} not found in service ${serviceName}.`);
      }

      // Validate required parameters
      const missingParams = functionConfig.requiredParams.filter(param => !(param in options));
      if (missingParams.length > 0) {
        throw new Error(`Missing required parameters: ${missingParams.join(', ')}`);
      }

      // Call the service's fetchData method
      const service = this._getService(serviceConfig.serviceName);
      return await service.fetchData({
        ...options,
        endpoint: functionConfig.endpoint,
      });
    } catch (error) {
      console.error(`Failed to fetch data for service ${serviceName} and function ${functionName}:`, error.message);
      throw error;
    }
  }
  async function fetchAndSaveData(serviceName, functionName, modelName, options = {}) {
    try {
      const data = await this.fetchDataByService(serviceName, functionName, options); // Fetch data
      await this.saveDataToMongoDB(modelName, data); // Save data to MongoDB
    } catch (error) {
      console.error(`Failed to fetch and save data for service ${serviceName}, function ${functionName}, and model ${modelName}:`, error.message);
      throw error;
    }
  }

  // await coinmarketcapService.fetchAndSaveData('marketPairs', 'fetchLatest', 'MarketPair', {
  //   id: 1, // Bitcoin ID
  //   convert: 'USD',
  //   limit: 100,
  // });



  /**
 * Fetch data using a specific service in the coinmarketcap folder
 * @param {string} serviceName - Name of the service (e.g., 'marketPairs', 'ohlcv', 'quotes')
 * @param {object} options - Query parameters for the API request
 * @returns {Promise<object>} - Fetched data
 */
async fetchDataByService(serviceName, options = {}) {
  try {
    const service = this._getService(serviceName); // Lazy-load the service
    return await service.fetchData(options); // Call the fetchData method in the service
  } catch (error) {
    console.error(`Failed to fetch data using service ${serviceName}:`, error.message);
    throw error;
  }
}

/**
 * Save data to MongoDB using a specific model in the coinmarketcap/crypto folder
 * @param {string} modelName - Name of the model (e.g., 'MarketPair', 'OHLCV', 'Quote')
 * @param {object} data - Data to save
 * @returns {Promise<void>}
 */
async saveDataToMongoDB(modelName, data) {
  try {
    const Model = require(`../models/coinmarketcap/crypto/${modelName}`); // Dynamically load the model
    const bulkOps = Array.isArray(data)
      ? data.map(item => ({
          updateOne: {
            filter: { id: item.id }, // Use a unique identifier for upsert
            update: { $set: item },
            upsert: true,
          },
        }))
      : [
          {
            updateOne: {
              filter: { id: data.id },
              update: { $set: data },
              upsert: true,
            },
          },
        ];

    await Model.bulkWrite(bulkOps); // Perform bulk upsert
    console.log(`${modelName} data saved successfully.`);
  } catch (error) {
    console.error(`Failed to save data to MongoDB for model ${modelName}:`, error.message);
    throw error;
  }
}

/**
 * Fetch data using a service and save it to MongoDB
 * @param {string} serviceName - Name of the service (e.g., 'marketPairs', 'ohlcv', 'quotes')
 * @param {string} modelName - Name of the model (e.g., 'MarketPair', 'OHLCV', 'Quote')
 * @param {object} options - Query parameters for the API request
 * @returns {Promise<void>}
 */
async fetchAndSaveData(serviceName, modelName, options = {}) {
  try {
    const data = await this.fetchDataByService(serviceName, options); // Fetch data
    await this.saveDataToMongoDB(modelName, data); // Save data to MongoDB
  } catch (error) {
    console.error(`Failed to fetch and save data for service ${serviceName} and model ${modelName}:`, error.message);
    throw error;
  }
}


    /**
   * Get cryptocurrency data using either ID or symbol
   * @param {number|string} identifier - Can be ID (number) or symbol (string)
   * @param {string} endpoint - API endpoint suffix
   * @param {object} options - Additional options
   * @returns {Promise<object>}
   */
    async _getByCryptocurrencyIdentifier(identifier, endpoint, options = {}) {
      const params = {};
      
      // Determine if identifier is ID (number) or symbol (string)
      if (typeof identifier === 'number') {
        params.id = identifier;
      } else {
        params.symbol = identifier.toUpperCase();
      }
      
      return this._makeRequest(`/cryptocurrency/${endpoint}`, {
        ...params,
        ...options
      });
    }
  
    /**
     * Get exchange data using either ID or slug
     * @param {number|string} identifier - Can be ID (number) or slug (string)
     * @param {string} endpoint - API endpoint suffix
     * @param {object} options - Additional options
     * @returns {Promise<object>}
     */
    async _getByExchangeIdentifier(identifier, endpoint, options = {}) {
      const params = {};
      
      if (typeof identifier === 'number') {
        params.id = identifier;
      } else {
        params.slug = identifier.toLowerCase();
      }
      
      return this._makeRequest(`/exchange/${endpoint}`, {
        ...params,
        ...options
      });
    }

    /**
   * Get cryptocurrency quotes using either ID or symbol
   * @param {number|string|array} identifier - Can be ID, symbol, or array of either
   * @param {object} options - {convert, aux}
   * @returns {Promise<object>}
   */
  async getCryptocurrencyQuotesLatest(identifier, options = {}) {
    let params = {};
    
    if (Array.isArray(identifier)) {
      // Handle array of identifiers
      const firstItem = identifier[0];
      if (typeof firstItem === 'number') {
        params.id = identifier.join(',');
      } else {
        params.symbol = identifier.map(s => s.toUpperCase()).join(',');
      }
    } else if (typeof identifier === 'number') {
      params.id = identifier;
    } else {
      params.symbol = identifier.toUpperCase();
    }
    
    return this._makeRequest('/cryptocurrency/quotes/latest', {
      ...params,
      ...options
    });
  }

  // ==================== FIAT CURRENCY METHODS ====================

  /**
   * Check if a fiat currency code is supported
   * @param {string} currencyCode - ISO currency code
   * @returns {boolean}
   */
  isFiatSupported(currencyCode) {
    return this.FIAT_CURRENCIES.hasOwnProperty(currencyCode.toUpperCase());
  }

  /**
   * Get all supported fiat currencies
   * @returns {Promise<array>} - Array of fiat currency objects
   */
  async getSupportedFiatCurrencies() {
    try {
      // First try to get fresh data from API
      const freshData = await this._makeRequest('/fiat/map');
      return freshData;
    } catch (error) {
      console.warn('Failed to fetch fresh fiat data, using fallback:', error.message);
      // Fallback to our predefined list if API fails
      return Object.entries(this.FIAT_CURRENCIES).map(([code, data]) => ({
        id: data.id,
        name: data.name,
        sign: data.symbol,
        symbol: code
      }));
    }
  }

  /**
   * Convert amount with enhanced currency support
   * @param {number} amount - Amount to convert
   * @param {string|number} from - Source currency (symbol or ID)
   * @param {string|number|array} to - Target currency/currencies (symbol or ID)
   * @param {object} options - Additional options
   * @returns {Promise<object>}
   */
  async convertCurrency(amount, from, to, options = {}) {
    const params = {
      amount,
      ...options
    };

    // Handle source currency (can be symbol or ID)
    if (typeof from === 'number') {
      params.id = from;
    } else {
      params.symbol = from.toUpperCase();
    }

    // Handle target currency/currencies
    if (Array.isArray(to)) {
      params.convert = to.map(c => typeof c === 'number' 
        ? this._getCurrencyCodeById(c) 
        : c.toUpperCase()).join(',');
    } else if (typeof to === 'number') {
      params.convert = this._getCurrencyCodeById(to);
    } else {
      params.convert = to.toUpperCase();
    }

    return this._makeRequest('/tools/price-conversion', params);
  }

  /**
   * Helper to get currency code by ID (for fiat currencies)
   * @private
   */
  _getCurrencyCodeById(id) {
    const entry = Object.entries(this.FIAT_CURRENCIES).find(([_, data]) => data.id === id);
    return entry ? entry[0] : null;
  }

  // ==================== PRECIOUS METALS ====================

  /**
   * Get precious metals quotes
   * @param {string|array} metals - Metal codes (XAU, XAG, XPT, XPD) or array of codes
   * @param {object} options - {convert, aux}
   * @returns {Promise<object>}
   */
  async getPreciousMetalsQuotes(metals, options = {}) {
    const params = {
      symbol: Array.isArray(metals) ? metals.join(',') : metals,
      ...options
    };
    
    return this._makeRequest('/cryptocurrency/quotes/latest', params);
  }

   /**
   * Get detailed information about the last API call status
   * @returns {object|null} Status object with:
   *   - timestamp: When the call was executed
   *   - error_code: API error code if any
   *   - error_message: Description of error if any
   *   - elapsed: Processing time in milliseconds
   *   - credit_count: API credits used
   */
   getLastRequestStatus() {
    return this.lastRequestStatus ? { ...this.lastRequestStatus } : null;
  }

  /**
   * Get human-readable error message for an API error code
   * @param {number} errorCode - The API error code
   * @returns {object} Contains httpStatus and message
   */
  getErrorInfo(errorCode) {
    return this.ERROR_CODES[errorCode] || { 
      httpStatus: 500, 
      message: 'Unknown error' 
    };
  }

  // ==================== CRYPTOCURRENCY ENDPOINTS ====================

  /**
   * Get latest cryptocurrency listings
   * @param {object} options - {start, limit, convert, sort, sort_dir, cryptocurrency_type}
   * @returns {Promise<array>} - Array of cryptocurrency objects
   */
  async getCryptocurrencyListingsLatest(options = {}) {
    return this._makeRequest('/cryptocurrency/listings/latest', {
      start: 1,
      limit: 100,
      ...options
    });
  }

  /**
   * Get latest cryptocurrency quotes
   * @param {string|array} ids - Single id or array of ids
   * @param {object} options - {convert, aux}
   * @returns {Promise<object>} - Object keyed by cryptocurrency id
   */
  async getCryptocurrencyQuotesLatest(ids, options = {}) {
    return this._makeRequest('/cryptocurrency/quotes/latest', {
      id: Array.isArray(ids) ? ids.join(',') : ids,
      ...options
    });
  }

  // ==================== HISTORICAL DATA ENDPOINTS ====================

  /**
   * Get historical cryptocurrency listings
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {object} options - {start, limit, convert, sort, sort_dir}
   * @returns {Promise<array>} - Array of historical cryptocurrency data
   */
  async getCryptocurrencyListingsHistorical(date, options = {}) {
    return this._makeRequest('/cryptocurrency/listings/historical', {
      date,
      ...options
    });
  }

  /**
   * Get OHLCV data for a cryptocurrency
   * @param {number} id - Cryptocurrency ID
   * @param {object} options - {time_period, time_start, time_end, count, interval, convert}
   * @returns {Promise<object>} - OHLCV data
   */
  async getCryptocurrencyOHLCV(id, options = {}) {
    return this._makeRequest('/cryptocurrency/ohlcv/latest', {
      id,
      ...options
    });
  }

  // ==================== METADATA ENDPOINTS ====================

  /**
   * Get cryptocurrency metadata
   * @param {string|array} ids - Single id or array of ids
   * @param {object} options - {aux}
   * @returns {Promise<object>} - Object keyed by cryptocurrency id
   */
  async getCryptocurrencyInfo(ids, options = {}) {
    return this._makeRequest('/cryptocurrency/info', {
      id: Array.isArray(ids) ? ids.join(',') : ids,
      ...options
    });
  }

  // ==================== MAP ENDPOINTS ====================

  /**
   * Get cryptocurrency ID map
   * @param {object} options - {listing_status, start, limit, sort, symbol, aux}
   * @returns {Promise<array>} - Array of cryptocurrency map objects
   */
  async getCryptocurrencyMap(options = {}) {
    return this._makeRequest('/cryptocurrency/map', options);
  }

  // ==================== GLOBAL METRICS ====================

  /**
   * Get global metrics
   * @param {object} options - {convert, aux}
   * @returns {Promise<object>} - Global metrics data
   */
  async getGlobalMetricsLatest(options = {}) {
    return this._makeRequest('/global-metrics/quotes/latest', options);
  }

  // ==================== TOOLS ====================

  /**
   * Convert cryptocurrency amount
   * @param {number} amount - Amount to convert
   * @param {string} symbol - Cryptocurrency symbol
   * @param {string} convert - Comma-separated list of currencies to convert to
   * @param {object} options - {time, aux}
   * @returns {Promise<object>} - Conversion data
   */
  async convertCurrency(amount, symbol, convert, options = {}) {
    return this._makeRequest('/tools/price-conversion', {
      amount,
      symbol,
      convert,
      ...options
    });
  }

  // --- Blockchain ---
  async getBlockchainStatistics(blockchainId, options = {}) {
    return this._makeRequest('/blockchain/statistics/latest', {
      id: blockchainId,
      ...options
    });
  }

  // --- Partners ---
  async getPartnersFCASListings(options = {}) {
    return this._makeRequest('/partners/flipside-crypto/fcas/listings/latest', options);
  }

  // --- Key Info ---
  async getKeyInfo() {
    return this._makeRequest('/key/info');
  }

  // --- Content ---
  async getLatestPosts(options = {}) {
    return this._makeRequest('/content/posts/latest', options);
  }

  /**
   * Get cryptocurrency airdrops with optional filters
   * @param {object} options - { start, limit, status, id, slug, symbol }
   * @returns {Promise<array>} - Array of airdrop objects
   */
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

    try {
      const data = await this._makeRequest('/cryptocurrency/airdrop', params);
      
      // If single airdrop returned (when filtering by id/slug/symbol)
      if (data.id) {
        return [await this._saveAirdrop(data)];
      }
      
      // If multiple airdrops returned
      return await Promise.all(data.map(airdrop => this._saveAirdrop(airdrop)));
    } catch (error) {
      console.error('Failed to fetch airdrops:', error);
      throw error;
    }
  }

  /**
   * Save or update airdrop in MongoDB
   * @private
   */
  async _saveAirdrop(airdropData) {
    try {
      const airdrop = await Airdrop.findOneAndUpdate(
        { cmcId: airdropData.id },
        {
          $set: {
            projectName: airdropData.project_name,
            description: airdropData.description,
            status: airdropData.status,
            coin: {
              id: airdropData.coin.id,
              name: airdropData.coin.name,
              slug: airdropData.coin.slug,
              symbol: airdropData.coin.symbol
            },
            startDate: new Date(airdropData.start_date),
            endDate: new Date(airdropData.end_date),
            totalPrize: airdropData.total_prize,
            winnerCount: airdropData.winner_count,
            link: airdropData.link,
            lastUpdated: new Date()
          }
        },
        { upsert: true, new: true }
      );
      return airdrop;
    } catch (error) {
      console.error('Failed to save airdrop:', error);
      throw error;
    }
  }

  /**
   * Get cryptocurrency categories with optional filters
   * @param {object} options - { id, start, limit, convert, convert_id }
   * @returns {Promise<array>} - Array of category objects
   */
  async getCategories(options = {}) {
    const params = {
      id: options.id,
      start: options.start || 1,
      limit: options.limit || 100,
      convert: options.convert,       // Comma-separated currency symbols
      convert_id: options.convert_id  // Comma-separated currency IDs
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    try {
      const data = await this._makeRequest('/cryptocurrency/categories', params);
      
      // If single category returned (when filtering by id)
      if (options.id && data.id) {
        return [await this._saveCategory(data)];
      }
      
      // If multiple categories returned
      return await Promise.all(data.map(category => this._saveCategory(category)));
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  }

  /**
   * Save or update category in MongoDB
   * @private
   */
  async _saveCategory(categoryData) {
    try {
      const category = await Category.findOneAndUpdate(
        { cmcId: categoryData.id },
        {
          $set: {
            name: categoryData.name,
            title: categoryData.title,
            description: categoryData.description,
            numTokens: categoryData.num_tokens,
            avgPriceChange: categoryData.avg_price_change,
            marketCap: categoryData.market_cap,
            marketCapChange: categoryData.market_cap_change,
            volume: categoryData.volume,
            volumeChange: categoryData.volume_change,
            lastUpdated: new Date(categoryData.last_updated),
            quotes: categoryData.quote, // Stores converted values if any
            updatedAt: new Date()
          }
        },
        { upsert: true, new: true }
      );
      return category;
    } catch (error) {
      console.error('Failed to save category:', error);
      throw error;
    }
  }

  /**
   * Get cryptocurrency map data
   * @param {object} options - { listing_status, start, limit, sort, symbol, aux }
   * @returns {Promise<array>} - Array of cryptocurrency mapping objects
   */
  async getCryptoMap(options = {}) {
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

    try {
      const data = await this._makeRequest('/cryptocurrency/map', params);
      
      // If filtering by symbol(s)
      if (options.symbol && data.length > 0) {
        return [await this._saveCryptoMap(data[0])];
      }
      
      // For bulk operations
      return await Promise.all(data.map(crypto => this._saveCryptoMap(crypto)));
    } catch (error) {
      console.error('Failed to fetch cryptocurrency map:', error);
      throw error;
    }
  }

  /**
   * Save or update cryptocurrency mapping data
   * @private
   */
  async _saveCryptoMap(cryptoData) {
    try {
      const crypto = await CryptoMap.findOneAndUpdate(
        { cmcId: cryptoData.id },
        {
          $set: {
            rank: cryptoData.rank,
            name: cryptoData.name,
            symbol: cryptoData.symbol,
            slug: cryptoData.slug,
            is_active: cryptoData.is_active === 1,
            first_historical_data: cryptoData.first_historical_data ? new Date(cryptoData.first_historical_data) : null,
            last_historical_data: cryptoData.last_historical_data ? new Date(cryptoData.last_historical_data) : null,
            platform: cryptoData.platform || null,
            status: this._determineStatus(cryptoData),
            lastUpdated: new Date()
          }
        },
        { upsert: true, new: true }
      );
      return crypto;
    } catch (error) {
      console.error('Failed to save cryptocurrency map:', error);
      throw error;
    }
  }

  /**
   * Determine status based on is_active and listing_status
   * @private
   */
  _determineStatus(cryptoData) {
    if (cryptoData.is_active === 0) return 'inactive';
    if (cryptoData.status === 'untracked') return 'untracked';
    return 'active';
  }

  /**
   * Get cryptocurrency information (v2 endpoint)
   * @param {object} options - { id, slug, symbol, address, skip_invalid, aux }
   * @returns {Promise<object>} - Cryptocurrency info objects keyed by ID
   */
  async getCryptoInfo(options = {}) {
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

    try {
      const data = await this._makeRequest('/v2/cryptocurrency/info', params);
      const results = {};
      
      for (const [id, info] of Object.entries(data)) {
        results[id] = await this._saveCryptoInfo(parseInt(id), info);
      }
      
      return results;
    } catch (error) {
      console.error('Failed to fetch cryptocurrency info:', error);
      throw error;
    }
  }

  /**
   * Save or update cryptocurrency information
   * @private
   */
  async _saveCryptoInfo(id, cryptoData) {
    try {
      const crypto = await CryptoInfo.findOneAndUpdate(
        { cmcId: id },
        {
          $set: {
            name: cryptoData.name,
            symbol: cryptoData.symbol,
            slug: cryptoData.slug,
            description: cryptoData.description,
            logo: cryptoData.logo,
            urls: cryptoData.urls || {},
            date_added: cryptoData.date_added ? new Date(cryptoData.date_added) : null,
            date_launched: cryptoData.date_launched ? new Date(cryptoData.date_launched) : null,
            tags: cryptoData.tags || [],
            platform: cryptoData.platform || null,
            category: cryptoData.category || 'coin',
            notice: cryptoData.notice,
            self_reported_circulating_supply: cryptoData.self_reported_circulating_supply,
            self_reported_market_cap: cryptoData.self_reported_market_cap,
            self_reported_tags: cryptoData.self_reported_tags || [],
            infinite_supply: cryptoData.infinite_supply || false,
            lastUpdated: new Date()
          }
        },
        { upsert: true, new: true }
      );
      return crypto;
    } catch (error) {
      console.error(`Failed to save cryptocurrency info for ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get latest cryptocurrency listings with pagination and filtering
   * @param {object} options - All available query parameters
   * @returns {Promise<array>} - Array of cryptocurrency listing objects
   */
  async getLatestListings(options = {}) {
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

    try {
      const data = await this._makeRequest('/v1/cryptocurrency/listings/latest', params);
      return await this._saveListings(data);
    } catch (error) {
      console.error('Failed to fetch latest listings:', error);
      throw error;
    }
  }

  /**
   * Save or update multiple cryptocurrency listings
   * @private
   */
  async _saveListings(listings) {
    const bulkOps = listings.map(listing => ({
      updateOne: {
        filter: { cmcId: listing.id },
        update: {
          $set: {
            name: listing.name,
            symbol: listing.symbol,
            slug: listing.slug,
            cmc_rank: listing.cmc_rank,
            num_market_pairs: listing.num_market_pairs,
            circulating_supply: listing.circulating_supply,
            total_supply: listing.total_supply,
            max_supply: listing.max_supply,
            infinite_supply: listing.infinite_supply || false,
            last_updated: new Date(listing.last_updated),
            date_added: listing.date_added ? new Date(listing.date_added) : null,
            tags: listing.tags || [],
            platform: listing.platform || null,
            self_reported_circulating_supply: listing.self_reported_circulating_supply,
            self_reported_market_cap: listing.self_reported_market_cap,
            quotes: this._normalizeQuotes(listing.quote),
            category: listing.platform ? 'token' : 'coin',
            lastSynced: new Date()
          }
        },
        upsert: true
      }
    }));

    try {
      await CryptoListing.bulkWrite(bulkOps);
      return await CryptoListing.find({ 
        cmcId: { $in: listings.map(l => l.id) } 
      }).lean();
    } catch (error) {
      console.error('Failed to save listings:', error);
      throw error;
    }
  }

  /**
   * Normalize quotes structure for MongoDB
   * @private
   */
  _normalizeQuotes(quoteData) {
    const normalized = {};
    for (const [currency, values] of Object.entries(quoteData)) {
      normalized[currency] = {
        ...values,
        last_updated: values.last_updated ? new Date(values.last_updated) : null
      };
    }
    return normalized;
  }

  /**
   * Get newly listed cryptocurrencies
   * @param {object} options - { start, limit, convert, convert_id, sort_dir }
   * @returns {Promise<array>} - Array of newly listed cryptocurrencies
   */
  async getNewListings(options = {}) {
    const params = {
      start: options.start || 1,
      limit: options.limit || 100,
      convert: options.convert || 'USD',
      convert_id: options.convert_id,
      sort_dir: options.sort_dir || 'desc' // Typically want newest first
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    try {
      const data = await this._makeRequest('/v1/cryptocurrency/listings/new', params);
      return await this._saveNewListings(data);
    } catch (error) {
      console.error('Failed to fetch new listings:', error);
      throw error;
    }
  }

  /**
   * Save or update new cryptocurrency listings
   * @private
   */
  async _saveNewListings(listings) {
    const bulkOps = listings.map(listing => ({
      updateOne: {
        filter: { cmcId: listing.id },
        update: {
          $set: {
            name: listing.name,
            symbol: listing.symbol,
            slug: listing.slug,
            cmc_rank: listing.cmc_rank,
            num_market_pairs: listing.num_market_pairs,
            circulating_supply: listing.circulating_supply,
            total_supply: listing.total_supply,
            max_supply: listing.max_supply,
            last_updated: new Date(listing.last_updated),
            date_added: new Date(listing.date_added),
            tags: listing.tags || [],
            platform: listing.platform || null,
            quotes: this._normalizeQuotes(listing.quote),
            is_new: true,
            lastSynced: new Date()
          }
        },
        upsert: true
      }
    }));

    try {
      await NewCryptoListing.bulkWrite(bulkOps);
      return await NewCryptoListing.find({ 
        cmcId: { $in: listings.map(l => l.id) } 
      }).sort({ date_added: -1 }).lean();
    } catch (error) {
      console.error('Failed to save new listings:', error);
      throw error;
    }
  }

  /**
   * Get the newest cryptocurrency listings from database
   * @param {number} limit - Number of results to return
   * @returns {Promise<array>} - Array of new listings sorted by date_added
   */
  async getLatestNewListingsFromDB(limit = 100) {
    return await NewCryptoListing.find({ is_new: true })
      .sort({ date_added: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Mark old listings as not new anymore
   * @param {number} daysOld - Number of days after which listing is no longer "new"
   * @returns {Promise<object>} - MongoDB update result
   */
  async archiveOldListings(daysOld = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return await NewCryptoListing.updateMany(
      { date_added: { $lt: cutoffDate }, is_new: true },
      { $set: { is_new: false } }
    );
  }


  /**
   * Get trending gainers and losers
   * @param {object} options - { start, limit, time_period, convert, convert_id, sort, sort_dir }
   * @returns {Promise<object>} - Object containing gainers and losers
   */
  async getTrendingCryptos(options = {}) {
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

    try {
      const data = await this._makeRequest('/v1/cryptocurrency/trending/gainers-losers', params);
      
      // Determine trend type based on percent change
      const processedData = data.map(item => {
        const percentChange = item.quote[params.convert || 'USD'].percent_change_24h;
        return {
          ...item,
          trend_type: percentChange >= 0 ? 'gainer' : 'loser',
          percent_change: Math.abs(percentChange),
          time_period: params.time_period
        };
      });

      return await this._saveTrendingCryptos(processedData);
    } catch (error) {
      console.error('Failed to fetch trending cryptos:', error);
      throw error;
    }
  }

  /**
   * Save trending cryptocurrency data
   * @private
   */
  async _saveTrendingCryptos(trendingData) {
    const bulkOps = trendingData.map(item => ({
      updateOne: {
        filter: { 
          cmcId: item.id,
          time_period: item.time_period,
          snapshot_time: { 
            $gte: new Date(Date.now() - 1000 * 60 * 60) // Last hour
          }
        },
        update: {
          $set: {
            name: item.name,
            symbol: item.symbol,
            slug: item.slug,
            cmc_rank: item.cmc_rank,
            num_market_pairs: item.num_market_pairs,
            circulating_supply: item.circulating_supply,
            total_supply: item.total_supply,
            max_supply: item.max_supply,
            last_updated: new Date(item.last_updated),
            date_added: item.date_added ? new Date(item.date_added) : null,
            tags: item.tags || [],
            platform: item.platform || null,
            quotes: this._normalizeQuotes(item.quote),
            trend_type: item.trend_type,
            time_period: item.time_period,
            percent_change: item.percent_change,
            snapshot_time: new Date()
          }
        },
        upsert: true
      }
    }));

    try {
      await TrendingCrypto.bulkWrite(bulkOps);
      
      // Return categorized results
      const gainers = await TrendingCrypto.find({ 
        trend_type: 'gainer',
        time_period: bulkOps[0]?.updateOne?.filter?.time_period
      })
      .sort({ percent_change: -1 })
      .limit(params.limit || 100)
      .lean();

      const losers = await TrendingCrypto.find({ 
        trend_type: 'loser',
        time_period: bulkOps[0]?.updateOne?.filter?.time_period
      })
      .sort({ percent_change: -1 })
      .limit(params.limit || 100)
      .lean();

      return { gainers, losers };
    } catch (error) {
      console.error('Failed to save trending cryptos:', error);
      throw error;
    }
  }

  /**
   * Get historical trends from database
   * @param {string} timePeriod - '1h', '24h', '7d', or '30d'
   * @param {number} limit - Number of results to return
   * @returns {Promise<object>} - Object containing historical gainers and losers
   */
  async getHistoricalTrends(timePeriod = '24h', limit = 100) {
    const [gainers, losers] = await Promise.all([
      TrendingCrypto.find({ 
        trend_type: 'gainer',
        time_period: timePeriod
      })
      .sort({ percent_change: -1 })
      .limit(limit)
      .lean(),

      TrendingCrypto.find({ 
        trend_type: 'loser',
        time_period: timePeriod
      })
      .sort({ percent_change: -1 })
      .limit(limit)
      .lean()
    ]);

    return { gainers, losers };
  }

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
  
    try {
      const response = await this._makeRequest('/v2/cryptocurrency/market-pairs/latest', params);
      return response.data; // Return the market pairs data
    } catch (error) {
      console.error('Failed to fetch market pairs:', error.message);
      throw error;
    }
  }

  async saveMarketPairs(data) {
    const bulkOps = data.market_pairs.map(pair => ({
      updateOne: {
        filter: { marketId: pair.market_id },
        update: {
          $set: {
            cryptocurrency: {
              id: data.id,
              name: data.name,
              symbol: data.symbol,
            },
            exchange: {
              id: pair.exchange.id,
              name: pair.exchange.name,
              slug: pair.exchange.slug,
            },
            marketPair: pair.market_pair,
            category: pair.category,
            feeType: pair.fee_type,
            marketPairBase: {
              currencyId: pair.market_pair_base.currency_id,
              currencySymbol: pair.market_pair_base.currency_symbol,
              exchangeSymbol: pair.market_pair_base.exchange_symbol,
              currencyType: pair.market_pair_base.currency_type,
            },
            marketPairQuote: {
              currencyId: pair.market_pair_quote.currency_id,
              currencySymbol: pair.market_pair_quote.currency_symbol,
              exchangeSymbol: pair.market_pair_quote.exchange_symbol,
              currencyType: pair.market_pair_quote.currency_type,
            },
            quote: {
              exchangeReported: {
                price: pair.quote.exchange_reported.price,
                volume24hBase: pair.quote.exchange_reported.volume_24h_base,
                volume24hQuote: pair.quote.exchange_reported.volume_24h_quote,
                lastUpdated: new Date(pair.quote.exchange_reported.last_updated),
              },
              USD: {
                price: pair.quote.USD.price,
                volume24h: pair.quote.USD.volume_24h,
                lastUpdated: new Date(pair.quote.USD.last_updated),
              },
            },
          },
        },
        upsert: true, // Insert if not exists
      },
    }));
  
    try {
      await MarketPair.bulkWrite(bulkOps);
      console.log('Market pairs saved successfully.');
    } catch (error) {
      console.error('Failed to save market pairs:', error.message);
      throw error;
    }
  }

  async fetchAndSaveMarketPairs(options = {}) {
    try {
      const marketPairsData = await this.getMarketPairsLatest(options);
      await this.saveMarketPairs(marketPairsData);
    } catch (error) {
      console.error('Failed to fetch and save market pairs:', error.message);
      throw error;
    }
  }

  async getOHLCVHistorical(options = {}) {
    const params = {
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
  
    try {
      const response = await this._makeRequest('/v2/cryptocurrency/ohlcv/historical', params);
      return response.data; // Return the OHLCV data
    } catch (error) {
      console.error('Failed to fetch OHLCV historical data:', error.message);
      throw error;
    }
  }

  async saveOHLCVData(data) {
    const bulkOps = data.quotes.map(quote => ({
      updateOne: {
        filter: {
          'cryptocurrency.id': data.id,
          timeOpen: new Date(quote.time_open),
          timeClose: new Date(quote.time_close),
        },
        update: {
          $set: {
            cryptocurrency: {
              id: data.id,
              name: data.name,
              symbol: data.symbol,
            },
            timeOpen: new Date(quote.time_open),
            timeClose: new Date(quote.time_close),
            timeHigh: new Date(quote.time_high),
            timeLow: new Date(quote.time_low),
            quote: {
              USD: {
                open: quote.quote.USD.open,
                high: quote.quote.USD.high,
                low: quote.quote.USD.low,
                close: quote.quote.USD.close,
                volume: quote.quote.USD.volume,
                marketCap: quote.quote.USD.market_cap,
                timestamp: new Date(quote.quote.USD.timestamp),
              },
            },
          },
        },
        upsert: true, // Insert if not exists
      },
    }));
  
    try {
      await OHLCV.bulkWrite(bulkOps);
      console.log('OHLCV data saved successfully.');
    } catch (error) {
      console.error('Failed to save OHLCV data:', error.message);
      throw error;
    }
  }

  async fetchAndSaveOHLCVData(options = {}) {
    try {
      const ohlcvData = await this.getOHLCVHistorical(options);
      await this.saveOHLCVData(ohlcvData);
    } catch (error) {
      console.error('Failed to fetch and save OHLCV data:', error.message);
      throw error;
    }
  }

  async getLatestOHLCV(options = {}) {
    const params = {
      id: options.id,
      symbol: options.symbol,
      convert: options.convert || 'USD',
      convert_id: options.convert_id,
      skip_invalid: options.skip_invalid || false,
    };
  
    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
  
    try {
      const response = await this._makeRequest('/v2/cryptocurrency/ohlcv/latest', params);
      return response.data; // Return the latest OHLCV data
    } catch (error) {
      console.error('Failed to fetch latest OHLCV data:', error.message);
      throw error;
    }
  }

  async saveLatestOHLCVData(data) {
    const bulkOps = Object.values(data).map(item => ({
      updateOne: {
        filter: { 'cryptocurrency.id': item.id },
        update: {
          $set: {
            cryptocurrency: {
              id: item.id,
              name: item.name,
              symbol: item.symbol,
            },
            lastUpdated: new Date(item.last_updated),
            timeOpen: new Date(item.time_open),
            timeClose: item.time_close ? new Date(item.time_close) : null,
            timeHigh: new Date(item.time_high),
            timeLow: new Date(item.time_low),
            quote: {
              USD: {
                open: item.quote.USD.open,
                high: item.quote.USD.high,
                low: item.quote.USD.low,
                close: item.quote.USD.close,
                volume: item.quote.USD.volume,
                lastUpdated: new Date(item.quote.USD.last_updated),
              },
            },
          },
        },
        upsert: true, // Insert if not exists
      },
    }));
  
    try {
      await LatestOHLCV.bulkWrite(bulkOps);
      console.log('Latest OHLCV data saved successfully.');
    } catch (error) {
      console.error('Failed to save latest OHLCV data:', error.message);
      throw error;
    }
  }

  async fetchAndSaveLatestOHLCVData(options = {}) {
    try {
      const latestOHLCVData = await this.getLatestOHLCV(options);
      await this.saveLatestOHLCVData(latestOHLCVData);
    } catch (error) {
      console.error('Failed to fetch and save latest OHLCV data:', error.message);
      throw error;
    }
  }

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
  
    try {
      const response = await this._makeRequest('/v2/cryptocurrency/price-performance-stats/latest', params);
      return response.data; // Return the price performance stats data
    } catch (error) {
      console.error('Failed to fetch price performance stats:', error.message);
      throw error;
    }
  }

  async savePricePerformanceStats(data) {
    const bulkOps = Object.values(data).map(item => ({
      updateOne: {
        filter: { 'cryptocurrency.id': item.id },
        update: {
          $set: {
            cryptocurrency: {
              id: item.id,
              name: item.name,
              symbol: item.symbol,
              slug: item.slug,
            },
            lastUpdated: new Date(item.last_updated),
            periods: {
              all_time: {
                openTimestamp: new Date(item.periods.all_time.open_timestamp),
                highTimestamp: new Date(item.periods.all_time.high_timestamp),
                lowTimestamp: new Date(item.periods.all_time.low_timestamp),
                closeTimestamp: new Date(item.periods.all_time.close_timestamp),
                quote: {
                  USD: {
                    open: item.periods.all_time.quote.USD.open,
                    high: item.periods.all_time.quote.USD.high,
                    low: item.periods.all_time.quote.USD.low,
                    close: item.periods.all_time.quote.USD.close,
                    percentChange: item.periods.all_time.quote.USD.percent_change,
                    priceChange: item.periods.all_time.quote.USD.price_change,
                  },
                },
              },
            },
          },
        },
        upsert: true, // Insert if not exists
      },
    }));
  
    try {
      await PricePerformanceStats.bulkWrite(bulkOps);
      console.log('Price performance stats saved successfully.');
    } catch (error) {
      console.error('Failed to save price performance stats:', error.message);
      throw error;
    }
  }

  async fetchAndSavePricePerformanceStats(options = {}) {
    try {
      const pricePerformanceStats = await this.getPricePerformanceStats(options);
      await this.savePricePerformanceStats(pricePerformanceStats);
    } catch (error) {
      console.error('Failed to fetch and save price performance stats:', error.message);
      throw error;
    }
  }

  async getHistoricalQuotes(options = {}) {
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
  
    try {
      const response = await this._makeRequest('/v2/cryptocurrency/quotes/historical', params);
      return response.data; // Return the historical quotes data
    } catch (error) {
      console.error('Failed to fetch historical quotes:', error.message);
      throw error;
    }
  }

  async saveHistoricalQuotes(data) {
    const bulkOps = [
      {
        updateOne: {
          filter: { 'cryptocurrency.id': data.id },
          update: {
            $set: {
              cryptocurrency: {
                id: data.id,
                name: data.name,
                symbol: data.symbol,
                isActive: data.is_active === 1,
                isFiat: data.is_fiat === 1,
              },
              quotes: data.quotes.map(quote => ({
                timestamp: new Date(quote.timestamp),
                quote: {
                  USD: {
                    price: quote.quote.USD.price,
                    volume24h: quote.quote.USD.volume_24h,
                    marketCap: quote.quote.USD.market_cap,
                    circulatingSupply: quote.quote.USD.circulating_supply,
                    totalSupply: quote.quote.USD.total_supply,
                    timestamp: new Date(quote.quote.USD.timestamp),
                  },
                },
              })),
            },
          },
          upsert: true, // Insert if not exists
        },
      },
    ];
  
    try {
      await HistoricalQuote.bulkWrite(bulkOps);
      console.log('Historical quotes saved successfully.');
    } catch (error) {
      console.error('Failed to save historical quotes:', error.message);
      throw error;
    }
  }

  async fetchAndSaveHistoricalQuotes(options = {}) {
    try {
      const historicalQuotes = await this.getHistoricalQuotes(options);
      await this.saveHistoricalQuotes(historicalQuotes);
    } catch (error) {
      console.error('Failed to fetch and save historical quotes:', error.message);
      throw error;
    }
  }

  async getCryptocurrencyQuotesLatest(options = {}) {
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
  
    try {
      const response = await this._makeRequest('/v2/cryptocurrency/quotes/latest', params);
      return response.data; // Return the cryptocurrency quotes data
    } catch (error) {
      console.error('Failed to fetch cryptocurrency quotes:', error.message);
      throw error;
    }
  }

  async saveCryptocurrencyQuotes(data) {
    const bulkOps = Object.values(data).map(item => ({
      updateOne: {
        filter: { 'cryptocurrency.id': item.id },
        update: {
          $set: {
            cryptocurrency: {
              id: item.id,
              name: item.name,
              symbol: item.symbol,
              slug: item.slug,
              isActive: item.is_active === 1,
              isFiat: item.is_fiat === 1,
              circulatingSupply: item.circulating_supply,
              totalSupply: item.total_supply,
              maxSupply: item.max_supply,
              dateAdded: new Date(item.date_added),
              numMarketPairs: item.num_market_pairs,
              cmcRank: item.cmc_rank,
              tags: item.tags || [],
              platform: item.platform || null,
              selfReportedCirculatingSupply: item.self_reported_circulating_supply,
              selfReportedMarketCap: item.self_reported_market_cap,
            },
            quote: {
              USD: {
                price: item.quote.USD.price,
                volume24h: item.quote.USD.volume_24h,
                volumeChange24h: item.quote.USD.volume_change_24h,
                percentChange1h: item.quote.USD.percent_change_1h,
                percentChange24h: item.quote.USD.percent_change_24h,
                percentChange7d: item.quote.USD.percent_change_7d,
                percentChange30d: item.quote.USD.percent_change_30d,
                marketCap: item.quote.USD.market_cap,
                marketCapDominance: item.quote.USD.market_cap_dominance,
                fullyDilutedMarketCap: item.quote.USD.fully_diluted_market_cap,
                lastUpdated: new Date(item.quote.USD.last_updated),
              },
            },
          },
        },
        upsert: true, // Insert if not exists
      },
    }));
  
    try {
      await CryptocurrencyQuote.bulkWrite(bulkOps);
      console.log('Cryptocurrency quotes saved successfully.');
    } catch (error) {
      console.error('Failed to save cryptocurrency quotes:', error.message);
      throw error;
    }
  }

  async fetchAndSaveCryptocurrencyQuotes(options = {}) {
    try {
      const cryptocurrencyQuotes = await this.getCryptocurrencyQuotesLatest(options);
      await this.saveCryptocurrencyQuotes(cryptocurrencyQuotes);
    } catch (error) {
      console.error('Failed to fetch and save cryptocurrency quotes:', error.message);
      throw error;
    }
  }

  async getHistoricalQuotesV3(options = {}) {
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
  
    try {
      const response = await this._makeRequest('/v3/cryptocurrency/quotes/historical', params);
      return response.data; // Return the historical quotes data
    } catch (error) {
      console.error('Failed to fetch historical quotes (v3):', error.message);
      throw error;
    }
  }

  async saveHistoricalQuotesV3(data) {
    const bulkOps = [
      {
        updateOne: {
          filter: { 'cryptocurrency.id': data.id },
          update: {
            $set: {
              cryptocurrency: {
                id: data.id,
                name: data.name,
                symbol: data.symbol,
                isActive: data.is_active === 1,
                isFiat: data.is_fiat === 1,
              },
              quotes: data.quotes.map(quote => ({
                timestamp: new Date(quote.timestamp),
                quote: {
                  USD: {
                    price: quote.quote.USD.price,
                    volume24h: quote.quote.USD.volume_24h,
                    marketCap: quote.quote.USD.market_cap,
                    circulatingSupply: quote.quote.USD.circulating_supply,
                    totalSupply: quote.quote.USD.total_supply,
                    timestamp: new Date(quote.quote.USD.timestamp),
                  },
                },
              })),
            },
          },
          upsert: true, // Insert if not exists
        },
      },
    ];
  
    try {
      await HistoricalQuoteV3.bulkWrite(bulkOps);
      console.log('Historical quotes (v3) saved successfully.');
    } catch (error) {
      console.error('Failed to save historical quotes (v3):', error.message);
      throw error;
    }
  }

  async fetchAndSaveHistoricalQuotesV3(options = {}) {
    try {
      const historicalQuotes = await this.getHistoricalQuotesV3(options);
      await this.saveHistoricalQuotesV3(historicalQuotes);
    } catch (error) {
      console.error('Failed to fetch and save historical quotes (v3):', error.message);
      throw error;
    }
  }






}

module.exports = new CoinmarketcapService();