// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
/**
 * Standalone script to initialize the database (run migrations and seed).
 * Run with: npm run init:db or ts-node --transpileOnly src/init-db.ts
 */
import dotenv from 'dotenv';
import { initAppServices } from './app';
import { loadConfig } from './config/loader';

dotenv.config();

async function main(): Promise<void> {
  try {
    // Default to file-based config, or use env: for environment variables
    // Can also specify: file:medplum.config.json, env:, aws:path, etc.
    const configName = process.argv[2] || 'file:medplum.config.json';
    const config = await loadConfig(configName);

    await initAppServices(config);

    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
