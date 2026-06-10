// Data
const defaultBooks = [
    { "title": "Blood Relatives", "meta": "Inspector Griffin Mystery", "coverUrl": "Blood Relatives.jpg", "synopsis": "Adam Griffin meets Finn Williams..." },
    { "title": "The Crypto Mystery Weekend", "meta": "Inspector Griffin Mystery", "coverUrl": "A Crypto Mystery Weekend3.jpg", "synopsis": "A murder at a luxury estate..." }
];

const defaultCharacters = [
    { "name": "Adam Griffin", "role": "The Analytical Investigator", "bio": "Managing his grandmother's estate..." }
];

// Logic
document.addEventListener('DOMContentLoaded', () => {
    // 1. Set Date
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // 2. Initial Render
    renderBooks();
    renderCharacters();
    
    // 3. Update Admin Status if stored in browser
    if(localStorage.getItem('admin') === 'true') {
        document.getElementById('admin-nav-link').innerText = "Terminal (Active)";
    }
});

function renderBooks() {
    const container = document.getElementById('books-container');
    if (!container) return;
    
    const isAdmin = localStorage.getItem('admin') === 'true';
    
    container.innerHTML = defaultBooks.map(b => `
        <div class="book-card">
            <div><img src="${b.coverUrl}" style="width:100%;"></div>
            <div>
                <h3>${b.title}</h3><p>${b.meta}</p><p>${b.synopsis}</p>
                ${isAdmin ? `<button style="background:red; color:white; border:none; padding:5px 10px; margin-top:10px;">Delete</button>` : ''}
            </div>
        </div>
    `).join('');
}

function renderCharacters() {
    const container = document.getElementById('dossiers-container');
    if (!container) return;
    container.innerHTML = defaultCharacters.map(c => `
        <div class="character-card">
            <h3>${c.name}</h3><p>${c.role}</p><p>${c.bio}</p>
        </div>
    `).join('');
}

function handleAdminNavClick() {
    if (localStorage.getItem('admin') === 'true') {
        if(confirm("Terminate session?")) {
            localStorage.removeItem('admin');
            location.reload();
        }
    } else {
        document.getElementById('login-modal').style.display = 'flex';
    }
}

function handleLogin(event) {
    event.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    
    if (user === 'admin123' && pass === 'admin123') {
        localStorage.setItem('admin', 'true');
        location.reload(); // Refresh to apply changes
    } else {
        alert("Invalid login.");
    }
}
