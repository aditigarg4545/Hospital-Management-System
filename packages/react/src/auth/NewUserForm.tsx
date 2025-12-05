// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Anchor, Center, Checkbox, Divider, Group, PasswordInput, Stack, Text, TextInput } from '@mantine/core';
import type { GoogleCredentialResponse, LoginAuthenticationResponse } from '@medplum/core';
import { normalizeOperationOutcome } from '@medplum/core';
import type { OperationOutcome } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react-hooks';
import type { JSX, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Form } from '../Form/Form';
import { SubmitButton } from '../Form/SubmitButton';
import { GoogleButton } from '../GoogleButton/GoogleButton';
import { getGoogleClientId } from '../GoogleButton/GoogleButton.utils';
import { OperationOutcomeAlert } from '../OperationOutcomeAlert/OperationOutcomeAlert';
import { getErrorsForInput, getIssuesForExpression } from '../utils/outcomes';
import { getRecaptcha, initRecaptcha } from '../utils/recaptcha';

export interface NewUserFormProps {
  readonly projectId: string;
  readonly clientId?: string;
  readonly googleClientId?: string;
  readonly recaptchaSiteKey?: string;
  readonly children?: ReactNode;
  readonly handleAuthResponse: (response: LoginAuthenticationResponse) => void;
}

export function NewUserForm(props: NewUserFormProps): JSX.Element {
  const googleClientId = getGoogleClientId(props.googleClientId);
  const recaptchaSiteKey = props.recaptchaSiteKey;
  const medplum = useMedplum();
  const [outcome, setOutcome] = useState<OperationOutcome>();
  const issues = getIssuesForExpression(outcome, undefined);

  useEffect(() => {
    if (recaptchaSiteKey) {
      initRecaptcha(recaptchaSiteKey);
    }
  }, [recaptchaSiteKey]);

  // Clear any autofilled values after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      const form = document.querySelector('form[data-testid="new-user-registration-form"]') as HTMLFormElement;
      if (form) {
        const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;
        const passwordInput = form.querySelector('input[name="password"]') as HTMLInputElement;
        if (emailInput?.value) {
          emailInput.value = '';
          // Trigger input event to notify React
          emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (passwordInput?.value) {
          passwordInput.value = '';
          // Trigger input event to notify React
          passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Form
      key="new-user-form"
      testid="new-user-registration-form"
      onSubmit={async (formData: Record<string, string>) => {
        setOutcome(undefined);
        try {
          let recaptchaToken = '';
          if (recaptchaSiteKey) {
            recaptchaToken = await getRecaptcha(recaptchaSiteKey);
          }
          props.handleAuthResponse(
            await medplum.startNewUser({
              projectId: props.projectId,
              clientId: props.clientId,
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              password: formData.password,
              remember: formData.remember === 'true',
              recaptchaSiteKey,
              recaptchaToken,
            })
          );
        } catch (err) {
          setOutcome(normalizeOperationOutcome(err));
        }
      }}
    >
      <Center style={{ flexDirection: 'column' }}>{props.children}</Center>
      <OperationOutcomeAlert issues={issues} />
      {googleClientId && (
        <>
          <Group justify="center" p="xl" style={{ height: 70 }}>
            <GoogleButton
              googleClientId={googleClientId}
              handleGoogleCredential={async (response: GoogleCredentialResponse) => {
                try {
                  props.handleAuthResponse(
                    await medplum.startGoogleLogin({
                      googleClientId: response.clientId,
                      googleCredential: response.credential,
                      projectId: props.projectId,
                      createUser: true,
                    })
                  );
                } catch (err) {
                  setOutcome(normalizeOperationOutcome(err));
                }
              }}
            />
          </Group>
          <Divider label="or" labelPosition="center" my="lg" />
        </>
      )}
      <Stack gap="xl">
        <TextInput
          name="firstName"
          type="text"
          label="First name"
          placeholder="First name"
          required={true}
          autoFocus={true}
          error={getErrorsForInput(outcome, 'firstName')}
        />
        <TextInput
          name="lastName"
          type="text"
          label="Last name"
          placeholder="Last name"
          required={true}
          error={getErrorsForInput(outcome, 'lastName')}
        />
        <TextInput
          name="email"
          type="email"
          label="Email"
          placeholder="name@domain.com"
          required={true}
          autoComplete="off"
          data-1p-ignore
          data-lpignore="true"
          error={getErrorsForInput(outcome, 'email')}
        />
        <PasswordInput
          name="password"
          label="Password"
          autoComplete="new-password"
          data-1p-ignore
          data-lpignore="true"
          required={true}
          error={getErrorsForInput(outcome, 'password')}
        />
        <Text c="dimmed" size="xs">
          By clicking submit you agree to the Medivyx{' '}
          <Anchor href="https://www.medplum.com/privacy">Privacy&nbsp;Policy</Anchor>
          {' and '}
          <Anchor href="https://www.medplum.com/terms">Terms&nbsp;of&nbsp;Service</Anchor>.
        </Text>
        <Text c="dimmed" size="xs">
          This site is protected by reCAPTCHA and the Google{' '}
          <Anchor href="https://policies.google.com/privacy">Privacy&nbsp;Policy</Anchor>
          {' and '}
          <Anchor href="https://policies.google.com/terms">Terms&nbsp;of&nbsp;Service</Anchor> apply.
        </Text>
      </Stack>
      <Group justify="space-between" mt="xl" wrap="nowrap">
        <Checkbox name="remember" label="Remember me" size="xs" />
        <SubmitButton>Create account</SubmitButton>
      </Group>
    </Form>
  );
}
