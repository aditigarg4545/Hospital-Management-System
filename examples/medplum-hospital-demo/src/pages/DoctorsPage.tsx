// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Badge, Button, Card, Grid, Group, Stack, Table, Text, TextInput, Title } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { formatHumanName } from '@medplum/core';
import type { Practitioner } from '@medplum/fhirtypes';
import { ResourceAvatar, useMedplum } from '@medplum/react';
import { IconSearch, IconStethoscope, IconUserPlus } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

export function DoctorsPage(): JSX.Element {
  const medplum = useMedplum();
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(searchQuery, 300);

  useEffect(() => {
    loadPractitioners().catch(console.error);
  }, [debouncedQuery]);

  async function loadPractitioners(): Promise<void> {
    try {
      setLoading(true);
      const searchParams = debouncedQuery ? `name:contains=${debouncedQuery}` : '_count=50&_sort=-_lastUpdated';

      const practitionersBundle = await medplum.search('Practitioner', searchParams);
      const practitionersList = (practitionersBundle.entry?.map((e) => e.resource) || []) as Practitioner[];
      setPractitioners(practitionersList);
    } catch (error) {
      console.error('Error loading practitioners:', error);
    } finally {
      setLoading(false);
    }
  }

  // Calculate statistics
  const activeDoctors = practitioners.filter((p) => p.active !== false).length;
  const specialties = new Set(
    practitioners.flatMap((p) => p.qualification?.map((q) => q.code?.coding?.[0]?.display) || [])
  ).size;

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2}>Doctors & Practitioners</Title>
          <Text size="sm" c="dimmed">
            Total: {practitioners.length} | Active: {activeDoctors} | Specialties: {specialties}
          </Text>
        </div>
        <Button leftSection={<IconUserPlus size={16} />}>Add Doctor</Button>
      </Group>

      <Grid>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text size="xl" fw={700}>
                  {practitioners.length}
                </Text>
                <Text size="sm" c="dimmed">
                  Total Doctors
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
                  {activeDoctors}
                </Text>
                <Text size="sm" c="dimmed">
                  Active
                </Text>
              </div>
              <IconStethoscope size={32} color="green" />
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text size="xl" fw={700}>
                  {specialties}
                </Text>
                <Text size="sm" c="dimmed">
                  Specialties
                </Text>
              </div>
              <IconStethoscope size={32} color="orange" />
            </Group>
          </Card>
        </Grid.Col>
      </Grid>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <TextInput
          placeholder="Search doctors by name..."
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          mb="md"
        />

        {loading ? (
          <Text>Loading doctors...</Text>
        ) : practitioners.length === 0 ? (
          <Text c="dimmed">No doctors found</Text>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Doctor</Table.Th>
                <Table.Th>Specialties</Table.Th>
                <Table.Th>Contact</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {practitioners.map((practitioner) => {
                const primaryPhone = practitioner.telecom?.find((t) => t.system === 'phone')?.value;
                const primaryEmail = practitioner.telecom?.find((t) => t.system === 'email')?.value;
                const specialties = practitioner.qualification
                  ?.map((q) => q.code?.coding?.[0]?.display || q.code?.text)
                  .filter(Boolean)
                  .join(', ');

                return (
                  <Table.Tr key={practitioner.id} style={{ cursor: 'pointer' }}>
                    <Table.Td>
                      <Group gap="sm">
                        <ResourceAvatar value={practitioner} />
                        <div>
                          <Text size="sm" fw={500}>
                            {formatHumanName(practitioner.name?.[0])}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {practitioner.id}
                          </Text>
                        </div>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{specialties || 'General Practice'}</Text>
                    </Table.Td>
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
                    <Table.Td>
                      <Badge color={practitioner.active !== false ? 'green' : 'red'} variant="light">
                        {practitioner.active !== false ? 'Active' : 'Inactive'}
                      </Badge>
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
