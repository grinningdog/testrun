// Data Payload
const defaultBooks = [
    { "title": "Blood Relatives", "meta": "An Inspector Griffin Mystery", "category": "griffin", "coverUrl": "Blood Relatives.jpg", "synopsis": "Adam Griffin meets Finn Williams..." },
    { "title": "The Crypto Mystery Weekend", "meta": "An Inspector Griffin Mystery", "category": "griffin", "coverUrl": "A Crypto Mystery Weekend3.jpg", "synopsis": "A murder at a luxury estate..." },
    { "title": "The Choirboy Killer", "meta": "An Inspector Griffin Mystery", "category": "griffin", "coverUrl": "the choirboy killer.jpg", "synopsis": "Coming soon..." }
];

const defaultCharacters = [
    { "name": "Adam Griffin", "role": "The Analytical Investigator", "bio": "Managing his grandmother's estate..." },
    { "name": "Finn Williams", "role": "The Elite White-Hat Hacker", "bio": "An absolute wizard within the digital underworld." }
];

let isLoggedIn = false;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    renderBooks();
    renderCharacters();
    
    // Set Footer Year
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});

// Logic
function renderBooks() {
    const container = document.getElementById('books-container');
    if (!container) return;
    container.innerHTML = defaultBooks.map(b => `
        <div class="book-card">
            <div class="book-cover"><img src="${b.coverUrl}" style="width:100%;"></div>
            <div class="book-details"><h3>${b.title}</h3><p>${b.meta}</p><p>${b.synopsis}</p></div>
        </div>
    `).join('');
}

function renderCharacters() {
    const container = document.getElementById('dossiers-container');
    if (!container) return;
    container.innerHTML = defaultCharacters.map(c => `
        <div class="character-card">
            <div><h3>${c.name}</h3><p><b>${c.role}</b></p></div>
            <div><p>${c.bio}</p></div>
        </div>
    `).join('');
}

function handleAdminNavClick() {
    document.getElementById('login-modal').style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

function handleLogin(event) {
    event.preventDefault();
    if (document.getElementById('username').value === 'admin123' && document.getElementById('password').value === 'admin123') {
        isLoggedIn = true;
        closeModal('login-modal');
        alert("Logged In");
    } else {
        alert("Invalid credentials.");
    }
}
