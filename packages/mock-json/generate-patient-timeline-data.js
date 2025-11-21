#!/usr/bin/env node
/* eslint-disable */
/* eslint-env node */
/**
 * Comprehensive script to generate patient timeline data
 * - Links appointments to encounters
 * - Creates conditions (diagnosis/problems)
 * - Creates procedures linked to encounters
 * - Creates observations (vitals, lab values) linked to encounters
 * - Links diagnostic reports to encounters
 * - Links service requests to encounters
 * - Creates medication requests linked to encounters
 * - Ensures all resources are properly connected
 */
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const mockJsonDir = __dirname;

// Read existing files
const patients = JSON.parse(fs.readFileSync(path.join(mockJsonDir, 'patients.json'), 'utf8'));
const practitioners = JSON.parse(fs.readFileSync(path.join(mockJsonDir, 'practitioners.json'), 'utf8'));
const locations = JSON.parse(fs.readFileSync(path.join(mockJsonDir, 'locations.json'), 'utf8'));
const organizations = JSON.parse(fs.readFileSync(path.join(mockJsonDir, 'organizations.json'), 'utf8'));
const appointments = JSON.parse(fs.readFileSync(path.join(mockJsonDir, 'appointments.json'), 'utf8'));
const encounters = JSON.parse(fs.readFileSync(path.join(mockJsonDir, 'encounters.json'), 'utf8'));
const observations = JSON.parse(fs.readFileSync(path.join(mockJsonDir, 'observations.json'), 'utf8'));
const diagnosticReports = JSON.parse(fs.readFileSync(path.join(mockJsonDir, 'diagnosticReports.json'), 'utf8'));
const serviceRequests = JSON.parse(fs.readFileSync(path.join(mockJsonDir, 'serviceRequests.json'), 'utf8'));
const medicationRequests = JSON.parse(fs.readFileSync(path.join(mockJsonDir, 'medicationRequests.json'), 'utf8'));

// Common conditions/diagnosis
const CONDITIONS = [
  { code: '38341003', display: 'Hypertensive disorder', text: 'Hypertension' },
  { code: '44054006', display: 'Diabetes mellitus type 2', text: 'Type 2 Diabetes' },
  { code: '195967001', display: 'Asthma', text: 'Asthma' },
  { code: '235595009', display: 'Gastritis', text: 'Gastritis' },
  { code: '161891005', display: 'Low back pain', text: 'Low back pain' },
  { code: '73211009', display: 'Diabetes mellitus', text: 'Diabetes' },
  { code: '49601007', display: 'Essential hypertension', text: 'Essential Hypertension' },
  { code: '13645005', display: 'Chronic obstructive lung disease', text: 'COPD' },
  { code: '195080001', display: 'Osteoarthritis', text: 'Osteoarthritis' },
  { code: '16114001', display: 'Depressive disorder', text: 'Depression' },
  { code: '35489007', display: 'Anxiety disorder', text: 'Anxiety' },
  { code: '197480006', display: 'Hyperlipidemia', text: 'Hyperlipidemia' },
  { code: '414915002', display: 'Obesity', text: 'Obesity' },
  { code: '72892002', display: 'Anemia', text: 'Anemia' },
  { code: '363418001', display: 'Hypothyroidism', text: 'Hypothyroidism' },
];

// Common procedures
const PROCEDURES = [
  { code: '301095005', display: 'Electrocardiogram', text: 'ECG performed' },
  { code: '71651007', display: 'X-Ray', text: 'X-Ray done' },
  { code: '410528000', display: 'Nebulization therapy', text: 'Nebulization' },
  { code: '387713003', display: 'Wound dressing', text: 'Dressing change' },
  { code: '113091000', display: 'Magnetic resonance imaging of brain', text: 'MRI Brain' },
  { code: '241615005', display: 'Blood pressure measurement', text: 'Blood Pressure Check' },
  { code: '399208008', display: 'Urinalysis', text: 'Urine Test' },
  { code: '168499009', display: 'Physical examination', text: 'Physical Exam' },
  { code: '410528000', display: 'Vaccination', text: 'Vaccination' },
  { code: '443253003', display: 'Ultrasound scan', text: 'Ultrasound' },
];

