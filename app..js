// =========================================================================
// 🚨 NO. 5: DATA PAYLOAD SELF-HEALING UPGRADE
// Bumping version control to v3.1 to force-clear corrupted browser states.
// =========================================================================
const SITE_VERSION = "3.1"; 

const defaultBooks = [
    {
        "title": "Blood Relatives",
        "meta": "An Inspector Griffin Mystery",
        "category": "griffin",
        "coverUrl": "Blood Relatives.jpg",
        "amazonUrl": "",
        "goodreadsUrl": "",
        "synopsis": "A near-miss with a speeding van at Waterloo Station is just the opening move in a deadly new game for Adam Griffin. Reunited with his old school friend, Finn Williams—now an elite white-hat hacker—Adam thinks his biggest challenge is navigating a sudden romance and managing his grandmother's massive literary estate.\n\nBut when a high-profile stabbing at the London School of Economics strikes a terrifyingly familiar chord, the investigation takes a deeply personal turn. Hidden behind a web of cyber-scams, stolen identities, and black-market weapons is a ghost from Adam's past: a woman he had never met, driven by a lifetime of bitter envy and a desperate hunger for his fortune.\n\nIn this 21st-century mystery, Adam and Finn must use every ounce of financial logic and hacking prowess to track a killer who is rapidly unravelling—before her final, desperate strike hits home."
    },
    {
        "title": "The Crypto Mystery Weekend",
        "meta": "An Inspector Griffin Mystery",
        "category": "griffin",
        "coverUrl": "A Crypto Mystery Weekend3.jpg",
        "amazonUrl": "",
        "goodreadsUrl": "",
        "synopsis": "An exclusive Murder Mystery weekend at a luxury Oxfordshire estate turns deadly when a real body is found bludgeoned in the garden.\n\nFor independently wealthy Adam Griffin and his partner Finn, a top-tier ethical hacker, the investigation quickly morphs from a cozy whodunit into a high-stakes cyber chase.\n\nAt the centre of it all? A fastidiously arrogant guest, a manipulative psychic medium and a hidden USB drive holding a secret. A secret worth killing for.\n\nTo catch a killer who has played everyone for a fool, they must follow the money—before the digital trail goes cold forever."
    },
    {
        "title": "The Choirboy Killer",
        "meta": "An Inspector Griffin Mystery",
        "category": "griffin",
        "coverUrl": "the choirboy killer.jpg",
        "amazonUrl": "",
        "goodreadsUrl": "",
        "synopsis": "COMING SOON!\n\nAn exciting new adventure with a tangled web of murder, MI5 agents, Mexican Cartels and Big Pharma.\n\nWill a former child movie star escape them all and will Adam and Finn find the serial killer?"
    }
];

const defaultCharacters = [
    {
        "name": "Adam Griffin",
        "role": "The Analytical Investigator",
        "traits": "Grandson of a mystery icon, hyper-logical, independently wealthy.",
        "bio": "Managing his grandmother's massive literary estate was supposed to be quiet, archival work. Instead, Adam finds his hyper-focused, puzzle-solving mind pulled out from behind a desk and thrust into genuine high-stakes investigations, where classic deductive logic serves as his ultimate weapon."
    },
    {
        "name": "Finn Williams",
        "role": "The Elite White-Hat Hacker",
        "traits": "Cybersecurity prodigy, runs on caffeine, fiercely protective.",
        "bio": "An absolute wizard within the digital underworld. Finn handles encrypted data pipelines, device cracking, and deep-web tracing, acting as the perfect hyper-modern digital lens to complement Adam's traditional analytical reasoning."
    }
];

let isLoggedIn = false;
let editingIndex = null; 
let editingCharIndex = null; 
let memoryFallbackCache = null; 
let memoryCharFallbackCache = null;

/* --- XSS TEXT SANITIZER FILTER --- */
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

