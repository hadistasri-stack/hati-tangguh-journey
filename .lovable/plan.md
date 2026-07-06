# Sistem Akun Pendamping (Ortu & Guru BK)

Fitur ini bikin **Reset Hati** punya 3 jenis akun dengan dashboard berbeda. Anak tetap privacy-first — pendamping cuma lihat *status* quest, bukan isi muhasabah.

---

## 1. Aktifkan backend (prasyarat)

- **Lovable Cloud** → auth + database + email invite
- **Lovable Emails** → kirim undangan ke ortu/BK

## 2. Struktur data (database)

```text
profiles          → 1 row per user (role: child | parent | counselor)
classes           → kelas yg dihandle BK (nama, kode kelas, counselor_id)
class_members     → siswa di dalam kelas (class_id, child_id)
relationships     → pairing ortu↔anak (parent_id, child_id, status)
invites           → undangan pending (email, role, child_id/class_id, token, expires_at)
daily_progress    → migrasi dari sessionStorage → DB (user_id, day, sholat, belajar, sosial, panic_taps)
emotion_logs      → pre-test + emotion meter berikutnya
muhasabah_entries → PRIVAT, RLS keras: HANYA child sendiri yg bisa baca
```

**RLS (Row Level Security)** — kunci utama privasi:
- `muhasabah_entries` → hanya owner (child) yg bisa SELECT
- `daily_progress` → child (owner) + parent yg dipair + counselor yg punya kelas
- `emotion_logs` → sama kayak daily_progress
- Role disimpan di tabel `user_roles` terpisah (anti privilege escalation)

## 3. Flow user

### A) Anak (child) — flow yg sudah ada + login
1. Splash → **Login/Daftar** (baru) → Consent → Avatar → Tutorial → Pre-test → Dashboard
2. Data quest yang tadinya di sessionStorage → sekarang ke DB
3. Menu baru: **"Hubungkan Pendamping"** → masukin email ortu/BK → invite terkirim

### B) Ortu (parent)
1. Buka link invite dari email → daftar/login
2. Otomatis terhubung ke 1 anak
3. Dashboard ortu: 
   - Status 3 quest 7 hari terakhir (✓/✗ per hari)
   - Level Pohon Iman
   - Grafik trend emosi (pre-test vs sekarang)
   - ⚠️ Alert kalau panic taps > 3x/hari atau quest 0 selama 2 hari berturut
   - **Tidak ada**: isi muhasabah, foto bukti

### C) Guru BK (counselor) — multi-siswa
1. Login → buat **kelas** (dapat kode kelas 6-digit, mis. `BK7A23`)
2. Invite siswa via email (atau siswa join pakai kode kelas)
3. Dashboard BK:
   - **List view**: tabel semua siswa di kelas + ringkasan (quest rate %, level pohon, alert)
   - **Detail view**: klik 1 siswa → dashboard ortu-style
   - **Agregat kelas** (penting buat skripsi/uji efektifitas):
     - % siswa yg complete quest hari ini
     - Rata-rata level pohon
     - Distribusi emosi pre-test vs current
     - Export CSV buat olah data SPSS

## 4. Halaman/route baru

```text
/                          → splash (sudah ada)
/login                     → login (semua role)
/signup                    → daftar (pilih role: anak/ortu/BK)
/invite/$token             → terima undangan
/_authenticated/           → layout protected
  ├── child/dashboard      → dashboard anak (yg sudah ada)
  ├── parent/dashboard     → dashboard ortu
  ├── counselor/
  │     ├── classes        → list kelas
  │     ├── classes/$id    → detail kelas + list siswa
  │     └── student/$id    → detail 1 siswa
  └── settings/pendamping  → anak kelola siapa yg lihat datanya
```

## 5. Halaman setting penting buat anak

Menu **"Pendamping Saya"** — anak bisa:
- Lihat siapa aja yg lihat datanya (nama + role)
- Revoke akses kapan aja (sesuai janji privasi di ConsentScreen)
- Re-confirm consent

## 6. Yang TIDAK akan dibangun di tahap ini

- Notifikasi push/realtime (nanti)
- Chat antara ortu↔BK (nanti)
- Export PDF laporan (CSV dulu cukup)

---

## Estimasi scope

Ini fitur **besar** (auth + 3 role + 6 tabel + 8 halaman baru). Saran: kerjain bertahap.

**Fase 1 (yg aku rekomen sekarang)**:
- Enable Cloud + auth (login/signup)
- Migrasi data quest dari sessionStorage → DB
- Role system (child/parent/counselor)
- Dashboard ortu sederhana + invite via email

**Fase 2**:
- Kelas + dashboard BK
- Agregat kelas + export CSV
- Alert system

Setuju mulai dari **Fase 1** dulu? Atau mau langsung full?
