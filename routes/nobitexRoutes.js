// routes/nobitexRoutes.js
const express = require('express');
const router = express.Router();
const marketController = require('../controllers/marketController');

// ===== API‌های عمومی بازار =====

// دریافت لیست سفارش‌ها
router.get('/orderbook/:symbol', marketController.getOrderBook);

// دریافت نمودار عمق
router.get('/depth/:symbol', marketController.getDepth);

// دریافت لیست معاملات
router.get('/trades/:symbol', marketController.getTrades);

// دریافت آمار بازار
router.get('/market/stats', marketController.getMarketStats);

// دریافت آمار OHLC بازار
router.get('/udf/history', marketController.getUDFHistory);

// دریافت آمار بازار جهانی
router.get('/global/stats', marketController.getGlobalStats);

module.exports = router;
