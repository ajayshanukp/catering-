# Firebase Production Setup & Deployment Guide

This guide provides complete step-by-step instructions to connect your **Catering Workforce Management** web application to your live **Google Firebase** backend.

---

## 1. Create Your Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **"Add project"** (or **"Create a project"**).
3. Enter your project name (for example, `catering-workforce-app`).
4. (Optional) Enable Google Analytics according to your preference, then click **Create project**.

---

## 2. Configure Phone Authentication

The application uses SMS one-time passwords (OTP) and reCAPTCHA for mobile phone logins.

1. In the left navigation menu, click **Build** > **Authentication**.
2. Click **Get Started**.
3. On the **Sign-in method** tab, click **Phone** in the list of providers.
4. Toggle the **Enable** switch to **ON**.

### A. Add Phone Numbers for Testing (Crucial for Testing Without SMS Costs)
Under **Phone numbers for testing**:
1. Add your mobile number or a test number (e.g. `+91 9876543210`).
2. Set a 6-digit test verification code (e.g. `123456`).
3. Click **Save**.
> Test phone numbers allow you and your team to log in instantly without waiting for carrier SMS deliveries or consuming your free monthly SMS quota.

### B. Add Authorized Domains
Scroll down to **Authorized domains**:
- Verify `localhost` is present.
- When you deploy your website to production (e.g. `your-company.web.app` or `yourdomain.com`), click **Add domain** and enter your production domain.

---

## 3. Set Up Cloud Firestore Database

1. In the Firebase console menu, click **Build** > **Firestore Database**.
2. Click **Create database**.
3. Choose a database location close to your operations (e.g. `asia-south1` for Mumbai/India).
4. For Security rules, select **Start in production mode** (our pre-configured `firestore.rules` will be deployed in Step 6).
5. Click **Create**.

---

## 4. Enable Cloud Storage for Profile Photos

1. In the Firebase console menu, click **Build** > **Storage**.
2. Click **Get started**.
3. Select **Start in production mode**.
4. Choose the same region as Firestore and click **Done**.

---

## 5. Register Your Web App & Obtain API Credentials

1. In the Firebase console, click the **Settings gear icon ⚙️** next to *Project Overview* > select **Project settings**.
2. Under the **General** tab, scroll down to the **"Your apps"** section and click the **Web icon (`</>`)**.
3. App nickname: `Catering Workforce Web` (leave Firebase Hosting unchecked for now).
4. Click **Register app**.
5. Firebase will display your `firebaseConfig` object:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyD...",
     authDomain: "your-project-id.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project-id.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef...",
   };
   ```

6. In your project root folder (`c:\Users\AJAY\OneDrive\Desktop\work`), create a file named `.env` and paste your keys:

```bash
# .env (in the project root)
VITE_FIREBASE_API_KEY=AIzaSyD...
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef...

# Leave emulator disabled for production
VITE_USE_FIREBASE_EMULATOR=false
```

7. Restart your development server so Vite loads the new environment variables:
   ```bash
   npm run dev
   ```

---

## 6. Deploy Security Rules and Indexes to Firebase

The project already contains hardened rules matching the 60-page PDF specification:
- `firestore.rules`: Default-deny, segregates public work metadata (`work_public`) from sensitive quota staffing numbers (`works`), restricts financial updates to Owner, and enforces attendance marking windows for Captains.
- `storage.rules`: Avatar upload constraints (max 5MB, image types only).
- `firestore.indexes.json`: Optimized composite queries for work filtering and payment history.

To deploy them with one command:

1. In your terminal, run:
   ```bash
   npx firebase-tools login
   ```
2. Link to your project:
   ```bash
   npx firebase-tools use --add
   ```
   *(Select the Firebase project you created)*
3. Deploy the rules and indexes:
   ```bash
   npx firebase-tools deploy --only firestore,storage
   ```

---

## 7. Bootstrapping the First "Owner" Account

Per the application specifications, normal user registration **never** permits selecting the Owner role (all registrations register as a worker application with `role: "boy"` and `accountStatus: "pending"`). 

To securely create the very first Owner:

1. Open the website (`http://localhost:5173` or your live URL).
2. Enter the Owner's mobile number on the login page and verify with OTP.
3. Once logged in, go to the [Firebase Console](https://console.firebase.google.com/) > **Firestore Database**.
4. Open the `users` collection.
5. Locate the document corresponding to the Owner's User ID (matching their phone number).
6. Edit the fields as follows:
   - `role`: change from `"boy"` to `"owner"`
   - `accountStatus`: change from `"pending"` to `"active"`
   - `fullName`: enter the Owner's name (e.g. `"Vikram Mehta"`)
   - `currentOfficialId`: enter `"OWNER-001"`
7. Click **Save**.
8. Refresh your browser or log in again. You will now be welcomed directly into the **Owner Command Center**!

From this point on, the Owner can:
- Review and approve Captain and Worker applications.
- Assign Captain IDs (`CPT-101`, `CPT-102`) and Boy IDs (`BOY-1001-A`).
- Create and post works.
- View financial reports and audit logs.

---

## 8. Deploying the Website to Live Production Hosting

### Option A: Firebase Hosting (Recommended)
1. Initialize hosting:
   ```bash
   npx firebase-tools init hosting
   ```
   - Public directory: `dist`
   - Configure as single-page app (rewrite all urls to `/index.html`): **Yes**
   - Set up automatic builds and deploys with GitHub: **No** (or Yes if desired)
2. Build the production bundle:
   ```bash
   npm run build
   ```
3. Deploy:
   ```bash
   npx firebase-tools deploy --only hosting
   ```
4. Firebase will output your live URL: `https://your-project-id.web.app`.

### Option B: Vercel / Netlify
1. Connect your Git repository to Vercel or Netlify.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add your `VITE_FIREBASE_*` environment variables in the project settings.
5. Deploy.
