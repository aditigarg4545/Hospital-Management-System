/* eslint-disable */
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const mockJsonDir = __dirname;

// Read existing files
const diagnosticReports = JSON.parse(fs.readFileSync(path.join(mockJsonDir, 'diagnosticReports.json'), 'utf8'));
const serviceRequests = JSON.parse(fs.readFileSync(path.join(mockJsonDir, 'serviceRequests.json'), 'utf8'));
const organizations = JSON.parse(fs.readFileSync(path.join(mockJsonDir, 'organizations.json'), 'utf8'));

// 1. Create Observation resources for DiagnosticReport results
const observations = [];
const observationMap = new Map(); // Track created observations by reference

diagnosticReports.forEach((report) => {
  if (report.result && Array.isArray(report.result)) {
    report.result.forEach((resultRef) => {
      if (resultRef.reference && !observationMap.has(resultRef.reference)) {
        const [, obsId] = resultRef.reference.split('/');
        const observation = {
          resourceType: 'Observation',
          id: obsId,
          status: 'final',
          code: {
            coding: report.code?.coding || [
              {
                system: 'http://loinc.org',
                code: '00000-0',
                display: 'Observation',
              },
            ],
            text: report.code?.text || 'Observation',
          },
          subject: report.subject,
          effectiveDateTime: report.effectiveDateTime || new Date().toISOString(),
          valueQuantity: {
            value: (Math.random() * 100 + 10).toFixed(2),
            unit: 'mg/dL',
            system: 'http://unitsofmeasure.org',
            code: 'mg/dL',
          },
          interpretation: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
                  code: ['N', 'A', 'H', 'L'][Math.floor(Math.random() * 4)],
                  display: ['Normal', 'Abnormal', 'High', 'Low'][Math.floor(Math.random() * 4)],
                },
              ],
            },
          ],
        };
        observations.push(observation);
        observationMap.set(resultRef.reference, observation);
        // Add display to the reference
        resultRef.display = `${report.code?.text || 'Observation'} Result`;
      } else if (observationMap.has(resultRef.reference)) {
        // Update display if observation already exists
        const obs = observationMap.get(resultRef.reference);
        resultRef.display = `${report.code?.text || 'Observation'} Result`;
      }
    });
  }
});

// 2. Create Coverage resources for ServiceRequest insurance
const coverages = [];
const coverageMap = new Map();

serviceRequests.forEach((request) => {
  if (request.insurance && Array.isArray(request.insurance)) {
    request.insurance.forEach((insuranceRef) => {
      if (insuranceRef.reference && !coverageMap.has(insuranceRef.reference)) {
        const [, coverageId] = insuranceRef.reference.split('/');
        const payers = [
          'BlueCross BlueShield',
          'UnitedHealthcare',
          'Aetna',
          'Cigna',
          'Humana',
          'Medicare',
          'Medicaid',
          'Kaiser Permanente',
        ];
        const payer = payers[Math.floor(Math.random() * payers.length)];

        const coverage = {
          resourceType: 'Coverage',
          id: coverageId,
          status: 'active',
          type: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
                code: 'EHCPOL',
                display: 'Extended Healthcare',
              },
            ],
          },
          subscriber: request.subject,
          beneficiary: request.subject,
          payor: [
            {
              display: payer,
            },
          ],
          period: {
            start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          },
        };
        coverages.push(coverage);
        coverageMap.set(insuranceRef.reference, coverage);
        // Add display to the reference
        insuranceRef.display = payer;
      } else if (coverageMap.has(insuranceRef.reference)) {
        // Update display if coverage already exists
        const cov = coverageMap.get(insuranceRef.reference);
        insuranceRef.display = cov.payor?.[0]?.display || 'Insurance';
      }
    });
  }
});

// 3. Add more organizations (branches, labs, pharmacies)
const mainOrgId = organizations[0]?.id || '34c95d53-17b0-4985-855e-5db90d67c161';

