const redis = require("redis");
const { promisify } = require("util");

// Configuration for Redis client
const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },
  legacyMode: true
});

// Connect to Redis
redisClient.connect().catch(err => console.error('Redis connect error:', err));

// Promisify Redis methods
const lpushAsync = promisify(redisClient.lpush).bind(redisClient);
const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);
const lrangeAsync = promisify(redisClient.lrange).bind(redisClient);
const delAsync = promisify(redisClient.del).bind(redisClient);

async function cleanRedisData() {
  try {
    // Delete specific keys related to game results and bets
    await redisClient.del("gameResults"); // Deletes the game results list
    await redisClient.del("bets");        // Deletes the bets list

    // Optionally, use FLUSHDB to remove all keys (be careful with this)
    // await redisClient.flushDb(); // Uncomment if you want to clear the entire Redis database

    console.log("Redis data cleaned.");
  } catch (error) {
    console.error("Error cleaning Redis data:", error);
  }
}
module.exports = {
  redisClient,cleanRedisData,
  lpushAsync,getAsync,setAsync,lrangeAsync,delAsync
};
