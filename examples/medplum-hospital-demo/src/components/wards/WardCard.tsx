// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Badge, Button, Card, Group, Progress, Stack, Text } from '@mantine/core';
import type { Location } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react';
import { IconBed, IconDoor } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';

interface WardCardProps {
  ward: Location;
  onRefresh: () => void;
}

interface WardStats {
  totalBeds: number;
  occupiedBeds: number;
}

export function WardCard({ ward }: WardCardProps): JSX.Element {
  const medplum = useMedplum();
  const [stats, setStats] = useState<WardStats>({ totalBeds: 0, occupiedBeds: 0 });

  useEffect(() => {
    async function loadWardStats(): Promise<void> {
      try {
        // Get all beds in this ward
        const bedsBundle = await medplum.search('Location', `type=bd&part-of=${ward.id}&_count=100`);
        const totalBeds = bedsBundle.entry?.length || 0;

        // Count occupied beds
        let occupiedBeds = 0;
        if (bedsBundle.entry) {
          for (const entry of bedsBundle.entry) {
            const bed = entry.resource as Location;
            if (bed.operationalStatus?.code === 'O') {
              occupiedBeds++;
            }
          }
        }

        setStats({ totalBeds, occupiedBeds });
      } catch (error) {
        console.error('Error loading ward stats:', error);
      }
    }

    loadWardStats().catch(console.error);
  }, [medplum, ward.id]);

  const occupancyRate = stats.totalBeds > 0 ? (stats.occupiedBeds / stats.totalBeds) * 100 : 0;

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="xs">
            <IconDoor size={24} />
            <Text fw={600}>{ward.name}</Text>
          </Group>
          <Badge color={ward.status === 'active' ? 'green' : 'red'} variant="light">
            {ward.status}
          </Badge>
        </Group>

        {ward.description && (
          <Text size="sm" c="dimmed">
            {ward.description}
          </Text>
        )}

        <Stack gap="xs">
          <Group justify="space-between">
            <Group gap="xs">
              <IconBed size={16} />
              <Text size="sm">Beds</Text>
            </Group>
            <Text size="sm" fw={500}>
              {stats.occupiedBeds} / {stats.totalBeds}
            </Text>
          </Group>
          <Progress value={occupancyRate} color={occupancyRate > 80 ? 'red' : 'blue'} />
          <Text size="xs" c="dimmed" ta="center">
            {occupancyRate.toFixed(0)}% Occupancy
          </Text>
        </Stack>

        <Button variant="light" fullWidth>
          View Details
        </Button>
      </Stack>
    </Card>
  );
}
