// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Button, Grid, Group, Modal, Stack, Text, TextInput, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import type { Location } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react';
import { IconCheck, IconDoor, IconX } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { WardCard } from '../components/wards/WardCard';

export function WardManagementPage(): JSX.Element {
  const medplum = useMedplum();
  const [wards, setWards] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [newWardName, setNewWardName] = useState('');
  const [newWardDescription, setNewWardDescription] = useState('');

  const loadWards = useCallback(async () => {
    try {
      setLoading(true);
      // Search for ward locations
      const wardsBundle = await medplum.search('Location', 'type=wa&_count=100');
      const wardsList = (wardsBundle.entry?.map((e) => e.resource) || []) as Location[];
      setWards(wardsList);
    } catch (error) {
      console.error('Error loading wards:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to load wards',
        color: 'red',
        icon: <IconX />,
      });
    } finally {
      setLoading(false);
    }
  }, [medplum]);

  useEffect(() => {
    loadWards();
  }, [loadWards]);

  async function createWard(): Promise<void> {
    try {
      await medplum.createResource<Location>({
        resourceType: 'Location',
        name: newWardName,
        description: newWardDescription,
        status: 'active',
        mode: 'instance',
        type: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v3-RoleCode',
                code: 'wa',
                display: 'Ward',
              },
            ],
          },
        ],
        physicalType: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/location-physical-type',
              code: 'wa',
              display: 'Ward',
            },
          ],
        },
      });

      showNotification({
        title: 'Success',
        message: 'Ward created successfully',
        color: 'green',
        icon: <IconCheck />,
      });

      setNewWardName('');
      setNewWardDescription('');
      closeCreate();
      await loadWards();
    } catch (error) {
      console.error('Error creating ward:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to create ward',
        color: 'red',
        icon: <IconX />,
      });
    }
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2}>Ward Management</Title>
          <Text size="sm" c="dimmed">
            Total Wards: {wards.length}
          </Text>
        </div>
        <Button leftSection={<IconDoor size={16} />} onClick={openCreate}>
          Add New Ward
        </Button>
      </Group>

      {loading ? (
        <Text>Loading wards...</Text>
      ) : (
        <Grid>
          {wards.map((ward) => (
            <Grid.Col key={ward.id} span={{ base: 12, sm: 6, md: 4 }}>
              <WardCard ward={ward} onRefresh={loadWards} />
            </Grid.Col>
          ))}
        </Grid>
      )}

      {/* Create Ward Modal */}
      <Modal opened={createOpened} onClose={closeCreate} title="Add New Ward">
        <Stack gap="md">
          <TextInput
            label="Ward Name"
            placeholder="e.g., ICU, General Ward 1"
            value={newWardName}
            onChange={(e) => setNewWardName(e.currentTarget.value)}
            required
          />
          <TextInput
            label="Description"
            placeholder="Ward description"
            value={newWardDescription}
            onChange={(e) => setNewWardDescription(e.currentTarget.value)}
          />
          <Group justify="flex-end">
            <Button variant="light" onClick={closeCreate}>
              Cancel
            </Button>
            <Button onClick={createWard} disabled={!newWardName}>
              Create Ward
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
