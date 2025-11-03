// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Button, Group, Modal, Stack, Textarea } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import type { Encounter } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useState } from 'react';

interface DischargePatientModalProps {
  encounter: Encounter;
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DischargePatientModal({
  encounter,
  opened,
  onClose,
  onSuccess,
}: DischargePatientModalProps): JSX.Element {
  const medplum = useMedplum();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleDischarge(): Promise<void> {
    try {
      setLoading(true);

      // Update encounter status to finished
      await medplum.updateResource<Encounter>({
        ...encounter,
        status: 'finished',
        period: {
          ...encounter.period,
          end: new Date().toISOString(),
        },
        hospitalization: {
          ...encounter.hospitalization,
          dischargeDisposition: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/discharge-disposition',
                code: 'home',
                display: 'Home',
              },
            ],
            text: notes || undefined,
          },
        },
      });

      // Release the bed
      if (encounter.location?.[0]?.location?.reference) {
        const bedId = encounter.location[0].location.reference.split('/')[1];
        const bed = await medplum.readResource('Location', bedId);

        await medplum.updateResource({
          ...bed,
          operationalStatus: {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0116',
            code: 'C',
            display: 'Cleaning',
          },
        });
      }

      showNotification({
        title: 'Success',
        message: 'Patient discharged successfully',
        color: 'green',
        icon: <IconCheck />,
      });

      setNotes('');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error discharging patient:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to discharge patient',
        color: 'red',
        icon: <IconX />,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Discharge Patient" size="md">
      <Stack gap="md">
        <Textarea
          label="Discharge Notes"
          placeholder="Enter discharge instructions and notes..."
          minRows={4}
          value={notes}
          onChange={(e) => setNotes(e.currentTarget.value)}
        />

        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleDischarge} loading={loading} color="red">
            Discharge Patient
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
