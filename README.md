# Portfolio Nadia — siap deploy ke Netlify

## Isi folder
```
index.html                 -> halaman utama (mode user & mode developer)
netlify/functions/content.js -> baca/tulis konten (Netlify Blobs)
netlify/functions/image.js   -> menyajikan gambar (avatar, cover, galeri proyek)
netlify/functions/upload.js  -> upload gambar (hanya developer login)
netlify/functions/clap.js    -> hitungan "clap" ala Medium di halaman proyek
netlify.toml                -> konfigurasi build & redirect /api/*
package.json                -> dependency @netlify/blobs
```

## Cara deploy
1. Push folder ini ke repo Git (GitHub/GitLab/Bitbucket), lalu di Netlify pilih
   **Add new site → Import an existing project** dan hubungkan repo-nya.
   Atau paling cepat: buka https://app.netlify.com/drop lalu **drag & drop folder ini**.
2. Build settings sudah diatur lewat `netlify.toml` (publish = ".", functions =
   "netlify/functions") — tidak perlu isi apa-apa lagi di dashboard.
3. Aktifkan **Netlify Identity** di dashboard situs: Site settings → Identity →
   Enable Identity. Undang dirimu sendiri sebagai user lewat "Invite users" —
   itu jadi akun "developer" kamu.
4. Aktifkan **Netlify Blobs**: otomatis aktif begitu function pertama kali
   dipanggil, tidak perlu setup manual.
5. (Opsional) Isi 3 nilai EmailJS di bagian akhir `index.html`
   (`EMAILJS_PUBLIC_KEY`, `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`) supaya
   form kontak bisa kirim email — ambil dari dashboard emailjs.com.

## Mode developer vs mode user (untuk klien/HR)
- **User mode** (default, dilihat semua pengunjung termasuk HR/klien): tombol
  edit tidak muncul, konten tampil apa adanya, tombol "🔧 Developer" kecil di
  pojok kanan bawah untuk login.
- **Developer mode**: klik "🔧 Developer" → login pakai akun Netlify Identity
  yang sudah diundang di langkah 3 → muncul bar developer di atas + tombol
  "✏️ Edit Konten". Semua perubahan (teks, foto profil, cover, galeri proyek)
  langsung publish dan tampil ke semua pengunjung begitu disimpan.

## Yang baru disesuaikan di update ini
1. **Interface "whoami.sh" (terminal animasi) dihapus**, diganti kartu kaca
   (glassmorphism) di sisi foto — tetap menampilkan tiga bagian yang sama:
   `whoami`, `focus`, `availability`. Ketiga teks ini sekarang bisa diedit
   lewat mode developer (Edit Konten → bagian "// hero" → "kartu kaca di
   samping foto"), jadi tidak lagi hardcode di kode seperti sebelumnya.
2. **Foto profil dibesarkan** jadi elemen utama hero (bukan lagi bulatan
   kecil 78px), dengan cincin glow lembut di belakangnya dan name-chip kaca
   yang menempel di bagian bawah foto. Posisi & tata letak hero dirombak jadi
   dua kolom: teks di kiri, foto besar + kartu kaca di kanan.
3. **Animasi masuk**: begitu halaman pertama dibuka, teks hero, foto, dan
   kartu kaca muncul bertahap (fade + slide up). Bagian lain (about, skills,
   proyek, kontak) muncul dengan animasi serupa saat discroll ke posisinya.
   Animasi otomatis dimatikan untuk pengguna yang mengaktifkan "reduce
   motion" di perangkatnya.
4. Resolusi upload foto profil dinaikkan ke 640×640 supaya tetap tajam di
   ukuran tampilan yang jauh lebih besar.

Semua fitur lama (upload foto/cover/galeri, clap, share, form kontak, editor
konten) tetap berfungsi seperti sebelumnya — hanya tampilannya yang diperbarui.
