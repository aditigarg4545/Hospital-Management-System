// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { AppShell, Burger, Group, NavLink, Stack, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useMedplum, useMedplumProfile } from '@medplum/react';
import {
  IconBed,
  IconCalendar,
  IconClipboardList,
  IconCoin,
  IconDashboard,
  IconDoor,
  IconHospital,
  IconStethoscope,
  IconUsers,
} from '@tabler/icons-react';
import type { JSX } from 'react';
import { Suspense } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router';
import { Loading } from './components/Loading';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { BedManagementPage } from './pages/BedManagementPage';
import { BillingPage } from './pages/BillingPage';
import { DashboardPage } from './pages/DashboardPage';
import { DoctorsPage } from './pages/DoctorsPage';
import { IPDPage } from './pages/IPDPage';
import { OPDPage } from './pages/OPDPage';
import { PatientPage } from './pages/PatientPage';
import { PatientsPage } from './pages/PatientsPage';
import { ServicesPage } from './pages/ServicesPage';
import { SignInPage } from './pages/SignInPage';
import { WardManagementPage } from './pages/WardManagementPage';

export function App(): JSX.Element {
  const medplum = useMedplum();
  const profile = useMedplumProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const [opened, { toggle }] = useDisclosure();

  if (!profile || !medplum.getActiveLogin()) {
    return <SignInPage />;
  }

  const navItems = [
    { label: 'Dashboard', icon: IconDashboard, path: '/' },
    { label: 'Appointments', icon: IconCalendar, path: '/appointments' },
    { label: 'Patients', icon: IconUsers, path: '/patients' },
    { label: 'Doctors', icon: IconStethoscope, path: '/doctors' },
    { label: 'OPD', icon: IconStethoscope, path: '/opd' },
    { label: 'IPD', icon: IconHospital, path: '/ipd' },
    { label: 'Bed Management', icon: IconBed, path: '/beds' },
    { label: 'Ward Management', icon: IconDoor, path: '/wards' },
    { label: 'Services', icon: IconClipboardList, path: '/services' },
    { label: 'Billing', icon: IconCoin, path: '/billing' },
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 250, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <IconHospital size={32} color="blue" />
            <Title order={3}>Synthlane Hospital Management</Title>
          </Group>
          <Text size="sm" c="dimmed">
            {profile.name?.[0]?.text || 'User'}
          </Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap="xs">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              label={item.label}
              leftSection={<item.icon size={20} />}
              active={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            />
          ))}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/patients/:id" element={<PatientPage />} />
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/opd" element={<OPDPage />} />
            <Route path="/ipd" element={<IPDPage />} />
            <Route path="/beds" element={<BedManagementPage />} />
            <Route path="/wards" element={<WardManagementPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/billing" element={<BillingPage />} />
          </Routes>
        </Suspense>
      </AppShell.Main>
    </AppShell>
  );
}
