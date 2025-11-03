# Medplum Hospital Management Demo

A comprehensive hospital management system demo built on Medplum FHIR platform, featuring OPD, IPD, appointments, bed management, billing, and more.

## Features

### 🏥 Core Hospital Management

- **Dashboard** - Real-time overview of hospital operations with key metrics
- **Patient Management** - Complete patient registration and records
- **Appointments** - Scheduling and appointment management system
- **OPD (Outpatient Department)** - Queue management and outpatient visits
- **IPD (Inpatient Department)** - Admission, discharge, and bed assignments

### 🛏️ Bed & Ward Management

- **Bed Tracking** - Real-time bed availability and occupancy
- **Ward Management** - Multiple wards with capacity monitoring
- **Bed Assignment** - Assign patients to beds with status tracking
- **Bed Transfer** - Transfer patients between beds
- **Cleaning Status** - Track bed cleaning and maintenance

### 💰 Billing & Insurance

- **Claims Management** - Create and manage insurance claims
- **Billing Dashboard** - Track revenue and pending claims
- **Coverage Support** - Insurance coverage integration
- **Invoice Generation** - Create bills for services

### 🩺 Healthcare Services

- **Service Catalog** - Manage hospital services and procedures
- **Service Types** - Categorize and organize services
- **Active/Inactive Status** - Control service availability

## Technology Stack

