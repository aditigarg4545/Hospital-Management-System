// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Badge, Button, Card, Group, Menu, Stack, Text } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { formatHumanName } from '@medplum/core';
import type { Encounter, Location, Patient } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react';
import { IconBed, IconCheck, IconDots, IconUser, IconX } from '@tabler/icons-react';
import type { JSX } from 'react';

interface BedCardProps {
  bed: Location & { currentPatient?: Patient; currentEncounter?: Encounter };
  onAssign: (bed: Location) => void;
  onRefresh: () => void;
}

export function BedCard({ bed, onAssign, onRefresh }: BedCardProps): JSX.Element {
  const medplum = useMedplum();
  const isOccupied = !!bed.currentPatient;

  async function handleReleaseBed(): Promise<void> {
    if (!bed.currentEncounter) return;

    try {
      // Update encounter status to finished
      await medplum.updateResource({
        ...bed.currentEncounter,
        status: 'finished',
      });

      showNotification({
        title: 'Success',
        message: 'Bed released successfully',
        color: 'green',
        icon: <IconCheck />,
      });

      onRefresh();
    } catch (error) {
      console.error('Error releasing bed:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to release bed',
        color: 'red',
        icon: <IconX />,
      });
    }
  }

  async function handleMarkForCleaning(): Promise<void> {
    try {
      await medplum.updateResource<Location>({
        ...bed,
        operationalStatus: {
          system: 'http://terminology.hl7.org/CodeSystem/v2-0116',
          code: 'C',
          display: 'Cleaning',
        },
      });

      showNotification({
        title: 'Success',
        message: 'Bed marked for cleaning',
        color: 'blue',
        icon: <IconCheck />,
      });

      onRefresh();
    } catch (error) {
      console.error('Error updating bed status:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to update bed status',
        color: 'red',
        icon: <IconX />,
      });
    }
  }

  const bedStatusCode = bed.operationalStatus?.code;
  const bedStatusColor =
    bedStatusCode === 'O' ? 'red' : bedStatusCode === 'C' ? 'yellow' : bedStatusCode === 'U' ? 'green' : 'gray';

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="xs">
            <IconBed size={24} />
            <Text fw={600}>{bed.name}</Text>
          </Group>
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Button variant="subtle" size="xs">
                <IconDots size={16} />
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              {isOccupied && (
                <>
                  <Menu.Item onClick={handleReleaseBed}>Release Bed</Menu.Item>
                  <Menu.Item onClick={handleMarkForCleaning}>Mark for Cleaning</Menu.Item>
                </>
              )}
              {!isOccupied && <Menu.Item onClick={() => onAssign(bed)}>Assign Patient</Menu.Item>}
            </Menu.Dropdown>
          </Menu>
        </Group>

        <Badge color={bedStatusColor} variant="light">
          {bed.operationalStatus?.display || 'Available'}
        </Badge>

        {isOccupied && bed.currentPatient ? (
          <Card withBorder p="sm" bg="gray.0">
            <Group gap="xs">
              <IconUser size={16} />
              <div>
                <Text size="sm" fw={500}>
                  {formatHumanName(bed.currentPatient.name?.[0])}
                </Text>
                <Text size="xs" c="dimmed">
                  {bed.currentPatient.id}
                </Text>
              </div>
            </Group>
          </Card>
        ) : (
          <Button variant="light" fullWidth onClick={() => onAssign(bed)} disabled={bedStatusCode === 'C'}>
            Assign Patient
          </Button>
        )}
      </Stack>
    </Card>
  );
}
