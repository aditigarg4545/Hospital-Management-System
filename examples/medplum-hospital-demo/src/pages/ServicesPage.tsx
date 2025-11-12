// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Badge, Button, Card, Grid, Group, Modal, Stack, Text, TextInput, Textarea, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import type { HealthcareService } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react';
import { IconCheck, IconStethoscope, IconX } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useCallback, useEffect, useState } from 'react';

export function ServicesPage(): JSX.Element {
  const medplum = useMedplum();
  const [services, setServices] = useState<HealthcareService[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDescription, setNewServiceDescription] = useState('');

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      const servicesBundle = await medplum.search('HealthcareService', '_count=100&_sort=name');
      const servicesList = (servicesBundle.entry?.map((e) => e.resource) || []) as HealthcareService[];
      setServices(servicesList);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  }, [medplum]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  async function handleCreateService(): Promise<void> {
    if (!newServiceName) {
      showNotification({
        title: 'Validation Error',
        message: 'Please enter a service name',
        color: 'red',
        icon: <IconX />,
      });
      return;
    }

    try {
      await medplum.createResource<HealthcareService>({
        resourceType: 'HealthcareService',
        active: true,
        name: newServiceName,
        comment: newServiceDescription,
        type: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/service-type',
                code: '1',
                display: 'Clinical Service',
              },
            ],
          },
        ],
      });

      showNotification({
        title: 'Success',
        message: 'Service created successfully',
        color: 'green',
        icon: <IconCheck />,
      });

      setNewServiceName('');
      setNewServiceDescription('');
      closeCreate();
      await loadServices();
    } catch (error) {
      console.error('Error creating service:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to create service',
        color: 'red',
        icon: <IconX />,
      });
    }
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2}>Healthcare Services</Title>
          <Text size="sm" c="dimmed">
            Total Services: {services.length}
          </Text>
        </div>
        <Button leftSection={<IconStethoscope size={16} />} onClick={openCreate}>
          Add Service
        </Button>
      </Group>

      {loading ? (
        <Text>Loading services...</Text>
      ) : (
        <Grid>
          {services.map((service) => (
            <Grid.Col key={service.id} span={{ base: 12, sm: 6, md: 4 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Group justify="space-between">
                    <Group gap="xs">
                      <IconStethoscope size={24} />
                      <Text fw={600}>{service.name}</Text>
                    </Group>
                    <Badge color={service.active ? 'green' : 'red'} variant="light">
                      {service.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </Group>

                  {service.comment && (
                    <Text size="sm" c="dimmed">
                      {service.comment}
                    </Text>
                  )}

                  {service.type && service.type.length > 0 && (
                    <div>
                      <Text size="xs" c="dimmed" mb="xs">
                        Service Type:
                      </Text>
                      {service.type.map((type, idx) => (
                        <Badge key={idx} variant="light" mr="xs">
                          {type.coding?.[0]?.display || 'Unknown'}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <Button variant="light" fullWidth>
                    View Details
                  </Button>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      )}

      {/* Create Service Modal */}
      <Modal opened={createOpened} onClose={closeCreate} title="Add New Service">
        <Stack gap="md">
          <TextInput
            label="Service Name"
            placeholder="e.g., Cardiology Consultation"
            value={newServiceName}
            onChange={(e) => setNewServiceName(e.currentTarget.value)}
            required
          />
          <Textarea
            label="Description"
            placeholder="Service description..."
            minRows={3}
            value={newServiceDescription}
            onChange={(e) => setNewServiceDescription(e.currentTarget.value)}
          />
          <Group justify="flex-end">
            <Button variant="light" onClick={closeCreate}>
              Cancel
            </Button>
            <Button onClick={handleCreateService} disabled={!newServiceName}>
              Create Service
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
