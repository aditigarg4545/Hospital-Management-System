// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
/**
 * Standalone script to seed mock data into the database.
 * Run with: npm run seed:mock-data
 */
import dotenv from 'dotenv';
import { initAppServices } from './app';
import { loadConfig } from './config/loader';
import { getSystemRepo } from './fhir/repo';
import { seedMockData } from './seeds/mock-data';

dotenv.config();

async function main(): Promise<void> {
  try {
    // Default to file-based config, or use env: for environment variables
    // Can also specify: file:medplum.config.json, env:, aws:path, etc.
    const configName = process.argv[2] || 'file:medplum.config.json';
    const config = await loadConfig(configName);

    await initAppServices(config);

    const systemRepo = getSystemRepo();
    await seedMockData(systemRepo);

    console.log('Mock data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding mock data:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
