// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Button, Group, Modal, Stack } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { createReference } from '@medplum/core';
import type { Encounter, Location, Patient } from '@medplum/fhirtypes';
import { ResourceInput, useMedplum } from '@medplum/react';
import { IconCheck, IconX } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useState } from 'react';

interface AssignBedModalProps {
  bed: Location;
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AssignBedModal({ bed, opened, onClose, onSuccess }: AssignBedModalProps): JSX.Element {
  const medplum = useMedplum();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAssign(): Promise<void> {
    if (!selectedPatient) {
      return;
    }

    try {
      setLoading(true);

      // Create IPD encounter with bed assignment
      await medplum.createResource<Encounter>({
        resourceType: 'Encounter',
        status: 'in-progress',
        class: {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
          code: 'IMP',
          display: 'inpatient encounter',
        },
        subject: createReference(selectedPatient),
        location: [
          {
            location: createReference(bed),
            status: 'active',
          },
        ],
        period: {
          start: new Date().toISOString(),
        },
      });

      // Update bed operational status
      await medplum.updateResource<Location>({
        ...bed,
        operationalStatus: {
          system: 'http://terminology.hl7.org/CodeSystem/v2-0116',
          code: 'O',
          display: 'Occupied',
        },
      });

      showNotification({
        title: 'Success',
        message: 'Patient assigned to bed successfully',
        color: 'green',
        icon: <IconCheck />,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error assigning patient:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to assign patient to bed',
        color: 'red',
        icon: <IconX />,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title={`Assign Patient to ${bed.name}`}>
      <Stack gap="md">
        <ResourceInput
          resourceType="Patient"
          name="patient"
          placeholder="Search for patient"
          onChange={(value) => setSelectedPatient(value as Patient)}
        />

        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAssign} loading={loading} disabled={!selectedPatient}>
            Assign to Bed
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
