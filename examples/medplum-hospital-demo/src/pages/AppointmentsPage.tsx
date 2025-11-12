// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Badge, Button, Card, Group, Modal, Select, Stack, Table, Text, Title } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { createReference, formatHumanName } from '@medplum/core';
import type { Appointment, Patient, Practitioner } from '@medplum/fhirtypes';
import { ResourceAvatar, ResourceInput, useMedplum } from '@medplum/react';
import { IconCalendar, IconCheck, IconX } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useCallback, useEffect, useState } from 'react';

interface AppointmentWithPatient extends Appointment {
  patientResource?: Patient;
}

export function AppointmentsPage(): JSX.Element {
  const medplum = useMedplum();
  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);

  // Form state
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Practitioner | null>(null);
  const [appointmentDate, setAppointmentDate] = useState<Date | null>(null);
  const [appointmentTime, setAppointmentTime] = useState<string>('09:00');

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      const appointmentsBundle = await medplum.search(
        'Appointment',
        `date=ge${today}&_include=Appointment:patient&_count=100&_sort=date`
      );

      const appointmentsList: AppointmentWithPatient[] = [];

      if (appointmentsBundle.entry) {
        const apps = appointmentsBundle.entry.filter(
          (e) => e.resource && (e.resource.resourceType as string) === 'Appointment'
        );
        const patients = appointmentsBundle.entry.filter(
          (e) => e.resource && (e.resource.resourceType as string) === 'Patient'
        );

        for (const appEntry of apps) {
          const appointment = appEntry.resource as Appointment;
          const patientParticipant = appointment.participant?.find((p) => p.actor?.reference?.startsWith('Patient/'));
          const patientRef = patientParticipant?.actor?.reference;
          const patientEntry = patients.find((p) => {
            const resource = p.resource;
            if (!resource) {
              return false;
            }
            const resourceType = resource.resourceType as string;
            const resourceId = resource.id;
            return `${resourceType}/${resourceId}` === patientRef;
          });
          const patient = patientEntry?.resource as Patient | undefined;

          appointmentsList.push({
            ...appointment,
            patientResource: patient,
          });
        }
      }

      setAppointments(appointmentsList);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  }, [medplum]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  async function handleCreateAppointment(): Promise<void> {
    if (!selectedPatient || !appointmentDate) {
      showNotification({
        title: 'Validation Error',
        message: 'Please select a patient and date',
        color: 'red',
        icon: <IconX />,
      });
      return;
    }

    try {
      const dateTimeStr = `${appointmentDate.toISOString().split('T')[0]}T${appointmentTime}:00`;
      const endTime = new Date(new Date(dateTimeStr).getTime() + 30 * 60000).toISOString();

      const appointment: Appointment = {
        resourceType: 'Appointment',
        status: 'booked',
        start: dateTimeStr,
        end: endTime,
        participant: [
          {
            actor: createReference(selectedPatient),
            status: 'accepted',
          },
        ],
      };

      if (selectedDoctor) {
        appointment.participant?.push({
          actor: createReference(selectedDoctor),
          status: 'accepted',
        });
      }

      await medplum.createResource(appointment);

      showNotification({
        title: 'Success',
        message: 'Appointment created successfully',
        color: 'green',
        icon: <IconCheck />,
      });

      setSelectedPatient(null);
      setSelectedDoctor(null);
      setAppointmentDate(null);
      closeCreate();
      await loadAppointments();
    } catch (error) {
      console.error('Error creating appointment:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to create appointment',
        color: 'red',
        icon: <IconX />,
      });
    }
  }

  async function handleUpdateStatus(appointment: Appointment, newStatus: Appointment['status']): Promise<void> {
    try {
      await medplum.updateResource<Appointment>({
        ...appointment,
        status: newStatus,
      });
      await loadAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  }

  const filteredAppointments = appointments.filter((apt) => {
    if (filterStatus === 'all') {
      return true;
    }
    return apt.status === filterStatus;
  });

  function getStatusColor(status: string): string {
    switch (status) {
      case 'booked':
        return 'blue';
      case 'arrived':
        return 'orange';
      case 'fulfilled':
        return 'green';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2}>Appointments</Title>
          <Text size="sm" c="dimmed">
            Upcoming: {appointments.filter((a) => a.status === 'booked').length}
          </Text>
        </div>
        <Button leftSection={<IconCalendar size={16} />} onClick={openCreate}>
          Book Appointment
        </Button>
      </Group>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={4}>Appointment List</Title>
          <Select
            placeholder="Filter by status"
            value={filterStatus}
            onChange={(value) => setFilterStatus(value || 'all')}
            data={[
              { value: 'all', label: 'All' },
              { value: 'booked', label: 'Booked' },
              { value: 'arrived', label: 'Arrived' },
              { value: 'fulfilled', label: 'Fulfilled' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
            style={{ width: 200 }}
          />
        </Group>

        {loading && <Text>Loading appointments...</Text>}
        {!loading && filteredAppointments.length === 0 && <Text c="dimmed">No appointments found</Text>}
        {!loading && filteredAppointments.length > 0 && (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Patient</Table.Th>
                <Table.Th>Date & Time</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredAppointments.map((appointment) => {
                const dateTime = appointment.start ? new Date(appointment.start) : null;

                return (
                  <Table.Tr key={appointment.id}>
                    <Table.Td>
                      <Group gap="sm">
                        <ResourceAvatar value={appointment.patientResource} />
                        <div>
                          <Text size="sm" fw={500}>
                            {appointment.patientResource
                              ? formatHumanName(appointment.patientResource.name?.[0])
                              : 'Unknown'}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {appointment.patientResource?.id}
                          </Text>
                        </div>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      {dateTime ? (
                        <>
                          <Text size="sm">{dateTime.toLocaleDateString()}</Text>
                          <Text size="xs" c="dimmed">
                            {dateTime.toLocaleTimeString()}
                          </Text>
                        </>
                      ) : (
                        'N/A'
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Badge color={getStatusColor(appointment.status || 'unknown')}>{appointment.status}</Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        {appointment.status === 'booked' && (
                          <>
                            <Button
                              size="xs"
                              variant="light"
                              onClick={() => handleUpdateStatus(appointment, 'arrived')}
                            >
                              Check In
                            </Button>
                            <Button
                              size="xs"
                              variant="light"
                              color="red"
                              onClick={() => handleUpdateStatus(appointment, 'cancelled')}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                        {appointment.status === 'arrived' && (
                          <Button
                            size="xs"
                            variant="light"
                            color="green"
                            onClick={() => handleUpdateStatus(appointment, 'fulfilled')}
                          >
                            Complete
                          </Button>
                        )}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        )}
      </Card>

      {/* Create Appointment Modal */}
      <Modal opened={createOpened} onClose={closeCreate} title="Book Appointment" size="md">
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

          <DateInput
            label="Appointment Date"
            placeholder="Select date"
            value={appointmentDate}
            onChange={setAppointmentDate}
            minDate={new Date()}
          />

          <Select
            label="Time"
            placeholder="Select time"
            value={appointmentTime}
            onChange={(value) => setAppointmentTime(value || '09:00')}
            data={[
              '09:00',
              '09:30',
              '10:00',
              '10:30',
              '11:00',
              '11:30',
              '12:00',
              '14:00',
              '14:30',
              '15:00',
              '15:30',
              '16:00',
              '16:30',
              '17:00',
            ]}
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={closeCreate}>
              Cancel
            </Button>
            <Button onClick={handleCreateAppointment} disabled={!selectedPatient || !appointmentDate}>
              Book Appointment
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
