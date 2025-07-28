import { Router } from 'express';
import { PeopleController } from '../controllers/peopleController';
import { SnippetsController } from '../controllers/snippetsController';
import { HealthController } from '../controllers/healthController';
import { EventsController } from '../controllers/eventsController';
import { ResearchController } from '../controllers/researchController';
import { CompanyController } from '../controllers/companyController';
import { CampaignController } from '../controllers/campaignController';
import { apiKeyAuth } from '../middleware/Auth';

const router = Router();

// Campaign routes
router.get('/campaigns', apiKeyAuth, CampaignController.listAll);
router.post('/campaigns', apiKeyAuth, CampaignController.create);
router.get('/campaigns/:id', apiKeyAuth, CampaignController.getById);

// Company routes
router.get('/companies', apiKeyAuth, CompanyController.listAll);
router.post('/companies', apiKeyAuth, CompanyController.create);
router.get('/companies/:id', apiKeyAuth, CompanyController.getById);

// People routes
router.get('/people', apiKeyAuth, PeopleController.listAll);
router.post('/people', apiKeyAuth, PeopleController.create);

// Research routes
router.post(
  '/enrich/:person_id',
  apiKeyAuth,
  PeopleController.triggerEnrichment,
);

// Alias for research endpoint
router.get(
  '/research/jobs/:job_id',
  apiKeyAuth,
  ResearchController.getJobStatus,
);

router.put(
  '/research/status',
  apiKeyAuth,
  ResearchController.bulkUpdateResearchStatus,
);

// Snippets routes
router.get(
  '/snippets/company/:company_id',
  apiKeyAuth,
  SnippetsController.getByCompany,
);

// SSE endpoints
router.get('/events/jobs/:jobId', apiKeyAuth, EventsController.streamJobUpdates);

// Health check
router.get('/healthz', apiKeyAuth, HealthController.check);

export default router;
