import RedisConnect from "../config/RedisConnect.js";

const RedisService = () => {
    const LastCursorWriteAt = new Map();

    const SaveCursor = async ({ userId, name, X, Y }) => {
        const now = Date.now();
        const lastWriteAt = LastCursorWriteAt.get(userId) || 0;

        // Har user ke liye 100ms mein sirf ek Redis write hone do.
        if (now - lastWriteAt < 100) return false;

        LastCursorWriteAt.set(userId, now);
        await RedisConnect().set(
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
        const RedisClient = RedisConnect();

        do {
            // SCAN keys ko batches mein dhoondta hai aur server ko block nahi karta.
            const [nextCursor, keys] = await RedisClient.scan(
                scanCursor,
                "MATCH",
                "cursor:*",
                "COUNT",
                100,
            );
            scanCursor = nextCursor;

            if (keys.length > 0) {
                const values = await RedisClient.mget(...keys);
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
        await RedisConnect().del(`cursor:${userId}`);
    };

    return {
        SaveCursor,
        GetAllCursors,
        RemoveCursor,
    };
};

export default RedisService;
