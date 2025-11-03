# Hospital Demo Setup Guide

This guide will help you set up the Hospital Management Demo from scratch with sample data.

## Step-by-Step Setup

### Step 1: Install and Configure (5 minutes)

1. Navigate to the project directory:

   ```bash
   cd examples/medplum-hospital-demo
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create `.env` file from template:

   ```bash
   cp .env.defaults .env
   ```

4. Get your Medplum credentials:
   - Go to [app.medplum.com](https://app.medplum.com)
   - Sign in or create account
   - Create a new project or use existing
   - Get your Client ID and Project ID from project settings

5. Update `.env` with your credentials:
   ```env
   VITE_MEDPLUM_BASE_URL=https://api.medplum.com/
   VITE_MEDPLUM_CLIENT_ID=your_client_id_here
   VITE_MEDPLUM_PROJECT_ID=your_project_id_here
   ```

### Step 2: Start the Application (1 minute)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 3: Sign In

Use your Medplum credentials to sign in.

### Step 4: Create Sample Data (10-15 minutes)

#### A. Create Wards (2-3 minutes)

1. Go to **Ward Management** page
2. Click **"Add New Ward"**
3. Create these wards:

   | Ward Name      | Description          |
   | -------------- | -------------------- |
   | ICU            | Intensive Care Unit  |
   | General Ward 1 | General medical ward |
   | General Ward 2 | General medical ward |
   | Pediatric Ward | Children's ward      |
   | Maternity Ward | Maternity services   |

#### B. Create Beds (5-7 minutes)

1. Go to **Bed Management** page
2. Click **"Add New Bed"**
3. Create at least 20 beds across wards:

   **ICU Beds:**
   - ICU-101, ICU-102, ICU-103, ICU-104

   **General Ward 1:**
   - GW1-201, GW1-202, GW1-203, GW1-204, GW1-205

   **General Ward 2:**
   - GW2-201, GW2-202, GW2-203, GW2-204, GW2-205

   **Pediatric Ward:**
   - PED-301, PED-302, PED-303

   **Maternity Ward:**
   - MAT-401, MAT-402, MAT-403

#### C. Create Services (2-3 minutes)

1. Go to **Services** page
2. Click **"Add Service"**
3. Create these services:

   | Service Name            | Description                    |
   | ----------------------- | ------------------------------ |
   | General Consultation    | General medical consultation   |
   | Cardiology Consultation | Heart and cardiovascular care  |
   | Pediatric Consultation  | Children's healthcare          |
   | Orthopedic Consultation | Bone and joint care            |
   | Laboratory Tests        | Blood tests, urine tests, etc. |
   | X-Ray                   | Radiography imaging            |
   | Ultrasound              | Ultrasound imaging             |
   | CT Scan                 | CT imaging services            |
   | Emergency Services      | Emergency department services  |

#### D. Create Practitioners (Using Medplum App)

Since practitioner creation isn't in the demo UI yet, use the Medplum app:

1. Open [app.medplum.com](https://app.medplum.com) in a new tab
2. Go to your project
3. Click **"Create New"** → **"Practitioner"**
4. Create these practitioners:
   - Dr. John Smith - General Physician
   - Dr. Sarah Johnson - Cardiologist
   - Dr. Michael Brown - Pediatrician
   - Dr. Emily Davis - Orthopedic Surgeon
   - Dr. James Wilson - Emergency Medicine

#### E. Create Patients (Using Medplum App)

1. In [app.medplum.com](https://app.medplum.com)
2. Click **"Create New"** → **"Patient"**
3. Create at least 10 sample patients:

   **Sample Patients:**
   - Homer Simpson (Male, DOB: 1956-05-12)
   - Marge Simpson (Female, DOB: 1956-03-19)
   - Lisa Simpson (Female, DOB: 2014-05-09)
   - Bart Simpson (Male, DOB: 2013-04-01)
   - Peter Griffin (Male, DOB: 1960-09-15)
   - Lois Griffin (Female, DOB: 1963-02-18)
   - Stewie Griffin (Male, DOB: 2021-09-11)
   - Brian Griffin (Male, DOB: 2010-07-14)
   - Eric Cartman (Male, DOB: 2014-01-02)
   - Stan Marsh (Male, DOB: 2013-10-19)

### Step 5: Test the System (10 minutes)

#### Test OPD Workflow:

1. Go to **OPD** page
2. Click **"New OPD Visit"**
3. Select a patient
4. Enter chief complaint: "Fever and cough"
5. Click "Create Visit"
6. Patient should appear in waiting queue
7. Click "Start" to begin consultation
8. Click "Complete" to finish visit

#### Test Appointments:

1. Go to **Appointments** page
2. Click **"Book Appointment"**
3. Select patient and doctor
4. Choose date (today or tomorrow)
5. Select time slot
6. Click "Book Appointment"
7. Test "Check In" and "Complete" buttons

#### Test IPD Workflow:

1. Go to **IPD** page
2. Click **"Admit Patient"**
3. Select patient, bed, and doctor
4. Click "Admit Patient"
5. Patient should appear in admissions list
6. Test **"Transfer"** button:
   - Select new bed
   - Verify bed occupancy updates
7. Test **"Discharge"** button:
   - Enter discharge notes
   - Verify bed is released

#### Test Bed Management:

1. Go to **Bed Management** page
2. Filter by status (Available/Occupied)
3. Click on occupied bed's menu (⋮)
4. Try "Release Bed"
5. Verify bed status changes to "Cleaning"
6. Assign patient to available bed

### Step 6: Verify Dashboard (2 minutes)

1. Go to **Dashboard** page
2. Verify you see:
   - Total patients count
   - Today's appointments
   - OPD visits today
   - Current IPD admissions
   - Bed occupancy percentage
3. All metrics should reflect your sample data

## Expected Results

After setup, you should have:

- ✅ 5 Wards created
- ✅ 20+ Beds across wards
- ✅ 9 Healthcare services
- ✅ 5 Practitioners
- ✅ 10+ Patients
- ✅ 2-3 Active OPD visits
- ✅ 1-2 Booked appointments
- ✅ 1-2 IPD admissions
- ✅ Dashboard showing real data

## Demo Scenarios

### Scenario 1: Emergency Admission

1. **Patient arrives at emergency**: Homer Simpson with chest pain
2. **Create OPD visit** at Emergency
3. **Start consultation** - diagnose acute condition
4. **Admit to ICU**:
   - Go to IPD page
   - Admit patient
   - Select ICU bed
   - Assign cardiologist
5. **Transfer to General Ward** after stabilization:
   - Click Transfer
   - Select General Ward bed
6. **Discharge** when recovered

### Scenario 2: Scheduled Surgery

1. **Book pre-op appointment** for Peter Griffin
2. **Check in** on appointment day
3. **Admit to ward** for surgery
4. **Update status** as surgery progresses
5. **Discharge** post-recovery

### Scenario 3: Pediatric Care

1. **OPD visit** for Lisa Simpson (fever)
2. **Start consultation** with pediatrician
3. **Order tests** (lab work)
4. **Follow-up appointment** scheduled
5. **Complete visit**

### Scenario 4: Bed Management

1. **View bed occupancy** on dashboard
2. **Identify available beds** by ward
3. **Admit patient** to available bed
4. **Transfer patient** between wards
5. **Track cleaning status** after discharge

## Time Estimate

- **Basic Setup**: 5 minutes
- **Sample Data Creation**: 15 minutes
- **Testing**: 10 minutes
- **Total**: ~30 minutes for full setup

## Next Steps

1. **Explore Features**: Try all pages and workflows
2. **Customize**: Add your own wards, services, etc.
3. **Integrate**: Connect with your own systems via FHIR API
4. **Extend**: Add new features as needed

## Troubleshooting

### No data showing on Dashboard?

- Ensure you created sample data
- Check date filters (dashboard shows today's data)
- Verify encounters have proper dates

### Can't assign patient to bed?

- Bed must be "Available" status
- Patient must exist in system
- Check bed isn't already occupied

### Appointments not appearing?

- Appointments must have future or today's date
- Check status filter (default shows all)

## Need Help?

- Check the main [README.md](./README.md)
- Visit [Medplum Docs](https://www.medplum.com/docs)
- Join [Medplum Discord](https://discord.gg/medplum)

---

**Ready to build?** This demo is a starting point. Customize it for your hospital's specific needs!
