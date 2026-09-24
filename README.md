# IDARAH — Sistem Tata Kelola Kepesantrenan Ma'had UNIA
### Universitas Al-Amien Prenduan

Aplikasi sistem informasi tata kelola administrasi, persuratan, disposisi, rapat, rekomendasi, dan pelaporan berkala Ma'had UNIA berbasis React, TypeScript, Tailwind CSS, dan **Supabase Database**, siap dideploy ke **GitHub** dan **Vercel**.

---

## 🚀 Panduan Setup Supabase, GitHub & Vercel

### 1. Setup Database di Supabase
1. Buka [https://supabase.com](https://supabase.com) dan buat akun/login.
2. Buat proyek baru (*New Project*), beri nama misalnya `idarah-unia`.
3. Buka menu **SQL Editor** di sidebar Supabase.
4. Salin seluruh isi file **`supabase-schema.sql`** di repository ini, lalu tempel (*paste*) dan klik **Run**.
   - Ini akan membuat seluruh 24 tabel, relasi, Row Level Security (RLS), dan master data awal secara otomatis.
5. Buka menu **Project Settings** -> **API**.
6. Salin dua kunci berikut:
   - **Project URL** (misal: `https://xyzcompany.supabase.co`)
   - **anon / public key** (kunci publik anonim)

---

### 2. Konfigurasi Environment Variables (`.env`)
Buat file `.env` di komputer Anda (atau gunakan template di `.env.example`):
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

---

### 3. Simpan ke GitHub
Inisialisasi git dan dorong (*push*) ke repositori GitHub Anda:
```bash
git init
git add .
git commit -m "feat: setup idarah unia dengan integrasi supabase & vercel"
git branch -M main
git remote add origin https://github.com/USERNAME_ANDA/idarah-unia.git
git push -u origin main
```

---

### 4. Deploy ke Vercel
1. Buka [https://vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
2. Klik **Add New...** -> **Project**.
3. Pilih repositori GitHub `idarah-unia` yang baru saja Anda buat, lalu klik **Import**.
4. Vercel akan otomatis mengenali framework Vite:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Pada bagian **Environment Variables**, tambahkan 2 variabel berikut:
   - `VITE_SUPABASE_URL`: isi dengan Project URL dari Supabase Anda
   - `VITE_SUPABASE_ANON_KEY`: isi dengan Anon Public Key dari Supabase Anda
6. Klik **Deploy**!
7. Dalam 1-2 menit aplikasi Anda akan aktif dengan domain Vercel (misal: `https://idarah-unia.vercel.app`).
   - File konfigurasi `vercel.json` telah disediakan agar routing SPA (Single Page Application) berjalan mulus tanpa error 404 saat refresh.

---

## 🛠️ Fitur Utama
- **Multi-Mahad**: Pengelolaan terintegrasi untuk Ma'had Lil Banin (Putra) dan Ma'had Lil Banat (Putri).
- **Tata Persuratan & Disposisi**: Surat Masuk, Surat Keluar, SK Direktur/Mudir, dan alur disposisi berjenjang.
- **Siklus Rapat & Rekomendasi**: Penjadwalan rapat, notulensi resmi, ekstraksi butir rekomendasi, dan monitoring tindak lanjut unit.
- **Pelaporan Berkala**: Laporan mingguan, bulanan, dan tahunan unit dengan validasi bertingkat.
- **Sinkronisasi Supabase + Fallback**: Bekerja instan dengan Supabase saat terhubung, serta fallback offline/lokal cache yang tangguh.
