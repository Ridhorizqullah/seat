---
description: Di dalam folder /src/app/admin/shows, saat admin menyimpan data acara baru, kita perlu menjalankan logika untuk mengisi tabel seats.
---

Gunakan perulangan untuk membuat baris dan nomor kursi (misal: A1-A10, B1-B10).

// Contoh logika di dalam komponen form admin
const handleCreateShow = async (showData) => {
  // 1. Simpan data Show ke Supabase
  const { data: newShow, error: showError } = await supabase
    .from('shows')
    .insert([showData])
    .select()
    .single();

  if (showError) return console.error(showError);

  // 2. Generate Kursi (Misal: 5 baris, 10 kursi per baris)
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const seatsToInsert = [];

  rows.forEach((row) => {
    for (let i = 1; i <= 10; i++) {
      seatsToInsert.push({
        show_id: newShow.id,
        seat_number: `${row}${i}`,
        status: 'available',
        category: 'Reguler'
      });
    }
  });

  // 3. Masukkan ke tabel seats
  const { error: seatError } = await supabase
    .from('seats')
    .insert(seatsToInsert);

  if (seatError) console.error("Gagal generate kursi:", seatError);
};