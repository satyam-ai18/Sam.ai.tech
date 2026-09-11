# Maa Kaushilya Convent School (MK Convent)
## Architecture & Developer Guide — Phase 1: Foundation

---

### 1. Technology Stack Selected

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | High-performance Server-Side Rendering (SSR) for SEO, built-in API route handlers, and edge middleware. |
| **Frontend Styling** | Vanilla CSS + CSS Modules | Flexible, lightweight, adhering to guidelines with 0 Tailwind dependencies and bespoke design system tokens. |
| **Design System** | Google Fonts (*Inter* + *Playfair Display*) | Academic, premium visual hierarchy with custom HSL token architecture. |
| **Database & ORM** | SQLite + Prisma ORM 5.22 | Zero-configuration local database with complete relational schema, easily upgradable to PostgreSQL for production. |
| **Authentication** | NextAuth.js v5 | JWT session strategy, secure HTTP-only cookies, 24-hour expiration, and bcrypt password hashing (cost factor 12). |
| **Authorization** | Centralized RBAC (`src/lib/permissions.ts`) | Matrix-based permission verification with 4 system roles and 21 granular permissions. |
| **Validation** | Zod | Runtime type safety and schema validation across client and server endpoints. |
| **Media Handling** | Native Node.js FS + UUID | Secure upload validation (MIME whitelisting, dangerous extension rejection, 10MB limit) with local disk storage in `public/uploads/`. |

---

### 2. Folder Structure

```text
MK/
├── docs/
│   └── ARCHITECTURE.md          # Architecture & setup guide
├── prisma/
│   ├── schema.prisma            # Prisma schema (21 models)
│   ├── dev.db                   # SQLite database
│   └── seed.ts                  # Database seeding script
├── public/
│   ├── uploads/                 # Uploaded media & documents
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── (admin)/             # Admin panel route group
│   │   │   ├── layout.tsx       # Admin shell layout (Sidebar + Header + Toast)
│   │   │   └── admin/           # Admin modules (20 distinct routes)
│   │   ├── (public)/            # Public website route group
│   │   │   ├── layout.tsx       # Public shell (Navbar + Footer)
│   │   │   ├── page.tsx         # Homepage shell
│   │   │   ├── about/           # About school
│   │   │   ├── mission-vision/  # Mission & Vision
│   │   │   ├── academics/       # Academic programs
│   │   │   ├── facilities/      # Infrastructure & labs
│   │   │   ├── campus-life/     # Activities & sports
│   │   │   ├── teachers/        # Faculty directory
│   │   │   ├── gallery/         # Photo albums
│   │   │   ├── news/            # Announcements & articles
│   │   │   ├── events/          # Upcoming school events
│   │   │   ├── notices/         # Notice board & circulars
│   │   │   ├── admissions/      # Admissions overview
│   │   │   │   ├── apply/       # Online application form
│   │   │   │   └── status/      # Application tracking
│   │   │   ├── complaint/       # Grievance & feedback portal
│   │   │   ├── contact/         # Contact info, map, inquiry
│   │   │   └── login/           # Redirects to /auth/login
│   │   ├── api/                 # API endpoints
│   │   │   ├── admin/           # Protected admin APIs (me, media, settings)
│   │   │   ├── auth/            # NextAuth handler routes
│   │   │   └── public/          # Public endpoints (settings)
│   │   ├── auth/                # Auth pages
│   │   │   └── login/           # Admin login interface
│   │   ├── globals.css          # Design system variables & base styles
│   │   ├── error.tsx            # Global error boundary (no leaked stack traces)
│   │   └── not-found.tsx        # 404 page
│   ├── components/
│   │   ├── admin/               # Admin panel UI system
│   │   │   ├── layout/          # AdminSidebar
│   │   │   └── ui/              # Card, Table, Modal, Toast, SearchInput, Pagination, Breadcrumbs, EmptyState, ErrorState, LoadingSpinner
│   │   ├── public/              # Public website components
│   │   │   ├── home/            # Homepage sections
│   │   │   └── layout/          # Navbar, Footer
│   │   └── ui/                  # Reusable UI primitives (Button, Container, Section, Card, Typography, Modal, Form)
│   ├── lib/
│   │   ├── auth.ts              # NextAuth configuration
│   │   ├── db.ts                # Prisma singleton
│   │   ├── permissions.ts       # Centralized RBAC engine
│   │   ├── settings.ts          # Centralized settings service
│   │   ├── errors.ts            # Centralized 401/403/404/422/429/500 handlers
│   │   ├── rate-limit.ts        # Sliding-window rate limiter
│   │   ├── constants.ts         # School constants & categories
│   │   └── utils.ts             # Date & JSON formatting helpers
│   └── middleware.ts            # Route protection & edge authorization
├── .env.example
├── .env
├── package.json
└── tsconfig.json
```

