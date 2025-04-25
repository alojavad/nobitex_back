class ContentService {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  // ==================== CONTENT LATEST ENDPOINT ====================
  async getContentLatest(options = {}) {
    const params = {
      start: options.start || 1,
      limit: options.limit || 100,
      id: options.id,
      slug: options.slug,
      Symbol: options.symbol,
      news_type: options.news_type || 'all',
      content_type: options.content_type || 'all',
      cateory: options.category,
      language: options.language || 'en',
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v1/content/latest', params);
  }

  // ==================== CONTENT TOP POSTS ENDPOINT ====================
  async getContentTopPosts(options = {}) {
    const params = {
      id: options.id,
      slug: options.slug,
      symbol: options.symbol,
      last_score: options.last_score,
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v1/content/posts/top', params);
  }

  // ==================== CONTENT LATEST POSTS ENDPOINT ====================
  async getContentLatestPosts(options = {}) {
    const params = {
      id: options.id,
      slug: options.slug,
      symbol: options.symbol,
      last_score: options.last_score,
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v1/content/posts/latest', params);
  }

  // ==================== CONTENT POST COMMENTS ENDPOINT ====================
  async getContentPostComments(options = {}) {
    const params = {
      post_id: options.post_id,
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v1/content/posts/comments', params);
  }
}

module.exports = ContentService;