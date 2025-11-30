# Customizing Practitioner Qualification Codes

This guide explains how to customize the qualification codes dropdown that appears when adding/editing a Practitioner's qualifications.

## Current Situation

By default, Medplum uses the HL7 v2-0360 code system which includes many codes (AA, AAS, ABA, MD, DO, RN, etc.) from the `v2-tables.json` file.

## Solution: Create Custom ValueSet and Profile

To customize the qualification codes, you need to:

1. **Create a custom ValueSet** with only the codes you want
2. **Create a StructureDefinition (Profile)** that binds Practitioner.qualification.code to your custom ValueSet
3. **Upload both resources** to your Medplum server

## Step-by-Step Instructions

### Step 1: Customize the ValueSet

Edit `custom-practitioner-qualification-valueset.json` and modify the `concept` array to include only the codes you want:

```json
{
  "resourceType": "ValueSet",
  "url": "http://your-organization.com/ValueSet/practitioner-qualification-codes",
  "compose": {
    "include": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/v2-0360",
        "concept": [
          {
            "code": "MD",
            "display": "Doctor of Medicine"
          },
          {
            "code": "RN",
            "display": "Registered Nurse"
          }
          // Add only the codes you want here
        ]
      }
    ]
  }
}
```

**OR** create your own CodeSystem with custom codes:

```json
{
  "resourceType": "CodeSystem",
  "url": "http://your-organization.com/CodeSystem/qualification-codes",
  "name": "CustomQualificationCodes",
  "status": "active",
  "content": "complete",
  "concept": [
    {
      "code": "CUSTOM1",
      "display": "Custom Qualification 1"
    },
    {
      "code": "CUSTOM2",
      "display": "Custom Qualification 2"
    }
  ]
}
```

Then reference it in your ValueSet:

```json
{
  "resourceType": "ValueSet",
  "url": "http://your-organization.com/ValueSet/practitioner-qualification-codes",
  "compose": {
    "include": [
      {
        "system": "http://your-organization.com/CodeSystem/qualification-codes"
      }
    ]
  }
}
```

### Step 2: Update the Profile

Edit `custom-practitioner-profile.json` and ensure the `valueSet` URL matches your ValueSet URL:

```json
{
  "binding": {
    "strength": "required",
    "valueSet": "http://your-organization.com/ValueSet/practitioner-qualification-codes"
  }
}
```

### Step 3: Upload to Medplum

1. Go to your Medplum server
2. Navigate to **ValueSet** and create/upload your custom ValueSet
3. Navigate to **StructureDefinition** and create/upload your custom Profile
4. Make sure the URLs match exactly

### Step 4: Use the Profile

When creating or editing a Practitioner:
- The system should automatically use your custom Profile if it's set as the default
- Or you can explicitly select your Profile when creating a Practitioner

## Alternative: Direct Binding in Forms

If you're using custom forms, you can directly bind the CodeInput component:

```tsx
import { CodeableConceptInput } from '@medplum/react';

<CodeableConceptInput
  name="qualification-code"
  binding="http://your-organization.com/ValueSet/practitioner-qualification-codes"
  onChange={(value) => {
    // Handle change
  }}
/>
```

## Notes

- The ValueSet URL must be unique and match exactly in the Profile binding
- Both resources must be uploaded to your Medplum server
- The CodeSystem referenced in the ValueSet must exist (either the HL7 v2-0360 system or your custom one)
- After uploading, the dropdown should show only your custom codes

