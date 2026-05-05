/**
 * js/main.js
 * Modul Entry Point yang secara krusial bekerja saat file web (DOM) selesai diproses sepenuhnya oleh Browser.
 * Tugas utamanya hanyalah menginspeksi apakah pengguna tersebut sudah pernah masuk / terekam di sistem memori, 
 * jika iya maka meloncati prosedur Log-In.
 */

// Menunggu kerangka HTML (DOM Content) terbentuk utuh secara komplit
document.addEventListener('DOMContentLoaded', () => {
    // Mengeksekusi transisi Bypass Panel Login jika session local valid
    if (isLoggedIn()) showApp();
});