/* --- IMMUNIZED CORE DATA RESTORATION PIPELINE --- */
function getBooks() {
    try {
        const testKey = '__storage_test__';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);

        const currentVersion = localStorage.getItem('site_version');
        if (currentVersion !== SITE_VERSION) {
            localStorage.setItem('site_version', SITE_VERSION);
            localStorage.setItem('author_books', JSON.stringify(defaultBooks));
            localStorage.setItem('author_characters', JSON.stringify(defaultCharacters));
            return defaultBooks;
        }

        const stored = localStorage.getItem('author_books');
        if (stored) {
            const parsed = JSON.parse(stored);
            // STRICT FORMAT VALIDATION GATE: Erases storage if data model corrupts
            if (Array.isArray(parsed)) return parsed;
        }
        return defaultBooks;
    } catch (error) {
        if (!memoryFallbackCache) {
            memoryFallbackCache = JSON.parse(JSON.stringify(defaultBooks));
        }
        return memoryFallbackCache;
    }
}

function getCharacters() {
    try {
        const stored = localStorage.getItem('author_characters');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) return parsed;
        }
        return defaultCharacters;
    } catch (error) {
        if (!memoryCharFallbackCache) {
            memoryCharFallbackCache = JSON.parse(JSON.stringify(defaultCharacters));
        }
        return memoryCharFallbackCache;
    }
}

function saveBooks(books) {
    try { localStorage.setItem('author_books', JSON.stringify(books)); } 
    catch (e) { memoryFallbackCache = books; }
    renderBooks();
}

function saveCharacters(chars) {
    try { localStorage.setItem('author_characters', JSON.stringify(chars)); } 
    catch (e) { memoryCharFallbackCache = chars; }
    renderCharacters();
}

/* --- DOM RENDER CHANNELS --- */
function renderBooks() {
    const books = getBooks();
    const griffinContainer = document.getElementById('books-container');
    const otherContainer = document.getElementById('other-works-container');
    const otherSection = document.getElementById('other-works-section');
    
    if (!griffinContainer || !otherContainer) return;
    griffinContainer.innerHTML = '';
    otherContainer.innerHTML = '';
    
    const griffinBooks = books.map((b, idx) => ({ ...b, masterIndex: idx })).filter(b => b.category !== 'other');
    const otherBooks = books.map((b, idx) => ({ ...b, masterIndex: idx })).filter(b => b.category === 'other');

    const generateCardHTML = (book, sectionIndex, sectionLength) => {
        let coverHTML = `<div class="placeholder-text">Cover Art<br>Classification Pending</div>`;
        if(book.coverUrl && book.coverUrl.trim() !== "" && !book.coverUrl.startsWith("data:image")) {
            coverHTML = `<img src="${escapeHTML(book.coverUrl)}" alt="${escapeHTML(book.title)} Cover">`;
        }

        let purchasePathwaysHTML = '';
        if(book.amazonUrl && book.amazonUrl.trim() !== '') {
            purchasePathwaysHTML += `<a href="${escapeHTML(book.amazonUrl)}" target="_blank" class="btn-link-accent">Buy on Amazon</a>`;
        }
        if(book.goodreadsUrl && book.goodreadsUrl.trim() !== '') {
            purchasePathwaysHTML += `<a href="${escapeHTML(book.goodreadsUrl)}" target="_blank" class="btn-link-subtle">Goodreads</a>`;
        }

        const upDisabled = sectionIndex === 0 ? 'style="opacity: 0.15; cursor: not-allowed; pointer-events: none;" disabled' : '';
        const downDisabled = sectionIndex === sectionLength - 1 ? 'style="opacity: 0.15; cursor: not-allowed; pointer-events: none;" disabled' : '';

        return `
            <div class="book-cover">
                ${coverHTML}
            </div>
            <div class="book-details">
                <h3>${escapeHTML(book.title)}</h3>
                <div class="book-meta">${escapeHTML(book.meta)}</div>
                <p class="book-synopsis">${escapeHTML(book.synopsis)}</p>
                
                ${purchasePathwaysHTML ? `<div class="book-links">${purchasePathwaysHTML}</div>` : ''}
                
                <div class="admin-actions" style="display: ${isLoggedIn ? 'flex' : 'none'}">
                    <button class="btn-admin-action" onclick="moveBook(${book.masterIndex}, -1)" ${upDisabled}>Move Up</button>
                    <button class="btn-admin-action" onclick="moveBook(${book.masterIndex}, 1)" ${downDisabled}>Move Down</button>
                    <button class="btn-admin-action" onclick="openBookModal(${book.masterIndex})">Edit Parameters</button>
                    <button class="btn-admin-action btn-admin-delete" onclick="deleteBook(${book.masterIndex})">Delete</button>
                </div>
            </div>
        `;
    };

    griffinBooks.forEach((book, sIdx) => {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = generateCardHTML(book, sIdx, griffinBooks.length);
        griffinContainer.appendChild(card);
    });

    otherBooks.forEach((book, sIdx) => {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = generateCardHTML(book, sIdx, otherBooks.length);
        otherContainer.appendChild(card);
    });

    if (otherSection) otherSection.style.display = otherBooks.length > 0 ? 'block' : 'none';
    const panelControl = document.getElementById('add-book-btn-container');
    if (panelControl) panelControl.style.display = isLoggedIn ? 'flex' : 'none';
}

