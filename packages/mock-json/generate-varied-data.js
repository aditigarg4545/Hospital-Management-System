#!/usr/bin/env node
// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Script to generate varied, realistic medical mock data
/* eslint-disable */
/* eslint-env node */
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Medical test data with LOINC codes
const MEDICAL_TESTS = [
  { code: '24356-8', display: 'Complete Blood Count', text: 'CBC' },
  { code: '24323-8', display: 'Comprehensive Metabolic Panel', text: 'CMP' },
  { code: '24320-4', display: 'Basic Metabolic Panel', text: 'BMP' },
  { code: '24357-6', display: 'Lipid Panel', text: 'Lipid Panel' },
  { code: '24359-2', display: 'Liver Function Panel', text: 'LFT' },
  { code: '24325-3', display: 'Thyroid Stimulating Hormone', text: 'TSH' },
  { code: '2339-0', display: 'Glucose [Mass/volume] in Blood', text: 'Blood Glucose' },
  { code: '718-7', display: 'Hemoglobin [Mass/volume] in Blood', text: 'Hemoglobin' },
  { code: '777-3', display: 'Platelets [#/volume] in Blood', text: 'Platelet Count' },
  { code: '26449-9', display: 'Hemoglobin A1c/Hemoglobin.total in Blood', text: 'HbA1c' },
  { code: '2093-3', display: 'Cholesterol [Mass/volume] in Serum or Plasma', text: 'Total Cholesterol' },
  { code: '2085-9', display: 'Cholesterol in HDL [Mass/volume] in Serum or Plasma', text: 'HDL Cholesterol' },
  { code: '2089-1', display: 'Cholesterol in LDL [Mass/volume] in Serum or Plasma', text: 'LDL Cholesterol' },
  { code: '2571-8', display: 'Triglyceride [Mass/volume] in Serum or Plasma', text: 'Triglycerides' },
  { code: '2160-0', display: 'Creatinine [Mass/volume] in Serum or Plasma', text: 'Creatinine' },
  { code: '33914-3', display: 'Glomerular filtration rate/1.73 sq M.predicted', text: 'eGFR' },
  { code: '5902-2', display: 'Prothrombin time (PT)', text: 'PT' },
  { code: '5900-6', display: 'INR in Platelet poor plasma by Coagulation assay', text: 'INR' },
  { code: '1920-8', display: 'Aspartate aminotransferase [Enzymatic activity/volume] in Serum or Plasma', text: 'AST' },
  { code: '2324-2', display: 'Alanine aminotransferase [Enzymatic activity/volume] in Serum or Plasma', text: 'ALT' },
  { code: '1975-2', display: 'Bilirubin.total [Mass/volume] in Serum or Plasma', text: 'Total Bilirubin' },
  { code: '1968-7', display: 'Bilirubin.direct [Mass/volume] in Serum or Plasma', text: 'Direct Bilirubin' },
  { code: '33914-3', display: 'Vitamin D, 25-Hydroxy', text: 'Vitamin D' },
  {
    code: '14647-2',
    display: 'Chlamydia trachomatis [Presence] in Specimen by Organism specific culture',
    text: 'Chlamydia Test',
  },
  { code: '49765-1', display: 'Calcium [Mass/volume] in Blood', text: 'Calcium' },
  { code: '2823-3', display: 'Potassium [Moles/volume] in Serum or Plasma', text: 'Potassium' },
  { code: '2951-2', display: 'Sodium [Moles/volume] in Serum or Plasma', text: 'Sodium' },
  { code: '33914-3', display: 'C-Reactive Protein [Mass/volume] in Serum or Plasma', text: 'CRP' },
  { code: '6598-7', display: 'Troponin I.cardiac [Mass/volume] in Serum or Plasma', text: 'Troponin I' },
  { code: '6599-5', display: 'Troponin T.cardiac [Mass/volume] in Serum or Plasma', text: 'Troponin T' },
  { code: '33747-0', display: 'BNP [Mass/volume] in Serum or Plasma', text: 'BNP' },
];

