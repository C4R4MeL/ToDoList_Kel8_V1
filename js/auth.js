/**
 * js/auth.js
 * Modul ini menangani semua operasi berkaitan dengan Autentikasi Pengguna
 * (Registrasi, Login, Keamanan Password, dan Transisi Animasi UI).
 */

// Membuka panel register atau kembali ke panel login dengan animasi pergeseran/sliding
function switchPanel(target) {
    const box = document.getElementById('authBox');
    target === 'register' ? box.classList.add('show-register') : box.classList.remove('show-register');
}

// Mengganti tipe input dari "password" ke "text" agar sandi bisa terlihat saat mengklik ikon mata
function togglePass(id, btn) {
    const input = document.getElementById(id);
    const icon  = btn.querySelector('i');
    input.type  = input.type === 'password' ? 'text' : 'password';
    icon.className = input.type === 'password' ? 'bi bi-eye' : 'bi bi-eye-slash';
}

// Proses Registrasi
function doRegister() {
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirm  = document.getElementById('confirmPassword').value;
    const errEl    = document.getElementById('registerError');
    const sucEl    = document.getElementById('registerSuccess');

    // Reset notifikasi ke keadaan sembunyi
    errEl.classList.add('d-none');
    sucEl.classList.add('d-none');

    // Validasi data (Keamanan dan Format)
    if (!username || username.length < 3) return showErr(errEl, 'Username minimal 3 karakter.');
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return showErr(errEl, 'Username hanya huruf, angka, underscore.');
    if (password.length < 8) return showErr(errEl, 'Password minimal 8 karakter.');
    if (!/[A-Z]/.test(password)) return showErr(errEl, 'Password harus ada huruf kapital.');
    if (!/[0-9]/.test(password)) return showErr(errEl, 'Password harus ada angka.');
    if (!/[\W_]/.test(password)) return showErr(errEl, 'Password harus ada karakter spesial.');
    if (password !== confirm)    return showErr(errEl, 'Konfirmasi password tidak cocok.');

    // Menarik data database saat ini untuk memastikan duplikasi data tidak terjadi
    const users = getUsers();
    if (users.find(u => u.username === username)) return showErr(errEl, 'Username sudah dipakai.');

    // Menambahkan akun pengguna ke memori. Menggunakan btoa() murni untuk simulasi masking (encoding ringan)
    users.push({ username, password: btoa(password) });
    saveUsers(users);

    // Keberhasilan. Beralih ke layar login 1.5 detik kemudian.
    sucEl.innerHTML = '<i class="bi bi-check-circle"></i> Registrasi berhasil! Silakan login.';
    sucEl.classList.remove('d-none');
    setTimeout(() => switchPanel('login'), 1500);
}

// Proses Login masuk ke akun
function doLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errEl    = document.getElementById('loginError');
    errEl.classList.add('d-none');

    const users = getUsers();
    
    // Melakukan pencocokan identitas (Username dan Password yg diencode).
    const user  = users.find(u => u.username === username && u.password === btoa(password));

    // Jika username atau password tidak ada/salah di dalam LocalStorage
    if (!user) return showErr(errEl, 'Username atau password salah!');

    // Sesi aktif dicatat lalu tampilkan UI App
    localStorage.setItem('todo_current', username);
    showApp();
}

// Memutus sesi login, menghapus status, dan memuat ulang halaman
function doLogout() {
    localStorage.removeItem('todo_current');
    location.reload();
}

// Pembantu (Helper) untuk memunculkan kotak notifikasi error
function showErr(el, msg) {
    el.innerHTML = `<i class="bi bi-exclamation-circle"></i> ${msg}`;
    el.classList.remove('d-none');
}

// Mengevaluasi kekuatan password menggunakan Regex (Regular Expressions)
function checkStrength(val) {
    // Definisi aturan (Minimal 8 karakter, ada Kapital, ada huruf kecil, Angka, dan Simbol Unik)
    const rules = {
        'rule-length':  val.length >= 8,
        'rule-upper':   /[A-Z]/.test(val),
        'rule-lower':   /[a-z]/.test(val),
        'rule-number':  /[0-9]/.test(val),
        'rule-special': /[\W_]/.test(val),
    };
    
    let passed = 0;
    
    // Perbarui Teks indikator hijau/coret sesuai kriteria yang sukses
    for (const [id, ok] of Object.entries(rules)) {
        const el = document.getElementById(id);
        if (el) {
            el.style.textDecoration = ok ? 'line-through' : 'none';
            el.className = ok ? 'text-success' : (val === '' ? 'text-muted' : 'text-danger');
        }
        if (ok) passed++;
    }
    
    // Perbarui animasi bilah persentase visual (strength bar)
    const bar  = document.getElementById('strength-bar');
    const text = document.getElementById('strength-text');
    if (!bar) return;
    bar.style.width = (passed / 5 * 100) + '%';
    
    if (val === '') { bar.style.width = '0%'; text.textContent = ''; return; }
    
    if (passed <= 2) { bar.className = 'progress-bar bg-danger';  text.innerHTML = '<span class="text-danger">Lemah</span>'; }
    else if (passed <= 4) { bar.className = 'progress-bar bg-warning'; text.innerHTML = '<span class="text-warning">Sedang</span>'; }
    else { bar.className = 'progress-bar bg-success'; text.innerHTML = '<span class="text-success">Kuat</span>'; }
    
    // Otomatis mencocokkan konfirmasi ulang password
    checkMatch();
}

// Pengecekan real-time apakah Password Konfirmasi bernilai persis sama
function checkMatch() {
    const pw      = document.getElementById('regPassword')?.value;
    const confirm = document.getElementById('confirmPassword')?.value;
    const text    = document.getElementById('match-text');
    
    if (!text || confirm === '') { if(text) text.textContent = ''; return; }
    
    text.innerHTML = pw === confirm
        ? '<i class="bi bi-check-circle-fill text-success"></i> <span class="text-success">Password cocok</span>'
        : '<i class="bi bi-x-circle text-danger"></i> <span class="text-danger">Password tidak cocok</span>';
}