function renderCharacters() {
    const chars = getCharacters();
    const container = document.getElementById('dossiers-container');
    if (!container) return;
    container.innerHTML = '';

    chars.forEach((char, index) => {
        const card = document.createElement('div');
        card.className = 'character-card';

        const upDisabled = index === 0 ? 'style="opacity: 0.15; cursor: not-allowed; pointer-events: none;" disabled' : '';
        const downDisabled = index === chars.length - 1 ? 'style="opacity: 0.15; cursor: not-allowed; pointer-events: none;" disabled' : '';

        card.innerHTML = `
            <div>
                <div class="character-header">
                    <h3>${escapeHTML(char.name)}</h3>
                    <div class="character-role">${escapeHTML(char.role)}</div>
                </div>
                <div class="character-traits">${escapeHTML(char.traits)}</div>
                <p class="character-bio">${escapeHTML(char.bio)}</p>
            </div>
            <div class="admin-actions" style="display: ${isLoggedIn ? 'flex' : 'none'}; margin-top: 1.5rem;">
                <button class="btn-admin-action" onclick="moveCharacter(${index}, -1)" ${upDisabled}>Up</button>
                <button class="btn-admin-action" onclick="moveCharacter(${index}, 1)" ${downDisabled}>Down</button>
                <button class="btn-admin-action" onclick="openCharacterModal(${index})">Edit</button>
                <button class="btn-admin-action btn-admin-delete" onclick="deleteCharacter(${index})">Delete</button>
            </div>
        `;
        container.appendChild(card);
    });
}

/* --- SWAP MECHANICS --- */
function moveBook(masterIndex, direction) {
    const books = getBooks();
    const targetBook = books[masterIndex];
    const category = targetBook.category || 'griffin';
    
    const sectionBooks = books
        .map((b, idx) => ({ ...b, originalIndex: idx }))
        .filter(b => (b.category || 'griffin') === category);
        
    const relativeIndex = sectionBooks.findIndex(b => b.originalIndex === masterIndex);
    const targetRelativeIndex = relativeIndex + direction;
    
    if (targetRelativeIndex >= 0 && targetRelativeIndex < sectionBooks.length) {
        const currentMasterIdx = masterIndex;
        const targetMasterIdx = sectionBooks[targetRelativeIndex].originalIndex;
        [books[currentMasterIdx], books[targetMasterIdx]] = [books[targetMasterIdx], books[currentMasterIdx]];
        saveBooks(books);
    }
}

