# Catering Workforce Management Web Application

> **Production Build Specification Edition**  
> A private, internal catering workforce management system replacing fragmented WhatsApp-based coordination. Built strictly per the 60-page primary architecture and operations specification.

---

## 1. Overview & Core Mission

Catering Workforce Management coordinates end-to-end event staffing for high-volume catering businesses. It provides role-segregated operational dashboards for:
- **Owner**: Global operations command center, Work creation wizard, application reviews, standard wage settings, Captain wage records, global payments, exact Boy ID search, and append-only audit logging.
- **Captain / Site Captain**: Designated on-site leadership responsible for assigned event execution, attendance marking (`Present` / `Unmarked`), and Work-specific Biller disbursements.
- **Boy (Worker)**: Simple mobile-first home, Available Works browsing, transaction-safe Take Work, Confirmed Works management with pre-event Leave Work capabilities, and personal wage/payment statements.
- **Biller**: A Work-specific temporary responsibility assigned strictly to an active Captain on that event to disburse cash/digital payments to designated workers.

---

## 2. Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS with custom design tokens (`#0F766E` primary teal, `#F6F8FB` background, `#102A43` strong text, `#15803D` success, `#B45309` warning, `#B42318` danger).
- **Navigation & Routing**: React Router DOM v6 with role-aware protected route guards and a complete 50+ route registry.
- **Icons & Dates**: Lucide React outline icons, `date-fns` for deterministic timestamp rendering.
- **Backend & Database**: Firebase Authentication (Phone OTP with E.164 formatting), Cloud Firestore (segregated collections enforcing field privacy), Cloud Storage (worker profile avatars), and Firestore Security Rules.
- **Transaction Engine**: Atomic concurrency checks for Take Work, daily assignment locks, quota decrements, and immutable payment events.

---

## 3. Getting Started & Local Development

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 9+ (tested on npm 11)

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd work

# Install dependencies
npm install
```

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your Firebase project credentials from the Firebase Console:
```ini
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Optional: Set to true to connect to local Firebase Emulator Suite
VITE_USE_FIREBASE_EMULATOR=false
```

### Running Locally
```bash
npm run dev
```
Open `http://localhost:5173/` in your browser.

---

## 4. Architecture & Key Workflows

### Zero Dead-Button Policy
Every single button, tab, and row action across all 50+ routes is wired to a validated handler, modal, or route. There are no placeholder `#` links, empty handlers, or "Coming Soon" stubs.

### Strict Historical Immutability
When a worker joins a Work:
1. Category snapshot (`snapshotCategory`) and base wage snapshot (`snapshotBaseWage`) are immutably captured.
2. Subsequent category promotions (e.g. from Category C to B or A) or standard base wage revisions **never** rewrite past historical Work records.

### Transaction-Safe "Take Work"
When a Boy clicks "Take Work", the system executes atomic validation:
- Authenticated Boy with active account status.
- Event is confirmed and not full/cancelled/finished.
- Event date is in the future.
- Daily assignment lock verified (`daily_assignment_locks/{uid_date}`).
- Category quota capacity verified (incrementing category and total counters atomically).
- Releases daily lock and re-opens vacancy if a Boy leaves before the event date.

### Biller & Payment Model
- **No permanent Biller role**: Biller is a temporary duty assigned only from Captains active on that specific event.
- **Individual Paid / Unpaid toggles**: No "Mark All Paid" button exists anywhere. Every payment toggle records an append-only `payment_events` entry.

---

## 5. Route Map Summary

| Area | Routes | Purpose |
|---|---|---|
| **Public/Auth** | `/`, `/login`, `/verify`, `/apply`, `/status` | Phone OTP authentication & application onboarding |
| **Shared** | `/notifications`, `/profile`, `/profile/edit`, `/settings` | Alerts, personal details, preferences, logout |
| **Owner** | `/owner`, `/owner/works`, `/owner/works/calendar`, `/owner/works/new`, `/owner/works/:id/*`, `/owner/applications`, `/owner/boys`, `/owner/captains`, `/owner/wage-settings`, `/owner/captain-wages`, `/owner/payments`, `/owner/history`, `/owner/search`, `/owner/audit`, `/owner/settings` | Global administration and operational management |
| **Captain** | `/captain`, `/captain/works`, `/captain/works/:id/biller`, `/captain/history`, `/captain/payments`, `/captain/wages` | On-site event execution, attendance, Biller workspace |
| **Boy** | `/boy`, `/boy/works`, `/boy/works/:id`, `/boy/confirmed`, `/boy/confirmed/:id`, `/boy/history`, `/boy/payments` | Available events, booking confirmations, wage statements |

---

## 6. Build & Deployment

### Production Build
```bash
npm run build
```
Generates optimized static assets in the `dist/` folder.

### Firebase Hosting Deployment
Ensure you are logged in to Firebase CLI (`npx firebase-tools login`):
```bash
# Deploy Firestore rules and indexes
npx firebase-tools deploy --only firestore

# Deploy Storage security rules
npx firebase-tools deploy --only storage

# Deploy Hosting web application
npx firebase-tools deploy --only hosting
```

---

## 7. License & Compliance
Proprietary internal workforce management system. Prepared for production operations.
