// routes/nobitexRoutes.js
const express = require('express');
const router = express.Router();
const marketController = require('../controllers/marketController');

// دریافت لیست سفارش‌ها
router.get('/orderbook/:symbol', marketController.getOrderBook);

// دریافت آمار بازار
router.get('/market/stats', marketController.getMarketStats);

// دریافت آمار OHLC بازار
router.get('/udf/history', marketController.getUDFHistory);

router.get('/depth/:symbol', marketController.getDepth);

router.get('/trades/:symbol', marketController.getTrades);


module.exports = router;