---

### 3. Database Schema Overview

The database contains **21 relational models** organized into four architectural tiers:

1. **Authentication & Access Control**:
   - `User`: Accounts with role assignment, status, and hashed credentials.
   - `Role`: Roles (`SUPER_ADMIN`, `CONTENT_ADMIN`, `ADMISSION_ADMIN`, `EDITOR`).
   - `Permission`: 21 granular permissions (`manage_all`, `manage_website`, `manage_pages`, etc.).
   - `RolePermission`: Many-to-many junction mapping roles to permissions.

2. **Core CMS**:
   - `Setting`: Centralized key-value store with groups (`general`, `contact`, `social`, `website`, `theme`, `seo`).
   - `Page`: Dynamic CMS pages with markdown/rich text, slugs, and author tracking.
   - `NavigationItem`: Multi-level hierarchical navigation with ordering and targets.
   - `HomepageSection`: Dynamic ordering and toggle controls for homepage blocks.

3. **Academic & Campus Content**:
   - `HeroSlide`: High-impact hero slider content with customizable badges and CTAs.
   - `AboutSection`: Modular about, mission, vision, history, and principal messages.
   - `CoreValue`: Institutional values with custom icons and descriptions.
   - `Academic`: Program tiers (Pre-Primary to Secondary) with subjects and highlights.
   - `Facility`: Campus amenities with feature lists and icons.
   - `Teacher`: Faculty directory with qualifications, departments, and photos.
   - `Achievement`: Awards, recognitions, and student competition achievements.
   - `Testimonial`: Parent, student, and alumni reviews with ratings.
   - `GalleryAlbum` & `GalleryMedia`: Categorized photo albums.
   - `News`: Article posts with draft/publish workflow and SEO tags.
   - `Event`: School calendar entries with date ranges, timing, and venue.
   - `Notice`: Urgent and scheduled circulars with attachment support.

4. **Media & Inquiries**:
   - `Media`: Centralized asset library with size, MIME type, folder, and alt text.
   - `Admission` & `AdmissionDocument`: Online student applications with reference number tracking.
   - `Complaint`: Public grievances with category classification and resolution status.

---

### 4. Setup and Installation

#### Prerequisites
- Node.js 18+ or 20 LTS
- npm 9+

#### Steps
```bash
# 1. Clone or navigate to the repository directory
cd c:\Users\aarya\Downloads\MK

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Copy .env.example to .env and set your secrets
cp .env.example .env

# 4. Generate Prisma Client & push schema to SQLite
npx prisma db push

# 5. Seed initial roles, permissions, admin user, settings, and content
npm run db:seed

# 6. Start development server
npm run dev
```

The application will be accessible at:
- **Public Portal**: `http://localhost:3000`
- **Admin Panel**: `http://localhost:3000/auth/login`

---

### 5. Environment Variables Configuration

Create a `.env` file in the root directory:

```env
# Database connection string (SQLite dev file)
DATABASE_URL="file:./dev.db"

# NextAuth secret key (generate using `openssl rand -base64 32`)
NEXTAUTH_SECRET="your-secure-random-secret-key-here"

# Application base URL
NEXTAUTH_URL="http://localhost:3000"
```

> [!WARNING]
> Never commit real secrets or production credentials to version control.

---

### 6. Admin Authentication & Default Credentials

| Account | Email | Password | Role |
|---|---|---|---|
| **Super Admin** | `admin@mkconvent.com` | `admin@mkconvent2024` | `SUPER_ADMIN` |

*Note: Immediately update the default password after deploying to production via the Admin Users panel.*

---

### 7. Security Implementation

1. **Password Security**: Passwords hashed using `bcryptjs` with salt work factor 12.
2. **Session Security**: NextAuth JWT sessions with HTTP-only, SameSite cookies and a 24-hour expiration window.
3. **Route Protection**: Next.js Edge middleware (`src/middleware.ts`) automatically intercepts `/admin/*` and `/api/admin/*`, verifying active session tokens and mapping role permissions before allowing access.
4. **Error Sanitization**: Centralized API error responder (`src/lib/errors.ts`) returns structured JSON without exposing database queries, stack traces, or credentials to users.
5. **Rate Limiting**: Sliding-window in-memory rate limiter (`src/lib/rate-limit.ts`) guards auth endpoints and forms against brute force.
6. **Upload Security**: Media API strictly whitelists safe image/PDF MIME types, rejects executable extensions (`.exe`, `.bat`, `.php`, `.js`, etc.), enforces a 10MB size ceiling, and uses UUIDs for file storage.