const newOrganizations = [
  // Branch 1
  {
    resourceType: 'Organization',
    id: uuidv4(),
    name: 'CityCare Hospital - North Branch',
    partOf: {
      reference: `Organization/${mainOrgId}`,
      display: 'CityCare Hospital',
    },
    active: true,
    address: [
      {
        line: ['456 Health Avenue'],
        city: 'Delhi',
        state: 'Delhi',
        postalCode: '110002',
        country: 'IN',
      },
    ],
    telecom: [
      {
        system: 'phone',
        value: '+91-11-2345-6790',
        use: 'work',
      },
      {
        system: 'email',
        value: 'north@citycarehospital.com',
        use: 'work',
      },
    ],
  },
  // Branch 2
  {
    resourceType: 'Organization',
    id: uuidv4(),
    name: 'CityCare Hospital - South Branch',
    partOf: {
      reference: `Organization/${mainOrgId}`,
      display: 'CityCare Hospital',
    },
    active: true,
    address: [
      {
        line: ['789 Medical Plaza'],
        city: 'Delhi',
        state: 'Delhi',
        postalCode: '110003',
        country: 'IN',
      },
    ],
    telecom: [
      {
        system: 'phone',
        value: '+91-11-2345-6791',
        use: 'work',
      },
      {
        system: 'email',
        value: 'south@citycarehospital.com',
        use: 'work',
      },
    ],
  },
  // Branch 3
  {
    resourceType: 'Organization',
    id: uuidv4(),
    name: 'CityCare Hospital - East Branch',
    partOf: {
      reference: `Organization/${mainOrgId}`,
      display: 'CityCare Hospital',
    },
    active: true,
    address: [
      {
        line: ['321 Care Boulevard'],
        city: 'Delhi',
        state: 'Delhi',
        postalCode: '110004',
        country: 'IN',
      },
    ],
    telecom: [
      {
        system: 'phone',
        value: '+91-11-2345-6792',
        use: 'work',
      },
      {
        system: 'email',
        value: 'east@citycarehospital.com',
        use: 'work',
      },
    ],
  },
  // Lab
  {
    resourceType: 'Organization',
    id: uuidv4(),
    name: 'CityCare Diagnostic Laboratory',
    partOf: {
      reference: `Organization/${mainOrgId}`,
      display: 'CityCare Hospital',
    },
    type: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/organization-type',
            code: 'lab',
            display: 'Laboratory',
          },
        ],
      },
    ],
    active: true,
    address: [
      {
        line: ['555 Test Center Drive'],
        city: 'Delhi',
        state: 'Delhi',
        postalCode: '110005',
        country: 'IN',
      },
    ],
    telecom: [
      {
        system: 'phone',
        value: '+91-11-2345-6793',
        use: 'work',
      },
      {
        system: 'email',
        value: 'lab@citycarehospital.com',
        use: 'work',
      },
    ],
  },
  // Pharmacy
  {
    resourceType: 'Organization',
    id: uuidv4(),
    name: 'CityCare Pharmacy',
    partOf: {
      reference: `Organization/${mainOrgId}`,
      display: 'CityCare Hospital',
    },
    type: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/organization-type',
            code: 'pharm',
            display: 'Pharmacy',
          },
        ],
      },
    ],
    active: true,
    address: [
      {
        line: ['777 Prescription Lane'],
        city: 'Delhi',
        state: 'Delhi',
        postalCode: '110006',
        country: 'IN',
      },
    ],
    telecom: [
      {
        system: 'phone',
        value: '+91-11-2345-6794',
        use: 'work',
      },
      {
        system: 'email',
        value: 'pharmacy@citycarehospital.com',
        use: 'work',
      },
    ],
  },
];

