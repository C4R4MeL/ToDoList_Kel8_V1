/**
 * js/utils.js
 * Modul ini berisi fungsi-fungsi pembantu (helper) yang murni untuk memproses data.
 */

// Menghindari serangan XSS (Cross-Site Scripting) dengan mengubah karakter khusus HTML menjadi aman (escape)
function escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Memformat tanggal dari format standar 'YYYY-MM-DD' menjadi format yang mudah dibaca (misal: 12 Januari 2024)
function formatDate(d) {
    const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    const dt = new Date(d);
    return `${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}`;
}

// Mengonversi tingkat prioritas teks menjadi bobot angka untuk keperluan pengurutan (sorting)
// 1 = tinggi (prioritas teratas), 2 = sedang, 3 = rendah
function priorityNum(p) { return p === 'tinggi' ? 1 : p === 'sedang' ? 2 : 3; }

// Menghasilkan elemen HTML berupa badge (label warna) visual berdasarkan tingkat prioritas
function priorityBadge(p) {
    const map = {
        tinggi: '<span class="badge bg-danger badge-priority">🟠 Tinggi</span>',
        sedang: '<span class="badge bg-warning text-dark badge-priority">🟡 Sedang</span>',
        rendah: '<span class="badge bg-success badge-priority">🟢 Rendah</span>',
    };
    return map[p] || '';
}

// Menghitung sisa waktu menuju tenggat (deadline) dan mengembalikan label pengingat HTML
function countdown(deadline, isCompleted) {
    // Jika tidak ada batas waktu, atau tugas sudah selesai, abaikan.
    if (!deadline || isCompleted) return ''; 
    
    // Normalisasi waktu hari ini dan waktu deadline tanpa memperhitungkan jam
    const today = new Date(); today.setHours(0,0,0,0);
    const dl    = new Date(deadline); dl.setHours(0,0,0,0);
    
    // Menghitung selisih jarak dalam hitungan hari
    const diff  = Math.round((dl - today) / 86400000); 

    // Menyesuaikan warna dan pesan urgensi berdasarkan sisa waktu
    if (diff < 0)  return `<span class="text-danger">⚠️ ${Math.abs(diff)} hari terlambat</span>`;
    if (diff === 0) return `<span class="text-danger fw-bold">⏰ Hari ini!</span>`;
    if (diff === 1) return `<span class="text-warning fw-bold">⏰ Besok!</span>`;
    if (diff <= 3)  return `<span class="text-warning">⏰ ${diff} hari lagi</span>`;
    if (diff <= 7)  return `<span class="text-info">⏰ ${diff} hari lagi</span>`;
    return `<span class="text-muted">⏰ ${diff} hari lagi</span>`;
}

// Mengecek kondisi boolean apakah suatu tugas sudah melewati batas hari (Overdue)
function isOverdue(task) {
    if (!task.deadline || task.status === 'completed') return false;
    const today = new Date(); today.setHours(0,0,0,0);
    return new Date(task.deadline) < today;
}
