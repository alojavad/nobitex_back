class FiatService {
  constructor(apiClient) {
    this.apiClient = apiClient;

    // Predefined list of supported fiat currencies with their IDs
    this.FIAT_CURRENCIES = {
      USD: { id: 2781, symbol: '$', name: 'United States Dollar' },
      ALL: { id: 3526, symbol: 'L', name: 'Albanian Lek' },
      DZD: { id: 3537, symbol: 'د.ج', name: 'Algerian Dinar' },
      ARS: { id: 2821, symbol: '$', name: 'Argentine Peso' },
      AMD: { id: 3527, symbol: '֏', name: 'Armenian Dram' },
      AUD: { id: 2782, symbol: '$', name: 'Australian Dollar' },
      AZN: { id: 3528, symbol: '₼', name: 'Azerbaijani Manat' },
      BHD: { id: 3531, symbol: '.د.ب', name: 'Bahraini Dinar' },
      BDT: { id: 3530, symbol: '৳', name: 'Bangladeshi Taka' },
      BYN: { id: 3533, symbol: 'Br', name: 'Belarusian Ruble' },
      BMD: { id: 3532, symbol: '$', name: 'Bermudan Dollar' },
      BOB: { id: 2832, symbol: 'Bs.', name: 'Bolivian Boliviano' },
      BAM: { id: 3529, symbol: 'KM', name: 'Bosnia-Herzegovina Convertible Mark' },
      BRL: { id: 2783, symbol: 'R$', name: 'Brazilian Real' },
      BGN: { id: 2814, symbol: 'лв', name: 'Bulgarian Lev' },
      KHR: { id: 3549, symbol: '៛', name: 'Cambodian Riel' },
      CAD: { id: 2784, symbol: '$', name: 'Canadian Dollar' },
      CLP: { id: 2786, symbol: '$', name: 'Chilean Peso' },
      CNY: { id: 2787, symbol: '¥', name: 'Chinese Yuan' },
      COP: { id: 2820, symbol: '$', name: 'Colombian Peso' },
      CRC: { id: 3534, symbol: '₡', name: 'Costa Rican Colón' },
      HRK: { id: 2815, symbol: 'kn', name: 'Croatian Kuna' },
      CUP: { id: 3535, symbol: '$', name: 'Cuban Peso' },
      CZK: { id: 2788, symbol: 'Kč', name: 'Czech Koruna' },
      DKK: { id: 2789, symbol: 'kr', name: 'Danish Krone' },
      DOP: { id: 3536, symbol: '$', name: 'Dominican Peso' },
      EGP: { id: 3538, symbol: '£', name: 'Egyptian Pound' },
      EUR: { id: 2790, symbol: '€', name: 'Euro' },
      GEL: { id: 3539, symbol: '₾', name: 'Georgian Lari' },
      GHS: { id: 3540, symbol: '₵', name: 'Ghanaian Cedi' },
      GTQ: { id: 3541, symbol: 'Q', name: 'Guatemalan Quetzal' },
      HNL: { id: 3542, symbol: 'L', name: 'Honduran Lempira' },
      HKD: { id: 2792, symbol: '$', name: 'Hong Kong Dollar' },
      HUF: { id: 2793, symbol: 'Ft', name: 'Hungarian Forint' },
      ISK: { id: 2818, symbol: 'kr', name: 'Icelandic Króna' },
      INR: { id: 2796, symbol: '₹', name: 'Indian Rupee' },
      IDR: { id: 2794, symbol: 'Rp', name: 'Indonesian Rupiah' },
      IRR: { id: 3544, symbol: '﷼', name: 'Iranian Rial' },
      IQD: { id: 3543, symbol: 'ع.د', name: 'Iraqi Dinar' },
      ILS: { id: 2795, symbol: '₪', name: 'Israeli New Shekel' },
      JMD: { id: 3545, symbol: '$', name: 'Jamaican Dollar' },
      JPY: { id: 2797, symbol: '¥', name: 'Japanese Yen' },
      JOD: { id: 3546, symbol: 'د.ا', name: 'Jordanian Dinar' },
      KZT: { id: 3551, symbol: '₸', name: 'Kazakhstani Tenge' },
      KES: { id: 3547, symbol: 'Sh', name: 'Kenyan Shilling' },
      KWD: { id: 3550, symbol: 'د.ك', name: 'Kuwaiti Dinar' },
      KGS: { id: 3548, symbol: 'с', name: 'Kyrgystani Som' },
      LBP: { id: 3552, symbol: 'ل.ل', name: 'Lebanese Pound' },
      MKD: { id: 3556, symbol: 'ден', name: 'Macedonian Denar' },
      MYR: { id: 2800, symbol: 'RM', name: 'Malaysian Ringgit' },
      MUR: { id: 2816, symbol: '₨', name: 'Mauritian Rupee' },
      MXN: { id: 2799, symbol: '$', name: 'Mexican Peso' },
      MDL: { id: 3555, symbol: 'L', name: 'Moldovan Leu' },
      MNT: { id: 3558, symbol: '₮', name: 'Mongolian Tugrik' },
      MAD: { id: 3554, symbol: 'د.م.', name: 'Moroccan Dirham' },
      MMK: { id: 3557, symbol: 'Ks', name: 'Myanma Kyat' },
      NAD: { id: 3559, symbol: '$', name: 'Namibian Dollar' },
      NPR: { id: 3561, symbol: '₨', name: 'Nepalese Rupee' },
      TWD: { id: 2811, symbol: 'NT$', name: 'New Taiwan Dollar' },
      NZD: { id: 2802, symbol: '$', name: 'New Zealand Dollar' },
      NIO: { id: 3560, symbol: 'C$', name: 'Nicaraguan Córdoba' },
      NGN: { id: 2819, symbol: '₦', name: 'Nigerian Naira' },
      NOK: { id: 2801, symbol: 'kr', name: 'Norwegian Krone' },
      OMR: { id: 3562, symbol: 'ر.ع.', name: 'Omani Rial' },
      PKR: { id: 2804, symbol: '₨', name: 'Pakistani Rupee' },
      PAB: { id: 3563, symbol: 'B/.', name: 'Panamanian Balboa' },
      PEN: { id: 2822, symbol: 'S/.', name: 'Peruvian Sol' },
      PHP: { id: 2803, symbol: '₱', name: 'Philippine Peso' },
      PLN: { id: 2805, symbol: 'zł', name: 'Polish Złoty' },
      QAR: { id: 3564, symbol: 'ر.ق', name: 'Qatari Rial' },
      RON: { id: 2817, symbol: 'lei', name: 'Romanian Leu' },
      RUB: { id: 2806, symbol: '₽', name: 'Russian Ruble' },
      SAR: { id: 3566, symbol: 'ر.س', name: 'Saudi Riyal' },
      RSD: { id: 3565, symbol: 'дин.', name: 'Serbian Dinar' },
      SGD: { id: 2808, symbol: 'S$', name: 'Singapore Dollar' },
      ZAR: { id: 2812, symbol: 'R', name: 'South African Rand' },
      KRW: { id: 2798, symbol: '₩', name: 'South Korean Won' },
      SSP: { id: 3567, symbol: '£', name: 'South Sudanese Pound' },
      VES: { id: 3573, symbol: 'Bs.', name: 'Sovereign Bolivar' },
      LKR: { id: 3553, symbol: 'Rs', name: 'Sri Lankan Rupee' },
      SEK: { id: 2807, symbol: 'kr', name: 'Swedish Krona' },
      CHF: { id: 2785, symbol: 'Fr', name: 'Swiss Franc' },
      THB: { id: 2809, symbol: '฿', name: 'Thai Baht' },
      TTD: { id: 3569, symbol: '$', name: 'Trinidad and Tobago Dollar' },
      TND: { id: 3568, symbol: 'د.ت', name: 'Tunisian Dinar' },
      TRY: { id: 2810, symbol: '₺', name: 'Turkish Lira' },
      UGX: { id: 3570, symbol: 'Sh', name: 'Ugandan Shilling' },
      UAH: { id: 2824, symbol: '₴', name: 'Ukrainian Hryvnia' },
      AED: { id: 2813, symbol: 'د.إ', name: 'United Arab Emirates Dirham' },
      UYU: { id: 3571, symbol: '$', name: 'Uruguayan Peso' },
      UZS: { id: 3572, symbol: "so'm", name: 'Uzbekistan Som' },
      VND: { id: 2823, symbol: '₫', name: 'Vietnamese Dong' },
      // Precious Metals
      XAU: { id: 3575, symbol: '', name: 'Gold Troy Ounce' },
      XAG: { id: 3574, symbol: '', name: 'Silver Troy Ounce' },
      XPT: { id: 3577, symbol: '', name: 'Platinum Ounce' },
      XPD: { id: 3576, symbol: '', name: 'Palladium Ounce' }
    };
  }


  // ==================== FIAT MAP ENDPOINT ====================
  async getFiatMap(options = {}) {
    const params = {
      start: options.start || 1,
      limit: options.limit || 5000,
      sort: options.sort || 'id',
      include_metals: options.include_metals || false,
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return this.apiClient.makeRequest('/v1/fiat/map', params);
  }
}

module.exports = FiatService;