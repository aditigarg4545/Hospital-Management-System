// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Button, Group, Modal, Select, Stack } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import type { Encounter, Location } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react';
import { IconCheck, IconX } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';

interface TransferBedModalProps {
  encounter: Encounter;
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TransferBedModal({ encounter, opened, onClose, onSuccess }: TransferBedModalProps): JSX.Element {
  const medplum = useMedplum();
  const [selectedBed, setSelectedBed] = useState<string>('');
  const [availableBeds, setAvailableBeds] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (opened) {
      loadAvailableBeds().catch(console.error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  async function loadAvailableBeds(): Promise<void> {
    try {
      const bedsBundle = await medplum.search('Location', 'type=bd&status=active&_count=100');
      const beds = (bedsBundle.entry?.map((e) => e.resource) || []) as Location[];
      // Filter for available beds (not current bed)
      const currentBedId = encounter.location?.[0]?.location?.reference?.split('/')[1];
      const availableList = beds.filter((bed) => bed.operationalStatus?.code !== 'O' && bed.id !== currentBedId);
      setAvailableBeds(availableList);
    } catch (error) {
      console.error('Error loading beds:', error);
    }
  }

  async function handleTransfer(): Promise<void> {
    if (!selectedBed) {
      showNotification({
        title: 'Validation Error',
        message: 'Please select a bed',
        color: 'red',
        icon: <IconX />,
      });
      return;
    }

    try {
      setLoading(true);

      // Get current and new bed
      const currentBedRef = encounter.location?.[0]?.location?.reference;
      const currentBedId = currentBedRef?.split('/')[1];

      // Update encounter with new bed
      const updatedLocations = [
        ...(encounter.location || []),
        {
          location: { reference: `Location/${selectedBed}` },
          status: 'active' as const,
          period: {
            start: new Date().toISOString(),
          },
        },
      ];

      // Mark previous location as completed
      if (encounter.location?.[0]) {
        updatedLocations[0] = {
          ...encounter.location[0],
          status: 'completed',
          period: {
            ...encounter.location[0].period,
            end: new Date().toISOString(),
          },
        };
      }

      await medplum.updateResource<Encounter>({
        ...encounter,
        location: updatedLocations,
      });

      // Release old bed
      if (currentBedId) {
        const oldBed = await medplum.readResource('Location', currentBedId);
        await medplum.updateResource({
          ...oldBed,
          operationalStatus: {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0116',
            code: 'C',
            display: 'Cleaning',
          },
        });
      }

      // Occupy new bed
      const newBed = availableBeds.find((b) => b.id === selectedBed);
      if (newBed) {
        await medplum.updateResource({
          ...newBed,
          operationalStatus: {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0116',
            code: 'O',
            display: 'Occupied',
          },
        });
      }

      showNotification({
        title: 'Success',
        message: 'Patient transferred successfully',
        color: 'green',
        icon: <IconCheck />,
      });

      setSelectedBed('');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error transferring patient:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to transfer patient',
        color: 'red',
        icon: <IconX />,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Transfer Patient to Another Bed" size="md">
      <Stack gap="md">
        <Select
          label="Select New Bed"
          placeholder="Choose an available bed"
          data={availableBeds.map((bed) => ({
            value: bed.id || '',
            label: bed.name || 'Unnamed bed',
          }))}
          value={selectedBed}
          onChange={(value) => setSelectedBed(value || '')}
          searchable
        />

        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleTransfer} loading={loading} disabled={!selectedBed}>
            Transfer Patient
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
