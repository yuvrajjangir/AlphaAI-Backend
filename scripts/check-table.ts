import sequelize from '../src/config/database';

async function checkTable() {
  try {
    const [tables] = await sequelize.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public';
    `);
    console.log('Tables:', tables);

    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'context_snippets'
      ORDER BY ordinal_position;
    `);
    console.log('Context Snippets columns:', columns);
  } catch (error) {
    console.error('Error checking table:', error);
  } finally {
    await sequelize.close();
  }
}

checkTable();
