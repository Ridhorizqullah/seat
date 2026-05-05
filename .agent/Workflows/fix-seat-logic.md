---
description: Workflow untuk memperbaiki sistem booking kursi: Sinkronisasi Admin (pembangkitan kursi otomatis) dan User (pemilihan kursi interaktif) menggunakan Supabase dan Next.js.
---

# Workflow: /setup-seat-booking

Gunakan workflow ini untuk membangun sistem manajemen kursi dari nol hingga fungsional, menghubungkan folder `admin` dan `(user)` yang ada di project.

## Step 1: Database & API Foundation
**Prompt:**
Analisa struktur folder di project ini. Fokus pada integrasi Supabase.
Tugas kamu:
1. Buat SQL Schema untuk tabel `seats` (id, show_id, seat_number, status, category).
2. Modifikasi tabel `bookings` agar memiliki relasi ke tabel `booking_items` untuk menyimpan detail kursi yang dipesan.
3. Buat file `src/lib/supabase.ts` untuk inisialisasi client.
4. Setup Row Level Security (RLS) di Supabase agar data kursi dapat dibaca oleh publik tetapi hanya bisa diubah melalui server/admin.

## Step 2: Admin Logic - Automated Seat Generation
**Prompt:**
Buka folder `src/app/admin/shows` dan `src/app/admin/bookings`. Saat ini fungsi booking di admin belum memiliki logika kursi.
Tugas kamu:
1. Modifikasi form pembuatan 'Show' di admin agar otomatis meng-generate 50-100 data kursi di tabel `seats` segera setelah Show baru disimpan.
2. Update halaman `admin/bookings/page.tsx` untuk menampilkan daftar kursi yang telah terisi (booked) per-acara menggunakan komponen visual sederhana.
3. Pastikan data di admin tersinkronisasi secara Realtime menggunakan Supabase Subscriptions.

## Step 3: User Logic - Interactive Seat Selection
**Prompt:**
Buka folder `src/app/(user)/seat-selection`, `checkout`, dan `tickets`.
Tugas kamu:
1. Di `seat-selection/page.tsx`, buat Grid UI kursi yang interaktif (Available: Hijau, Selected: Biru, Booked: Merah).
2. Implementasikan logika "Atomic Booking" menggunakan Supabase RPC. Pastikan sistem mengecek ketersediaan kursi di database tepat sebelum transaksi dibuat untuk menghindari "double booking".
3. Setelah pembayaran/checkout di folder `checkout` berhasil, update status `is_booked` di tabel `seats` dan arahkan user ke folder `tickets` untuk menampilkan detail kursi mereka.