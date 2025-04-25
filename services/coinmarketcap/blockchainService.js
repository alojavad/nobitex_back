class BlockchainService {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  // ==================== LATEST BLOCKCHAIN STATISTICS ENDPOINT ====================
  async getLatestBlockchainStatistics(options = {}) {
    const params = {
      id: options.id,
      slug: options.slug,
      symbol: options.symbol,
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v1/blockchain/statistics/latest', params);
  }
}

module.exports = BlockchainService;