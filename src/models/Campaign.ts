import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

interface CampaignAttributes {
  id?: number;
  name: string;
  createdAt?: Date;
}

class Campaign extends Model<CampaignAttributes> implements CampaignAttributes {
  public id!: number;
  public name!: string;
  public readonly createdAt!: Date;
}

Campaign.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
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
    modelName: 'Campaign',
    tableName: 'campaigns',
    timestamps: false,
  },
);

export default Campaign;