// Practitioner specializations
const SPECIALIZATIONS = [
  { code: 'MD', display: 'Doctor of Medicine', specialty: 'General Practice' },
  { code: 'MD', display: 'Doctor of Medicine', specialty: 'Cardiology' },
  { code: 'MD', display: 'Doctor of Medicine', specialty: 'Internal Medicine' },
  { code: 'MD', display: 'Doctor of Medicine', specialty: 'Pediatrics' },
  { code: 'MD', display: 'Doctor of Medicine', specialty: 'Orthopedics' },
  { code: 'MD', display: 'Doctor of Medicine', specialty: 'Dermatology' },
  { code: 'MD', display: 'Doctor of Medicine', specialty: 'Neurology' },
  { code: 'MD', display: 'Doctor of Medicine', specialty: 'Oncology' },
  { code: 'MD', display: 'Doctor of Medicine', specialty: 'Psychiatry' },
  { code: 'MD', display: 'Doctor of Medicine', specialty: 'Endocrinology' },
  { code: 'MD', display: 'Doctor of Medicine', specialty: 'Gastroenterology' },
  { code: 'MD', display: 'Doctor of Medicine', specialty: 'Pulmonology' },
  { code: 'RN', display: 'Registered Nurse', specialty: 'General Nursing' },
  { code: 'NP', display: 'Nurse Practitioner', specialty: 'Family Practice' },
  { code: 'PA', display: 'Physician Assistant', specialty: 'General Practice' },
];

// ServiceRequest priorities
const PRIORITIES = ['routine', 'urgent', 'asap', 'stat'];
const INTENTS = ['order', 'original-order', 'reflex-order', 'filler-order', 'instance-order'];

// Patient instruction examples
const PATIENT_INSTRUCTIONS = [
  'Fast for 12 hours before the test',
  'No special preparation required',
  'Take medication as usual',
  'Avoid strenuous exercise 24 hours before test',
  'Drink plenty of water before the test',
  'Bring a list of current medications',
  'Wear comfortable clothing',
  null, // Some may not have instructions
];

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomItems(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Read existing files to get IDs
const patients = JSON.parse(fs.readFileSync(path.join(__dirname, 'patients.json'), 'utf8'));
const practitioners = JSON.parse(fs.readFileSync(path.join(__dirname, 'practitioners.json'), 'utf8'));
const organizations = JSON.parse(fs.readFileSync(path.join(__dirname, 'organizations.json'), 'utf8'));

const practitionerIds = practitioners.map((p) => p.id);
const orgId = organizations[0]?.id || '34c95d53-17b0-4985-855e-5db90d67c161';

// Generate varied ServiceRequests - multiple per patient for variety
const serviceRequests = [];
patients.forEach((patient) => {
  // Each patient gets 1-3 different service requests
  const numRequests = Math.floor(Math.random() * 3) + 1;
  for (let i = 0; i < numRequests; i++) {
    const test = getRandomItem(MEDICAL_TESTS);
    const practitioner = getRandomItem(practitionerIds);
    const priority = getRandomItem(PRIORITIES);
    const intent = getRandomItem(INTENTS);
    const status = getRandomItem(['active', 'completed', 'on-hold', 'revoked']);
    const doNotPerform = Math.random() > 0.85; // 15% chance
    const patientInstruction = getRandomItem(PATIENT_INSTRUCTIONS);

    // Spread dates over the past year
    const authoredDate = randomDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date());

    serviceRequests.push({
      resourceType: 'ServiceRequest',
      id: uuidv4(),
      status: status,
      subject: {
        reference: `Patient/${patient.id}`,
      },
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: test.code,
            display: test.display,
          },
        ],
        text: test.text,
      },
      performer: [
        {
          reference: `Organization/${orgId}`,
        },
      ],
      intent: intent,
      priority: priority,
      authoredOn: authoredDate.toISOString(),
      requester: {
        reference: `Practitioner/${practitioner}`,
      },
      ...(doNotPerform && { doNotPerform: true }),
      ...(patientInstruction && { patientInstruction: patientInstruction }),
      ...(Math.random() > 0.6 && {
        insurance: [
          {
            reference: `Coverage/${uuidv4()}`,
          },
        ],
      }),
    });
  }
});

