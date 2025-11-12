// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Center, Loader, Stack, Text } from '@mantine/core';
import type { JSX } from 'react';

export function Loading(): JSX.Element {
  return (
    <Center style={{ minHeight: '50vh' }}>
      <Stack align="center">
        <Loader size="lg" />
        <Text c="dimmed">Loading...</Text>
      </Stack>
    </Center>
  );
}