// Vitals observations
const VITALS = [
  {
    code: '85354-9',
    display: 'Blood pressure panel',
    text: 'Blood Pressure',
    components: [
      { code: '8480-6', display: 'Systolic blood pressure', unit: 'mm[Hg]', normalRange: [90, 140] },
      { code: '8462-4', display: 'Diastolic blood pressure', unit: 'mm[Hg]', normalRange: [60, 90] },
    ],
  },
  { code: '8867-4', display: 'Heart rate', text: 'Heart Rate', unit: '/min', normalRange: [60, 100] },
  { code: '9279-1', display: 'Respiratory rate', text: 'Respiratory Rate', unit: '/min', normalRange: [12, 20] },
  { code: '8310-5', display: 'Body temperature', text: 'Temperature', unit: 'Cel', normalRange: [36.1, 37.2] },
  { code: '8302-2', display: 'Body height', text: 'Height', unit: 'cm', normalRange: [150, 200] },
  { code: '29463-7', display: 'Body weight', text: 'Weight', unit: 'kg', normalRange: [50, 120] },
  { code: '39156-5', display: 'Body mass index', text: 'BMI', unit: 'kg/m2', normalRange: [18.5, 25] },
  {
    code: '2708-6',
    display: 'Oxygen saturation in Arterial blood',
    text: 'O2 Saturation',
    unit: '%',
    normalRange: [95, 100],
  },
];

// Lab observations
const LAB_TESTS = [
  {
    code: '718-7',
    display: 'Hemoglobin [Mass/volume] in Blood',
    text: 'Hemoglobin',
    unit: 'g/dL',
    normalRange: [12, 17],
  },
  {
    code: '777-3',
    display: 'Platelets [#/volume] in Blood',
    text: 'Platelet Count',
    unit: '10*3/uL',
    normalRange: [150, 450],
  },
  { code: '6690-2', display: 'White Blood Cell Count', text: 'WBC', unit: '10*3/uL', normalRange: [4, 11] },
  {
    code: '2339-0',
    display: 'Glucose [Mass/volume] in Blood',
    text: 'Blood Glucose',
    unit: 'mg/dL',
    normalRange: [70, 100],
  },
  {
    code: '2160-0',
    display: 'Creatinine [Mass/volume] in Serum or Plasma',
    text: 'Creatinine',
    unit: 'mg/dL',
    normalRange: [0.6, 1.2],
  },
  {
    code: '26449-9',
    display: 'Hemoglobin A1c/Hemoglobin.total in Blood',
    text: 'HbA1c',
    unit: '%',
    normalRange: [4, 6],
  },
  {
    code: '2093-3',
    display: 'Cholesterol [Mass/volume] in Serum or Plasma',
    text: 'Total Cholesterol',
    unit: 'mg/dL',
    normalRange: [0, 200],
  },
];

