// اسکریپت برای حذف و ایجاد مجدد کالکشن‌ها
require('dotenv').config();
const mongoose = require('mongoose');

async function resetCollections() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // حذف کالکشن‌ها
    console.log('Dropping collections...');
    await mongoose.connection.collection('trades').drop().catch(err => console.log('Error dropping trades collection:', err.message));
    await mongoose.connection.collection('orderbooks').drop().catch(err => console.log('Error dropping orderbooks collection:', err.message));
    await mongoose.connection.collection('marketstats').drop().catch(err => console.log('Error dropping marketstats collection:', err.message));
    await mongoose.connection.collection('nobitexjobs').drop().catch(err => console.log('Error dropping nobitexjobs collection:', err.message));
    
    console.log('Collections dropped successfully');
    
    // ایجاد مجدد کالکشن‌ها با ساختار جدید
    console.log('Creating collections with new structure...');
    
    // ایجاد کالکشن trades با ایندکس ترکیبی
    await mongoose.connection.createCollection('trades');
    await mongoose.connection.collection('trades').createIndex(
      { symbol: 1, time: 1, price: 1, volume: 1, type: 1 },
      { unique: true }
    );
    
    // ایجاد کالکشن orderbooks
    await mongoose.connection.createCollection('orderbooks');
    
    // ایجاد کالکشن marketstats
    await mongoose.connection.createCollection('marketstats');
    await mongoose.connection.collection('marketstats').createIndex(
      { symbol: 1, lastUpdate: -1 }
    );
    
    // ایجاد کالکشن nobitexjobs
    await mongoose.connection.createCollection('nobitexjobs');
    
    console.log('Collections created successfully');
    
    // بستن اتصال
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
    console.log('Reset completed successfully');
  } catch (error) {
    console.error('Error resetting collections:', error);
  }
}

// اجرای تابع
resetCollections(); 