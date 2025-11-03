# How to Get Medplum Credentials

## Quick Start (5 Minutes)

### Step 1: Create Medplum Account

1. Go to **[https://app.medplum.com](https://app.medplum.com)**
2. Click **"Sign Up"** or **"Register"**
3. Fill in your details:
   - Email address
   - Password
   - First name / Last name
4. Verify your email

### Step 2: Create a Project

1. After signing in, you'll see the Projects page
2. Click **"Create New Project"** or use the default project
3. Give it a name: `Hospital Demo` or `My Hospital`
4. Click **"Create"**

### Step 3: Get Your Project ID

1. In the Medplum app, go to **"Project"** → **"Settings"**
2. Look for **"Project ID"**
3. Copy the UUID (looks like: `a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6`)
4. Save it somewhere safe

### Step 4: Create a Client Application

1. In Project Settings, scroll to **"Client Applications"**
2. Click **"+ New Client Application"**
3. Fill in:
   - **Name**: `Hospital Demo App`
   - **Description**: `Main hospital management application`
   - **Redirect URI**: `http://localhost:3000`
4. Click **"Create"**
5. Copy the **Client ID** (another UUID)

### Step 5: Add to .env File

1. Navigate to your project:

   ```bash
   cd /Users/apple/Desktop/fibo/medplum/examples/medplum-hospital-demo
   ```

2. Copy the template:

   ```bash
   cp .env.defaults .env
   ```

3. Edit `.env` file:

   ```bash
   nano .env  # or use your preferred editor
   ```

4. Add your credentials:

   ```env
   VITE_MEDPLUM_BASE_URL=https://api.medplum.com/
   VITE_MEDPLUM_CLIENT_ID=your-client-id-here
   VITE_MEDPLUM_PROJECT_ID=your-project-id-here
   ```

5. Save and exit

### Step 6: Start the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with your Medplum credentials!

---

## Detailed Walkthrough (With Screenshots Description)

### Creating Your Medplum Account

**What You'll See:**

1. Registration form with email, password fields
2. Email verification link sent to your inbox
3. Click the link to activate your account

**Pro Tips:**

- Use a real email you have access to
- Choose a strong password (required for healthcare data)
- Keep your credentials safe - you're handling health data!

---

### Understanding Medplum Projects

**What is a Project?**

- A Project is like a tenant/organization in Medplum
- All your data (patients, appointments, etc.) belongs to a project
- You can have multiple projects (dev, staging, production)
- Each project is completely isolated

**For This Demo:**

- One project is enough
- You can use the default project or create a new one
- Name it something memorable like "Hospital Demo"

---

### Finding Your Credentials

#### Finding Project ID:

**Navigation:**

```
Medplum App
  └─ Sign In
     └─ Projects (left sidebar)
        └─ Click your project
           └─ Project (top menu)
              └─ Settings
                 └─ General tab
                    └─ Project ID (copy this!)
```

**What it looks like:**

```
Project ID: a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6
```

#### Creating Client ID:

**Navigation:**

```
Medplum App
  └─ Project → Settings
     └─ Client Applications section
        └─ + New Client Application
           └─ Fill form:
              Name: Hospital Demo App
              Description: Main app
              Redirect URI: http://localhost:3000
           └─ Create
              └─ Copy the Client ID shown
```

**Important Settings:**

- **Redirect URI**: MUST be `http://localhost:3000` for local development
- **Access Policy**: Default is fine for demo
- **PKCE**: Enabled by default (secure)

---

## Troubleshooting Credentials

### "Invalid credentials" Error

**Check:**

1. Is your Client ID correct? (It's a UUID, not your email)
2. Is your Project ID correct?
3. Did you verify your email?
4. Are you using the right Medplum account to sign in?

**Solution:**

- Go back to app.medplum.com
- Verify you can sign in there
- Re-copy the credentials from Project Settings
- Make sure there are no extra spaces in `.env` file

### "Redirect URI mismatch" Error

**Problem:** Your redirect URI doesn't match

**Solution:**

1. Go to Project Settings → Client Applications
2. Click on your client app
3. Make sure Redirect URI is exactly: `http://localhost:3000`
4. No trailing slash, no https, just http://localhost:3000

### "Project not found" Error

**Problem:** Project ID is wrong or you don't have access

**Solution:**

1. Double-check Project ID in Project Settings
2. Make sure you're logged into the right Medplum account
3. Verify the project still exists

---

## Using Multiple Environments

### Development Setup:

```env
# .env.development
VITE_MEDPLUM_BASE_URL=https://api.medplum.com/
VITE_MEDPLUM_CLIENT_ID=dev-client-id-here
VITE_MEDPLUM_PROJECT_ID=dev-project-id-here
```

### Production Setup:

```env
# .env.production
VITE_MEDPLUM_BASE_URL=https://api.medplum.com/
VITE_MEDPLUM_CLIENT_ID=prod-client-id-here
VITE_MEDPLUM_PROJECT_ID=prod-project-id-here
```

**Best Practice:**

- Use different projects for dev/staging/prod
- Never commit `.env` files to git
- Keep production credentials secure
- Rotate credentials regularly

---

## Security Best Practices

### DO:

- ✅ Keep `.env` files in `.gitignore`
- ✅ Use different credentials per environment
- ✅ Rotate credentials if exposed
- ✅ Use HTTPS in production
- ✅ Enable two-factor authentication on Medplum

### DON'T:

- ❌ Commit credentials to git
- ❌ Share credentials via email/chat
- ❌ Use production credentials for testing
- ❌ Hardcode credentials in source files
- ❌ Use same credentials across environments

---

## Commercial Use Credentials

### For Development/Testing:

- Free Medplum cloud account is fine
- Good for demos and development
- Includes API access, storage, authentication

### For Production/Commercial Use:

1. **Option A: Medplum Cloud (Hosted)**
   - Sign up for paid plan at [medplum.com/pricing](https://www.medplum.com/pricing)
   - Get production-grade infrastructure
   - Includes support, SLAs, compliance

2. **Option B: Self-Hosted**
   - Deploy your own Medplum server
   - Full control over data and infrastructure
   - See [medplum.com/docs/self-hosting](https://www.medplum.com/docs/self-hosting)
   - Apache 2.0 license allows commercial use

**For this demo:**

- Free account is perfectly fine
- Test all features without limitations
- Upgrade when ready for production

---

## FAQ

### Q: Do I need a credit card?

**A:** No, Medplum free tier doesn't require a credit card for testing.

### Q: How long do credentials last?

**A:** Forever, until you delete them or rotate them manually.

### Q: Can I use the same credentials on multiple machines?

**A:** Yes, the same Client ID works on any machine (for development).

### Q: What if I lose my Client ID?

**A:** You can find it in Project Settings → Client Applications, or create a new one.

### Q: Can I have multiple Client IDs?

**A:** Yes! You can create multiple client applications for different purposes.

### Q: Is my data safe?

**A:** Yes, Medplum is HIPAA-compliant and follows healthcare security standards.

### Q: What's the difference between Client ID and Project ID?

**A:**

- **Project ID**: Which "tenant" your data belongs to
- **Client ID**: Which application is accessing the project

### Q: Can I use Medplum for real patient data?

**A:** Yes, but sign a Business Associate Agreement (BAA) with Medplum first for HIPAA compliance.

---

## Next Steps After Getting Credentials

1. ✅ Add credentials to `.env` file
2. ✅ Start the app: `npm run dev`
3. ✅ Sign in with your Medplum account
4. ✅ Follow [SETUP_GUIDE.md](./SETUP_GUIDE.md) to create sample data
5. ✅ Test all the features
6. 🚀 Start building your hospital management system!

---

## Support

**Need Help?**

- 📖 [Medplum Documentation](https://www.medplum.com/docs)
- 💬 [Medplum Discord](https://discord.gg/medplum)
- 🐛 [GitHub Issues](https://github.com/medplum/medplum/issues)
- 📧 [Email Support](mailto:hello@medplum.com)

**Quick Links:**

- Create Account: https://app.medplum.com/register
- Documentation: https://www.medplum.com/docs/tutorials/register
- Pricing: https://www.medplum.com/pricing
- Self-Hosting: https://www.medplum.com/docs/self-hosting
