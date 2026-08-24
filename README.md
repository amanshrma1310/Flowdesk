# FlowDesk AI 🚀
> **Import your data. Automate your work. Grow your business.**  
> *Any data → Clean customer profiles → Smart CRM → No-code automation → WhatsApp/Email/SMS/Tasks → Analytics*

---

## 🌟 Overview
FlowDesk AI is an **AI-Powered Customer Automation Platform** that turns messy, scattered contact data (Excel, CSV, screenshots, business cards, Google Sheets, forms) into clean 360° customer profiles and kicks off automated multi-channel follow-up workflows without writing code.

---

## 🚀 Key Features

- ⚡ **Smart Import & AI Data Scanner**:
  - Drag & drop Excel/CSV with AI auto-column matching (`Customer Name ➔ Name`, `Mobile ➔ Phone`, `Mail ID ➔ Email`).
  - Multimodal OCR scanner for WhatsApp chat screenshots and executive business card photos.
  - 1-Click Data Health & Auto-Fix engine (E.164 phone normalization, deduplication, email validation).
- 👤 **360° Customer Profiles**: Single-pane customer view with lead score meters, custom fields, quick action drawers, and complete chronological event timelines.
- 🎯 **Command Center Dashboard**: Action-first homepage: *"What needs my attention today?"* (Hot leads, overdue follow-ups, today's events, unread conversations, and live automation metrics).
- 🧠 **Visual No-Code Flow Builder**:
  - Interactive flowchart canvas powered by **React Flow (`@xyflow/react`)**.
  - Block library: `WHEN (Trigger) ➔ IF (Branch) ➔ THEN (Action) ➔ WAIT (Delay)`.
  - **AI "Explain This Automation"**: Translates visual flows into plain English for non-technical users.
  - Live simulation runner with real-time execution trace.
- 💬 **Multi-Channel Unified Inbox**: Official Meta WhatsApp Business Cloud API & transactional Email in one unified conversation interface.
- 👥 **Smart Lead Distribution**: Automated lead routing via Round-Robin, Territory/Location (Punjab, Delhi NCR, International), and Lead Score thresholds.
- 📅 **Event & Webinar Manager**: Automated 5-step journey (Instant WhatsApp QR pass, calendar invite, 2-day reminder, 2-hour alert, and post-event survey).
- 📢 **Broadcast Campaigns & Kanban Pipeline**: Target filtered smart segments with broadcasts and track deals in visual Kanban stages.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19, TypeScript)
- **Styling & UI**: [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), Lucide Icons, Radix UI Primitives, Framer Motion
- **Visual Canvas**: [@xyflow/react](https://reactflow.dev/)
- **Database & ORM**: PostgreSQL + [Prisma ORM](https://www.prisma.io/)
- **Data Ingestion & Parsing**: `xlsx`, `papaparse`, Multimodal OCR extraction
- **Messaging**: Meta WhatsApp Business Cloud API, Resend / SMTP

---

## 🏁 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/amanshrma1310/Flowdesk.git
cd Flowdesk
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 License
MIT License. Created for modern business growth.