// Common medications
const MEDICATIONS = [
  { code: '197806', display: 'Lisinopril 10 MG Oral Tablet', text: 'Lisinopril 10mg' },
  { code: '197884', display: 'Metformin 500 MG Oral Tablet', text: 'Metformin 500mg' },
  { code: '198440', display: 'Atorvastatin 20 MG Oral Tablet', text: 'Atorvastatin 20mg' },
  { code: '197808', display: 'Amlodipine 5 MG Oral Tablet', text: 'Amlodipine 5mg' },
  { code: '197808', display: 'Albuterol 90 MCG/ACTUAT Inhalant Solution', text: 'Albuterol Inhaler' },
  { code: '197808', display: 'Omeprazole 20 MG Oral Capsule', text: 'Omeprazole 20mg' },
  { code: '197808', display: 'Ibuprofen 200 MG Oral Tablet', text: 'Ibuprofen 200mg' },
  { code: '197808', display: 'Levothyroxine 50 MCG Oral Tablet', text: 'Levothyroxine 50mcg' },
];

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomItems(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomValueInRange(min, max) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

// Get all patient IDs
const patientIds = patients.map((p) => p.id);
const practitionerIds = practitioners.map((p) => p.id);
const locationIds = locations.map((l) => l.id);
const orgId = organizations[0]?.id || '34c95d53-17b0-4985-855e-5db90d67c161';

// Create a map of patient to their encounters
const patientEncountersMap = new Map();
encounters.forEach((encounter) => {
  const patientRef = encounter.subject?.reference;
  if (patientRef) {
    const patientId = patientRef.replace('Patient/', '');
    if (!patientEncountersMap.has(patientId)) {
      patientEncountersMap.set(patientId, []);
    }
    patientEncountersMap.get(patientId).push(encounter);
  }
});

// Create a map of appointments to link to encounters
const appointmentEncounterMap = new Map();
appointments.forEach((appointment) => {
  const patientParticipant = appointment.participant?.find((p) => p.actor?.reference?.startsWith('Patient/'));
  if (patientParticipant) {
    const patientId = patientParticipant.actor.reference.replace('Patient/', '');
    const encounters = patientEncountersMap.get(patientId) || [];
    if (encounters.length > 0) {
      // Link appointment to a random encounter for the same patient
      const encounter = getRandomItem(encounters);
      appointmentEncounterMap.set(appointment.id, encounter.id);
      // Add appointment reference to encounter
      if (!encounter.appointment) {
        encounter.appointment = [{ reference: `Appointment/${appointment.id}` }];
      }
    }
  }
});

// Generate Conditions for each patient
const conditions = [];
patients.forEach((patient) => {
  // Each patient gets 1-3 conditions
  const numConditions = Math.floor(Math.random() * 3) + 1;
  const patientConditions = getRandomItems(CONDITIONS, numConditions);

  patientConditions.forEach((conditionData) => {
    // Random date in the past 2 years
    const onsetDate = randomDate(new Date(Date.now() - 730 * 24 * 60 * 60 * 1000), new Date());
    const status = Math.random() > 0.3 ? 'active' : 'resolved'; // 70% active, 30% resolved

    conditions.push({
      resourceType: 'Condition',
      id: uuidv4(),
      clinicalStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: status,
            display: status === 'active' ? 'Active' : 'Resolved',
          },
        ],
      },
      verificationStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
            code: 'confirmed',
            display: 'Confirmed',
          },
        ],
      },
      category: [
        {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '55607006',
              display: 'Problem',
            },
          ],
        },
      ],
      code: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: conditionData.code,
            display: conditionData.display,
          },
        ],
        text: conditionData.text,
      },
      subject: {
        reference: `Patient/${patient.id}`,
      },
      onsetDateTime: onsetDate.toISOString(),
      recordedDate: onsetDate.toISOString(),
      recorder: {
        reference: `Practitioner/${getRandomItem(practitionerIds)}`,
      },
    });
  });
});

// Generate Procedures linked to encounters
const procedures = [];
encounters.forEach((encounter) => {
  // 30% chance of having a procedure during an encounter
  if (Math.random() > 0.7) {
    const procedureData = getRandomItem(PROCEDURES);
    const encounterStart = new Date(encounter.period?.start || new Date());
    const procedureDate = randomDate(encounterStart, new Date(encounterStart.getTime() + 2 * 60 * 60 * 1000));

    procedures.push({
      resourceType: 'Procedure',
      id: uuidv4(),
      status: 'completed',
      code: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: procedureData.code,
            display: procedureData.display,
          },
        ],
        text: procedureData.text,
      },
      subject: encounter.subject,
      encounter: {
        reference: `Encounter/${encounter.id}`,
      },
      performedDateTime: procedureDate.toISOString(),
      performer: [
        {
          actor: {
            reference: `Practitioner/${getRandomItem(practitionerIds)}`,
          },
        },
      ],
      location: encounter.location?.[0]?.location,
    });
  }
});

