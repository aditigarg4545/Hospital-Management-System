// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Button, Card, Grid, Group, Modal, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import type { Encounter, Location, Patient } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react';
import { IconBed, IconCheck, IconX } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { AssignBedModal } from '../components/beds/AssignBedModal';
import { BedCard } from '../components/beds/BedCard';

interface BedWithPatient extends Location {
  currentPatient?: Patient;
  currentEncounter?: Encounter;
}

export function BedManagementPage(): JSX.Element {
  const medplum = useMedplum();
  const [beds, setBeds] = useState<BedWithPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [assignOpened, { open: openAssign, close: closeAssign }] = useDisclosure(false);
  const [selectedBed, setSelectedBed] = useState<Location | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [newBedName, setNewBedName] = useState('');
  const [newBedWard, setNewBedWard] = useState('');

  const loadBeds = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      // Search for all bed locations
      const bedsBundle = await medplum.search('Location', 'type=bd&_count=100');
      const bedsList = (bedsBundle.entry?.map((e) => e.resource) || []) as Location[];

      // For each bed, check if there's a current patient
      const bedsWithPatients = await Promise.all(
        bedsList.map(async (bed) => {
          try {
            // Find active encounter with this bed location
            const encounterBundle = await medplum.search(
              'Encounter',
              `location=${bed.id}&status:not=finished&_count=1&_include=Encounter:patient`
            );

            let encounter: Encounter | undefined;
            let patient: Patient | undefined;

            for (const entry of encounterBundle.entry || []) {
              const resource = entry.resource;
              if (!resource) {
                continue;
              }
              const resourceType = resource.resourceType as string;
              if (resourceType === 'Encounter') {
                encounter = resource as Encounter;
              }
              if (resourceType === 'Patient') {
                patient = resource as unknown as Patient;
              }
            }

            return {
              ...bed,
              currentPatient: patient,
              currentEncounter: encounter,
            } as BedWithPatient;
          } catch (error) {
            console.error(`Error loading patient for bed ${bed.id}:`, error);
            return bed as BedWithPatient;
          }
        })
      );

      setBeds(bedsWithPatients);
    } catch (error) {
      console.error('Error loading beds:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to load bed information',
        color: 'red',
        icon: <IconX />,
      });
    } finally {
      setLoading(false);
    }
  }, [medplum]);

  useEffect(() => {
    loadBeds().catch(console.error);
  }, [loadBeds]);

  async function createBed(): Promise<void> {
    try {
      await medplum.createResource<Location>({
        resourceType: 'Location',
        name: newBedName,
        status: 'active',
        operationalStatus: {
          system: 'http://terminology.hl7.org/CodeSystem/v2-0116',
          code: 'U',
          display: 'Unoccupied',
        },
        type: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v3-RoleCode',
                code: 'bd',
                display: 'Bed',
              },
            ],
          },
        ],
        physicalType: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/location-physical-type',
              code: 'bd',
              display: 'Bed',
            },
          ],
        },
        partOf: newBedWard ? { reference: `Location/${newBedWard}` } : undefined,
      });

      showNotification({
        title: 'Success',
        message: 'Bed created successfully',
        color: 'green',
        icon: <IconCheck />,
      });

      setNewBedName('');
      setNewBedWard('');
      closeCreate();
      await loadBeds();
    } catch (error) {
      console.error('Error creating bed:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to create bed',
        color: 'red',
        icon: <IconX />,
      });
    }
  }

  function handleAssignBed(bed: Location): void {
    setSelectedBed(bed);
    openAssign();
  }

  const filteredBeds = beds.filter((bed) => {
    if (filterStatus === 'all') {
      return true;
    }
    if (filterStatus === 'occupied') {
      return !!bed.currentPatient;
    }
    if (filterStatus === 'available') {
      return !bed.currentPatient;
    }
    return true;
  });

  const occupiedCount = beds.filter((b) => b.currentPatient).length;
  const availableCount = beds.length - occupiedCount;

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2}>Bed Management</Title>
          <Text size="sm" c="dimmed">
            Total: {beds.length} | Occupied: {occupiedCount} | Available: {availableCount}
          </Text>
        </div>
        <Button leftSection={<IconBed size={16} />} onClick={openCreate}>
          Add New Bed
        </Button>
      </Group>

      <Card shadow="sm" padding="md" radius="md" withBorder>
        <Group>
          <Select
            label="Filter by status"
            placeholder="All beds"
            value={filterStatus}
            onChange={(value) => setFilterStatus(value || 'all')}
            data={[
              { value: 'all', label: 'All Beds' },
              { value: 'available', label: 'Available' },
              { value: 'occupied', label: 'Occupied' },
            ]}
            style={{ width: 200 }}
          />
        </Group>
      </Card>

      {loading ? (
        <Text>Loading beds...</Text>
      ) : (
        <Grid>
          {filteredBeds.map((bed) => (
            <Grid.Col key={bed.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
              <BedCard bed={bed} onAssign={handleAssignBed} onRefresh={loadBeds} />
            </Grid.Col>
          ))}
        </Grid>
      )}

      {/* Create Bed Modal */}
      <Modal opened={createOpened} onClose={closeCreate} title="Add New Bed">
        <Stack gap="md">
          <TextInput
            label="Bed Name"
            placeholder="e.g., Bed 101"
            value={newBedName}
            onChange={(e) => setNewBedName(e.currentTarget.value)}
            required
          />
          <TextInput
            label="Ward ID (Optional)"
            placeholder="Ward Location ID"
            value={newBedWard}
            onChange={(e) => setNewBedWard(e.currentTarget.value)}
          />
          <Group justify="flex-end">
            <Button variant="light" onClick={closeCreate}>
              Cancel
            </Button>
            <Button onClick={createBed} disabled={!newBedName}>
              Create Bed
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Assign Bed Modal */}
      {selectedBed && (
        <AssignBedModal
          bed={selectedBed}
          opened={assignOpened}
          onClose={() => {
            closeAssign();
            setSelectedBed(null);
          }}
          onSuccess={loadBeds}
        />
      )}
    </Stack>
  );
}
