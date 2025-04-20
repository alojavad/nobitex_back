require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const Market = require('../models/Market');

async function cleanDatabase() {
  try {
    // اتصال به دیتابیس
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ اتصال به دیتابیس برقرار شد');

    // حذف کالکشن‌های اضافی
    await Order.deleteMany({});
    console.log('✅ کالکشن Order حذف شد');
    
    await User.deleteMany({});
    console.log('✅ کالکشن User حذف شد');
    
    await Market.deleteMany({});
    console.log('✅ کالکشن Market حذف شد');

    // حذف خود مدل‌ها
    await mongoose.connection.db.dropCollection('orders');
    await mongoose.connection.db.dropCollection('users');
    await mongoose.connection.db.dropCollection('markets');
    console.log('✅ کالکشن‌ها از دیتابیس حذف شدند');

    console.log('✨ پاکسازی دیتابیس با موفقیت انجام شد');
  } catch (error) {
    console.error('❌ خطا در پاکسازی دیتابیس:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 اتصال به دیتابیس قطع شد');
  }
}

cleanDatabase(); 