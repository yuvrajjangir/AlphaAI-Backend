import { Worker } from 'bullmq';
import { Person, Company, ContextSnippet, SearchLog } from '../models';
import { redisConnection } from '../config/redis';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { JobEvents } from '../services/JobEvents';

interface SearchResult {
  title: string;
  snippet: string;
  url: string;
  confidence: number;
}

interface ResearchJob {
  personId: number;
  companyId: number;
}

const jobEvents = JobEvents.getInstance();

export const researchWorker = new Worker<ResearchJob>(
  'research',
  async (job) => {
    try {
      console.log(`🔍 Starting research for person ${job.data.personId}...`);
      const jobId = String(job.id);

      const person = await Person.findByPk(job.data.personId);
      if (!person) throw new Error(`Person ${job.data.personId} not found`);

      const company = await Company.findByPk(job.data.companyId);
      if (!company) throw new Error(`Company ${job.data.companyId} not found`);

      await job.updateProgress(25);
      jobEvents.emitProgress(jobId, 25);

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_AUTH_API_KEY || '');
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const companyPrompt = `
Research the company "${company.name}" and return a **very concise** summary in this exact flat JSON format:

{
  "companyValueProp": "Max 200 characters",
  "productNames": ["Up to 5 short product names"],
  "pricingModel": "Flat description under 300 characters. Do NOT include JSON or nested objects.",
  "keyCompetitors": ["Up to 5 competitor names"],
  "topLinks": ["Only the official homepage and one other link"]
}
Return only the JSON — no extra text.
`;

      const companyResult = await model.generateContent(companyPrompt);
      const companyText = companyResult.response.text();
      const companyMatch = companyText.match(/\{[\s\S]*\}/);
      if (!companyMatch) throw new Error('Invalid company response');
      const companyResearchData = JSON.parse(companyMatch[0]);

      await job.updateProgress(50);
      jobEvents.emitProgress(jobId, 50);

      const personPrompt = `
        Research "${person.fullName}" who is ${person.title} at ${company.name}. 
        Return 3 findings as JSON array:
        [
          {
            "title": "Role and Background",
            "snippet": "Key information",
            "url": "Source URL",
            "confidence": 0.9
          }
        ]
      `;
      const personResult = await model.generateContent(personPrompt);
      const personText = personResult.response.text();
      const personMatch = personText.match(/\[[\s\S]*\]/);
      if (!personMatch) throw new Error('Invalid person response');
      const searchResults: SearchResult[] = JSON.parse(personMatch[0]);

      await job.updateProgress(75);
      jobEvents.emitProgress(jobId, 75);

      let pricingModelStr = '';
      if (typeof companyResearchData.pricingModel === 'string') {
        pricingModelStr = companyResearchData.pricingModel;
      } else if (Array.isArray(companyResearchData.pricingModel)) {
        pricingModelStr = companyResearchData.pricingModel.join(', ');
      } else if (typeof companyResearchData.pricingModel === 'object') {
        pricingModelStr = JSON.stringify(companyResearchData.pricingModel);
      }

      await ContextSnippet.create({
        companyId: company.id,
        personId: person.id,
        companyValueProp: companyResearchData.companyValueProp || '',
        productNames: Array.isArray(companyResearchData.productNames)
          ? companyResearchData.productNames
          : [],
        pricingModel: pricingModelStr,
        keyCompetitors: Array.isArray(companyResearchData.keyCompetitors)
          ? companyResearchData.keyCompetitors
          : [],
        companyDomain: companyResearchData.topLinks?.[0] || '',
        topLinks: companyResearchData.topLinks || [],
      });

      await SearchLog.create({
        iteration: 1,
        query: 'Gemini Research',
        topResults: {
          results: searchResults.map((r) => r.snippet),
        },
      });

      await job.updateProgress(100);
      jobEvents.emitProgress(jobId, 100, 'completed');

      console.log(`✅ Research completed for person ${job.data.personId}`);

      return {
        success: true,
        results: searchResults,
        snippetsCount: searchResults.length,
      };
    } catch (error) {
      console.error(
        `❌ Research failed for person ${job.data.personId}:`,
        error,
      );
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 1,
    removeOnComplete: {
      age: 24 * 3600,
      count: 100,
    },
    removeOnFail: {
      age: 7 * 24 * 3600,
    },
  },
);

researchWorker.on('completed', (job) => {
  console.log(`🎉 Job ${job.id} completed`);
});

researchWorker.on('failed', (job, error) => {
  console.error(`💥 Job ${job?.id} failed:`, error);
});

researchWorker.on('error', (error) => {
  console.error('❗ Worker error:', error);
});

export default researchWorker;
