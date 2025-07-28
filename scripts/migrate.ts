import sequelize from '../src/config/database';
import { DataTypes, QueryInterface } from 'sequelize';
import * as fs from 'fs';
import * as path from 'path';

async function migrate() {
  const queryInterface: QueryInterface = sequelize.getQueryInterface();
  const migrationsDir = path.join(__dirname, 'src', 'migrations');
  
  try {
    await queryInterface.createTable('migrations', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      executed_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      }
    }).catch(err => {
      if (err.message.includes('already exists')) {
        return;
      }
      throw err;
    });

    const executedMigrations = await sequelize.query(
      'SELECT name FROM migrations',
      { type: 'SELECT' }
    );
    const executedNames = new Set(executedMigrations.map((m: any) => m.name));

    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.ts'))
      .sort();

    for (const file of files) {
      if (!executedNames.has(file)) {
        const migration = require(path.join(migrationsDir, file));
        console.log(`Running migration: ${file}`);
        await migration.up(queryInterface);
        await sequelize.query(
          'INSERT INTO migrations (name, executed_at) VALUES (?, CURRENT_TIMESTAMP)',
          {
            replacements: [file],
            type: 'INSERT'
          }
        );
        console.log(`Completed migration: ${file}`);
      }
    }

    try {
      await sequelize.query('DROP TABLE IF EXISTS context_snippets CASCADE;');
      console.log('Dropped existing context_snippets table');
    } catch (error) {
      console.log('Error dropping table:', error);
    }
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
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      }
    });
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
