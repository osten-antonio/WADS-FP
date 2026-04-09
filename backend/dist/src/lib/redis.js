import Redis from 'ioredis';
const url = process.env.REDIS_URL ?? 'redis://127.0.0.1:6379';
export const redis = new Redis(url);
redis.on('error', (err) => {
    console.error('Redis error:', err);
});
export default redis;
//# sourceMappingURL=redis.js.map