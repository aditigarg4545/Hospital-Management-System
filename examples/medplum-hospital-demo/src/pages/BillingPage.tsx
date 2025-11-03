// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Badge, Button, Card, Group, Select, Stack, Table, Text, Title } from '@mantine/core';
import { formatHumanName } from '@medplum/core';
import type { Claim, Patient } from '@medplum/fhirtypes';
import { ResourceAvatar, useMedplum } from '@medplum/react';
import { IconCoin, IconFileInvoice } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

interface ClaimWithPatient extends Claim {
  patientResource?: Patient;
}

export function BillingPage(): JSX.Element {
  const medplum = useMedplum();
  const [claims, setClaims] = useState<ClaimWithPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadClaims().catch(console.error);
  }, []);

  async function loadClaims(): Promise<void> {
    try {
      setLoading(true);
      const claimsBundle = await medplum.search('Claim', '_include=Claim:patient&_count=100&_sort=-_lastUpdated');

      const claimsList: ClaimWithPatient[] = [];

      if (claimsBundle.entry) {
        const claimEntries = claimsBundle.entry.filter((e) => e.resource?.resourceType === 'Claim');
        const patients = claimsBundle.entry.filter((e) => e.resource?.resourceType === 'Patient');

        for (const claimEntry of claimEntries) {
          const claim = claimEntry.resource as Claim;
          const patientRef = claim.patient?.reference;
          const patient = patients.find((p) => `${p.resource?.resourceType}/${p.resource?.id}` === patientRef)
            ?.resource as Patient;

          claimsList.push({
            ...claim,
            patientResource: patient,
          });
        }
      }

      setClaims(claimsList);
    } catch (error) {
      console.error('Error loading claims:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredClaims = claims.filter((claim) => {
    if (filterStatus === 'all') return true;
    return claim.status === filterStatus;
  });

  function getStatusColor(status: string): string {
    switch (status) {
      case 'draft':
        return 'gray';
      case 'active':
        return 'blue';
      case 'cancelled':
        return 'red';
      case 'entered-in-error':
        return 'red';
      default:
        return 'gray';
    }
  }

  const totalClaims = claims.length;
  const draftClaims = claims.filter((c) => c.status === 'draft').length;
  const activeClaims = claims.filter((c) => c.status === 'active').length;
  const totalAmount = claims.reduce((sum, claim) => sum + (claim.total?.value || 0), 0);

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2}>Billing & Claims</Title>
          <Text size="sm" c="dimmed">
            Total Claims: {totalClaims}
          </Text>
        </div>
        <Button leftSection={<IconFileInvoice size={16} />}>Create Claim</Button>
      </Group>

      <Grid>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text size="xl" fw={700}>
                  {draftClaims}
                </Text>
                <Text size="sm" c="dimmed">
                  Draft Claims
                </Text>
              </div>
              <IconFileInvoice size={32} color="gray" />
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text size="xl" fw={700}>
                  {activeClaims}
                </Text>
                <Text size="sm" c="dimmed">
                  Active Claims
                </Text>
              </div>
              <IconFileInvoice size={32} color="blue" />
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text size="xl" fw={700}>
                  ${totalAmount.toLocaleString()}
                </Text>
                <Text size="sm" c="dimmed">
                  Total Amount
                </Text>
              </div>
              <IconCoin size={32} color="green" />
            </Group>
          </Card>
        </Grid.Col>
      </Grid>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={4}>Claims List</Title>
          <Select
            placeholder="Filter by status"
            value={filterStatus}
            onChange={(value) => setFilterStatus(value || 'all')}
            data={[
              { value: 'all', label: 'All' },
              { value: 'draft', label: 'Draft' },
              { value: 'active', label: 'Active' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
            style={{ width: 200 }}
          />
        </Group>

        {loading ? (
          <Text>Loading claims...</Text>
        ) : filteredClaims.length === 0 ? (
          <Text c="dimmed">No claims found</Text>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Claim ID</Table.Th>
                <Table.Th>Patient</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Created</Table.Th>
                <Table.Th>Amount</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredClaims.map((claim) => {
                const createdDate = claim.created ? new Date(claim.created) : null;

                return (
                  <Table.Tr key={claim.id}>
                    <Table.Td>
                      <Text size="sm" fw={500}>
                        {claim.id?.substring(0, 8)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="sm">
                        <ResourceAvatar value={claim.patientResource} />
                        <div>
                          <Text size="sm" fw={500}>
                            {claim.patientResource ? formatHumanName(claim.patientResource.name?.[0]) : 'Unknown'}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {claim.patientResource?.id}
                          </Text>
                        </div>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={getStatusColor(claim.status || 'unknown')}>{claim.status}</Badge>
                    </Table.Td>
                    <Table.Td>{createdDate ? createdDate.toLocaleDateString() : 'N/A'}</Table.Td>
                    <Table.Td>
                      <Text fw={500}>${(claim.total?.value || 0).toFixed(2)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Button size="xs" variant="light">
                        View
                      </Button>
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

// Import Grid that was missing
import { Grid } from '@mantine/core';
