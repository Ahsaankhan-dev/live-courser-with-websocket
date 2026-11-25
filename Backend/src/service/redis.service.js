import Redis from "ioredis";

const RedisService = () => {
    let RedisClient;
    const LastCursorWriteAt = new Map();

    const GetRedisClient = () => {
        if (RedisClient) return RedisClient;

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

    const SaveCursor = async ({ userId, name, X, Y }) => {
        const now = Date.now();
        const lastWriteAt = LastCursorWriteAt.get(userId) || 0;

        // Har user ke liye 100ms mein sirf ek Redis write hone do.
        if (now - lastWriteAt < 100) return false;

        LastCursorWriteAt.set(userId, now);
        await GetRedisClient().set(
            `cursor:${userId}`,
            JSON.stringify({ userId: String(userId), name, X, Y }),
            "EX",
            30,
        );
        return true;
    };

    const GetAllCursors = async () => {
        const cursors = new Map();
        let scanCursor = "0";
        const RedisConnection = GetRedisClient();

        do {
            // SCAN keys ko batches mein dhoondta hai aur server ko block nahi karta.
            const [nextCursor, keys] = await RedisConnection.scan(
                scanCursor,
                "MATCH",
                "cursor:*",
                "COUNT",
                100,
            );
            scanCursor = nextCursor;

            if (keys.length > 0) {
                const values = await RedisConnection.mget(...keys);
                for (let index = 0; index < values.length; index += 1) {
                    const value = values[index];
                    if (value !== null) cursors.set(keys[index], JSON.parse(value));
                }
            }
        } while (scanCursor !== "0");

        return [...cursors.values()];
    };

    const RemoveCursor = async (userId) => {
        LastCursorWriteAt.delete(userId);
        await GetRedisClient().del(`cursor:${userId}`);
    };

    return {
        SaveCursor,
        GetAllCursors,
        RemoveCursor,
    };
};

export default RedisService;
