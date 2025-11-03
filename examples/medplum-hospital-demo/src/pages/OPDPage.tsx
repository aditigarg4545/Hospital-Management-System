// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Badge, Button, Card, Grid, Group, Select, Stack, Table, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { formatHumanName } from '@medplum/core';
import type { Encounter, Patient } from '@medplum/fhirtypes';
import { ResourceAvatar, useMedplum } from '@medplum/react';
import { IconClock, IconStethoscope, IconUserPlus } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { CreateOPDVisitModal } from '../components/opd/CreateOPDVisitModal';

interface OPDEncounter extends Encounter {
  patientResource?: Patient;
}

export function OPDPage(): JSX.Element {
  const medplum = useMedplum();
  const [visits, setVisits] = useState<OPDEncounter[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);

  useEffect(() => {
    loadVisits().catch(console.error);
  }, []);

  async function loadVisits(): Promise<void> {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      // Get today's OPD encounters
      const encountersBundle = await medplum.search(
        'Encounter',
        `class=AMB&date=ge${today}&_include=Encounter:patient&_count=100&_sort=-_lastUpdated`
      );

      const visitsList: OPDEncounter[] = [];

      if (encountersBundle.entry) {
        const encounters = encountersBundle.entry.filter((e) => e.resource?.resourceType === 'Encounter');
        const patients = encountersBundle.entry.filter((e) => e.resource?.resourceType === 'Patient');

        for (const encounterEntry of encounters) {
          const encounter = encounterEntry.resource as Encounter;
          const patientRef = encounter.subject?.reference;
          const patient = patients.find((p) => `${p.resource?.resourceType}/${p.resource?.id}` === patientRef)
            ?.resource as Patient;

          visitsList.push({
            ...encounter,
            patientResource: patient,
          });
        }
      }

      setVisits(visitsList);
    } catch (error) {
      console.error('Error loading visits:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredVisits = visits.filter((visit) => {
    if (filterStatus === 'all') return true;
    return visit.status === filterStatus;
  });

  const waitingCount = visits.filter((v) => v.status === 'arrived').length;
  const inProgressCount = visits.filter((v) => v.status === 'in-progress').length;
  const completedCount = visits.filter((v) => v.status === 'finished').length;

  function getStatusColor(status: string): string {
    switch (status) {
      case 'arrived':
        return 'orange';
      case 'in-progress':
        return 'blue';
      case 'finished':
        return 'green';
      default:
        return 'gray';
    }
  }

  async function handleUpdateStatus(encounter: OPDEncounter, newStatus: Encounter['status']): Promise<void> {
    try {
      await medplum.updateResource<Encounter>({
        ...encounter,
        status: newStatus,
      });
      await loadVisits();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2}>Outpatient Department (OPD)</Title>
          <Text size="sm" c="dimmed">
            Today's Visits: {visits.length}
          </Text>
        </div>
        <Button leftSection={<IconUserPlus size={16} />} onClick={openCreate}>
          New OPD Visit
        </Button>
      </Group>

      <Grid>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text size="xl" fw={700}>
                  {waitingCount}
                </Text>
                <Text size="sm" c="dimmed">
                  Waiting
                </Text>
              </div>
              <IconClock size={32} color="orange" />
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text size="xl" fw={700}>
                  {inProgressCount}
                </Text>
                <Text size="sm" c="dimmed">
                  In Consultation
                </Text>
              </div>
              <IconStethoscope size={32} color="blue" />
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text size="xl" fw={700}>
                  {completedCount}
                </Text>
                <Text size="sm" c="dimmed">
                  Completed
                </Text>
              </div>
              <IconStethoscope size={32} color="green" />
            </Group>
          </Card>
        </Grid.Col>
      </Grid>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={4}>Visit Queue</Title>
          <Select
            placeholder="Filter by status"
            value={filterStatus}
            onChange={(value) => setFilterStatus(value || 'all')}
            data={[
              { value: 'all', label: 'All' },
              { value: 'arrived', label: 'Waiting' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'finished', label: 'Completed' },
            ]}
            style={{ width: 200 }}
          />
        </Group>

        {loading ? (
          <Text>Loading visits...</Text>
        ) : filteredVisits.length === 0 ? (
          <Text c="dimmed">No visits found</Text>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Queue #</Table.Th>
                <Table.Th>Patient</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Check-in Time</Table.Th>
                <Table.Th>Wait Time</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredVisits.map((visit, index) => {
                const checkInTime = visit.period?.start ? new Date(visit.period.start) : null;
                const waitMinutes = checkInTime ? Math.floor((Date.now() - checkInTime.getTime()) / (1000 * 60)) : 0;

                return (
                  <Table.Tr key={visit.id}>
                    <Table.Td>
                      <Badge size="lg" variant="filled">
                        {index + 1}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="sm">
                        <ResourceAvatar value={visit.patientResource} />
                        <div>
                          <Text size="sm" fw={500}>
                            {visit.patientResource ? formatHumanName(visit.patientResource.name?.[0]) : 'Unknown'}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {visit.patientResource?.id}
                          </Text>
                        </div>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={getStatusColor(visit.status || 'unknown')}>
                        {visit.status === 'arrived'
                          ? 'Waiting'
                          : visit.status === 'in-progress'
                            ? 'In Progress'
                            : visit.status === 'finished'
                              ? 'Completed'
                              : visit.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{checkInTime ? checkInTime.toLocaleTimeString() : 'N/A'}</Table.Td>
                    <Table.Td>
                      <Text c={waitMinutes > 30 ? 'red' : 'dimmed'}>{waitMinutes} min</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        {visit.status === 'arrived' && (
                          <Button size="xs" variant="light" onClick={() => handleUpdateStatus(visit, 'in-progress')}>
                            Start
                          </Button>
                        )}
                        {visit.status === 'in-progress' && (
                          <Button
                            size="xs"
                            variant="light"
                            color="green"
                            onClick={() => handleUpdateStatus(visit, 'finished')}
                          >
                            Complete
                          </Button>
                        )}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        )}
      </Card>

      <CreateOPDVisitModal opened={createOpened} onClose={closeCreate} onSuccess={loadVisits} />
    </Stack>
  );
}
