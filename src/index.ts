import dotenv from 'dotenv';
dotenv.config();

import express, { Application, Request, Response } from 'express';
import sequelize from './config/database';
import routes from './routes';
import { JobEvents } from './services/JobEvents';
import { Queue } from 'bullmq';
import { researchWorker } from './worker/researchWorker';
import { redisConnection } from './config/redis';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

const app: Application = express();

const researchQueue = new Queue('research', { connection: redisConnection });
app.locals.researchQueue = researchQueue;

const port = process.env.PORT || 3000;
app.use(cors());

const jobEvents = JobEvents.getInstance();

app.use(express.json());

if (!researchWorker.isRunning()) {
  researchWorker.run();
  console.log('✅ Research worker started');
}

app.locals.researchQueue = researchQueue;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/api-docs.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes
app.use('/api', routes);

// Health check endpoint
app.get('/healthz', async (req: Request, res: Response) => {
  try {
    await sequelize.authenticate();

    await researchQueue.getJobCounts();

    const workerActive = researchWorker.isRunning();

    res.json({
      status: 'healthy',
      services: {
        database: 'connected',
        redis: 'connected',
        worker: workerActive ? 'running' : 'stopped',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    if (!researchWorker.isRunning()) {
      await researchWorker.run();
      console.log('✅ Research worker started');
    } else {
      console.log('✅ Research worker already running');
    }

    const server = app.listen(port, () => {
      console.log(`✅ Server running on http://localhost:${port}`);
    });

    const shutdown = async () => {
      console.log('\n🛑 Shutting down gracefully...');

      server.close(() => {
        console.log('📪 HTTP server closed');
      });

      try {
        await researchWorker.close();
        console.log('🔌 Research worker shutdown complete');

        await sequelize.close();
        console.log('🔌 Database connection closed');

        console.log('✅ Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('❌ Startup failed:', error);
    process.exit(1);
  }
}

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

startServer();
