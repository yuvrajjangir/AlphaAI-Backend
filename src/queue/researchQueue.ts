import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';

const researchQueue = new Queue('research', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

export default researchQueue;
