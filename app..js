const defaultBooks = [
    { "title": "Blood Relatives", "meta": "Inspector Griffin Mystery", "coverUrl": "Blood Relatives.jpg", "synopsis": "Adam Griffin meets Finn Williams..." },
    { "title": "The Crypto Mystery Weekend", "meta": "Inspector Griffin Mystery", "coverUrl": "A Crypto Mystery Weekend3.jpg", "synopsis": "A murder at a luxury estate..." }
];

const defaultCharacters = [
    { "name": "Adam Griffin", "role": "The Analytical Investigator", "bio": "Managing his grandmother's estate..." }
];

// Check localStorage for existing session
let isLoggedIn = localStorage.getItem('isAdmin') === 'true';

document.addEventListener('DOMContentLoaded', () => {
    updateAdminButton();
    renderBooks();
    renderCharacters();
    document.getElementById('year').textContent = new Date().getFullYear();
});

function updateAdminButton() {
    const btn = document.getElementById('admin-nav-link');
    if (btn) btn.innerText = isLoggedIn ? "Terminal (Active)" : "Admin Panel";
}

function renderBooks() {
    const container = document.getElementById('books-container');
    if (!container) return;
    container.innerHTML = defaultBooks.map(b => `
        <div class="book-card">
            <div class="book-cover"><img src="${b.coverUrl}" style="width:100%;"></div>
            <div>
                <h3>${b.title}</h3><p>${b.meta}</p><p>${b.synopsis}</p>
                ${isLoggedIn ? `<button onclick="alert('Delete ${b.title}')" style="margin-top:10px; background:red; color:white; border:none; padding:5px;">Delete</button>` : ''}
            </div>
        </div>
    `).join('');
}

function renderCharacters() {
    const container = document.getElementById('dossiers-container');
    if (!container) return;
    container.innerHTML = defaultCharacters.map(c => `
        <div class="character-card">
            <div><h3>${c.name}</h3><p>${c.role}</p></div>
            <div><p>${c.bio}</p></div>
        </div>
    `).join('');
}

function handleAdminNavClick() {
    if (isLoggedIn) {
        if (confirm("Terminate admin terminal session?")) {
            isLoggedIn = false;
            localStorage.removeItem('isAdmin');
            updateAdminButton();
            renderBooks();
            renderCharacters();
        }
    } else {
        document.getElementById('login-modal').style.display = 'flex';
    }
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

function handleLogin(event) {
    event.preventDefault();
    if (document.getElementById('username').value === 'admin123' && document.getElementById('password').value === 'admin123') {
        isLoggedIn = true;
        localStorage.setItem('isAdmin', 'true');
        closeModal('login-modal');
        updateAdminButton();
        renderBooks();
        renderCharacters();
        alert("Logged In Successfully");
    } else {
        alert("Invalid credentials.");
    }
}