// Generate varied DiagnosticReports
const diagnosticReports = serviceRequests.slice(0, Math.floor(serviceRequests.length * 0.8)).map((sr) => {
  const test = MEDICAL_TESTS.find((t) => t.code === sr.code.coding[0].code) || getRandomItem(MEDICAL_TESTS);
  const effectiveDate = new Date(sr.authoredOn);
  effectiveDate.setDate(effectiveDate.getDate() + Math.floor(Math.random() * 7) + 1); // 1-7 days after request

  const conclusions = [
    'Results are within normal limits.',
    'Mild elevation noted, recommend follow-up.',
    'Abnormal values detected, further investigation recommended.',
    'All parameters within expected range.',
    'Slight deviation from normal, clinical correlation recommended.',
    'Significant findings, immediate clinical attention advised.',
  ];

  const conclusionCodes = [
    { code: '260385009', display: 'Normal', system: 'http://snomed.info/sct' },
    { code: '10828004', display: 'Positive', system: 'http://snomed.info/sct' },
    { code: '260385009', display: 'Normal', system: 'http://snomed.info/sct' },
    { code: '263495000', display: 'Abnormal', system: 'http://snomed.info/sct' },
  ];

  return {
    resourceType: 'DiagnosticReport',
    id: uuidv4(),
    status: 'final',
    subject: {
      reference: sr.subject.reference,
    },
    code: {
      coding: [
        {
          system: 'http://loinc.org',
          code: test.code,
          display: test.display,
        },
      ],
      text: `${test.text} Report`,
    },
    performer: [
      {
        reference: `Organization/${orgId}`,
      },
    ],
    effectiveDateTime: effectiveDate.toISOString(),
    conclusion: getRandomItem(conclusions),
    conclusionCode: [
      {
        coding: [getRandomItem(conclusionCodes)],
      },
    ],
    ...(Math.random() > 0.5 && {
      result: [
        {
          reference: `Observation/${uuidv4()}`,
        },
      ],
    }),
  };
});

// Update practitioners with varied specializations and ensure all have required fields
const updatedPractitioners = practitioners.map((pract, index) => {
  const specialization = getRandomItem(SPECIALIZATIONS);

  // Ensure all practitioners have gender, address, and communication
  const gender = pract.gender || (Math.random() > 0.5 ? 'male' : 'female');
  const address = pract.address || [
    {
      line: [`${200 + index} Medical Plaza`],
      city: 'Delhi',
      state: 'Delhi',
      postalCode: '110001',
      country: 'IN',
    },
  ];

  return {
    ...pract,
    gender: gender,
    address: address,
    qualification: [
      {
        code: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0360',
              code: specialization.code,
              display: specialization.display,
            },
          ],
        },
        ...(specialization.specialty && {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/qualification-specialty',
              valueString: specialization.specialty,
            },
          ],
        }),
      },
    ],
    communication: pract.communication || [
      {
        coding: getRandomItems(
          [
            { system: 'urn:ietf:bcp:47', code: 'en', display: 'English' },
            { system: 'urn:ietf:bcp:47', code: 'hi', display: 'Hindi' },
            { system: 'urn:ietf:bcp:47', code: 'es', display: 'Spanish' },
            { system: 'urn:ietf:bcp:47', code: 'fr', display: 'French' },
          ],
          Math.floor(Math.random() * 2) + 1
        ),
      },
    ],
  };
});

// Write updated files
fs.writeFileSync(path.join(__dirname, 'serviceRequests.json'), JSON.stringify(serviceRequests, null, 2));

fs.writeFileSync(path.join(__dirname, 'diagnosticReports.json'), JSON.stringify(diagnosticReports, null, 2));

fs.writeFileSync(path.join(__dirname, 'practitioners.json'), JSON.stringify(updatedPractitioners, null, 2));

console.log(`Generated ${serviceRequests.length} varied ServiceRequests`);
console.log(`Generated ${diagnosticReports.length} varied DiagnosticReports`);
console.log(`Updated ${updatedPractitioners.length} Practitioners with varied specializations`);
console.log('Mock data generation complete!');
