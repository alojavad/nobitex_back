// redisClient.js  
const Redis = require('ioredis');  

// Create a new Redis client instance  
const redis = new Redis({  
  host: process.env.REDIS_HOST, // The Redis host from Render  
  port: process.env.REDIS_PORT, // The Redis port (default: 6379)  
  password: process.env.REDIS_PASSWORD, // The password if configured  
});  

// Function to set a cache value  
const setCache = async (key, value) => {  
  await redis.set(key, value, 'EX', 3600); // Expires in 1 hour  
};  

// Function to get a cache value  
const getCache = async (key) => {  
  return await redis.get(key);  
};  

// Export the client and utility functions  
module.exports = {  
  redis,  
  setCache,  
  getCache,  
};  