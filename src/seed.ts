import sequelize from './config/database';
import { Campaign, Company, Person, ContextSnippet, SearchLog } from './models';

async function seed() {
  try {
    await sequelize.sync({ force: true });

    // Create Campaign
    const campaign = await Campaign.create({
      name: 'Q3 2025 Tech Companies',
    });

    // Create Company
    const company = await Company.create({
      name: 'Stripe',
      campaignId: campaign.id,
    });

    // Create People
    const people = await Person.bulkCreate([
      {
        fullName: 'Patrick Collison',
        email: 'patrick@stripe.com',
        title: 'CEO',
        companyId: company.id,
      },
      {
        fullName: 'John Collison',
        email: 'john@stripe.com',
        title: 'President',
        companyId: company.id,
      },
    ]);

    // Create ContextSnippet for Stripe
    await ContextSnippet.create({
      companyId: company.id,
      personId: people[0].id, // Associating with Patrick Collison
      companyValueProp:
        "Stripe is a technology company that builds economic infrastructure for the internet. Businesses of every size use Stripe's software and APIs to accept payments, send payouts, and manage their businesses online.",
      productNames: [
        'Stripe Payments',
        'Stripe Connect',
        'Stripe Billing',
        'Stripe Terminal',
        'Stripe Atlas',
        'Stripe Radar',
        'Stripe Identity',
      ],
      pricingModel:
        'Transaction-based pricing with 2.9% + $0.30 per successful card charge for basic payments. Enterprise pricing available for high-volume customers.',
      keyCompetitors: [
        'PayPal',
        'Square',
        'Adyen',
        'Braintree',
        'Checkout.com',
      ],
      companyDomain: 'stripe.com',
      topLinks: [
        'https://stripe.com/about',
        'https://stripe.com/docs',
        'https://stripe.com/customers',
        'https://stripe.com/newsroom',
        'https://stripe.com/blog',
      ],
    });

    console.log('Seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
