// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Button, Card, Group, Stack, Table, Text, TextInput, Title } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { formatHumanName } from '@medplum/core';
import type { Patient } from '@medplum/fhirtypes';
import { ResourceAvatar, useMedplum } from '@medplum/react';
import { IconSearch, IconUserPlus } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

export function PatientsPage(): JSX.Element {
  const medplum = useMedplum();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(searchQuery, 300);

  useEffect(() => {
    loadPatients().catch(console.error);
  }, [debouncedQuery]);

  async function loadPatients(): Promise<void> {
    try {
      setLoading(true);
      const searchParams = debouncedQuery ? `name:contains=${debouncedQuery}` : '_count=50&_sort=-_lastUpdated';

      const patientsBundle = await medplum.search('Patient', searchParams);
      const patientsList = (patientsBundle.entry?.map((e) => e.resource) || []) as Patient[];
      setPatients(patientsList);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  }

  function handlePatientClick(patient: Patient): void {
    navigate(`/patients/${patient.id}`);
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>Patients</Title>
        <Button leftSection={<IconUserPlus size={16} />}>Register Patient</Button>
      </Group>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <TextInput
          placeholder="Search patients by name..."
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          mb="md"
        />

        {loading ? (
          <Text>Loading patients...</Text>
        ) : patients.length === 0 ? (
          <Text c="dimmed">No patients found</Text>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Patient</Table.Th>
                <Table.Th>MRN</Table.Th>
                <Table.Th>Date of Birth</Table.Th>
                <Table.Th>Gender</Table.Th>
                <Table.Th>Contact</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {patients.map((patient) => {
                const primaryPhone = patient.telecom?.find((t) => t.system === 'phone')?.value;
                const primaryEmail = patient.telecom?.find((t) => t.system === 'email')?.value;

                return (
                  <Table.Tr key={patient.id} style={{ cursor: 'pointer' }} onClick={() => handlePatientClick(patient)}>
                    <Table.Td>
                      <Group gap="sm">
                        <ResourceAvatar value={patient} />
                        <div>
                          <Text size="sm" fw={500}>
                            {formatHumanName(patient.name?.[0])}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {patient.id}
                          </Text>
                        </div>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      {patient.identifier?.find((i) => i.type?.coding?.[0]?.code === 'MR')?.value || 'N/A'}
                    </Table.Td>
                    <Table.Td>{patient.birthDate || 'N/A'}</Table.Td>
                    <Table.Td>{patient.gender || 'N/A'}</Table.Td>
                    <Table.Td>
                      <div>
                        {primaryPhone && <Text size="sm">{primaryPhone}</Text>}
                        {primaryEmail && (
                          <Text size="xs" c="dimmed">
                            {primaryEmail}
                          </Text>
                        )}
                      </div>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        )}
      </Card>
    </Stack>
  );
}
