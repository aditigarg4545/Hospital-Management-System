// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Title } from '@mantine/core';
import { SignInForm } from '@medplum/react';
import type { JSX } from 'react';
import { useNavigate } from 'react-router';
import AppLogo from '../../../../packages/assets/AppLogo.avif';

export default function SignInPage(): JSX.Element {
  const navigate = useNavigate();
  return (
    <SignInForm
      // Configure according to your settings
      googleClientId="397236612778-c0b5tnjv98frbo1tfuuha5vkme3cmq4s.apps.googleusercontent.com"
      onSuccess={() => navigate('/')?.catch(console.error)}
    >
      <img src={AppLogo} alt="Logo" style={{ height: 32, width: 32 }} />
      <Title ta="center">Sign in to Medplum</Title>
    </SignInForm>
  );
}
