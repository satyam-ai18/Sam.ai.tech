# Sam.ai.tech — 🏫 Maa Kaushilya Convent School (MK Convent)

> **Sam.ai.tech** | Professional web development, Next.js 14, UI/UX design, and AI-powered projects.  
> **MK Convent School** | Best CBSE School in Jaunpur | Full-Stack School Website with Admin CMS Panel

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)](https://www.prisma.io/)

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Vanilla CSS (CSS Modules) |
| Database | SQLite (local) / PostgreSQL (production) |
| ORM | Prisma |
| Auth | NextAuth.js v5 |
| Animations | Framer Motion |
| Rich Text | TipTap |
| Icons | Lucide React |

---

## 📁 Project Structure

```
MK/
├── src/
│   ├── app/
│   │   ├── (public)/        # Public-facing pages
│   │   ├── (admin)/         # Admin CMS panel
│   │   ├── api/             # API routes
│   │   └── auth/            # Login page
│   ├── components/
│   │   ├── public/          # Public website components
│   │   └── admin/           # Admin panel components
│   └── lib/                 # Utilities, auth, DB helpers
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Database seeder
├── public/                  # Static assets (images, fonts)
├── scripts/                 # Utility scripts
├── package.json
├── next.config.js
├── tsconfig.json
└── .env.example             # Environment variables template
```

---

## ⚙️ Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/mk-convent-school.git
cd mk-convent-school
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env.local
```
Edit `.env.local`:
```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="your-secure-random-string-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Set up the database
```bash
npm run db:push    # Create database tables
npm run db:seed    # Seed with initial data
```

### 5. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔐 Default Admin Credentials

| Field | Value |
|-------|-------|
| URL | `/auth/login` |
| Email | `admin@mkconvent.com` |
| Password | `admin@mkconvent2024` |

> ⚠️ **Change the password immediately after first login!**

---

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed database with initial data |
| `npm run db:studio` | Open Prisma Studio (DB GUI) |
| `npm run db:generate` | Regenerate Prisma Client |

---

## 🌐 Vercel Deployment

### Prerequisites
> ⚠️ **SQLite does NOT work on Vercel** (ephemeral filesystem).  
> You must switch to a cloud database before deploying.

**Recommended free options:**
- [Turso](https://turso.tech) — LibSQL (SQLite-compatible, free tier)
- [Supabase](https://supabase.com) — PostgreSQL (free tier)
- [PlanetScale](https://planetscale.com) — MySQL (free tier)

### Deploy Steps

1. Push code to GitHub
2. Connect GitHub repo to [Vercel](https://vercel.com)
3. Add Environment Variables in Vercel dashboard:
   ```
   DATABASE_URL=your_cloud_db_url
   NEXTAUTH_SECRET=your_secure_secret
   NEXTAUTH_URL=https://your-project.vercel.app
   ```
4. Deploy!

### Turso (SQLite-compatible) Quick Setup
```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login and create DB
turso auth login
turso db create mk-convent-school
turso db show mk-convent-school  # get URL
turso db tokens create mk-convent-school  # get auth token
```

Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

Set `DATABASE_URL`:
```
libsql://mk-convent-school-xxx.turso.io?authToken=YOUR_TOKEN
```

---

## 🛡️ Security Notes

- Never commit `.env` or `.env.local` to Git
- Change default admin password before going live
- Set a strong `NEXTAUTH_SECRET` (min 32 chars) in production
- Update `NEXTAUTH_URL` to your production domain

---

## 📄 License

Private — All rights reserved © 2024 Maa Kaushilya Convent School, Jaunpur
