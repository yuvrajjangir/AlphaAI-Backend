module.exports = {
  development: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    protocol: 'postgres',
    logging: true,
    define: {
      timestamps: true,
      underscored: true,
    },
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    },
  },
};
