# Backend Service

A TypeScript-based backend service for enriching and researching company and people data using queues, workers, and AI.

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 16+
- PostgreSQL
- Redis

### Environment Setup
1. Create a `.env` file in the root directory with:
```
DATABASE_URL=your_postgres_connection_string
REDIS_URL=your_redis_connection_string
PORT=3000
GEMINI_API_KEY=your_gemini_api_key
```

### Running with Docker Compose
```bash
# Build and start all services
docker compose up --build

# Start in detached mode
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

The Docker Compose setup includes:
- Backend application (Node.js)
- PostgreSQL database
- Redis instance

All environment variables are pre-configured in the docker-compose.yml file.

### Manual Setup
```bash
# Install dependencies
npm install

# Run migrations
npm run migrate

# Start the server
npm run dev
```

## Triggering Enrichment

### Via API
Send a POST request to trigger enrichment for a person:
```
POST /api/people/{personId}/enrich
```

Example:
```bash
curl -X POST http://localhost:3000/api/people/123/enrich
```

### Via UI
1. Navigate to the People List in the frontend
2. Click the "Enrich" button next to a person
3. Monitor progress in the Research Progress component

## Search Modes

The system supports both mock and real search implementations:

### Mock Search
- Located in `src/worker/enrichWorker.ts`
- Returns predefined data for testing
- Enabled by default in development

### Real Search
To enable real search:
1. Update the `processSearchResults` function in `enrichWorker.ts`
2. Implement your preferred search API integration
3. Update environment variables if needed

## API Documentation

The backend service provides API documentation using Swagger (OpenAPI 3.0).

- The Swagger UI is available at: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- The raw Swagger JSON specification can be accessed at: [http://localhost:3000/api-docs.json](http://localhost:3000/api-docs.json)

This documentation includes all available API endpoints, request/response schemas, and authentication requirements.

## Future Work

### Scaling
- Implement horizontal scaling for workers
- Add Redis cluster support
- Implement database sharding
- Add caching layer for frequently accessed data

### Authentication
- Add JWT-based authentication
- Implement role-based access control
- Add OAuth2 support for third-party integrations

### Additional Agents
Planned integrations:
- Company research agent
- News monitoring agent
- Social media enrichment agent
- Data validation agent

### Monitoring
- Add Prometheus metrics
- Implement logging aggregation
- Set up alert system for failed jobs
- Add performance monitoring

## Health Checks
The service provides a health endpoint at `/healthz` that monitors:
- Database connectivity
- Redis connection
- Worker status
