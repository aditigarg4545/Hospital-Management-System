// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Button, Group, Modal, Select, Stack, TextInput } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import type { Patient } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react';
import { IconCheck, IconX } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useState } from 'react';

interface AddPatientModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddPatientModal({ opened, onClose, onSuccess }: AddPatientModalProps): JSX.Element {
  const medplum = useMedplum();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<string>('');
  const [mrn, setMrn] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [active, setActive] = useState<string>('true');
  const [loading, setLoading] = useState(false);

  async function handleCreate(): Promise<void> {
    if (!firstName || !lastName) {
      showNotification({
        title: 'Validation Error',
        message: 'Please enter first name and last name',
        color: 'red',
        icon: <IconX />,
      });
      return;
    }

    try {
      setLoading(true);

      const patientData: Patient = {
        resourceType: 'Patient',
        active: active === 'true',
        name: [
          {
            given: [firstName],
            family: lastName,
          },
        ],
        ...(birthDate && { birthDate }),
        ...(gender && { gender: gender as Patient['gender'] }),
        ...(mrn && {
          identifier: [
            {
              type: {
                coding: [
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                    code: 'MR',
                    display: 'Medical Record Number',
                  },
                ],
              },
              value: mrn,
            },
          ],
        }),
        ...((phone || email) && {
          telecom: [
            ...(phone ? [{ system: 'phone' as const, value: phone }] : []),
            ...(email ? [{ system: 'email' as const, value: email }] : []),
          ],
        }),
        ...((street || city || state || postalCode || country) && {
          address: [
            {
              ...(street && { line: [street] }),
              ...(city && { city }),
              ...(state && { state }),
              ...(postalCode && { postalCode }),
              ...(country && { country }),
            },
          ],
        }),
      };

      await medplum.createResource(patientData);

      showNotification({
        title: 'Success',
        message: 'Patient created successfully',
        color: 'green',
        icon: <IconCheck />,
      });

      // Reset form
      setFirstName('');
      setLastName('');
      setBirthDate('');
      setGender('');
      setMrn('');
      setPhone('');
      setEmail('');
      setStreet('');
      setCity('');
      setState('');
      setPostalCode('');
      setCountry('');
      setActive('true');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating patient:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to create patient',
        color: 'red',
        icon: <IconX />,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Add New Patient" size="lg" centered>
      <Stack gap="md">
        <Group grow>
          <TextInput
            label="First Name"
            placeholder="Enter first name"
            value={firstName}
            onChange={(e) => setFirstName(e.currentTarget.value)}
            required
          />
          <TextInput
            label="Last Name"
            placeholder="Enter last name"
            value={lastName}
            onChange={(e) => setLastName(e.currentTarget.value)}
            required
          />
        </Group>

        <Group grow>
          <TextInput
            label="Date of Birth"
            placeholder="YYYY-MM-DD"
            value={birthDate}
            onChange={(e) => setBirthDate(e.currentTarget.value)}
            type="date"
          />
          <Select
            label="Gender"
            placeholder="Select gender"
            data={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'other', label: 'Other' },
              { value: 'unknown', label: 'Unknown' },
            ]}
            value={gender}
            onChange={(value) => setGender(value || '')}
          />
        </Group>

        <TextInput
          label="Medical Record Number (MRN)"
          placeholder="Enter MRN (optional)"
          value={mrn}
          onChange={(e) => setMrn(e.currentTarget.value)}
        />

        <Group grow>
          <TextInput
            label="Phone"
            placeholder="Enter phone number"
            value={phone}
            onChange={(e) => setPhone(e.currentTarget.value)}
            type="tel"
          />
          <TextInput
            label="Email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            type="email"
          />
        </Group>

        <TextInput
          label="Street Address"
          placeholder="Enter street address"
          value={street}
          onChange={(e) => setStreet(e.currentTarget.value)}
        />

        <Group grow>
          <TextInput
            label="City"
            placeholder="Enter city"
            value={city}
            onChange={(e) => setCity(e.currentTarget.value)}
          />
          <TextInput
            label="State"
            placeholder="Enter state"
            value={state}
            onChange={(e) => setState(e.currentTarget.value)}
          />
        </Group>

        <Group grow>
          <TextInput
            label="Postal Code"
            placeholder="Enter postal code"
            value={postalCode}
            onChange={(e) => setPostalCode(e.currentTarget.value)}
          />
          <TextInput
            label="Country"
            placeholder="Enter country"
            value={country}
            onChange={(e) => setCountry(e.currentTarget.value)}
          />
        </Group>

        <Select
          label="Status"
          placeholder="Select status"
          data={[
            { value: 'true', label: 'Active' },
            { value: 'false', label: 'Inactive' },
          ]}
          value={active}
          onChange={(value) => setActive(value || 'true')}
        />

        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} loading={loading} disabled={!firstName || !lastName}>
            Add Patient
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
