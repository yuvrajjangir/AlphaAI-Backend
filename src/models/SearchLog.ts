import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import ContextSnippet from './ContextSnippet';

interface SearchLogAttributes {
  id?: number;
  contextSnippetId?: number;
  iteration?: number;
  query?: string;
  topResults?: object;
  createdAt?: Date;
}

class SearchLog
  extends Model<SearchLogAttributes>
  implements SearchLogAttributes
{
  public id!: number;
  public contextSnippetId?: number;
  public iteration?: number;
  public query?: string;
  public topResults?: object;
  public readonly createdAt!: Date;
}

SearchLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    contextSnippetId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'context_snippet_id',
      references: {
        model: ContextSnippet,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    iteration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    query: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    topResults: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'top_results',
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
    modelName: 'SearchLog',
    tableName: 'search_logs',
    underscored: true,
    timestamps: false,
  },
);

SearchLog.belongsTo(ContextSnippet, {
  foreignKey: 'contextSnippetId',
  as: 'contextSnippet',
});
ContextSnippet.hasMany(SearchLog, {
  foreignKey: 'contextSnippetId',
  as: 'searchLogs',
});

export default SearchLog;
