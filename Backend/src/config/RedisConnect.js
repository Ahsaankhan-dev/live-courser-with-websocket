import Redis from "ioredis";

let RedisClient;

const RedisConnect = () => {
    if (RedisClient) return RedisClient;
    const now = Date.now();
    console.log(now);
    

    RedisClient = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
        enableOfflineQueue: false,
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => Math.min(times * 1000, 5000),
    });

    RedisClient.on("error", (error) => {
        console.error("Redis connection error:", error.message);
    });

    return RedisClient;
};

export default RedisConnect;
