/**
 * js/storage.js
 * Modul ini bertanggung jawab memfasilitasi interaksi dengan LocalStorage (database bawaan browser).
 */

// Mengambil seluruh database pendaftaran pengguna. Mengembalikan array kosong jika belum ada.
function getUsers() { return JSON.parse(localStorage.getItem('todo_users') || '[]'); }

// Merekam (menyimpan ulang) database pengguna kembali ke LocalStorage dalam bentuk JSON String
function saveUsers(u) { localStorage.setItem('todo_users', JSON.stringify(u)); }

// Mengambil sekumpulan tugas (tasks) yang hanya dikaitkan dengan pengguna yang login pada saat ini
function getTasks() { return JSON.parse(localStorage.getItem('todo_tasks_' + currentUser()) || '[]'); }

// Menyimpan pembaruan daftar tugas ke LocalStorage milik pengguna yang login saat ini
function saveTasks(t) { localStorage.setItem('todo_tasks_' + currentUser(), JSON.stringify(t)); }

// Membaca token identitas (Username) untuk pengguna yang sesinya masih terbuka 
function currentUser() { return localStorage.getItem('todo_current') || ''; }

// Mengonversi fungsi status login menjadi hasil true (sudah masuk) atau false (belum)
function isLoggedIn() { return !!currentUser(); }
