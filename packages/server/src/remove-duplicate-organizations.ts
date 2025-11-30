// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
/**
 * Removes duplicate organizations from the database.
 * Keeps the first occurrence of each organization name and deletes the rest.
 */
import type { Organization } from '@medplum/fhirtypes';
import dotenv from 'dotenv';
import { initAppServices } from './app';
import { loadConfig } from './config/loader';
import { getSystemRepo } from './fhir/repo';
import { globalLogger } from './logger';

dotenv.config();

async function main(): Promise<void> {
  try {
    const configName = process.argv[2] || 'file:medplum.config.json';
    const config = await loadConfig(configName);

    await initAppServices(config);

    const systemRepo = getSystemRepo();
    globalLogger.info('Searching for all organizations...');

    const bundle = await systemRepo.search<Organization>({
      resourceType: 'Organization',
      count: 1000,
    });

    const organizations = (bundle.entry || [])
      .map((entry) => entry.resource)
      .filter((org): org is Organization & { id: string } => !!org && !!org.id);

    globalLogger.info(`Found ${organizations.length} organizations`);

    const organizationsByName = new Map<string, (Organization & { id: string })[]>();
    for (const org of organizations) {
      const name = org.name;
      if (name) {
        if (!organizationsByName.has(name)) {
          organizationsByName.set(name, []);
        }
        organizationsByName.get(name)?.push(org);
      }
    }

    const duplicatesToDelete: string[] = [];
    for (const [name, orgs] of organizationsByName.entries()) {
      if (orgs.length > 1) {
        globalLogger.info(`Found ${orgs.length} organizations with name "${name}"`);
        // Keep the first one (oldest by ID or creation), delete the rest
        const sorted = orgs.sort((a, b) => (a.id || '').localeCompare(b.id || ''));
        const toKeep = sorted[0];
        globalLogger.info(`Keeping: Organization/${toKeep.id} (${toKeep.name})`);
        for (let i = 1; i < sorted.length; i++) {
          const toDelete = sorted[i];
          globalLogger.info(`Marking for deletion: Organization/${toDelete.id} (${toDelete.name})`);
          duplicatesToDelete.push(toDelete.id);
        }
      }
    }

    if (duplicatesToDelete.length > 0) {
      globalLogger.info(`Found ${duplicatesToDelete.length} duplicate organizations to delete.`);
      let deletedCount = 0;
      let errorCount = 0;
      for (const id of duplicatesToDelete) {
        try {
          await systemRepo.deleteResource('Organization', id);
          deletedCount++;
        } catch (error) {
          globalLogger.error(`Error deleting Organization/${id}: ${(error as Error).message}`);
          errorCount++;
        }
      }
      globalLogger.info(`Completed: Deleted ${deletedCount} duplicate organizations, ${errorCount} errors.`);
    } else {
      globalLogger.info('No duplicate organizations found.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error removing duplicate organizations:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