// Generate Vitals Observations linked to encounters
const vitalsObservations = [];
encounters.forEach((encounter) => {
  // Each encounter gets 2-4 vital signs
  const numVitals = Math.floor(Math.random() * 3) + 2;
  const selectedVitals = getRandomItems(VITALS, numVitals);
  const encounterStart = new Date(encounter.period?.start || new Date());

  selectedVitals.forEach((vital) => {
    if (vital.components) {
      // Blood pressure has components
      vital.components.forEach((component) => {
        const value = parseFloat(randomValueInRange(component.normalRange[0] * 0.9, component.normalRange[1] * 1.1));
        vitalsObservations.push({
          resourceType: 'Observation',
          id: uuidv4(),
          status: 'final',
          category: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                  code: 'vital-signs',
                  display: 'Vital Signs',
                },
              ],
            },
          ],
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: component.code,
                display: component.display,
              },
            ],
            text: component.display,
          },
          subject: encounter.subject,
          encounter: {
            reference: `Encounter/${encounter.id}`,
          },
          effectiveDateTime: randomDate(
            encounterStart,
            new Date(encounterStart.getTime() + 60 * 60 * 1000)
          ).toISOString(),
          valueQuantity: {
            value: value.toString(),
            unit: component.unit,
            system: 'http://unitsofmeasure.org',
            code: component.unit,
          },
          interpretation: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
                  code: value >= component.normalRange[0] && value <= component.normalRange[1] ? 'N' : 'H',
                  display: value >= component.normalRange[0] && value <= component.normalRange[1] ? 'Normal' : 'High',
                },
              ],
            },
          ],
        });
      });
    } else {
      // Single value vital
      const value = parseFloat(randomValueInRange(vital.normalRange[0] * 0.9, vital.normalRange[1] * 1.1));
      vitalsObservations.push({
        resourceType: 'Observation',
        id: uuidv4(),
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: vital.code,
              display: vital.display,
            },
          ],
          text: vital.text,
        },
        subject: encounter.subject,
        encounter: {
          reference: `Encounter/${encounter.id}`,
        },
        effectiveDateTime: randomDate(
          encounterStart,
          new Date(encounterStart.getTime() + 60 * 60 * 1000)
        ).toISOString(),
        valueQuantity: {
          value: value.toString(),
          unit: vital.unit,
          system: 'http://unitsofmeasure.org',
          code: vital.unit,
        },
        interpretation: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
                code: value >= vital.normalRange[0] && value <= vital.normalRange[1] ? 'N' : 'H',
                display: value >= vital.normalRange[0] && value <= vital.normalRange[1] ? 'Normal' : 'High',
              },
            ],
          },
        ],
      });
    }
  });
});

