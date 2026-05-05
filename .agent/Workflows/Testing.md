# Workflow: API & System Testing

Tujuan dari workflow ini adalah untuk memverifikasi bahwa seluruh sistem pemesanan kursi, otomatisasi admin, dan integrasi database berjalan dengan benar.

## 1. Verifikasi Database
- [ ] Pastikan tabel `seats` memiliki kolom `show_id` (TEXT), `status` (TEXT), `seat_number` (TEXT), `row` (TEXT), dan `number` (INTEGER).
- [ ] Pastikan fungsi RPC `book_seats` terdaftar di Supabase.

## 2. API Testing (Gunakan Bruno atau Curl)

### A. List Shows
**Endpoint:** `GET /api/shows`
**Expected Result:**
- Status 200 OK
- Menampilkan daftar acara.
- Setiap acara harus memiliki properti `seats` yang berisi array dengan `count` (minimal 0).

### B. Create Show (Automated Seats)
**Endpoint:** `POST /api/shows`
**Payload:**
```json
{
  "title": "Test Show Automated",
  "adultPrice": 20,
  "childPrice": 10,
  "concessionPrice": 15,
  "status": "DRAFT"
}
```
**Expected Result:**
- Status 201 Created
- Database `seats` otomatis terisi 50 baris untuk `show_id` tersebut.

### C. Booking Seats (Atomic)
**Endpoint:** `POST /api/bookings` (Gunakan RPC `book_seats` via API jika tersedia, atau sesuaikan dengan endpoint booking Anda)

## 3. Integrasi UI
- [ ] Buka `/admin/shows`, pastikan kolom "SEATS" menunjukkan angka 50 untuk acara baru.
- [ ] Buka `/admin/bookings`, pastikan peta kursi muncul dan sinkron secara realtime saat ada perubahan di database.
