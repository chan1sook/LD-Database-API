const session = require("express-session");
const redis = require("redis");
const connectRedis = require("connect-redis");

const sessionConfig = {
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: "lax",
  },
};

const redisClient = redis.createClient();
redisClient.on("error", (err) => {
  console.error(new Error("redis error: ", err));
});
const RedisStore = connectRedis(session);
sessionConfig.store = new RedisStore({ client: redisClient });

module.exports = session(sessionConfig);
