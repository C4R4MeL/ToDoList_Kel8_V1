/**
 * js/task.js
 * Modul fungsional untuk mengontrol logika data spesifik tugas (Tambah, Ubah, Hapus, Selesai).
 */

// Mempersiapkan jendela modal dalam kondisi bersih untuk menginput Tugas Baru
function openAddModal() {
    document.getElementById('modalTitle').textContent = 'Tambah Task';
    document.getElementById('editTaskId').value = '';
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDesc').value = '';
    document.getElementById('taskPriority').value = 'sedang';
    document.getElementById('taskDeadline').value = '';
    document.getElementById('taskTitle').classList.remove('is-invalid'); // Menghapus jejak error sebelumnya
}

// Mempersiapkan jendela modal untuk mengubah / mengedit data tugas yang sudah ada berdasarkan ID unik
function openEditModal(id) {
    const task = getTasks().find(t => t.id === id);
    if (!task) return;
    
    document.getElementById('modalTitle').textContent = 'Edit Task';
    
    // Menerapkan data lama ke kotak input (Pre-fill)
    document.getElementById('editTaskId').value   = id;
    document.getElementById('taskTitle').value    = task.title;
    document.getElementById('taskDesc').value     = task.description || '';
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskDeadline').value = task.deadline || '';
    
    document.getElementById('taskTitle').classList.remove('is-invalid');
    
    // Tampilkan paksa secara programatis via Bootstrap
    const modal = new bootstrap.Modal(document.getElementById('taskModal'));
    modal.show();
}

// Menyimpan atau menimpa tugas ke database LocalStorage. Dipanggil saat tombol "Simpan" diklik
function saveTask() {
    const id       = document.getElementById('editTaskId').value; // Mengidentifikasi apakah proses Edit atau Baru
    const titleEl  = document.getElementById('taskTitle');
    const title    = titleEl.value.trim();
    const desc     = document.getElementById('taskDesc').value.trim();
    const priority = document.getElementById('taskPriority').value;
    const deadline = document.getElementById('taskDeadline').value;

    // Judul wajib ada agar tugas valid
    if (!title) {
        titleEl.classList.add('is-invalid');
        return;
    }

    const tasks = getTasks();
    
    if (id) {
        // Mode UPDATE (Perbarui Data Lama)
        const i = tasks.findIndex(t => t.id === id);
        if (i !== -1) {
            tasks[i].title = title;
            tasks[i].description = desc;
            tasks[i].priority = priority;
            tasks[i].deadline = deadline;
        }
    } else {
        // Mode INSERT (Sisipkan Data Baru)
        tasks.push({
            id: 'task_' + Date.now(), // Membentuk ID berbasis timestamp yang unik
            title, description: desc, priority, deadline, status: 'pending' // default selalu pending
        });
    }

    // Melaksanakan Penyimpanan Ke Database
    saveTasks(tasks);
    
    // Memaksa Modalnya Menutup Sendiri
    bootstrap.Modal.getInstance(document.getElementById('taskModal')).hide();
    
    // Memperbarui grafis aplikasi (merender ulang HTML)
    renderTasks();
}

// Fungsi sederhana yang membalik status (toogle) antara 'Selesai' atau kembali 'Pending'
function toggleStatus(id) {
    const tasks = getTasks();
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.status = task.status === 'completed' ? 'pending' : 'completed';
        saveTasks(tasks);
        renderTasks(); // Menampakkan visualisasi coret jika sudah selesai
    }
}

// Operasi Hapus Data. Ditambahkan prompt konfirmasi untuk mencegah ketidaksengajaan klik
function deleteTask(id) {
    if (confirm('Yakin ingin menghapus task ini?')) {
        let tasks = getTasks();
        tasks = tasks.filter(t => t.id !== id);
        saveTasks(tasks);
        renderTasks();
    }
}
