# Pengetahuan Umum - Curation Website

Website editorial minimalis untuk mengkurasi dan memverifikasi hoaks terkait pejabat, kebijakan, ekonomi, dan isu umum di Indonesia.

## 🚀 Daily Update Workflow (Simple)
Untuk memperbarui data setiap hari, ikuti langkah ini:

1. **Minta Gemini**: *"Update hoaks hari ini dari Komdigi, Mafindo, dan RRI."*
2. **Kirim (Push)**: Setelah saya memperbarui file `data.js`, jalankan `git add .`, `git commit -m "Update [Tanggal]"`, dan `git push`.
3. **Selesai**: Vercel akan otomatis mengupdate website Anda dalam hitungan detik.

---

## 🛠️ Tech Stack
- **Vite** (Build Tool)
- **Vanilla JS** (Logic)
- **Modern CSS** (Sharp UI, 0px border-radius)

## 📎 Sumber Data Terverifikasi
Data dikurasi secara real-time dari:
- [Kementerian Komunikasi dan Digital (Komdigi)](https://www.komdigi.go.id/berita/berita-hoaks)
- [TurnBackHoax / Mafindo](https://turnbackhoax.id)
- [Cek Fakta RRI](https://rri.co.id/cek-fakta)
- [CekFakta.com](https://cekfakta.com)

---

## 🏗️ Local Development
```bash
npm install
npm run dev
```
Gunakan `npm run dev -- --force` jika perubahan tidak langsung terlihat di browser.
