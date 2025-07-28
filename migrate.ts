import sequelize from './src/config/database';
import { DataTypes, QueryInterface } from 'sequelize';
import * as fs from 'fs';
import * as path from 'path';

async function migrate() {
  const queryInterface: QueryInterface = sequelize.getQueryInterface();
  const migrationsDir = path.join(__dirname, '/src', 'migrations');
  
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

    // Drop and create campaigns table
    try {
      await sequelize.query('DROP TABLE IF EXISTS campaigns CASCADE;');
      console.log('Dropped existing campaigns table');
    } catch (error) {
      console.log('Error dropping campaigns table:', error);
    }
    await queryInterface.createTable('campaigns', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    // Drop and create companies table
    try {
      await sequelize.query('DROP TABLE IF EXISTS companies CASCADE;');
      console.log('Dropped existing companies table');
    } catch (error) {
      console.log('Error dropping companies table:', error);
    }
    await queryInterface.createTable('companies', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      campaign_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'campaigns',
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
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    // Drop and create people table
    try {
      await sequelize.query('DROP TABLE IF EXISTS people CASCADE;');
      console.log('Dropped existing people table');
    } catch (error) {
      console.log('Error dropping people table:', error);
    }
    await queryInterface.createTable('people', {
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
      full_name: {
        type: DataTypes.STRING,
        allowNull: false,
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
      research_status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    // Drop and create search_logs table
    try {
      await sequelize.query('DROP TABLE IF EXISTS search_logs CASCADE;');
      console.log('Dropped existing search_logs table');
    } catch (error) {
      console.log('Error dropping search_logs table:', error);
    }
    await queryInterface.createTable('search_logs', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      context_snippet_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'context_snippets',
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
      top_results: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    // Drop and create context_snippets table (existing code)
    try {
      await sequelize.query('DROP TABLE IF EXISTS context_snippets CASCADE;');
      console.log('Dropped existing context_snippets table');
    } catch (error) {
      console.log('Error dropping context_snippets table:', error);
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
        type: DataTypes.TEXT,
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