function moveCharacter(index, direction) {
    const chars = getCharacters();
    const targetIndex = index + direction;
    if (targetIndex >= 0 && targetIndex < chars.length) {
        [chars[index], chars[targetIndex]] = [chars[targetIndex], chars[index]];
        saveCharacters(chars);
    }
}

/* --- MODAL WINDOW CONTROLLERS --- */
function openBookModal(index) {
    editingIndex = (typeof index === 'number') ? index : null;
    const modal = document.getElementById('book-modal');
    if (!modal) return;
    
    if (editingIndex !== null) {
        const book = getBooks()[editingIndex];
        document.getElementById('modal-form-title').innerText = "Modify Book Entry";
        document.getElementById('book-title').value = book.title;
        document.getElementById('book-meta').value = book.meta;
        document.getElementById('book-category').value = book.category || "griffin";
        document.getElementById('book-amazon').value = book.amazonUrl || "";
        document.getElementById('book-goodreads').value = book.goodreadsUrl || "";
        document.getElementById('book-synopsis-input').value = book.synopsis;
    } else {
        document.getElementById('modal-form-title').innerText = "Create System Entry";
        const form = document.getElementById('book-form');
        if (form) form.reset();
    }
    modal.style.display = 'flex';
}

function openCharacterModal(index) {
    editingCharIndex = (typeof index === 'number') ? index : null;
    const modal = document.getElementById('character-modal');
    if (!modal) return;

    if (editingCharIndex !== null) {
        const char = getCharacters()[editingCharIndex];
        document.getElementById('char-modal-title').innerText = "Modify Character Profile";
        document.getElementById('char-name').value = char.name;
        document.getElementById('char-role').value = char.role;
        document.getElementById('char-traits').value = char.traits;
        document.getElementById('char-bio').value = char.bio;
    } else {
        document.getElementById('char-modal-title').innerText = "Create New Character Profile";
        const form = document.getElementById('character-form');
        if (form) form.reset();
    }
    modal.style.display = 'flex';
}

function closeModal(modalId) {
    const target = document.getElementById(modalId);
    if (target) target.style.display = 'none';
}

function handleBookFormSubmit(event) {
    event.preventDefault();
    const books = getBooks();
    const fileInput = document.getElementById('book-cover-file');

    const bookData = {
        title: document.getElementById('book-title').value,
        meta: document.getElementById('book-meta').value,
        category: document.getElementById('book-category').value,
        coverUrl: (fileInput && fileInput.files && fileInput.files[0]) ? fileInput.files[0].name : ((editingIndex !== null) ? books[editingIndex].coverUrl : ""),
        amazonUrl: document.getElementById('book-amazon').value,
        goodreadsUrl: document.getElementById('book-goodreads').value,
        synopsis: document.getElementById('book-synopsis-input').value
    };

    if (editingIndex !== null) books[editingIndex] = bookData;
    else books.push(bookData);
    
    saveBooks(books);
    closeModal('book-modal');
}

function handleCharacterFormSubmit(event) {
    event.preventDefault();
    const chars = getCharacters();
    const charData = {
        name: document.getElementById('char-name').value,
        role: document.getElementById('char-role').value,
        traits: document.getElementById('char-traits').value,
        bio: document.getElementById('char-bio').value
    };

    if (editingCharIndex !== null) chars[editingCharIndex] = charData;
    else chars.push(charData);

    saveCharacters(chars);
    closeModal('character-modal');
}

function deleteBook(masterIndex) {
    const books = getBooks();
    if (confirm("Purge entry payload data for \"" + books[masterIndex].title + "\"?")) {
        books.splice(masterIndex, 1);
        saveBooks(books);
    }
}

function deleteCharacter(index) {
    const chars = getCharacters();
    if (confirm("Purge entry data dossier for \"" + chars[index].name + "\"?")) {
        chars.splice(index, 1);
        saveCharacters(chars);
    }
}

