// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Badge, Button, Card, Grid, Group, Stack, Table, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { formatHumanName } from '@medplum/core';
import type { Encounter, Patient } from '@medplum/fhirtypes';
import { ResourceAvatar, useMedplum } from '@medplum/react';
import { IconBed, IconCheck, IconUserPlus } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { AdmitPatientModal } from '../components/ipd/AdmitPatientModal';
import { DischargePatientModal } from '../components/ipd/DischargePatientModal';
import { TransferBedModal } from '../components/ipd/TransferBedModal';

interface IPDEncounter extends Encounter {
  patientResource?: Patient;
  bedName?: string;
}

export function IPDPage(): JSX.Element {
  const medplum = useMedplum();
  const [admissions, setAdmissions] = useState<IPDEncounter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEncounter, setSelectedEncounter] = useState<IPDEncounter | null>(null);
  const [admitOpened, { open: openAdmit, close: closeAdmit }] = useDisclosure(false);
  const [dischargeOpened, { open: openDischarge, close: closeDischarge }] = useDisclosure(false);
  const [transferOpened, { open: openTransfer, close: closeTransfer }] = useDisclosure(false);

  const loadAdmissions = useCallback(async () => {
    try {
      setLoading(true);
      // Get all active IPD encounters
      const encountersBundle = await medplum.search(
        'Encounter',
        'class=IMP&status:not=finished&_include=Encounter:patient&_include=Encounter:location&_count=100'
      );

      const encountersList: IPDEncounter[] = [];

      if (encountersBundle.entry) {
        const encounters = encountersBundle.entry.filter(
          (e) => e.resource && (e.resource.resourceType as string) === 'Encounter'
        );
        const patients = encountersBundle.entry.filter(
          (e) => e.resource && (e.resource.resourceType as string) === 'Patient'
        );
        const locations = encountersBundle.entry.filter(
          (e) => e.resource && (e.resource.resourceType as string) === 'Location'
        );

        for (const encounterEntry of encounters) {
          const encounter = encounterEntry.resource as Encounter;
          const patientRef = encounter.subject?.reference;
          const patientEntry = patients.find((p) => {
            const resource = p.resource;
            if (!resource) return false;
            const resourceType = resource.resourceType as string;
            const resourceId = resource.id;
            return `${resourceType}/${resourceId}` === patientRef;
          });
          const patient = patientEntry?.resource as unknown as Patient | undefined;

          // Get bed name from location
          const locationRef = encounter.location?.[0]?.location?.reference;
          const locationEntry = locations.find((l) => {
            const resource = l.resource;
            if (!resource) return false;
            const resourceType = resource.resourceType as string;
            const resourceId = resource.id;
            return `${resourceType}/${resourceId}` === locationRef;
          });
          const location = locationEntry?.resource as Location | undefined;
          const bedName =
            location && 'name' in location && typeof location.name === 'string' ? location.name : undefined;

          encountersList.push({
            ...encounter,
            patientResource: patient,
            bedName,
          });
        }
      }

      setAdmissions(encountersList);
    } catch (error) {
      console.error('Error loading admissions:', error);
    } finally {
      setLoading(false);
    }
  }, [medplum]);

  useEffect(() => {
    loadAdmissions();
  }, [loadAdmissions]);

  function handleDischarge(encounter: IPDEncounter): void {
    setSelectedEncounter(encounter);
    openDischarge();
  }

  function handleTransfer(encounter: IPDEncounter): void {
    setSelectedEncounter(encounter);
    openTransfer();
  }

  const totalAdmissions = admissions.length;
  const activeAdmissions = admissions.filter((a) => a.status === 'in-progress').length;

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2}>Inpatient Department (IPD)</Title>
          <Text size="sm" c="dimmed">
            Total Admissions: {totalAdmissions} | Active: {activeAdmissions}
          </Text>
        </div>
        <Button leftSection={<IconUserPlus size={16} />} onClick={openAdmit}>
          Admit Patient
        </Button>
      </Group>

      <Grid>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text size="xl" fw={700}>
                  {activeAdmissions}
                </Text>
                <Text size="sm" c="dimmed">
                  Active Admissions
                </Text>
              </div>
              <IconBed size={32} color="blue" />
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text size="xl" fw={700}>
                  {admissions.filter((a) => a.status === 'arrived').length}
                </Text>
                <Text size="sm" c="dimmed">
                  Pending Admission
                </Text>
              </div>
              <IconUserPlus size={32} color="orange" />
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text size="xl" fw={700}>
                  {admissions.filter((a) => a.status === 'onleave').length}
                </Text>
                <Text size="sm" c="dimmed">
                  On Leave
                </Text>
              </div>
              <IconCheck size={32} color="green" />
            </Group>
          </Card>
        </Grid.Col>
      </Grid>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={4} mb="md">
          Current Admissions
        </Title>
        {loading ? (
          <Text>Loading admissions...</Text>
        ) : admissions.length === 0 ? (
          <Text c="dimmed">No active admissions</Text>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Patient</Table.Th>
                <Table.Th>Bed</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Admitted</Table.Th>
                <Table.Th>Duration</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {admissions.map((admission) => {
                const admittedDate = admission.period?.start ? new Date(admission.period.start) : null;
                const daysAdmitted = admittedDate
                  ? Math.floor((Date.now() - admittedDate.getTime()) / (1000 * 60 * 60 * 24))
                  : 0;

                return (
                  <Table.Tr key={admission.id}>
                    <Table.Td>
                      <Group gap="sm">
                        <ResourceAvatar value={admission.patientResource} />
                        <div>
                          <Text size="sm" fw={500}>
                            {admission.patientResource
                              ? formatHumanName(admission.patientResource.name?.[0])
                              : 'Unknown'}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {admission.patientResource?.id}
                          </Text>
                        </div>
                      </Group>
                    </Table.Td>
                    <Table.Td>{admission.bedName || 'Not assigned'}</Table.Td>
                    <Table.Td>
                      <Badge
                        color={
                          admission.status === 'in-progress'
                            ? 'blue'
                            : admission.status === 'arrived'
                              ? 'orange'
                              : 'gray'
                        }
                      >
                        {admission.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{admittedDate ? admittedDate.toLocaleDateString() : 'Unknown'}</Table.Td>
                    <Table.Td>{daysAdmitted} days</Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Button size="xs" variant="light" onClick={() => handleTransfer(admission)}>
                          Transfer
                        </Button>
                        <Button size="xs" variant="light" color="red" onClick={() => handleDischarge(admission)}>
                          Discharge
                        </Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        )}
      </Card>

      {/* Modals */}
      <AdmitPatientModal opened={admitOpened} onClose={closeAdmit} onSuccess={loadAdmissions} />

      {selectedEncounter && (
        <>
          <DischargePatientModal
            encounter={selectedEncounter}
            opened={dischargeOpened}
            onClose={() => {
              closeDischarge();
              setSelectedEncounter(null);
            }}
            onSuccess={loadAdmissions}
          />
          <TransferBedModal
            encounter={selectedEncounter}
            opened={transferOpened}
            onClose={() => {
              closeTransfer();
              setSelectedEncounter(null);
            }}
            onSuccess={loadAdmissions}
          />
        </>
      )}
    </Stack>
  );
}
