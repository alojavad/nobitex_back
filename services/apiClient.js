const axios = require('axios');

class ApiClient {
  constructor(baseURL, apiKey) {
    this.BASE_URL = baseURL;
    this.HEADERS = {
      'X-CMC_PRO_API_KEY': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Encoding': 'deflate, gzip',
    };

    // Define error codes
    this.ERROR_CODES = {
      1001: { httpStatus: 401, message: '[API_KEY_INVALID] This API Key is invalid.' },
      1002: { httpStatus: 401, message: '[API_KEY_MISSING] API key missing.' },
      1003: { httpStatus: 402, message: '[API_KEY_PLAN_REQUIRES_PAYEMENT] Your API Key must be activated. Please go to pro.coinmarketcap.com/account/plan.' },
      1004: { httpStatus: 402, message: "[API_KEY_PLAN_PAYMENT_EXPIRED] Your API Key's subscription plan has expired." },
      1005: { httpStatus: 403, message: '[API_KEY_REQUIRED] An API Key is required for this call.' },
      1006: { httpStatus: 403, message: "[API_KEY_PLAN_NOT_AUTHORIZED] Your API Key subscription plan doesn't support this endpoint." },
      1007: { httpStatus: 403, message: '[API_KEY_DISABLED] This API Key has been disabled. Please contact support.' },
      1008: { httpStatus: 429, message: "[API_KEY_PLAN_MINUTE_RATE_LIMIT_REACHED] You've exceeded your API Key's HTTP request rate limit. Rate limits reset every minute." },
      1009: { httpStatus: 429, message: "[API_KEY_PLAN_DAILY_RATE_LIMIT_REACHED] You've exceeded your API Key's daily rate limit." },
      1010: { httpStatus: 429, message: "[API_KEY_PLAN_MONTHLY_RATE_LIMIT_REACHED] You've exceeded your API Key's monthly rate limit." },
      1011: { httpStatus: 429, message: "[IP_RATE_LIMIT_REACHED] You've hit an IP rate limit." },
    };
  }

  async makeRequest(endpoint, params = {}) {
    const url = `${this.BASE_URL}${endpoint}`;
    try {
      const response = await axios.get(url, {
        headers: this.HEADERS,
        params,
        decompress: true,
      });

      // Validate response status
      if (response.data.status?.error_code !== 0) {
        throw this._handleApiError({ response });
      }

      return response.data.data || {};
    } catch (error) {
      throw this._handleApiError(error);
    }
  }

  /**
   * Enhanced error handler with API-specific error codes
   * @private
   */
  _handleApiError(error) {
    let status = null;
    let apiError = null;

    // Try to extract status from error response
    if (error.response && error.response.data && error.response.data.status) {
      status = error.response.data.status;
      this.lastRequestStatus = status;

      // Check if we have a known API error code
      if (status.error_code && this.ERROR_CODES[status.error_code]) {
        apiError = new Error(status.error_message || this.ERROR_CODES[status.error_code].message);
        apiError.code = status.error_code;
        apiError.httpStatus = this.ERROR_CODES[status.error_code].httpStatus;
      }
    }

    // If we didn't find an API-specific error, create a generic one
    if (!apiError) {
      apiError = new Error(error.response?.data?.status?.error_message || error.message);
      apiError.code = error.response?.data?.status?.error_code || error.code;
      apiError.httpStatus = error.response?.status || 500;
    }

    apiError.status = status || this.lastRequestStatus;

    console.error('API Error:', {
      code: apiError.code,
      message: apiError.message,
      httpStatus: apiError.httpStatus,
      status: apiError.status,
    });

    throw apiError;
  }
}

module.exports = ApiClient;