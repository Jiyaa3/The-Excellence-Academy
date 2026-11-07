# THE EXCELLENCE ACADEMY

Official Website & Admissions CRM Portal for **The Excellence Academy** (Gandhinagar, Gujarat).

Built for Academic & Civil Services Excellence:
- **School & Foundation**: Classes 8 to 10 (GSEB, CBSE, ICSE)
- **Higher Secondary**: Class 11 & 12 Science (PCM/PCB, JEE/NEET, GUJCET)
- **Higher Secondary**: Class 11 & 12 Commerce (GSEB/CBSE, CA Foundation Base)
- **Civil Services Wing**: UPSC Civil Services (IAS / IPS / IFS) & GPSC Class 1 & 2 (GAS / GPS)
- **Academic Support**: 1-on-1 Doubt Solving Clinics & Test Series

---

## 🚀 Features

- **Responsive Multi-Page Architecture**: High-conversion landing page and dedicated course pages.
- **Infinite Student Reviews Marquee**: Seamless moving testimonial reel featuring genuine student & parent reviews.
- **Dual-Sync Inquiries Engine**: Inquiries submitted through demo booking modals and quick hero forms sync automatically to:
  1. **Supabase Database** (`demo_bookings` table with Row Level Security).
  2. **Google Sheets Webhook** (Google Apps Script).
  3. **Local Storage Fallback** (Guaranteed zero-drop offline persistence).
- **Admin CRM Dashboard (`admin.html`)**:
  - Passcode-protected administrative portal.
  - Live KPI cards: Total Inquiries, Today's Inquiries, Pending Follow-ups, Demos Scheduled.
  - Real-time 4-second auto-polling & cross-tab instant synchronization.
  - 1-click **Export to CSV / Excel**.
  - Direct 1-click **📞 Call** and **💬 WhatsApp** action links.
  - Status management (`New` → `Contacted` → `Demo Scheduled` → `Enrolled` → `Closed`).
  - Student counselor notes modal.
  - Manual entry modal for walk-in / offline inquiries.

---

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML5, CSS3 (Modern Glassmorphism & Navy/Gold Academic Theme), JavaScript (ES6+).
- **Database / Backend**: Supabase REST API & PostgreSQL.
- **Spreadsheet Sync**: Google Apps Script Webhook.

---

## 🔒 Setup & Configuration

### Supabase Table Setup
Execute the SQL script [`supabase-setup.sql`](./supabase-setup.sql) in your Supabase project's SQL Editor to create the table, indexes, and RLS policies.

### Admin Portal Access
Open `admin.html` in any browser or click the **Staff Portal** link in the footer.
- Default Passcode: `excellence2025`

---

© The Excellence Academy. All rights reserved.
