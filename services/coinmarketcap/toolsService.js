class ToolsService {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  // ==================== PRICE CONVERSION ENDPOINT ====================
  async convertPrice(options = {}) {
    const params = {
      amount: options.amount,
      id: options.id,
      symbol: options.symbol,
      convert: options.convert || 'USD',
      convert_id: options.convert_id,
      time: options.time,
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v2/tools/price-conversion', params);
  }

  // ==================== POSTMAN TOOL ENDPOINT ====================
  async getPostmanTool(options = {}) {
    return this.apiClient.makeRequest('/v1/tools/postman', options);
  }
}

module.exports = ToolsService;