// Generate Lab Observations linked to encounters
const labObservations = [];
encounters.forEach((encounter) => {
  // 40% chance of having lab tests during an encounter
  if (Math.random() > 0.6) {
    const numLabs = Math.floor(Math.random() * 3) + 1;
    const selectedLabs = getRandomItems(LAB_TESTS, numLabs);
    const encounterStart = new Date(encounter.period?.start || new Date());

    selectedLabs.forEach((lab) => {
      const value = parseFloat(randomValueInRange(lab.normalRange[0] * 0.8, lab.normalRange[1] * 1.2));
      labObservations.push({
        resourceType: 'Observation',
        id: uuidv4(),
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'laboratory',
                display: 'Laboratory',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: lab.code,
              display: lab.display,
            },
          ],
          text: lab.text,
        },
        subject: encounter.subject,
        encounter: {
          reference: `Encounter/${encounter.id}`,
        },
        effectiveDateTime: randomDate(
          encounterStart,
          new Date(encounterStart.getTime() + 24 * 60 * 60 * 1000)
        ).toISOString(),
        valueQuantity: {
          value: value.toString(),
          unit: lab.unit,
          system: 'http://unitsofmeasure.org',
          code: lab.unit,
        },
        interpretation: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
                code:
                  value >= lab.normalRange[0] && value <= lab.normalRange[1]
                    ? 'N'
                    : value > lab.normalRange[1]
                      ? 'H'
                      : 'L',
                display:
                  value >= lab.normalRange[0] && value <= lab.normalRange[1]
                    ? 'Normal'
                    : value > lab.normalRange[1]
                      ? 'High'
                      : 'Low',
              },
            ],
          },
        ],
      });
    });
  }
});

// Link existing observations to encounters where possible
observations.forEach((observation) => {
  const patientRef = observation.subject?.reference;
  if (patientRef) {
    const patientId = patientRef.replace('Patient/', '');
    const encounters = patientEncountersMap.get(patientId) || [];
    if (encounters.length > 0 && !observation.encounter) {
      // Link to a random encounter for the same patient
      const encounter = getRandomItem(encounters);
      observation.encounter = {
        reference: `Encounter/${encounter.id}`,
      };
    }
  }
});

// Link diagnostic reports to encounters
diagnosticReports.forEach((report) => {
  const patientRef = report.subject?.reference;
  if (patientRef) {
    const patientId = patientRef.replace('Patient/', '');
    const encounters = patientEncountersMap.get(patientId) || [];
    if (encounters.length > 0 && !report.encounter) {
      // Find encounter closest to report date
      const reportDate = new Date(report.effectiveDateTime || new Date());
      let closestEncounter = encounters[0];
      let minDiff = Math.abs(new Date(closestEncounter.period?.start || 0).getTime() - reportDate.getTime());

      encounters.forEach((enc) => {
        const diff = Math.abs(new Date(enc.period?.start || 0).getTime() - reportDate.getTime());
        if (diff < minDiff) {
          minDiff = diff;
          closestEncounter = enc;
        }
      });

      report.encounter = {
        reference: `Encounter/${closestEncounter.id}`,
      };
    }
  }
});

// Link service requests to encounters
serviceRequests.forEach((request) => {
  const patientRef = request.subject?.reference;
  if (patientRef) {
    const patientId = patientRef.replace('Patient/', '');
    const encounters = patientEncountersMap.get(patientId) || [];
    if (encounters.length > 0 && !request.encounter) {
      // Find encounter closest to request date
      const requestDate = new Date(request.authoredOn || new Date());
      let closestEncounter = encounters[0];
      let minDiff = Math.abs(new Date(closestEncounter.period?.start || 0).getTime() - requestDate.getTime());

      encounters.forEach((enc) => {
        const diff = Math.abs(new Date(enc.period?.start || 0).getTime() - requestDate.getTime());
        if (diff < minDiff) {
          minDiff = diff;
          closestEncounter = enc;
        }
      });

      request.encounter = {
        reference: `Encounter/${closestEncounter.id}`,
      };
    }
  }
});

// Link medication requests to encounters and add more
const newMedicationRequests = [];
encounters.forEach((encounter) => {
  // 50% chance of prescribing medication during encounter
  if (Math.random() > 0.5) {
    const medication = getRandomItem(MEDICATIONS);
    const encounterStart = new Date(encounter.period?.start || new Date());

    newMedicationRequests.push({
      resourceType: 'MedicationRequest',
      id: uuidv4(),
      status: Math.random() > 0.2 ? 'active' : 'completed',
      intent: 'order',
      subject: encounter.subject,
      encounter: {
        reference: `Encounter/${encounter.id}`,
      },
      medicationCodeableConcept: {
        coding: [
          {
            system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
            code: medication.code,
            display: medication.display,
          },
        ],
        text: medication.text,
      },
      authoredOn: encounterStart.toISOString(),
      requester: {
        reference: `Practitioner/${getRandomItem(practitionerIds)}`,
      },
      dosageInstruction: [
        {
          text: 'Take as directed',
          timing: {
            repeat: {
              frequency: 1,
              period: 1,
              periodUnit: 'd',
            },
          },
          route: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '26643006',
                display: 'Oral route',
              },
            ],
          },
        },
      ],
    });
  }
});

