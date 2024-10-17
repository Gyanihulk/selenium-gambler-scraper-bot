require("dotenv").config();
const express = require("express");
const redis = require("redis");
const mongoose = require("mongoose");
const { monitorPercentagesCrazy } = require("./gamblerCrazyWebsite");
const { cleanRedisData } = require("./config/redisConfig");
const { monitorPercentages } = require("./newGambler");


const app = express();

// Environment variables
const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const MONGO_URL =
  process.env.MONGO_URL || "mongodb://localhost:27017/your-db-name";


// Connect to Redis
const redisClient = redis.createClient({
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT,
  },
});



redisClient.on("error", (err) => console.error("Redis Client Error", err));


// Connect to MongoDB
// mongoose
//   .connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => console.error("MongoDB connection error:", err));

// Express routes
app.get("/", (req, res) => {
  res.send("Hello aa 1ee31");
})


// Start the Express app
app.listen(3000, () => {
  console.log("Express app listening on port 3000");
  (async () => {
    await redisClient.connect();
    console.log("Connected to Redis");

    await cleanRedisData();
    console.log("Cleaned up Redis data for game results and bets.");
  })();
  monitorPercentagesCrazy()
  monitorPercentages()
});







