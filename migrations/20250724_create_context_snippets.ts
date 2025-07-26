import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('context_snippets', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'companies',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    person_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'people',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    company_value_prop: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    product_names: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
    pricing_model: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    key_competitors: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
    company_domain: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    top_links: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    }
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('context_snippets');
}
