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
const port = process.env.PORT || 3000;
app.use(cors());

// Initialize job events singleton
const jobEvents = JobEvents.getInstance();

// Create research queue
const researchQueue = new Queue('research', { connection: redisConnection });

// Middleware
app.use(express.json());

// Start research worker if not running
if (!researchWorker.isRunning()) {
  researchWorker.run();
  console.log('✅ Research worker started');
}

// Make queue available in app locals
app.locals.researchQueue = researchQueue;

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Documentation in JSON format
app.get('/api-docs.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes
app.use('/api', routes);

// Health check endpoint
app.get('/healthz', async (req: Request, res: Response) => {
  try {
    // Check database connection
    await sequelize.authenticate();

    // Check Redis connection by attempting to get queue info
    await researchQueue.getJobCounts();

    // Check worker status
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
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Start the research worker if it's not already running
    if (!researchWorker.isRunning()) {
      await researchWorker.run();
      console.log('✅ Research worker started');
    } else {
      console.log('✅ Research worker already running');
    }

    // Start the server
    const server = app.listen(port, () => {
      console.log(`✅ Server running on http://localhost:${port}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log('\n🛑 Shutting down gracefully...');

      // Close server first (stop accepting new requests)
      server.close(() => {
        console.log('📪 HTTP server closed');
      });

      try {
        // Close research worker
        await researchWorker.close();
        console.log('🔌 Research worker shutdown complete');

        // Close database connection
        await sequelize.close();
        console.log('🔌 Database connection closed');

        console.log('✅ Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    };

    // Handle shutdown signals
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('❌ Startup failed:', error);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

// Start the application
startServer();