/* --- BACKUP SYSTEM EXPORTER --- */
function openExportModal() {
    const exportTextarea = document.getElementById('export-textarea');
    if (!exportTextarea) return;

    const dataBackupBlock = {
        siteVersion: SITE_VERSION,
        booksData: getBooks(),
        charactersData: getCharacters()
    };

    exportTextarea.value = JSON.stringify(dataBackupBlock, null, 4);
    document.getElementById('export-modal').style.display = 'flex';
    document.getElementById('copy-btn').innerText = "Copy to Clipboard";
}

async function copyExportedCode() {
    const textToCopy = document.getElementById('export-textarea').value;
    const copyBtn = document.getElementById('copy-btn');
    try {
        await navigator.clipboard.writeText(textToCopy);
        copyBtn.innerText = "Code Copied";
    } catch (err) {
        const textArea = document.getElementById('export-textarea');
        if (textArea) { textArea.select(); document.execCommand('copy'); copyBtn.innerText = "Code Copied"; }
    }
}

function clearSystemMemory() {
    if (confirm("Reset layout system and clear browser memories? This restores your default settings.")) {
        try { localStorage.removeItem('author_books'); localStorage.removeItem('author_characters'); localStorage.removeItem('site_version'); } catch(e) {}
        location.reload();
    }
}

/* --- SECURE API SUBMISSIONS --- */
async function handleContactSubmit(event) {
    event.preventDefault();
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "TRANSMITTING...";
    submitBtn.disabled = true;

    try {
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({
                access_key: "199893c8-b1b4-464e-8a6a-4c30dca92931",
                name: document.getElementById('contact-name').value,
                email: document.getElementById('contact-email').value,
                message: document.getElementById('contact-comment').value,
                subject: `New Reader Message from ${document.getElementById('contact-name').value}`
            })
        });
        const result = await response.json();
        if (result.success) { alert("Message sent successfully! Routed securely to inbox."); document.getElementById('contact-form').reset(); } 
        else { alert("Submission error: " + result.message); }
    } catch (error) { alert("Connection error. Network handshake timed out."); } 
    finally { submitBtn.innerText = originalText; submitBtn.disabled = false; }
}

async function handleSubscribeSubmit(event) {
    event.preventDefault();
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "TRANSMITTING...";
    submitBtn.disabled = true;

    try {
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({
                access_key: "10273041-54af-48f6-a152-3560099fc314",
                name: document.getElementById('subscriber-name').value,
                email: document.getElementById('subscriber-email').value,
                message: `${document.getElementById('subscriber-name').value} has requested enrollment into your reader subscriber registry list.`,
                subject: `New Mailing List Enrollment Request`
            })
        });
        const result = await response.json();
        if (result.success) { alert("Subscription successful! Enrolled into database registry."); document.getElementById('subscribe-form').reset(); } 
        else { alert("Subscription error: " + result.message); }
    } catch (error) { alert("Connection error. Handshake timed out."); } 
    finally { submitBtn.innerText = originalText; submitBtn.disabled = false; }
}

function handleAdminNavClick() {
    if (isLoggedIn) { if(confirm("Terminate admin terminal session?")) handleLogout(); } 
    else { document.getElementById('login-modal').style.display = 'flex'; }
}

function handleLogin(event) {
    event.preventDefault();
    if (document.getElementById('username').value === 'admin123' && document.getElementById('password').value === 'admin123') {
        isLoggedIn = true;
        closeModal('login-modal');
        document.getElementById('admin-nav-link').innerText = "Terminal (Active)";
        renderBooks();
        renderCharacters();
    } else { alert("Invalid access credentials."); }
}

function handleLogout() {
    isLoggedIn = false;
    document.getElementById('admin-nav-link').innerText = "Admin Panel";
    renderBooks();
    renderCharacters();
}

// Global invocation ensures clean bootstrap loading patterns
window.onload = function() {
    renderBooks();
    renderCharacters();


// Dynamic Year in Footer
document.addEventListener('DOMContentLoaded', () => {
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});
};
