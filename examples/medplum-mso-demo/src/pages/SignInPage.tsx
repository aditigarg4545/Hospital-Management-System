// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Title } from '@mantine/core';
import { SignInForm } from '@medplum/react';
import type { JSX } from 'react';
import { useNavigate } from 'react-router';
import AppLogo from '../../../../packages/assets/AppLogo.avif';
import { getConfig } from '../config';

/**
 * SignInPage component for the MSO demo.
 * Displays a sign-in form with Google OAuth credentials.
 *
 * @returns The sign-in page
 */
export function SignInPage(): JSX.Element {
  const navigate = useNavigate();
  return (
    <SignInForm
      // Configure according to your settings
      googleClientId={getConfig().googleClientId}
      clientId={getConfig().clientId}
      onSuccess={() => navigate('/')}
    >
      <img src={AppLogo} alt="Logo" style={{ height: 32, width: 32 }} />
      <Title>Sign in to Medplum</Title>
    </SignInForm>
  );
}
