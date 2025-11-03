// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Card, Stack, Tabs, Title } from '@mantine/core';
import type { Patient } from '@medplum/fhirtypes';
import { ResourceBadge, ResourceTable, useMedplum } from '@medplum/react';
import { IconCalendar, IconHistory, IconUser } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

export function PatientPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const medplum = useMedplum();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      medplum
        .readResource('Patient', id)
        .then(setPatient)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id, medplum]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!patient) {
    return <div>Patient not found</div>;
  }

  return (
    <Stack gap="lg">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={2}>
          <ResourceBadge value={patient} />
        </Title>
      </Card>

      <Tabs defaultValue="details">
        <Tabs.List>
          <Tabs.Tab value="details" leftSection={<IconUser size={16} />}>
            Details
          </Tabs.Tab>
          <Tabs.Tab value="encounters" leftSection={<IconHistory size={16} />}>
            Encounters
          </Tabs.Tab>
          <Tabs.Tab value="appointments" leftSection={<IconCalendar size={16} />}>
            Appointments
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="details" pt="md">
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <ResourceTable value={patient} />
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="encounters" pt="md">
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={4} mb="md">
              Encounter History
            </Title>
            {/* Encounter list would go here */}
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="appointments" pt="md">
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={4} mb="md">
              Appointment History
            </Title>
            {/* Appointment list would go here */}
          </Card>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
