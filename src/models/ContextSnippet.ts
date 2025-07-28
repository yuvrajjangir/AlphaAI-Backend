import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Company from './Company';
import Person from './Person';

interface ContextSnippetAttributes {
  id?: number;
  companyId: number;
  personId: number;
  companyValueProp: string;
  productNames: string[];
  pricingModel: string;
  keyCompetitors: string[];
  companyDomain: string;
  topLinks: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

class ContextSnippet
  extends Model<ContextSnippetAttributes>
  implements ContextSnippetAttributes
{
  public id!: number;
  public companyId!: number;
  public personId!: number;
  public companyValueProp!: string;
  public productNames!: string[];
  public pricingModel!: string;
  public keyCompetitors!: string[];
  public companyDomain!: string;
  public topLinks!: string[];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly company?: Company;
  public readonly person?: Person;
}

ContextSnippet.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'company_id',
      references: {
        model: Company,
        key: 'id',
      },
    },
    personId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'person_id',
      references: {
        model: Person,
        key: 'id',
      },
    },
    companyValueProp: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'company_value_prop',
    },
    productNames: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      field: 'product_names',
    },
    pricingModel: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'pricing_model',
    },
    keyCompetitors: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      field: 'key_competitors',
    },
    companyDomain: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'company_domain',
    },
    topLinks: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      field: 'top_links',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    modelName: 'ContextSnippet',
    tableName: 'context_snippets',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);

ContextSnippet.belongsTo(Company, {
  foreignKey: 'companyId',
  as: 'company',
});

ContextSnippet.belongsTo(Person, {
  foreignKey: 'personId',
  as: 'person',
});

export default ContextSnippet;
