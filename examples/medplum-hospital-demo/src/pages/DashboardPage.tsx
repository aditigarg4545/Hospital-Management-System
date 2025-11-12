// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Card, Grid, Group, Paper, Progress, Stack, Text, Title } from '@mantine/core';
import { useMedplum } from '@medplum/react';
import { IconBed, IconCalendar, IconCoin, IconStethoscope, IconTrendingUp, IconUsers } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  opdVisits: number;
  ipdAdmissions: number;
  availableBeds: number;
  totalBeds: number;
  revenue: number;
}

export function DashboardPage(): JSX.Element {
  const medplum = useMedplum();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayAppointments: 0,
    opdVisits: 0,
    ipdAdmissions: 0,
    availableBeds: 0,
    totalBeds: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats(): Promise<void> {
      try {
        const today = new Date().toISOString().split('T')[0];

        // Get total patients
        const patientsBundle = await medplum.search('Patient', '_count=0&_total=accurate');
        const totalPatients = patientsBundle.total || 0;

        // Get today's appointments
        const appointmentsBundle = await medplum.search('Appointment', `date=${today}&_count=0&_total=accurate`);
        const todayAppointments = appointmentsBundle.total || 0;

        // Get OPD encounters (today)
        const opdBundle = await medplum.search('Encounter', `class=AMB&date=${today}&_count=0&_total=accurate`);
        const opdVisits = opdBundle.total || 0;

        // Get IPD admissions (current)
        const ipdBundle = await medplum.search('Encounter', `class=IMP&status:not=finished&_count=0&_total=accurate`);
        const ipdAdmissions = ipdBundle.total || 0;

        // Get bed information from Locations
        const bedsBundle = await medplum.search('Location', 'type=bd&_count=1000');
        const totalBeds = bedsBundle.entry?.length || 0;
        const availableBeds = bedsBundle.entry?.filter((entry) => entry.resource?.status === 'active').length || 0;

        setStats({
          totalPatients,
          todayAppointments,
          opdVisits,
          ipdAdmissions,
          availableBeds,
          totalBeds,
          revenue: 0, // Would be calculated from Claims/ChargeItems
        });
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats().catch(console.error);
  }, [medplum]);

  const statCards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: IconUsers,
      color: 'blue',
    },
    {
      title: "Today's Appointments",
      value: stats.todayAppointments,
      icon: IconCalendar,
      color: 'green',
    },
    {
      title: 'OPD Visits Today',
      value: stats.opdVisits,
      icon: IconStethoscope,
      color: 'cyan',
    },
    {
      title: 'Current IPD Admissions',
      value: stats.ipdAdmissions,
      icon: IconBed,
      color: 'orange',
    },
  ];

  const bedOccupancy = stats.totalBeds > 0 ? ((stats.totalBeds - stats.availableBeds) / stats.totalBeds) * 100 : 0;

  return (
    <Stack gap="lg">
      <Title order={2}>Dashboard</Title>

      <Grid>
        {statCards.map((stat) => (
          <Grid.Col key={stat.title} span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="md">
                <stat.icon size={32} color={stat.color} />
              </Group>
              <Text size="xl" fw={700}>
                {loading ? '...' : stat.value}
              </Text>
              <Text size="sm" c="dimmed">
                {stat.title}
              </Text>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="md">
              <Group justify="space-between">
                <Text size="lg" fw={600}>
                  Bed Occupancy
                </Text>
                <IconBed size={24} />
              </Group>
              <div>
                <Group justify="space-between" mb="xs">
                  <Text size="sm" c="dimmed">
                    {stats.totalBeds - stats.availableBeds} / {stats.totalBeds} beds occupied
                  </Text>
                  <Text size="sm" fw={600}>
                    {bedOccupancy.toFixed(1)}%
                  </Text>
                </Group>
                <Progress value={bedOccupancy} color={bedOccupancy > 80 ? 'red' : 'blue'} size="lg" />
              </div>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="md">
              <Group justify="space-between">
                <Text size="lg" fw={600}>
                  Revenue Overview
                </Text>
                <IconCoin size={24} />
              </Group>
              <div>
                <Text size="xl" fw={700}>
                  ${stats.revenue.toLocaleString()}
                </Text>
                <Group gap="xs" mt="xs">
                  <IconTrendingUp size={16} color="green" />
                  <Text size="sm" c="dimmed">
                    This month
                  </Text>
                </Group>
              </div>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      <Paper shadow="sm" p="lg" radius="md" withBorder>
        <Title order={4} mb="md">
          Quick Actions
        </Title>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card
              shadow="xs"
              padding="md"
              radius="md"
              withBorder
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/patients')}
            >
              <Stack align="center" gap="xs">
                <IconUsers size={32} />
                <Text size="sm" fw={600}>
                  Register Patient
                </Text>
              </Stack>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card
              shadow="xs"
              padding="md"
              radius="md"
              withBorder
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/appointments')}
            >
              <Stack align="center" gap="xs">
                <IconCalendar size={32} />
                <Text size="sm" fw={600}>
                  Book Appointment
                </Text>
              </Stack>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card
              shadow="xs"
              padding="md"
              radius="md"
              withBorder
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/ipd')}
            >
              <Stack align="center" gap="xs">
                <IconBed size={32} />
                <Text size="sm" fw={600}>
                  Admit Patient
                </Text>
              </Stack>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card
              shadow="xs"
              padding="md"
              radius="md"
              withBorder
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/opd')}
            >
              <Stack align="center" gap="xs">
                <IconStethoscope size={32} />
                <Text size="sm" fw={600}>
                  OPD Visit
                </Text>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Paper>
    </Stack>
  );
}
