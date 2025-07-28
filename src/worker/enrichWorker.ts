import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import { Person, Company, ContextSnippet, SearchLog } from '../models';

type EnrichmentField =
  | 'companyValueProp'
  | 'productNames'
  | 'pricingModel'
  | 'keyCompetitors'
  | 'companyDomain';

interface SearchResult {
  url: string;
  title: string;
  snippet: string;
}

interface EnrichmentData {
  companyValueProp?: string;
  productNames?: string[];
  pricingModel?: string;
  keyCompetitors?: string[];
  companyDomain?: string;
}

async function mockSearch(
  companyName: string,
  _missingFields: string[],
): Promise<SearchResult[]> {
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay

  return [
    {
      url: 'https://example.com/1',
      title: `About ${companyName}`,
      snippet: `${companyName} is a leading provider of software solutions. Their main product is...`,
    },
    {
      url: 'https://example.com/2',
      title: `${companyName} Pricing`,
      snippet: 'Flexible pricing models starting from $10/month...',
    },
    {
      url: 'https://example.com/3',
      title: `${companyName} Competitors`,
      snippet: 'Main competitors include Company A, Company B...',
    },
  ];
}

async function processSearchResults(
  results: SearchResult[],
  data: EnrichmentData,
): Promise<void> {
  for (const result of results) {
    if (!data.companyValueProp && result.snippet.includes('provider')) {
      data.companyValueProp = result.snippet;
    }
    if (!data.pricingModel && result.title.includes('Pricing')) {
      data.pricingModel = result.snippet;
    }
    if (!data.keyCompetitors && result.title.includes('Competitors')) {
      data.keyCompetitors = ['Company A', 'Company B'];
    }
    if (!data.productNames) {
      data.productNames = ['Product A', 'Product B'];
    }
  }
}

const enrichWorker = new Worker(
  'enrich',
  async (job: Job) => {
    console.log(`🔄 Processing job ${job.id}:`, job.data);
    const { personId } = job.data;

    try {
      const person = await Person.findByPk(personId);
      if (!person) {
        throw new Error('Person not found');
      }

      const company = await Company.findByPk(person.companyId);
      if (!company) {
        throw new Error('Company not found');
      }

      const enrichmentData: EnrichmentData = {};
      const maxIterations = 3;
      const requiredFields: EnrichmentField[] = [
        'companyValueProp',
        'productNames',
        'pricingModel',
        'keyCompetitors',
        'companyDomain',
      ];

      for (let i = 0; i < maxIterations; i++) {
        const missingFields = requiredFields.filter(
          (field) => !enrichmentData[field],
        );
        const searchResults = await mockSearch(company.name, missingFields);

        await SearchLog.create({
          query: `Iteration ${i + 1}: ${company.name}`,
          iteration: i + 1,
          topResults: searchResults.slice(0, 3),
        });

        await processSearchResults(searchResults, enrichmentData);
        await job.updateProgress((i + 1) * 33);

        if (requiredFields.every((field) => enrichmentData[field])) {
          break;
        }
      }

      const lastSearchResults = await mockSearch(company.name, []);
      await ContextSnippet.create({
        companyId: company.id,
        personId: person.id,
        companyValueProp: enrichmentData.companyValueProp || '',
        productNames: enrichmentData.productNames || [],
        pricingModel: enrichmentData.pricingModel || '',
        keyCompetitors: enrichmentData.keyCompetitors || [],
        companyDomain: company.domain || '',
        topLinks: lastSearchResults.map((r: SearchResult) => r.url),
      });

      console.log(`✅ Completed job ${job.id}`);
      return { success: true, enrichmentData };
    } catch (error) {
      console.error('❌ Job failed:', error);
      throw error;
    }
  },
  { connection: redisConnection },
);

// Worker event listeners
enrichWorker.on('completed', (job: Job) => {
  console.log(`🎉 Job ${job.id} completed!`);
});

enrichWorker.on('failed', (job: Job | undefined, err: Error) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});

export default enrichWorker;