// 4. Create Questionnaires
const questionnaires = [
  {
    resourceType: 'Questionnaire',
    id: uuidv4(),
    status: 'active',
    title: 'Patient Intake Form',
    description: 'Comprehensive patient intake questionnaire for new admissions',
    subjectType: ['Patient'],
    item: [
      {
        linkId: '1',
        text: 'Personal Information',
        type: 'group',
        item: [
          {
            linkId: '1.1',
            text: 'Date of Birth',
            type: 'date',
            required: true,
          },
          {
            linkId: '1.2',
            text: 'Gender',
            type: 'choice',
            required: true,
            answerOption: [
              { valueCoding: { code: 'male', display: 'Male' } },
              { valueCoding: { code: 'female', display: 'Female' } },
              { valueCoding: { code: 'other', display: 'Other' } },
            ],
          },
          {
            linkId: '1.3',
            text: 'Emergency Contact Name',
            type: 'string',
            required: true,
          },
          {
            linkId: '1.4',
            text: 'Emergency Contact Phone',
            type: 'string',
            required: true,
          },
        ],
      },
      {
        linkId: '2',
        text: 'Medical History',
        type: 'group',
        item: [
          {
            linkId: '2.1',
            text: 'Do you have any known allergies?',
            type: 'boolean',
            required: false,
          },
          {
            linkId: '2.2',
            text: 'If yes, please list your allergies',
            type: 'text',
            enableWhen: [
              {
                question: '2.1',
                operator: '=',
                answerBoolean: true,
              },
            ],
          },
          {
            linkId: '2.3',
            text: 'Current Medications',
            type: 'text',
            required: false,
          },
          {
            linkId: '2.4',
            text: 'Past Surgeries',
            type: 'text',
            required: false,
          },
          {
            linkId: '2.5',
            text: 'Family Medical History',
            type: 'text',
            required: false,
          },
        ],
      },
      {
        linkId: '3',
        text: 'Current Symptoms',
        type: 'group',
        item: [
          {
            linkId: '3.1',
            text: 'Primary Complaint',
            type: 'text',
            required: true,
          },
          {
            linkId: '3.2',
            text: 'Symptom Duration',
            type: 'choice',
            required: false,
            answerOption: [
              { valueCoding: { code: 'acute', display: 'Less than 1 week' } },
              { valueCoding: { code: 'subacute', display: '1-4 weeks' } },
              { valueCoding: { code: 'chronic', display: 'More than 4 weeks' } },
            ],
          },
          {
            linkId: '3.3',
            text: 'Pain Level (1-10)',
            type: 'integer',
            required: false,
          },
        ],
      },
    ],
  },
  {
    resourceType: 'Questionnaire',
    id: uuidv4(),
    status: 'active',
    title: 'Discharge Planning Form',
    description: 'Post-treatment discharge planning and follow-up care questionnaire',
    subjectType: ['Patient'],
    item: [
      {
        linkId: '1',
        text: 'Discharge Information',
        type: 'group',
        item: [
          {
            linkId: '1.1',
            text: 'Discharge Date',
            type: 'date',
            required: true,
          },
          {
            linkId: '1.2',
            text: 'Discharge Disposition',
            type: 'choice',
            required: true,
            answerOption: [
              { valueCoding: { code: 'home', display: 'Home' } },
              { valueCoding: { code: 'home-health', display: 'Home with Home Health' } },
              { valueCoding: { code: 'skilled-nursing', display: 'Skilled Nursing Facility' } },
              { valueCoding: { code: 'rehab', display: 'Rehabilitation Facility' } },
            ],
          },
        ],
      },
      {
        linkId: '2',
        text: 'Medications at Discharge',
        type: 'group',
        item: [
          {
            linkId: '2.1',
            text: 'New Medications Prescribed',
            type: 'text',
            required: false,
          },
          {
            linkId: '2.2',
            text: 'Medication Changes',
            type: 'text',
            required: false,
          },
          {
            linkId: '2.3',
            text: 'Patient understands medication instructions',
            type: 'boolean',
            required: true,
          },
        ],
      },
      {
        linkId: '3',
        text: 'Follow-up Care',
        type: 'group',
        item: [
          {
            linkId: '3.1',
            text: 'Follow-up Appointment Scheduled',
            type: 'boolean',
            required: true,
          },
          {
            linkId: '3.2',
            text: 'Follow-up Date',
            type: 'date',
            enableWhen: [
              {
                question: '3.1',
                operator: '=',
                answerBoolean: true,
              },
            ],
          },
          {
            linkId: '3.3',
            text: 'Special Instructions',
            type: 'text',
            required: false,
          },
          {
            linkId: '3.4',
            text: 'Activity Restrictions',
            type: 'text',
            required: false,
          },
          {
            linkId: '3.5',
            text: 'Dietary Restrictions',
            type: 'text',
            required: false,
          },
        ],
      },
      {
        linkId: '4',
        text: 'Patient Education',
        type: 'group',
        item: [
          {
            linkId: '4.1',
            text: 'Warning Signs to Watch For',
            type: 'text',
            required: false,
          },
          {
            linkId: '4.2',
            text: 'When to Seek Emergency Care',
            type: 'text',
            required: false,
          },
          {
            linkId: '4.3',
            text: 'Patient received discharge instructions',
            type: 'boolean',
            required: true,
          },
        ],
      },
    ],
  },
];

// Write all files
fs.writeFileSync(path.join(mockJsonDir, 'observations.json'), JSON.stringify(observations, null, 2));

fs.writeFileSync(path.join(mockJsonDir, 'coverages.json'), JSON.stringify(coverages, null, 2));

fs.writeFileSync(
  path.join(mockJsonDir, 'organizations.json'),
  JSON.stringify([...organizations, ...newOrganizations], null, 2)
);

fs.writeFileSync(path.join(mockJsonDir, 'diagnosticReports.json'), JSON.stringify(diagnosticReports, null, 2));

fs.writeFileSync(path.join(mockJsonDir, 'serviceRequests.json'), JSON.stringify(serviceRequests, null, 2));

fs.writeFileSync(path.join(mockJsonDir, 'questionnaires.json'), JSON.stringify(questionnaires, null, 2));

console.log('All resources generated successfully!');
