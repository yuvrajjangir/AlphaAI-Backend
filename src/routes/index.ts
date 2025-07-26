import { Router } from 'express';
import { PeopleController } from '../controllers/peopleController';
import { SnippetsController } from '../controllers/snippetsController';
import { HealthController } from '../controllers/healthController';
import { EventsController } from '../controllers/eventsController';
import { ResearchController } from '../controllers/researchController';
import { CompanyController } from '../controllers/companyController';
import { CampaignController } from '../controllers/campaignController';

const router = Router();

// Campaign routes
router.get('/campaigns', CampaignController.listAll);
router.post('/campaigns', CampaignController.create);
router.get('/campaigns/:id', CampaignController.getById);

// Company routes
router.get('/companies', CompanyController.listAll);
router.post('/companies', CompanyController.create);
router.get('/companies/:id', CompanyController.getById);

// People routes
router.get('/people', PeopleController.listAll);
router.post('/people', PeopleController.create);
// router.post('/people/:person_id/research', ResearchController.triggerResearch);
router.post('/enrich/:person_id', ResearchController.triggerResearch); // Alias for research endpoint
router.get('/research/jobs/:job_id', ResearchController.getJobStatus);

// Snippets routes
router.get('/snippets/company/:company_id', SnippetsController.getByCompany);

// SSE endpoints
router.get('/events/jobs/:jobId', EventsController.streamJobUpdates);

// Health check
router.get('/healthz', HealthController.check);

export default router;
