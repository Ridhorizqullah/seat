# 📊 Laporan Analisis & Rencana A/B Testing Ilmiah - EventEase Platform
**Dokumen Pengujian A/B Testing Tunggal (Scientific Single-Variable Isolation)**  
**Kategori**: Dokumen Akademik & Validasi Ujian  
**Status**: 100% Sesuai Kaidah Isolasi Satu Variabel (Tanpa Mengubah Logika, Fungsionalitas, Teks, Warna, atau Font)

---

## 🔍 Bagian 1: Prinsip Isolasi Variabel Tunggal (Metode Ilmiah)

Sesuai dengan kaidah pengujian A/B Testing yang valid secara ilmiah (khususnya untuk kebutuhan ujian akademik), **hanya boleh ada SATU variabel independen yang diubah** antara Versi A dan Versi B. 

Jika kita mengubah teks, warna, dan posisi sekaligus, maka hasil pengujian akan mengalami **bias multivariabel**, sehingga kita tidak dapat membuktikan elemen mana yang sebenarnya mempengaruhi kenaikan atau penurunan konversi.

Oleh karena itu, dalam rencana pengujian ini:
* **Teks/Salinan**: Tetap 100% sama (tidak diubah).
* **Warna**: Tetap 100% sama (tidak diubah).
* **Font**: Tetap 100% sama (tidak diubah).
* **Fungsionalitas & Logika Sistem**: Tetap 100% sama (tidak diubah).
* **VARIABEL TUNGGAL YANG DIUJI**: **Posisi/Tata Letak Tombol Utama "Checkout"** pada Halaman Pemilihan Kursi (`/seat-selection`).

---

## 🎯 Bagian 2: Mengapa Memilih Posisi Tombol "Checkout" Sebagai Variabel Tunggal?

Halaman Pemilihan Kursi (`/seat-selection`) dipilih karena halaman ini merupakan jembatan kritis (*critical gateway*) dalam corong transaksi. Elemen yang akan diisolasi adalah **Tombol "Checkout"** yang bertugas mengantar pengguna ke halaman pembayaran.

```
[VERSI A - CONTROL]
Tombol Checkout diletakkan di bagian paling atas halaman (Navigasi Header).

[VERSI B - CHALLENGER]
Tombol Checkout diletakkan di bagian Sidebar Kanan (di bawah rincian harga).
```

### Karakteristik Variabel yang Dipertahankan (Ketetapan Mutlak):
* **Teks Tombol**: Tetap menggunakan string `"Checkout"` di kedua versi.
* **Warna Tombol**: Tetap menggunakan kelas CSS `bg-blue-600` (biru) saat aktif, dan `bg-slate-100` saat tidak aktif di kedua versi.
* **Font Tombol**: Tetap menggunakan `font-black uppercase tracking-widest text-xs` di kedua versi.
* **Fungsionalitas**: Keduanya tetap memproses array `selectedSeats` dan mengalihkan pengguna ke rute URL `/checkout` yang sama.

---

## 🛠️ Bagian 3: Rincian Teknis Perbandingan A/B Testing

Berikut adalah rincian perbandingan murni di mana **hanya letak koordinat tombol** yang mengalami perubahan:

### Tabel Isolasi Elemen: Version A vs. Version B

| Dimensi Pengujian | 🔴 Version A (Control / Saat Ini) | 🔵 Version B (Challenger / Pengujian) | Status Validitas |
| :--- | :--- | :--- | :--- |
| **Lokasi Fisik Tombol** | **Navigasi Atas (Header)**<br>`src/app/(user)/seat-selection/page.tsx`<br>(Baris 180-192) | **Sidebar Kanan**<br>`src/app/(user)/seat-selection/page.tsx`<br>(Dipindahkan ke bawah Baris 270) | **BERBEDA (Variabel Bebas)** |
| **Teks Tombol** | `"Checkout"` | `"Checkout"` | **SAMA (Variabel Terkontrol)** |
| **Warna Tombol** | `bg-blue-600` (Biru Aktif) | `bg-blue-600` (Biru Aktif) | **SAMA (Variabel Terkontrol)** |
| **Ukuran & Padding** | `px-8 py-3 rounded-2xl` | `px-8 py-3 rounded-2xl` | **SAMA (Variabel Terkontrol)** |
| **Font & Style** | `font-black uppercase tracking-widest text-xs` | `font-black uppercase tracking-widest text-xs` | **SAMA (Variabel Terkontrol)** |
| **Logika Navigasi** | Mengarah ke `/checkout` dengan parameter data kursi terpilih. | Mengarah ke `/checkout` dengan parameter data kursi terpilih. | **SAMA (Variabel Terkontrol)** |

---

## 📈 Bagian 4: Rumusan Tujuan & Hipotesis Ilmiah

Untuk keperluan dokumentasi ujian, berikut adalah rumusan hipotesis formal yang akan diuji:

* **Tujuan Pengujian**: Menguji pengaruh posisi tombol konversi terhadap tingkat inisiasi pembayaran pengguna pada halaman pemilihan kursi.
* **Hipotesis Nol ($H_0$)**: Perubahan posisi tombol checkout dari Navigasi Header ke Sidebar Kanan tidak memberikan pengaruh yang signifikan terhadap jumlah pengguna yang melanjutkan ke proses pembayaran.
* **Hipotesis Alternatif ($H_1$)**: Penempatan tombol checkout di Sidebar Kanan (dekat dengan denah pemilihan kursi) secara signifikan meningkatkan tingkat inisiasi pembayaran karena berada dalam jalur pandang fokus utama pengguna (*Visual Path Alliance*).

---

## 📊 Bagian 5: Metrik Pengukuran & Batasan Uji

Karena tidak ada perubahan teks atau warna, satu-satunya faktor yang mempengaruhi metrik adalah **aksesibilitas tata letak (layout accessibility)**.

### Metrik Utama yang Diukur:
* **Checkout Initiation Rate (CIR)**:
  $$\text{CIR} = \frac{\text{Jumlah Klik Tombol "Checkout"}}{\text{Jumlah Sesi Pengguna yang Memilih Minimal 1 Kursi}} \times 100\%$$

### Prosedur Validasi Ujian:
1. **Pembagian Trafik**: Sistem A/B testing membagi trafik pengunjung `/seat-selection` menjadi 50% untuk Versi A dan 50% untuk Versi B secara acak.
2. **Durasi Pengujian**: Dilakukan selama minimal 7-14 hari untuk mendapatkan sampel yang merata dan menghindari efek hari libur/akhir pekan.
3. **Uji Signifikansi Statistik**: Hasil pengujian akan divalidasi menggunakan uji **Chi-Square** atau **T-Test** dengan target tingkat kepercayaan (*Confidence Level*) sebesar **95% ($p < 0.05$)** untuk menolak Hipotesis Nol ($H_0$).
