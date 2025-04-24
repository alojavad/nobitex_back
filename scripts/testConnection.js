// testConnection.js
const mongoose = require('mongoose');

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    // Test database operations
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nAvailable collections:', collections.map(c => c.name).join(', '));
    
    // Close the connection
    await mongoose.connection.close();
    console.log('\nConnection closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    process.exit(1);
  }
}

// Load environment variables
require('dotenv').config();

// Run the test
testConnection();