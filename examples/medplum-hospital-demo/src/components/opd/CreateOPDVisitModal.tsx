// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Button, Group, Modal, Stack, Textarea } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { createReference } from '@medplum/core';
import type { Encounter, Patient, Practitioner } from '@medplum/fhirtypes';
import { ResourceInput, useMedplum } from '@medplum/react';
import { IconCheck, IconX } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useState } from 'react';

interface CreateOPDVisitModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateOPDVisitModal({ opened, onClose, onSuccess }: CreateOPDVisitModalProps): JSX.Element {
  const medplum = useMedplum();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Practitioner | null>(null);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate(): Promise<void> {
    if (!selectedPatient) {
      showNotification({
        title: 'Validation Error',
        message: 'Please select a patient',
        color: 'red',
        icon: <IconX />,
      });
      return;
    }

    try {
      setLoading(true);

      const encounter: Encounter = {
        resourceType: 'Encounter',
        status: 'arrived',
        class: {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
          code: 'AMB',
          display: 'ambulatory',
        },
        subject: createReference(selectedPatient),
        period: {
          start: new Date().toISOString(),
        },
        reasonCode: chiefComplaint
          ? [
              {
                text: chiefComplaint,
              },
            ]
          : undefined,
      };

      if (selectedDoctor) {
        encounter.participant = [
          {
            individual: createReference(selectedDoctor),
            type: [
              {
                coding: [
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                    code: 'ATND',
                    display: 'attender',
                  },
                ],
              },
            ],
          },
        ];
      }

      await medplum.createResource(encounter);

      showNotification({
        title: 'Success',
        message: 'OPD visit created successfully',
        color: 'green',
        icon: <IconCheck />,
      });

      setSelectedPatient(null);
      setSelectedDoctor(null);
      setChiefComplaint('');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating visit:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to create OPD visit',
        color: 'red',
        icon: <IconX />,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title="New OPD Visit" size="md">
      <Stack gap="md">
        <ResourceInput
          resourceType="Patient"
          name="patient"
          placeholder="Select patient"
          onChange={(value) => setSelectedPatient(value as Patient)}
        />

        <ResourceInput
          resourceType="Practitioner"
          name="doctor"
          placeholder="Select doctor (optional)"
          onChange={(value) => setSelectedDoctor(value as Practitioner)}
        />

        <Textarea
          label="Chief Complaint"
          placeholder="Reason for visit..."
          minRows={3}
          value={chiefComplaint}
          onChange={(e) => setChiefComplaint(e.currentTarget.value)}
        />

        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} loading={loading} disabled={!selectedPatient}>
            Create Visit
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
