// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Button, Group, Modal, Select, Stack } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { createReference } from '@medplum/core';
import type { Encounter, Location, Patient, Practitioner } from '@medplum/fhirtypes';
import { ResourceInput, useMedplum } from '@medplum/react';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

interface AdmitPatientModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdmitPatientModal({ opened, onClose, onSuccess }: AdmitPatientModalProps): JSX.Element {
  const medplum = useMedplum();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedBed, setSelectedBed] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<Practitioner | null>(null);
  const [availableBeds, setAvailableBeds] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (opened) {
      loadAvailableBeds().catch(console.error);
    }
  }, [opened]);

  async function loadAvailableBeds(): Promise<void> {
    try {
      const bedsBundle = await medplum.search('Location', 'type=bd&status=active&_count=100');
      const beds = (bedsBundle.entry?.map((e) => e.resource) || []) as Location[];
      // Filter for available beds
      const availableList = beds.filter((bed) => bed.operationalStatus?.code !== 'O');
      setAvailableBeds(availableList);
    } catch (error) {
      console.error('Error loading beds:', error);
    }
  }

  async function handleAdmit(): Promise<void> {
    if (!selectedPatient || !selectedBed) {
      showNotification({
        title: 'Validation Error',
        message: 'Please select a patient and bed',
        color: 'red',
        icon: <IconX />,
      });
      return;
    }

    try {
      setLoading(true);

      // Create IPD encounter
      const encounter: Encounter = {
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
            location: { reference: `Location/${selectedBed}` },
            status: 'active',
          },
        ],
        period: {
          start: new Date().toISOString(),
        },
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

      // Update bed status
      const bed = availableBeds.find((b) => b.id === selectedBed);
      if (bed) {
        await medplum.updateResource<Location>({
          ...bed,
          operationalStatus: {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0116',
            code: 'O',
            display: 'Occupied',
          },
        });
      }

      showNotification({
        title: 'Success',
        message: 'Patient admitted successfully',
        color: 'green',
        icon: <IconCheck />,
      });

      setSelectedPatient(null);
      setSelectedBed('');
      setSelectedDoctor(null);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error admitting patient:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to admit patient',
        color: 'red',
        icon: <IconX />,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Admit Patient (IPD)" size="md">
      <Stack gap="md">
        <ResourceInput
          resourceType="Patient"
          name="patient"
          placeholder="Select patient"
          onChange={(value) => setSelectedPatient(value as Patient)}
        />

        <Select
          label="Select Bed"
          placeholder="Choose an available bed"
          data={availableBeds.map((bed) => ({
            value: bed.id || '',
            label: bed.name || 'Unnamed bed',
          }))}
          value={selectedBed}
          onChange={(value) => setSelectedBed(value || '')}
          searchable
        />

        <ResourceInput
          resourceType="Practitioner"
          name="doctor"
          placeholder="Select attending physician (optional)"
          onChange={(value) => setSelectedDoctor(value as Practitioner)}
        />

        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAdmit} loading={loading} disabled={!selectedPatient || !selectedBed}>
            Admit Patient
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