// Link existing medication requests to encounters
medicationRequests.forEach((request) => {
  const patientRef = request.subject?.reference;
  if (patientRef) {
    const patientId = patientRef.replace('Patient/', '');
    const encounters = patientEncountersMap.get(patientId) || [];
    if (encounters.length > 0 && !request.encounter) {
      const encounter = getRandomItem(encounters);
      request.encounter = {
        reference: `Encounter/${encounter.id}`,
      };
    }
  }
});

// Add conditions to encounter diagnosis
encounters.forEach((encounter) => {
  const patientRef = encounter.subject?.reference;
  if (patientRef) {
    const patientId = patientRef.replace('Patient/', '');
    const patientConditions = conditions.filter((c) => c.subject?.reference === `Patient/${patientId}`);

    if (patientConditions.length > 0 && !encounter.diagnosis) {
      // Add 1-2 conditions as diagnosis for this encounter
      const encounterConditions = getRandomItems(patientConditions, Math.min(2, patientConditions.length));
      encounter.diagnosis = encounterConditions.map((condition) => ({
        condition: {
          reference: `Condition/${condition.id}`,
        },
        use: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/diagnosis-role',
              code: 'AD',
              display: 'Admission diagnosis',
            },
          ],
        },
      }));
    }
  }
});

// Write all updated files
fs.writeFileSync(path.join(mockJsonDir, 'appointments.json'), JSON.stringify(appointments, null, 2));
fs.writeFileSync(path.join(mockJsonDir, 'encounters.json'), JSON.stringify(encounters, null, 2));
fs.writeFileSync(
  path.join(mockJsonDir, 'observations.json'),
  JSON.stringify([...observations, ...vitalsObservations, ...labObservations], null, 2)
);
fs.writeFileSync(path.join(mockJsonDir, 'diagnosticReports.json'), JSON.stringify(diagnosticReports, null, 2));
fs.writeFileSync(path.join(mockJsonDir, 'serviceRequests.json'), JSON.stringify(serviceRequests, null, 2));
fs.writeFileSync(
  path.join(mockJsonDir, 'medicationRequests.json'),
  JSON.stringify([...medicationRequests, ...newMedicationRequests], null, 2)
);

// Write new files
fs.writeFileSync(path.join(mockJsonDir, 'conditions.json'), JSON.stringify(conditions, null, 2));
fs.writeFileSync(path.join(mockJsonDir, 'procedures.json'), JSON.stringify(procedures, null, 2));

console.log('✅ Generated patient timeline data:');
console.log(`   - ${conditions.length} Conditions (diagnosis/problems)`);
console.log(`   - ${procedures.length} Procedures`);
console.log(`   - ${vitalsObservations.length} Vital Signs Observations`);
console.log(`   - ${labObservations.length} Lab Observations`);
console.log(`   - ${newMedicationRequests.length} new Medication Requests`);
console.log('✅ Linked resources:');
console.log('   - Appointments → Encounters');
console.log('   - Observations → Encounters');
console.log('   - Diagnostic Reports → Encounters');
console.log('   - Service Requests → Encounters');
console.log('   - Medication Requests → Encounters');
console.log('   - Conditions → Encounters (as diagnosis)');
console.log('   - Procedures → Encounters');
console.log('✅ All resources are now properly connected for patient timeline!');
