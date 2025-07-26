import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Campaign from './Campaign';

interface CompanyAttributes {
  id?: number;
  campaignId: number;
  name: string;
  domain?: string;
  createdAt?: Date;
}

class Company extends Model<CompanyAttributes> implements CompanyAttributes {
  public id!: number;
  public campaignId!: number;
  public name!: string;
  public domain?: string;
  public readonly createdAt!: Date;
}

Company.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    campaignId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'campaign_id',
      references: {
        model: Campaign,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    domain: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  },
  {
    sequelize,
    modelName: 'Company',
    tableName: 'companies',
    timestamps: false,
  },
);

Company.belongsTo(Campaign, { foreignKey: 'campaignId', as: 'campaign' });
Campaign.hasMany(Company, { foreignKey: 'campaignId', as: 'companies' });

export default Company;
