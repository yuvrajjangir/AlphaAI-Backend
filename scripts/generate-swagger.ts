import fs from 'fs';
import path from 'path';
import { swaggerSpec } from '../src/config/swagger';

const outputPath = path.resolve(__dirname, '../swagger.json');

// Generate swagger.json
fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));
console.log(`✨ Swagger documentation generated at ${outputPath}`);
