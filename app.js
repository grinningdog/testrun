const defaultBooks = [
    { "title": "Blood Relatives", "meta": "Inspector Griffin Mystery", "coverUrl": "Blood Relatives.jpg", "synopsis": "Adam Griffin meets Finn Williams..." },
    { "title": "The Crypto Mystery Weekend", "meta": "Inspector Griffin Mystery", "coverUrl": "A Crypto Mystery Weekend3.jpg", "synopsis": "A murder at a luxury estate..." }
];

const defaultCharacters = [
    { "name": "Adam Griffin", "role": "The Analytical Investigator", "bio": "Managing his grandmother's estate..." }
];

document.addEventListener('DOMContentLoaded', () => {
    // Determine login state from local storage
    const isAdmin = localStorage.getItem('admin') === 'true';
    
    // Update Nav
    const adminLink = document.getElementById('admin-nav-link');
    if (adminLink) adminLink.innerText = isAdmin ? "Terminal (Active)" : "Admin Panel";

    renderBooks(isAdmin);
    renderCharacters();
});

function renderBooks(isAdmin) {
    const container = document.getElementById('books-container');
    if (!container) return;
    container.innerHTML = defaultBooks.map(b => `
        <div class="book-card">
            <div><img src="${b.coverUrl}" style="width:100%;"></div>
            <div>
                <h3>${b.title}</h3><p>${b.meta}</p><p>${b.synopsis}</p>
                ${isAdmin ? `<button onclick="alert('Delete')" style="margin-top:10px; background:red; color:white; border:none; padding:5px 10px;">Delete</button>` : ''}
            </div>
        </div>
    `).join('');
}

function renderCharacters() {
    const container = document.getElementById('dossiers-container');
    if (!container) return;
    container.innerHTML = defaultCharacters.map(c => `
        <div class="book-card">
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
    if (document.getElementById('username').value === 'admin123' && document.getElementById('password').value === 'admin123') {
        localStorage.setItem('admin', 'true');
        location.reload(); 
    } else {
        alert("Invalid login.");
    }
}
