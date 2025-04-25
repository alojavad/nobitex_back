class CommunityService {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  // ==================== COMMUNITY TRENDING TOPICS ENDPOINT ====================
  async getTrendingTopics(options = {}) {
    const params = {
      limit: options.limit || 5,
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v1/community/trending/topic', params);
  }

  // ==================== COMMUNITY TRENDING TOKENS ENDPOINT ====================
  async getTrendingTokens(options = {}) {
    const params = {
      limit: options.limit || 5,
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v1/community/trending/token', params);
  }
}

module.exports = CommunityService;