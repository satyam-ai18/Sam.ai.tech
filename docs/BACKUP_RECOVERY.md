# Maa Kaushilya Convent School (MK Convent)
## Database & Media Backup / Recovery Procedure

This document specifies the standard operating procedures (SOP) for creating, testing, and restoring backups for the Maa Kaushilya Convent School CMS and Online Admission System.

---

### 1. Architectural Components to Back Up

The application stores data in two primary layers:
1. **SQLite Database File (`prisma/dev.db` / `prisma/prod.db`)**:
   Contains all CMS pages, admission applications, applicant records, audit logs, user credentials (bcrypt hashes), news, events, notices, gallery albums, and site configurations.
2. **Public Uploads Storage (`public/uploads/`)**:
   Contains all uploaded campus photographs, student admission documents (passports, marksheet scans, birth certificates), and staff avatars.

---

### 2. Backup Strategy & Recommended Frequencies

| Component | Frequency | Retention | Tool / Method |
| :--- | :--- | :--- | :--- |
| **Database Snapshot** | Every 6 hours (or daily during low season) | 30 daily + 12 monthly | SQLite VACUUM INTO / Online Backup API |
| **Admission Media Files** | Daily | 30 days rolling | Incremental zip or rsync / Robocopy |
| **System Audit Logs** | Monthly archive | 365 days (1 year compliance) | Database export / CSV dump |

---

### 3. Automated Backup Script (Windows PowerShell / Batch)

A helper script is provided at `scripts/backup.ps1` (or `scripts/backup.bat`):

```powershell
# scripts/backup.ps1
$Date = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$BackupDir = ".\backups\$Date"
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

Write-Host "Creating SQLite safe snapshot..."
# Uses sqlite3 safe VACUUM INTO to prevent WAL read corruption
sqlite3 .\prisma\dev.db ".timeout 5000" "VACUUM INTO '$BackupDir\database.db';"

Write-Host "Archiving public media files..."
Compress-Archive -Path .\public\uploads -DestinationPath "$BackupDir\uploads.zip" -Force

Write-Host "Backup completed successfully at: $BackupDir"
```

---

### 4. Disaster Recovery & Restoration Procedure

In the event of database corruption, hardware replacement, or rollback requirement:

#### Step 1: Stop the Application Service
Ensure the Node.js / Next.js web application is stopped to avoid write conflicts:
```powershell
# Stop PM2 or system process
pm2 stop mk-convent-school
```

#### Step 2: Restore Database
Copy the verified database snapshot back into place:
```powershell
Copy-Item ".\backups\2026-09-08_...\database.db" ".\prisma\dev.db" -Force
```

#### Step 3: Restore Uploads Folder
Unzip the media archives:
```powershell
Expand-Archive -Path ".\backups\2026-09-08_...\uploads.zip" -DestinationPath ".\public\" -Force
```

#### Step 4: Verify Database Integrity
Run Prisma validate and check query integrity:
```powershell
npx prisma db pull
npx prisma generate
```

#### Step 5: Restart the Web Application
```powershell
npm run dev # or pm2 start ecosystem.config.js
```

---

### 5. Security & Isolation Considerations
- Backups contain sensitive student admission PII and encrypted password hashes.
- Always store production backups on encrypted storage (BitLocker, AES-256) and off-site cloud storage (e.g. AWS S3 with Object Lock or secure SFTP).
- Never commit `.db` backup archives or applicant document zips to Git repositories.
