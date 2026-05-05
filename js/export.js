/**
 * js/export.js
 * Modul khusus untuk menangani fitur unik Ekspor Daftar Tugas (Task List) menjadi File Wallpaper Interaktif/Grafis (PNG).
 * Menggunakan library pihak ketiga 'html2canvas'.
 */

function exportToWallpaper() {
    const btn = event.currentTarget;
    const originalText = btn.innerHTML;
    
    // Merubah tombol menjadi indikator loading
    btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Memproses...';
    btn.disabled = true;

    // Fitur Wallpaper hanya menampilkan tugas yang belum selesai
    const tasks = getTasks().filter(t => t.status === 'pending');
    const container = document.getElementById('wp-task-list');
    container.innerHTML = '';
    
    if (tasks.length === 0) {
        // Menampilkan teks ucapan selamat jika pengguna sudah membersihkan semua pekerjaannya
        container.innerHTML = '<div class="wp-task-item"><h3 style="text-align:center;color:#cbd5e1;margin:0">Tidak ada tugas yang tertunda.<br>Saatnya bersantai! 🎉</h3></div>';
    } else {
        // Menyaring data hanya untuk menampilkan 5 tugas paling prioritas & mendesak (Urutan Deadline Terbaik)
        const sorted = [...tasks].sort((a, b) => {
            const aTs = a.deadline ? new Date(a.deadline).getTime() : 9999999999999;
            const bTs = b.deadline ? new Date(b.deadline).getTime() : 9999999999999;
            return aTs - bTs;
        }).slice(0, 5); 

        // Pembuatan tanggal cetak eksklusif untuk desain di bagian atas gambar
        const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
        const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
        const now = new Date();
        const dateStr = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
        document.getElementById('wp-date').innerHTML = `Jadwal Tugas<br><span style="font-size:2rem;color:#94a3b8;font-weight:500;letter-spacing:1px">${dateStr}</span>`;

        // Pemuatan data menjadi blok elemen rahasia pembentuk Gambar Wallpaper Template
        sorted.forEach(t => {
            const over = isOverdue(t);
            const dlStr = t.deadline ? formatDate(t.deadline) : 'Tidak ada tenggat';
            
            // Mewarnai teks merah jika terlambat, atau biru pudar jika tidak
            const dlColor = over ? '#ef4444' : (t.deadline ? '#60a5fa' : '#cbd5e1');
            const prioClass = `wp-priority-${t.priority}`;
            
            // Komputasi peringatan (H-x) untuk di dalam Gambar
            let countdownStr = '';
            if (t.deadline) {
                const today = new Date(); today.setHours(0,0,0,0);
                const dl = new Date(t.deadline); dl.setHours(0,0,0,0);
                const diff = Math.round((dl - today) / 86400000);
                if (diff < 0) countdownStr = ` <span style="color:#ef4444;font-weight:bold">(Terlambat ${Math.abs(diff)} hari)</span>`;
                else if (diff === 0) countdownStr = ` <span style="color:#f59e0b;font-weight:bold">(Hari ini!)</span>`;
                else if (diff === 1) countdownStr = ` <span style="color:#f59e0b;font-weight:bold">(Besok)</span>`;
                else countdownStr = ` <span style="color:#cbd5e1">(${diff} hari lagi)</span>`;
            }

            const descHtml = t.description ? `<p style="font-size:1.6rem; color:#94a3b8; margin: 10px 0 0 0; line-height: 1.4;">${escHtml(t.description)}</p>` : '';
            const prioText = t.priority === 'tinggi' ? 'Tinggi 🔴' : (t.priority === 'sedang' ? 'Sedang 🟡' : 'Rendah 🟢');
            
            // Inject konten (tersembunyi secara absolute visibility HTML namun nyata di DOM Object)
            container.innerHTML += `
                <div class="wp-task-item ${prioClass}">
                    <h3 style="margin-bottom:5px; font-size:2.4rem;">${escHtml(t.title)}</h3>
                    ${descHtml}
                    <div class="wp-task-meta" style="margin-top:25px; font-size:1.5rem; display:flex; justify-content:space-between;">
                        <div>
                            <span style="color:#94a3b8">Batas Waktu:</span> 
                            <span style="color: ${dlColor}; font-weight:600">${dlStr}</span>${countdownStr}
                        </div>
                        <div>
                            <span style="color:#94a3b8">Prioritas:</span> 
                            <span style="font-weight:600; color:#fff">${prioText}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        // Menampilkan pesan tambahan jika ternyata daftarnya sangat banyak, melebihi ruang
        if (tasks.length > 5) {
            container.innerHTML += `<div style="text-align:center;font-size:1.8rem;color:#cbd5e1;margin-top:20px">+ ${tasks.length - 5} tugas lainnya...</div>`;
        }
    }

    const template = document.getElementById('wallpaper-template');
    
    // Pemanggilan library html2canvas. Kita berikan delay sedikit (timeout 500ms) agar Browser merender CSS-nya terlebih dahulu
    setTimeout(() => {
        html2canvas(template, {
            scale: 2,  // Skala resolusi dua kali lipat untuk gambar High-Definition
            backgroundColor: null, // Transparan agar menutupi
            logging: false,
            useCORS: true // Membaca format CSS Eksternal
        }).then(canvas => {
            // Memaksa browser mengeksekusi proses Trigger Auto-Download
            const link = document.createElement('a');
            link.download = 'Jadwal-TaskFlow.png';
            link.href = canvas.toDataURL('image/png'); // Format PNG murni
            link.click();
            
            // Kembalikan status tombol ke keadaan semula
            btn.innerHTML = originalText;
            btn.disabled = false;
        }).catch(err => {
            console.error("Gagal membuat wallpaper:", err);
            alert("Maaf, terjadi kesalahan saat membuat wallpaper.");
            btn.innerHTML = originalText;
            btn.disabled = false;
        });
    }, 500);
}
