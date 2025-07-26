import { ConnectionOptions } from 'bullmq';

function parseRedisUrl(url: string): ConnectionOptions {
  const redisUrl = new URL(url);
  return {
    host: redisUrl.hostname,
    port: parseInt(redisUrl.port),
    username: redisUrl.username || undefined,
    password: redisUrl.password || undefined,
    tls: redisUrl.protocol === 'rediss:' ? {} : undefined,
  };
}

export const redisConnection: ConnectionOptions = process.env.REDIS_URL
  ? parseRedisUrl(process.env.REDIS_URL)
  : {
      host: 'localhost',
      port: 6379,
    };

export default redisConnection;
