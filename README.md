# CryptoFinance — Modern Crypto Trading Platform

CryptoFinance adalah platform trading kripto modern berbasis Next.js 14 yang dirancang untuk memberikan pengalaman profesional, ringkas, dan mudah dipahami. Semuanya dibangun dengan fokus pada kecepatan, kejelasan, dan kemudahan penggunaan — mulai dari data harga real‑time hingga integrasi wallet yang mulus.

## 🚀 Fitur Utama

### 💰 Market & Trading

* Harga kripto real‑time (CoinGecko API)
* Chart profesional dengan indikator teknikal
* Analisis market dan tren
* Mendukung lebih dari 100 aset kripto

### 🔗 Wallet Integration

* Koneksi MetaMask secara langsung
* Multi-chain: Ethereum, Polygon, BSC
* UI otomatis menyesuaikan status wallet
* Opsi login via wallet atau email

### 📊 Portfolio Management

* Bisa menambahkan banyak alamat wallet
* Perhitungan nilai portofolio secara real‑time
* Analisis performa dan metrik portofolio
* Visualisasi alokasi aset

### 🤖 AI Financial Advisor

* Chat AI untuk diskusi seputar investasi
* Rekomendasi berdasarkan portofolio
* Insight market dan sinyal trading
* Saran manajemen risiko

### 🎨 Pengalaman Pengguna

* Desain minimalis ala Bloomberg
* Mode gelap & terang
* Responsif di desktop dan mobile
* Navigasi yang bersih dan intuitif

## 🛠 Teknologi

### Frontend

* **Next.js 14** (App Router)
* **Tailwind CSS + shadcn/ui**
* **Framer Motion** untuk animasi
* **Recharts** untuk chart
* **Lucide Icons**

### Blockchain & Wallet

* **wagmi v2 + viem**
* **WalletConnect v2**
* TypeScript untuk type safety

### Backend & Auth

* **NextAuth.js**
* REST API endpoints
* Data dari CoinGecko API
* TanStack Query untuk state management

## 📋 Persiapan Lingkungan

* Node.js 18+
* npm/yarn/pnpm
* WalletConnect Project ID
* MetaMask atau wallet serupa

## ⚡ Cara Menjalankan

### 1. Clone & Install

```bash
git clone https://github.com/username/cryptoweb.git
cd cryptoweb
npm install
```

### 2. Setup Environment

Buat file `.env.local`:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
```

### 3. Jalankan Server

```bash
npm run dev
```

### 4. Akses Aplikasi

Buka `http://localhost:3000`

## 🔐 Alur Koneksi Wallet

1. Klik tombol **Connect**
2. Pilih wallet (MetaMask / WalletConnect / Coinbase)
3. Setujui permintaan dari wallet
4. Setelah terhubung, alamat wallet tampil di navbar
5. Dapat mengakses portfolio atau memutuskan koneksi

### Demo Akun (Email Login)

* Email: `demo@cryptofinance.app`
* Password: `demo123!`

## 📱 Bagian-Bagian Aplikasi

### 🏠 Home

* Overview platform
* Market ticker real-time
* Navigasi cepat ke fitur utama

### 📈 Markets

* Harga live
* Tabel data yang bisa di-sort
* Fitur pencarian aset
* Informasi change %, volume, dan market cap

### 📊 Portfolio

* Login diperlukan
* Tracking multi-wallet
* Perhitungan balance real-time
* Chart performa dan alokasi portofolio

### 🤖 AI Advisor

* Login diperlukan
* Chat untuk analisa dan strategi
* Insight market terbaru

### 📰 News

* Berita kripto terkurasi
* Tampilan ala Bloomberg

## 🏗 Struktur Project

```
cryptoweb/
├── src/
│   ├── app/               
│   ├── components/        
│   ├── lib/               
│   └── hooks/
├── public/                
├── docs/                  
└── package.json
```

## 🔧 Konfigurasi Tambahan

### WalletConnect

```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

### CoinGecko API

```
COINGECKO_API_KEY=your_api_key
```

### NextAuth

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret
```

## 📊 API

* `GET /api/markets`
* `GET /api/charts/[id]`
* `GET|POST /api/auth/[...nextauth]`
* `POST /api/wallet-login`
* `GET /api/news`
* `GET /api/insights`

## 🚀 Deployment

### Vercel (Rekomendasi)

* Hubungkan repo GitHub
* Tambahkan env di dashboard
* Deploy otomatis ketika push ke `main`

## 🔒 Keamanan

* Koneksi wallet aman
* Tidak ada private key di frontend
* Validasi input dan environment variable
* Rate limiting (direkomendasikan)

## 🚨 Catatan Penting

* Aplikasi ini untuk tujuan edukasi
* Bukan saran finansial
* Trading kripto berisiko

## 🤝 Kontribusi

* Fork repo
* Buat branch baru
* Tulis perubahan dan buat pull request

## 📄 Lisensi

MIT License

## 📞 Support

* GitHub Issues
* GitHub Discussions
* Dokumentasi di folder `/docs`

---

Dibangun dengan Next.js, TypeScript, dan teknologi Web3 modern.
