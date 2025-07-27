import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AlphaAI Backend API',
      version: '1.0.0',
      description: 'API documentation for the AlphaAI Backend service',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Person: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            fullName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            title: { type: 'string' },
            companyId: { type: 'integer' },
            researchStatus: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
          required: ['fullName', 'email', 'companyId'],
        },
        Company: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            campaignId: { type: 'integer' },
            domain: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
          required: ['name', 'campaignId'],
        },
        Campaign: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
          required: ['name'],
        },
        ContextSnippet: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            companyId: { type: 'integer' },
            personId: { type: 'integer' },
            companyValueProp: { type: 'string' },
            productNames: { type: 'array', items: { type: 'string' } },
            pricingModel: { type: 'string' },
            keyCompetitors: { type: 'array', items: { type: 'string' } },
            companyDomain: { type: 'string' },
            emailDomain: { type: 'string' },
            topLinks: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['companyId', 'personId', 'companyValueProp', 'productNames', 'pricingModel', 'keyCompetitors', 'companyDomain', 'topLinks'],
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
      responses: {
        NotFound: {
          description: 'The specified resource was not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        InternalError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
