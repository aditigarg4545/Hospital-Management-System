// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Title } from '@mantine/core';
import { SignInForm } from '@medplum/react';
import type { JSX } from 'react';
import { useNavigate } from 'react-router';
import AppLogo from '../../../../packages/assets/AppLogo.avif';
import { getConfig } from '../config';

export function SignInPage(): JSX.Element {
  const navigate = useNavigate();
  return (
    <SignInForm
      // Configure according to your settings
      googleClientId={getConfig().googleClientId}
      onSuccess={() => navigate('/')?.catch(console.error)}
      clientId={getConfig().clientId}
    >
      <img src={AppLogo} alt="Logo" style={{ height: 32 }} />
      <Title>Sign in to Medplum</Title>
    </SignInForm>
  );
}
