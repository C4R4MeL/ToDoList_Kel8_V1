/**
 * js/ui.js
 * Modul utama untuk memanipulasi DOM (Tampilan HTML), mengatur visibilitas, dan mencetak template HTML.
 */

// Menyimpan status memori untuk fitur Filter dan Pengurutan
let activeFilter = 'all';
let activeSort   = 'deadline';

// Fungsi untuk mentransisikan tampilan dari Landing/Login menuju Dashboard Utama Aplikasi
function showApp() {
    // Sembunyikan halaman otentikasi
    document.getElementById('authPage').classList.add('d-none');
    // Munculkan kontainer utama aplikasi
    document.getElementById('mainApp').classList.remove('d-none');
    
    // Sisipkan nama pengguna ke pesan sapaan
    const gt = document.getElementById('greetingText');
    if (gt) gt.innerHTML = `Halo, ${currentUser()}! 👋`;
    
    // Trigger penggambaran awal kartu tugas
    renderTasks();
}

// Fungsi untuk menghitung ringkasan statistik dan pesan hari ini
function updateGreeting() {
    const tasks   = getTasks();
    const today   = new Date().toISOString().split('T')[0]; // Format 'YYYY-MM-DD'
    
    // Menghitung status tertunda dan tenggat hari ini
    const pending = tasks.filter(t => t.status === 'pending').length;
    const todayT  = tasks.filter(t => t.deadline === today && t.status === 'pending').length;
    
    const subEl   = document.getElementById('greetingSubtext');

    // Menentukan pesan psikologis untuk motivasi pengguna
    if (todayT > 0)     subEl.innerHTML = `Kamu punya <strong>${todayT} task</strong> yang harus diselesaikan hari ini. Semangat!`;
    else if (pending>0) subEl.innerHTML = `Tidak ada task jatuh tempo hari ini. Kamu punya <strong>${pending} task</strong> yang masih pending.`;
    else                subEl.textContent = 'Semua task sudah selesai! Kerja bagus hari ini. 🎉';

    // Mencetak tanggal realtime di header dashboard
    const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    const now = new Date();
    document.getElementById('greetingDate').textContent =
        `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

// Fungsi merespons tombol filter (Semua, Pending, Selesai, Terlambat)
function applyFilter(f) {
    activeFilter = f;
    
    // Membersihkan class aktif lama, dan menambahkan ke tombol filter baru
    document.querySelectorAll('.stat-card-inner').forEach(el => el.classList.remove('active'));
    const statEl = document.getElementById(`stat-${f}`);
    if (statEl) statEl.classList.add('active');

    let visible = 0; // Menghitung kartu yang lolos filter
    const items = document.querySelectorAll('.task-item');
    
    // Proses penyembunyian kartu menggunakan properti display none
    items.forEach(item => {
        const status  = item.dataset.status;
        const overdue = item.dataset.overdue === 'true';
        let show = false;
        
        // Aturan validasi Filter
        if (f === 'all')                                            show = true;
        if (f === 'pending'   && status === 'pending' && !overdue) show = true;
        if (f === 'completed' && status === 'completed')           show = true;
        if (f === 'overdue'   && overdue)                          show = true;

        item.style.display = show ? '' : 'none';
        
        // Memutar ulang animasi fade jika elemen dimunculkan
        if (show) { item.style.animation = 'fadeInCard 0.3s ease'; visible++; }
    });

    // Menampilkan tulisan panduan jika data kosong di filter tersebut
    const old = document.getElementById('empty-filter-msg');
    if (old) old.remove();

    if (visible === 0 && getTasks().length > 0) {
        const labels = { all:'semua', pending:'pending', completed:'selesai', overdue:'terlambat' };
        const container = document.getElementById('task-container');
        const msg = document.createElement('div');
        msg.id = 'empty-filter-msg';
        msg.className = 'col-12 text-center py-4 text-muted';
        msg.innerHTML = `<i class="bi bi-filter-circle fs-3"></i><p class="mt-2">Tidak ada task <strong>${labels[f]}</strong> saat ini.</p>`;
        container.appendChild(msg);
    }
}

// Memproses menu opsi dropdown Sort (Urutkan berdasar...)
function sortTasks(sortBy) {
    activeSort = sortBy;
    
    // Menyesuaikan sorotan styling (biru) di dropdown
    document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active-sort'));
    const sortBtn = document.querySelector(`.sort-btn[data-sort="${sortBy}"]`);
    if (sortBtn) sortBtn.classList.add('active-sort');
    
    // Mengubah judul tombol dropdown agar informatif
    const labels = { deadline: '<i class="bi bi-calendar-event"></i> Deadline', priority: '<i class="bi bi-flag"></i> Prioritas' };
    document.getElementById('sortDropdown').innerHTML = `<i class="bi bi-sort-down"></i> ${labels[sortBy]}`;
    
    // Mengeksekusi ulang render tugas dengan urutan baru
    renderTasks();
}

// Fungsi utama (Core) pembentuk HTML susunan tugas
function renderTasks() {
    const tasks     = getTasks();
    const container = document.getElementById('task-container');

    // Mengumpulkan metrik ringkasan kartu
    const total     = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending   = tasks.filter(t => t.status === 'pending' && !isOverdue(t)).length;
    const overdue   = tasks.filter(t => isOverdue(t)).length;

    // Memproyeksikan metrik ke angka di atas (dashboard boxes)
    document.getElementById('statTotal').textContent     = total;
    document.getElementById('statPending').textContent   = pending;
    document.getElementById('statCompleted').textContent = completed;
    document.getElementById('statOverdue').textContent   = overdue;

    // Kondisi kosong ('Empty State') apabila akun pengguna masih baru
    if (total === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="empty-state shadow-sm">
                    <i class="bi bi-inbox text-muted" style="font-size:3rem"></i>
                    <h5 class="mt-3 text-muted">Belum ada task nih!</h5>
                    <p class="text-muted">Yuk mulai tambah task pertamamu 🚀</p>
                </div>
            </div>`;
        return;
    }

    // Melakukan proses sort sebelum menggambar. 
    // Data lokal tidak berubah karena kita memakai teknik *Spread Operator* [...tasks]
    let sorted = [...tasks];
    sorted.sort((a, b) => {
        const aComp = a.status === 'completed';
        const bComp = b.status === 'completed';
        
        // Pindahkan semua tugas selesai ke paling bawah, terlepas dari filter
        if (aComp && !bComp) return 1;
        if (!aComp && bComp) return -1;
        
        // Mekanisme perbandingan sorting (Deadline & Prioritas)
        if (activeSort === 'deadline') {
            const aTs = a.deadline ? new Date(a.deadline).getTime() : 9999999999999;
            const bTs = b.deadline ? new Date(b.deadline).getTime() : 9999999999999;
            return aTs - bTs;
        }
        return priorityNum(a.priority) - priorityNum(b.priority);
    });

    // Looping dan mencetak string komponen HTML Kartu per satu objek data
    container.innerHTML = sorted.map(task => {
        const comp     = task.status === 'completed';
        const over     = isOverdue(task);
        // Mengubah warna border/glow mengikuti jenis status/prioritas
        const cardCls  = comp ? 'completed' : `priority-${task.priority}`;
        const deadlineTs = task.deadline ? new Date(task.deadline).getTime() : 9999999999999;
        const pNum     = priorityNum(task.priority);

        return `
        <div class="col-md-6 task-item"
             data-id="${task.id}"
             data-status="${task.status}"
             data-overdue="${over}"
             data-priority="${pNum}"
             data-deadline-ts="${deadlineTs}">
            <div class="card task-card shadow-sm ${cardCls}">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h6 class="fw-semibold mb-0 ${comp ? 'text-decoration-line-through text-muted' : ''}">
                            ${escHtml(task.title)}
                        </h6>
                        ${priorityBadge(task.priority)}
                    </div>
                    <p class="card-text text-muted small mb-2 flex-grow-1">
                        ${task.description ? escHtml(task.description) : '<span class="fst-italic">Tidak ada deskripsi</span>'}
                    </p>
                    ${task.deadline ? `
                    <p class="small mb-2 ${over ? 'text-danger fw-bold' : 'text-muted'}">
                        <i class="bi bi-calendar-event"></i>
                        ${formatDate(task.deadline)}
                        · ${countdown(task.deadline, comp)}
                    </p>` : ''}
                    <div class="d-flex gap-2 mt-3 flex-wrap">
                        <button class="btn btn-sm ${comp ? 'btn-outline-secondary' : 'btn-success'}"
                                onclick="toggleStatus('${task.id}')">
                            <i class="bi bi-${comp ? 'arrow-counterclockwise' : 'check-lg'}"></i>
                            ${comp ? 'Batal' : 'Selesai'}
                        </button>
                        ${!comp ? `
                        <button class="btn btn-sm btn-warning" onclick="openEditModal('${task.id}')">
                            <i class="bi bi-pencil"></i> Edit
                        </button>` : ''}
                        <button class="btn btn-sm btn-danger" onclick="deleteTask('${task.id}')">
                            <i class="bi bi-trash"></i> Hapus
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');

    // Menerapkan penyesuaian visual setelah elemen DOM tercipta
    applyFilter(activeFilter);
    setTimeout(equalizeCards, 50);
    updateGreeting();
}

// Menghitung elemen-elemen dan memastikan kartu sebelahnya tidak menjadi timpang tingginya (Estetika UI Grid)
function equalizeCards() {
    const items = document.querySelectorAll('.task-item .card');
    items.forEach(c => c.style.height = 'auto'); // Lepaskan pengikat tinggi
    
    // Mengelompokkan kartu yang berada pada koordinat garis horisontal yang sama
    const rows = {};
    items.forEach(c => {
        if (!c.parentElement.style.display || c.parentElement.style.display !== 'none') {
            const top = c.getBoundingClientRect().top;
            if (!rows[top]) rows[top] = [];
            rows[top].push(c);
        }
    });
    
    // Temukan elemen tertinggi dalam satu baris, samakan yang lebih pendek kepadanya
    Object.values(rows).forEach(row => {
        const max = Math.max(...row.map(c => c.offsetHeight));
        row.forEach(c => c.style.height = max + 'px');
    });
}

// Validasi Form - Menandai kotak isian berwarna merah bila tak terisi
function checkTitle(input) {
    input.value.trim() === ''
        ? input.classList.add('is-invalid')
        : input.classList.remove('is-invalid');
}
