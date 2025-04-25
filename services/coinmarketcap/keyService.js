class KeyService {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  // ==================== KEY INFO ENDPOINT ====================
  async getKeyInfo(options = {}) {
    return this.apiClient.makeRequest('/v1/key/info', options);
  }
}

module.exports = KeyService;