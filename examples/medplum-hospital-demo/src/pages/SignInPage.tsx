// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Center, Paper, Stack, Title } from '@mantine/core';
import { SignInForm } from '@medplum/react';
import type { JSX } from 'react';
import { useNavigate } from 'react-router';

export function SignInPage(): JSX.Element {
  const navigate = useNavigate();

  return (
    <Center style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Paper shadow="md" p="xl" radius="md" withBorder style={{ width: 450 }}>
        <Stack gap="lg">
          <Title order={2} ta="center">
            Hospital Management System
          </Title>
          <SignInForm onSuccess={() => navigate('/')} googleClientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <Title order={3}>Sign In</Title>
          </SignInForm>
        </Stack>
      </Paper>
    </Center>
  );
}
