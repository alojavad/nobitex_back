# Nobitex API Integration

این پروژه یک رابط برنامه‌نویسی برای دسترسی به API های صرافی نوبیتکس است.

## ویژگی‌ها

- دریافت اطلاعات عمق بازار (Order Book)
- دریافت آمار بازار
- دریافت تاریخچه معاملات
- دریافت آمار جهانی
- ذخیره اطلاعات در پایگاه داده MongoDB

## نصب

```bash
npm install
```

## تنظیمات

1. یک فایل `.env` در مسیر اصلی پروژه ایجاد کنید:

```env
MONGODB_URI=your_mongodb_uri
PORT=3000
```

2. پایگاه داده MongoDB را نصب و راه‌اندازی کنید.

## اجرا

```bash
npm start
```

## API Endpoints

### دریافت عمق بازار
```
GET /api/orderbook?symbol=BTCIRT&version=v2
```

### دریافت آمار بازار
```
GET /api/market/stats?srcCurrency=btc&dstCurrency=rls
```

### دریافت تاریخچه
```
GET /api/market/udf/history?symbol=BTCIRT&resolution=1D&from=1625097600&to=1625184000
```

### دریافت آمار جهانی
```
GET /api/market/global-stats
```

## تکنولوژی‌ها

- Node.js
- Express.js
- MongoDB
- Mongoose
- Axios

## مجوز

MIT
