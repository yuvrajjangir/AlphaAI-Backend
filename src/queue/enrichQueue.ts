import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';

export const enrichQueue = new Queue('enrich', {
  connection: redisConnection,
});
