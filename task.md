# Dokumentasi Use Case & Skenario Task Error (Negative Testing)
**Aplikasi: EventEase (Stitch + Neon Event Seat Booking)**  
**Target File: `task.md`**  
**Template Format: Skenario Multi-Task per Use Case & Penanganan Eksepsi/Error**

---

> [!NOTE]
> File ini disusun berdasarkan temuan riil pada pengujian di [proseduroutput.md](file:///c:/Users/ASUS/Downloads/stitch_neon_event_seat_booking/eventseats/proseduroutput.md) serta pemodelan eksepsi teknis yang terinspirasi dari struktur penanganan error sistem (seperti yang terdapat pada konfigurasi environment/runtime).
> 
> **Prinsip Dasar**: Setiap **1 Use Case** dapat diturunkan menjadi **banyak Task**, baik itu **Task Sukses (Normal Flow)** maupun **Task Error (Alternative/Validation Flow)**.

---

## 📂 TEMPLATE FORMAT PENGUJIAN TASK ERROR

Berikut adalah format standar penulisan skenario pengujian tugas (Task) beserta penanganan error di aplikasi:

```markdown
### Use Case [ID]: [Nama Use Case]
* **Deskripsi**: Penjelasan ringkas mengenai tujuan use case.
* **Aktor Utama**: Pengguna / Penguji / Admin.

#### Task [ID].[No] - [Nama Task (Sukses/Error)]
* **Kondisi Awal (Preconditions)**: Keadaan sistem sebelum task dimulai.
* **Langkah-Langkah Reproduksi**:
  1. Langkah 1
  2. Langkah 2
* **Kondisi Akhir yang Diharapkan (Expected Result)**: Hasil jika skenario berjalan normal.
* **Penanganan Eksepsi / Skenario Error**:
  * **Exception/Error Class**: `NamaEksepsiSistem` (Contoh: `App.ValidationException` atau `Database.ConstraintConflict`)
  * **Actual Error Message**: Pesan error teknis yang ditangkap sistem.
  * **Expected Handled State**: Bagaimana sistem mendeteksi, menangani, dan menampilkan error secara aman di UI kepada pengguna (mencegah sistem crash).
```

---

## 🛠️ IMPLEMENTASI NYATA DAFTAR USE CASE & TASK ERROR (EVENTEASE)

Berikut adalah penerapan dari data temuan pengujian kegunaan EventEase menggunakan template di atas:

### 👤 Use Case 1: Manajemen Profil Pengguna
* **Deskripsi**: Pengguna memperbarui informasi kontak pribadi mereka untuk keperluan e-ticket.
* **Aktor Utama**: Pelanggan (Tester)

#### Task 1.1: Memperbarui Nama, Telepon, dan Alamat (Normal Flow)
* **Kondisi Awal**: Pengguna telah login dan berada di halaman `/profile` tab **PROFILE DETAILS**.
* **Langkah-Langkah**:
  1. Ubah First Name menjadi `Ridho Update`.
  2. Ubah Phone Number menjadi `08123456789`.
  3. Ubah Physical Address menjadi `Bandung, Indonesia`.
  4. Klik tombol **Save Changes**.
* **Kondisi Akhir**: Data berhasil disimpan dan nama di sidebar langsung ter-update secara dinamis.

#### Task 1.2: Pembaruan Alamat Email Akun (Error/Restricted Flow)
* **Kondisi Awal**: Pengguna berada di tab **PROFILE DETAILS**.
* **Langkah-Langkah**:
  1. Pengguna mencoba mengklik atau mengetik pada kolom **Email Address** untuk mengubah email.
* **Kondisi Akhir**: Kolom email tidak dapat diketik atau diinteraksi karena bersifat *disabled* (read-only).
* **Penanganan Eksepsi / Skenario Error**:
  * **Exception/Error Class**: `App.Fields.ImmutableFieldException`
  * **Actual Error Message**: `Error: Cannot modify read-only element 'email' (disabled in DOM)`
  * **Expected Handled State**: Atribut `disabled` atau `readOnly` terpasang pada elemen HTML `<input>`. Cursor berubah menjadi penunjuk dilarang (`not-allowed`) untuk memberi sinyal visual yang jelas kepada pengguna tanpa harus mengirim request gagal ke server.

#### Task 1.3: Input Format Telepon Tidak Valid (Error Flow)
* **Kondisi Awal**: Pengguna berada di halaman edit profil.
* **Langkah-Langkah**:
  1. Pengguna mengosongkan kolom Phone Number atau mengisinya dengan karakter huruf (misal: `abcde`).
  2. Pengguna mengklik tombol **Save Changes**.
* **Kondisi Akhir**: Sistem menolak penyimpanan dan menampilkan pesan validasi berwarna merah.
* **Penanganan Eksepsi / Skenario Error**:
  * **Exception/Error Class**: `App.Validation.InvalidPhoneNumberException`
  * **Actual Error Message**: `ValidationException: Phone number 'abcde' does not match regex pattern '^[0-9+() \-]{7,15}$'`
  * **Expected Handled State**: Zod schema di server/client memvalidasi input, membatalkan mutasi ke database Supabase, dan menampilkan pesan kesalahan: *"Format nomor telepon tidak valid!"* di bawah input field.

---

### 💳 Use Case 2: Manajemen Metode Pembayaran
* **Deskripsi**: Pengguna menyimpan kartu kredit baru di profil mereka untuk mempermudah transaksi mendatang.
* **Aktor Utama**: Pelanggan (Tester)

#### Task 2.1: Menambahkan Kartu Kredit Valid (Normal Flow)
* **Kondisi Awal**: Pengguna berada di `/profile` tab **PAYMENTS**.
* **Langkah-Langkah**:
  1. Masukkan nama pemegang, nomor kartu kredit Stripe, masa berlaku, dan CVV yang valid.
  2. Klik tombol **Save Card**.
* **Kondisi Akhir**: Kartu baru tersimpan dan masuk ke daftar metode pembayaran terdaftar.

#### Task 2.2: Menambahkan Kartu yang Sudah Kedaluwarsa (Error Flow)
* **Kondisi Awal**: Pengguna berada di tab **PAYMENTS** formulir kartu.
* **Langkah-Langkah**:
  1. Masukkan nomor kartu kredit valid.
  2. Pada kolom Expiry, masukkan tanggal yang sudah lewat (misal: `01/24`).
  3. Klik tombol **Save Card**.
* **Kondisi Akhir**: Formulir menampilkan indikasi merah di kolom kedaluwarsa dan tombol simpan diblokir.
* **Penanganan Eksepsi / Skenario Error**:
  * **Exception/Error Class**: `Stripe.Card.ExpiredCardException`
  * **Actual Error Message**: `StripeError: The card expiration date is in the past. Current date: 2026-05-07.`
  * **Expected Handled State**: Client-side validator mendeteksi input kedaluwarsa, menolak pengiriman token ke Stripe API, dan menampilkan toast alert: *"Masa berlaku kartu Anda telah habis!"*.

---

### 🎟️ Use Case 3: Pemesanan Kursi & Pembayaran Tiket
* **Deskripsi**: Pengguna memilih kursi di peta tempat duduk interaktif dan menyelesaikan transaksi via payment gateway.
* **Aktor Utama**: Pelanggan (Tester)

#### Task 3.1: Memilih Kursi Tersedia dan Melakukan Checkout (Normal Flow)
* **Kondisi Awal**: Pengguna berada di halaman detail event "Anta Show" dan peta kursi terbuka.
* **Langkah-Langkah**:
  1. Pilih kursi berwarna putih (misal: `A3`).
  2. Isi formulir checkout (Nama & Telepon).
  3. Selesaikan pembayaran di portal Stripe Sandbox.
* **Kondisi Akhir**: Transaksi sukses, pengguna dialihkan ke halaman konfirmasi pembayaran sukses.

#### Task 3.2: Konflik Pemilihan Kursi yang Sudah Dipesan (Error Flow - Double Booking)
* **Kondisi Awal**: Pengguna membuka peta kursi untuk event yang sangat populer.
* **Langkah-Langkah**:
  1. Pengguna membuka peta kursi saat sesi booking lain sedang berlangsung.
  2. Pengguna memilih kursi `A3` yang sebenarnya baru saja dibayar oleh pengguna lain dalam selisih beberapa detik (status belum ter-update di layar client).
  3. Pengguna mengklik tombol **Checkout**.
* **Kondisi Akhir**: Sistem menampilkan modal peringatan bahwa kursi sudah tidak tersedia, dan mengembalikan pengguna ke peta kursi terbaru.
* **Penanganan Eksepsi / Skenario Error**:
  * **Exception/Error Class**: `Database.Postgres.UniqueConstraintViolationException`
  * **Actual Error Message**: `PostgresError: duplicate key value violates unique constraint "bookings_show_id_seat_id_key"`
  * **Expected Handled State**: Database Postgres Supabase menolak transaksi insert berkat adanya `UNIQUE constraint` pada kombinasi `show_id` dan `seat_id`. API Route menangkap error database, mengembalikan response status `409 Conflict`, dan frontend menampilkan pesan: *"Mohon maaf, kursi A3 baru saja dipesan oleh pengguna lain. Silakan pilih kursi lain."*

#### Task 3.3: Pembayaran Dibatalkan oleh Pengguna di Stripe (Error Flow)
* **Kondisi Awal**: Pengguna dialihkan ke portal Stripe Sandbox.
* **Langkah-Langkah**:
  1. Di halaman pembayaran Stripe, pengguna memilih untuk mengklik tombol **"Back to Merchant"** atau membatalkan transaksi.
* **Kondisi Akhir**: Pengguna dikembalikan ke aplikasi EventEase dengan pesan bahwa transaksi dibatalkan, dan kursi yang sempat dikunci sementara dikembalikan statusnya menjadi "Tersedia".
* **Penanganan Eksepsi / Skenario Error**:
  * **Exception/Error Class**: `Stripe.Gateway.PaymentCanceledException`
  * **Actual Error Message**: `StripeSessionError: Checkout session was canceled by the user without completing payment.`
  * **Expected Handled State**: Aplikasi mendeteksi parameter redirect cancel URL, merilis status *hold* pada kursi yang dipilih, dan menampilkan pemberitahuan ramah di halaman checkout: *"Pemesanan Anda telah dibatalkan. Kursi Anda telah dikosongkan kembali."*

---

### 📥 Use Case 4: Akses dan Validasi Tiket Elektronik
* **Deskripsi**: Pengguna membuka e-ticket mereka untuk ditunjukkan kepada petugas di gerbang masuk event.
* **Aktor Utama**: Pelanggan & Petugas Event

#### Task 4.1: Membuka E-Ticket Aktif Milik Pribadi (Normal Flow)
* **Kondisi Awal**: Pengguna berada di halaman `/tickets` dalam keadaan login.
* **Langkah-Langkah**:
  1. Cari tiket "Anta Show".
  2. Klik tombol **View Details**.
* **Kondisi Akhir**: Detail tiket lengkap, struk pembayaran, dan QR Code valid ditampilkan di layar.

#### Task 4.2: Akses Tiket Milik Pengguna Lain Tanpa Izin (Error/Security Flow)
* **Kondisi Awal**: Pengguna jahat (Hacker) login dengan akun miliknya sendiri, namun mencoba membuka halaman detail tiket milik akun lain dengan menebak ID tiket di URL.
* **Langkah-Langkah**:
  1. Pengguna jahat mengganti parameter URL menjadi `/tickets/view?id=BK926323HHU` (yang merupakan ID tiket milik `suddensae@gmail.com`).
* **Kondisi Akhir**: Sistem menolak akses dan menampilkan halaman error 403 Forbidden atau mengalihkan ke halaman utama.
* **Penanganan Eksepsi / Skenario Error**:
  * **Exception/Error Class**: `Security.AccessControl.UnauthorizedAccessException`
  * **Actual Error Message**: `AccessDeniedException: User 'attacker@gmail.com' does not own booking 'BK926323HHU' and lacks ADMIN role.`
  * **Expected Handled State**: Row-Level Security (RLS) di database Supabase atau Middleware di Next.js memverifikasi kepemilikan data sebelum mengembalikan response. Server mengembalikan status code `403 Forbidden` dan menampilkan halaman error aman: *"Anda tidak memiliki izin untuk melihat tiket ini."*
