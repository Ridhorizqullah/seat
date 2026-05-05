---
description: Agar admin bisa melihat perubahan status kursi secara langsung tanpa refresh halaman saat ada user yang melakukan booking, tambahkan Supabase Realtime di halaman admin.
---

Langkah Setup:

Pastikan Replication untuk tabel seats di dashboard Supabase sudah aktif (Full).

Tambahkan Listener di komponen admin:

TypeScript
useEffect(() => {
  const channel = supabase
    .channel('admin-seat-updates')
    .on('postgres_changes', 
      { event: 'UPDATE', schema: 'public', table: 'seats' }, 
      (payload) => {
        // Update state seats lokal di admin agar warna grid berubah otomatis
        setSeats((prev) => prev.map(s => s.id === payload.new.id ? payload.new : s));
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}, []);