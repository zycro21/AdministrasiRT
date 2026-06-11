# AdministrasiRT

Aplikasi Administrasi RT berbasis Laravel dan React untuk mengelola data penghuni, rumah, tagihan bulanan, pembayaran iuran, pengeluaran, serta laporan keuangan perumahan.

## Study Case

Sistem ini dibuat untuk membantu pengelolaan administrasi RT pada sebuah perumahan yang memiliki:

* 20 rumah
* 15 rumah dihuni tetap
* 5 rumah dapat kosong atau dihuni kontrak sementara
* Iuran Satpam Rp100.000/bulan
* Iuran Kebersihan Rp15.000/bulan

---

# Tech Stack

## Backend

* PHP 8.2+
* Laravel 12
* Laravel Sanctum
* MySQL

## Frontend

* React
* Vite
* Axios
* React Router DOM
* Tailwind CSS

---

# Persyaratan Sistem

Pastikan sudah terinstall:

* PHP 8.2+
* Composer
* MySQL
* Node.js 20+
* NPM

---

# Clone Repository

Clone repository terlebih dahulu:

```bash
git clone https://github.com/zycro21/AdministrasiRT.git
```

Masuk ke folder project:

```bash
cd AdministrasiRT
```

Struktur project:

```text
AdministrasiRT
├── backend
└── frontend
```

Setelah proses clone selesai, lanjutkan ke proses instalasi backend dan frontend pada langkah berikutnya.

---

# Instalasi Backend

Masuk ke folder backend:

```bash
cd backend
```

## Install Dependency

```bash
composer install
```

## Copy Environment

```bash
cp .env.example .env
```

## Generate Application Key

```bash
php artisan key:generate
```

---

# Konfigurasi Database

Buat database baru di MySQL:

```sql
CREATE DATABASE administrasi_rt;
```

Edit file `.env`

```env
APP_NAME=AdministrasiRT
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=administrasi_rt
DB_USERNAME=root
DB_PASSWORD=
```

Sesuaikan username dan password MySQL di masing-masing komputer/laptop.

---

# Menjalankan Migration

```bash
php artisan migrate
```

---

# Menjalankan Seeder

Seeder akan membuat:

* User Admin
* Payment Type
* 20 Rumah
* Data Penghuni
* Riwayat Penghuni Rumah
* Tagihan Bulanan
* Pembayaran
* Pengeluaran

Jalankan:

```bash
php artisan migrate:fresh --seed
```

---

# Akun Login Default

```text
Email    : admin@test.com
Password : password123
```

---

# Menjalankan Backend

```bash
php artisan serve
```

Backend berjalan pada:

```text
http://localhost:8000
```

---

# Instalasi Frontend

Masuk ke folder frontend:

```bash
cd frontend
```

## Install Dependency

```bash
npm install
```

---

# Konfigurasi Environment Frontend

Buat file:

```text
frontend/.env
```

Isi dengan:

```env
VITE_API_URL=http://localhost:8000/api
VITE_STORAGE_URL=http://localhost:8000/storage
```

Jika backend berjalan pada host berbeda, sesuaikan URL di atas.

---

# Menjalankan Frontend

```bash
npm run dev
```

Frontend akan berjalan pada:

```text
http://localhost:5173
```

---

# Alur Menjalankan Aplikasi

## 1. Jalankan Backend

```bash
cd backend

php artisan serve
```

## 2. Jalankan Frontend

Buka terminal baru:

```bash
cd frontend

npm run dev
```

## 3. Akses Aplikasi

```text
http://localhost:5173
```

---

# Data Seeder

Seeder menghasilkan data simulasi:

## Rumah

* 20 Rumah
* 15 Rumah penghuni tetap
* 3 Rumah penghuni kontrak
* 2 Rumah kosong

## Historical Penghuni

Terdapat beberapa rumah yang memiliki riwayat pergantian penghuni untuk memenuhi requirement historical penghuni rumah.

## Tagihan Bulanan

Tagihan:

* Satpam
* Kebersihan

Untuk beberapa bulan terakhir.

## Pembayaran

Status tagihan dapat berupa:

* Pending (tapi di seeder dibuat pending semua)
* Paid
* Partially Paid

## Pengeluaran

Contoh data:

* Gaji Satpam
* Token Listrik Pos Satpam
* Perbaikan Jalan
* Perbaikan Selokan

---

# ERD

ERD aplikasi berupa PNG dan PDF tersedia pada folder:

```text
/backend/ERD/
```

---

# Catatan

* Backend dan frontend dibuat terpisah sesuai ketentuan soal.
* Tidak menggunakan Docker.
* Menggunakan autentikasi Laravel Sanctum.
* Data seeder disediakan untuk mempermudah pengujian aplikasi.