- **Frontend**: React 18, TypeScript
- **UI Library**: Mantine v7
- **FHIR Platform**: Medplum
- **Routing**: React Router v6
- **Build Tool**: Vite
- **Data Standard**: FHIR R4

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Medplum account (sign up at [app.medplum.com](https://app.medplum.com))

### Installation

1. **Clone the repository** (if not already in the medplum monorepo):

   ```bash
   cd examples/medplum-hospital-demo
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure environment variables**:

   Copy the `.env.defaults` file to `.env`:

   ```bash
   cp .env.defaults .env
   ```

   Update the `.env` file with your Medplum credentials:

   ```env
   VITE_MEDPLUM_BASE_URL=https://api.medplum.com/
   VITE_MEDPLUM_CLIENT_ID=your_client_id_here
   VITE_MEDPLUM_PROJECT_ID=your_project_id_here
   ```

4. **Start the development server**:

   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Initial Setup

### Create Sample Data

To get started quickly, you'll need to create some initial data:

#### 1. Create Wards

- Go to **Ward Management** page
- Click "Add New Ward"
- Create a few wards (e.g., "ICU", "General Ward 1", "Pediatric Ward")

#### 2. Create Beds

- Go to **Bed Management** page
- Click "Add New Bed"
- Create beds for each ward (e.g., "Bed 101", "Bed 102", etc.)
- Optionally link beds to wards by entering the Ward ID

#### 3. Register Patients

- Go to **Patients** page
- Click "Register Patient"
- Add sample patients for testing

#### 4. Create Healthcare Services

- Go to **Services** page
- Click "Add Service"
- Create services like "Consultation", "X-Ray", "Blood Test", etc.

#### 5. Book Appointments

- Go to **Appointments** page
- Click "Book Appointment"
- Schedule appointments for your test patients

## Usage Guide

### OPD Workflow

1. **Create OPD Visit**:
   - Navigate to OPD page
   - Click "New OPD Visit"
   - Select patient and enter chief complaint
   - Patient appears in "Waiting" queue

2. **Start Consultation**:
   - Click "Start" button in the queue
   - Status changes to "In Progress"

3. **Complete Visit**:
   - Click "Complete" when consultation is done
   - Patient moves to completed status

### IPD Workflow

1. **Admit Patient**:
   - Navigate to IPD page
   - Click "Admit Patient"
   - Select patient, bed, and attending physician
   - Creates an inpatient encounter with bed assignment

2. **Transfer Bed**:
   - Click "Transfer" button for a patient
   - Select new available bed
   - System updates bed occupancy automatically

3. **Discharge Patient**:
   - Click "Discharge" button
   - Enter discharge notes
   - Releases the bed and marks it for cleaning

### Bed Management

1. **View Bed Status**:
   - Green badge = Available
   - Red badge = Occupied
   - Yellow badge = Cleaning

2. **Assign Patient to Bed**:
   - Click "Assign Patient" on an available bed
   - Search and select patient
   - Creates IPD encounter automatically

3. **Release Bed**:
   - Use the menu (⋮) on occupied bed
   - Click "Release Bed"
   - Bed status changes to "Cleaning"

### Appointments

1. **Book Appointment**:
   - Click "Book Appointment"
   - Select patient, doctor, date, and time
   - Appointment appears in the list

2. **Check In**:
   - When patient arrives, click "Check In"
   - Status changes to "Arrived"

3. **Complete**:
   - After visit, click "Complete"
   - Status changes to "Fulfilled"

## Project Structure

```
medplum-hospital-demo/
├── src/
│   ├── App.tsx                 # Main app with routing
│   ├── main.tsx                # Entry point
│   ├── components/
│   │   ├── beds/               # Bed management components
│   │   │   ├── BedCard.tsx
│   │   │   └── AssignBedModal.tsx
│   │   ├── ipd/                # IPD workflow components
│   │   │   ├── AdmitPatientModal.tsx
│   │   │   ├── DischargePatientModal.tsx
│   │   │   └── TransferBedModal.tsx
│   │   ├── opd/                # OPD components
│   │   │   └── CreateOPDVisitModal.tsx
│   │   ├── wards/              # Ward management
│   │   │   └── WardCard.tsx
│   │   └── Loading.tsx
│   └── pages/
│       ├── DashboardPage.tsx   # Main dashboard
│       ├── AppointmentsPage.tsx
│       ├── PatientsPage.tsx
│       ├── PatientPage.tsx
│       ├── OPDPage.tsx
│       ├── IPDPage.tsx
│       ├── BedManagementPage.tsx
│       ├── WardManagementPage.tsx
│       ├── BillingPage.tsx
│       ├── ServicesPage.tsx
│       └── SignInPage.tsx
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## FHIR Resources Used

This demo uses the following FHIR R4 resources:

- **Patient** - Patient demographics and information
- **Practitioner** - Healthcare providers/doctors
- **Encounter** - Visits, admissions (both OPD and IPD)
- **Appointment** - Scheduled appointments
- **Location** - Beds and wards (physical locations)
- **HealthcareService** - Available hospital services
- **Claim** - Billing and insurance claims
- **Coverage** - Insurance coverage information
- **ChargeItem** - Individual billable items

## Key Concepts

### Encounter Classifications

- **AMB (Ambulatory)** - Used for OPD visits
- **IMP (Inpatient)** - Used for IPD admissions

### Bed Status Codes (v2-0116)

- **U (Unoccupied)** - Bed is available
- **O (Occupied)** - Bed has a patient
- **C (Cleaning)** - Bed is being cleaned
- **K (Housekeeping)** - Under maintenance

### Location Types

- **bd** - Bed
- **wa** - Ward
- **ro** - Room

## Customization

### Adding New Features

1. Create new components in `src/components/`
2. Add new pages in `src/pages/`
3. Update routing in `src/App.tsx`
4. Add navigation items in the AppShell navbar

### Styling

The app uses Mantine v7 for UI components. Customize theme in `src/main.tsx`:

```typescript
<MantineProvider theme={{ colorScheme: 'light', primaryColor: 'blue' }}>
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests

### Building for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## Troubleshooting

### Common Issues

1. **Authentication Errors**:
   - Verify your `.env` file has correct Medplum credentials
   - Ensure your Medplum project is active

2. **Bed Assignment Fails**:
   - Check that beds have proper status (active)
   - Verify Location resources are created correctly

3. **Empty Dashboard**:
   - Create sample data (patients, appointments, beds)
   - Ensure date filters are not excluding data

### Getting Help

- [Medplum Documentation](https://www.medplum.com/docs)
- [Medplum Discord](https://discord.gg/medplum)
- [FHIR Specification](https://hl7.org/fhir/R4/)

## Contributing

This is a demo application. For production use:

1. Add proper error handling
2. Implement audit logging
3. Add data validation
4. Enhance security measures
5. Add comprehensive testing
6. Implement role-based access control

## License

Apache 2.0

Copyright © Medplum 2025

## About Medplum

[Medplum](https://www.medplum.com/) is an open-source, API-first EHR. Medplum makes it easy to build healthcare apps quickly with less code.

- Read our [documentation](https://www.medplum.com/docs)
- Browse our [react component library](https://storybook.medplum.com/)
- Join our [Discord](https://discord.gg/medplum)
