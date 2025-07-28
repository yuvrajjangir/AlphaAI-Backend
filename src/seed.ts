import sequelize from './config/database';
import { Campaign, Company, Person } from './models';

async function seed() {
  try {
    await sequelize.sync({ force: true });

    const campaign = await Campaign.create({
      name: 'Q3 2025 Tech Companies',
    });

    const companiesData = [
      {
        name: 'Stripe',
        people: [
          {
            fullName: 'Patrick Collison',
            email: 'patrick@stripe.com',
            title: 'CEO',
          },
          {
            fullName: 'John Collison',
            email: 'john@stripe.com',
            title: 'President',
          },
        ],
      },
      {
        name: 'OpenAI',
        people: [
          { fullName: 'Sam Altman', email: 'sam@openai.com', title: 'CEO' },
          { fullName: 'Mira Murati', email: 'mira@openai.com', title: 'CTO' },
        ],
      },
      {
        name: 'Google',
        people: [
          {
            fullName: 'Sundar Pichai',
            email: 'sundar@google.com',
            title: 'CEO',
          },
          {
            fullName: 'Prabhakar Raghavan',
            email: 'prabhakar@google.com',
            title: 'SVP',
          },
        ],
      },
      {
        name: 'Meta',
        people: [
          { fullName: 'Mark Zuckerberg', email: 'mark@meta.com', title: 'CEO' },
          {
            fullName: 'Andrew Bosworth',
            email: 'bosworth@meta.com',
            title: 'CTO',
          },
        ],
      },
      {
        name: 'Amazon',
        people: [
          { fullName: 'Andy Jassy', email: 'andy@amazon.com', title: 'CEO' },
          {
            fullName: 'Adam Selipsky',
            email: 'adam@amazon.com',
            title: 'CEO, AWS',
          },
        ],
      },
      {
        name: 'Netflix',
        people: [
          {
            fullName: 'Ted Sarandos',
            email: 'ted@netflix.com',
            title: 'Co-CEO',
          },
          {
            fullName: 'Greg Peters',
            email: 'greg@netflix.com',
            title: 'Co-CEO',
          },
        ],
      },
      {
        name: 'Microsoft',
        people: [
          {
            fullName: 'Satya Nadella',
            email: 'satya@microsoft.com',
            title: 'CEO',
          },
          {
            fullName: 'Scott Guthrie',
            email: 'scott@microsoft.com',
            title: 'EVP, Cloud',
          },
        ],
      },
      {
        name: 'Apple',
        people: [
          { fullName: 'Tim Cook', email: 'tim@apple.com', title: 'CEO' },
          {
            fullName: 'Craig Federighi',
            email: 'craig@apple.com',
            title: 'SVP, Software',
          },
        ],
      },
      {
        name: 'Adobe',
        people: [
          {
            fullName: 'Shantanu Narayen',
            email: 'shantanu@adobe.com',
            title: 'CEO',
          },
          {
            fullName: 'Anil Chakravarthy',
            email: 'anil@adobe.com',
            title: 'President',
          },
        ],
      },
      {
        name: 'Salesforce',
        people: [
          {
            fullName: 'Marc Benioff',
            email: 'marc@salesforce.com',
            title: 'CEO',
          },
          {
            fullName: 'Parker Harris',
            email: 'parker@salesforce.com',
            title: 'Co-Founder',
          },
        ],
      },
      {
        name: 'Twilio',
        people: [
          { fullName: 'Jeff Lawson', email: 'jeff@twilio.com', title: 'CEO' },
          {
            fullName: 'Khozema Shipchandler',
            email: 'khozema@twilio.com',
            title: 'President',
          },
        ],
      },
      {
        name: 'Shopify',
        people: [
          { fullName: 'Tobi Lütke', email: 'tobi@shopify.com', title: 'CEO' },
          {
            fullName: 'Harley Finkelstein',
            email: 'harley@shopify.com',
            title: 'President',
          },
        ],
      },
    ];

    for (const companyData of companiesData) {
      const company = await Company.create({
        name: companyData.name,
        campaignId: campaign.id,
      });

      const peopleWithCompanyId = companyData.people.map((person) => ({
        ...person,
        companyId: company.id,
      }));

      await Person.bulkCreate(peopleWithCompanyId);
    }

    console.log('Seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
