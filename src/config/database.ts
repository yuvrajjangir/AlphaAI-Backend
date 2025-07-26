import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL!, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: true, // Enable logging to see what's happening
  define: {
    timestamps: true,
    underscored: true,
  },
});

export default sequelize;
