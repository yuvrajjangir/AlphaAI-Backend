import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Company from './Company';

interface PersonAttributes {
  id?: number;
  companyId: number;
  fullName: string;
  email: string;
  title?: string;
  researchStatus?: string;
  createdAt?: Date;
  company?: Company;
}

class Person extends Model<PersonAttributes> implements PersonAttributes {
  public id!: number;
  public companyId!: number;
  public fullName!: string;
  public email!: string;
  public title?: string;
  public readonly createdAt!: Date;
  public readonly company?: Company;
}

Person.init(
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
      onDelete: 'CASCADE',
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'full_name',
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    researchStatus: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'research_status',
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
    modelName: 'Person',
    tableName: 'people',
    timestamps: false,
  },
);

Person.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });
Company.hasMany(Person, { foreignKey: 'companyId', as: 'people' });

export default Person;
