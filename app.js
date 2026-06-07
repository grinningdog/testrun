// =========================================================================
// 🚨 VERSION CONTROL HIGHLIGHT:
// Stepped up version identifier to v3.0 to clear old Firefox memories.
// =========================================================================
const SITE_VERSION = "3.0"; 

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
    },
    {
        "title": "A new Romance",
        "meta": "How Not to Marry a Millionaire",
        "category": "other",
        "coverUrl": "the choirboy killer.jpg",
        "amazonUrl": "https://www.amazon.co.uk/No-Ladies-Detective-Agency-Book/dp/034911675X",
        "goodreadsUrl": "",
        "synopsis": "When you want to marry a miillionaire but accidentally fall in love."
    }
];

let isLoggedIn = false;
let editingIndex = null; 
let memoryFallbackCache = null; // Memory-resident backup cache array

/* --- XSS TEXT SANITIZER FILTER --- */
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

/* --- IMMUNIZED HARDENED STORAGE ENGINE --- */
function getBooks() {
    try {
        // Execute dynamic authorization verification probe
        const testKey = '__firefox_probe__';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);

        const currentVersion = localStorage.getItem('site_version');
        if (currentVersion !== SITE_VERSION) {
            localStorage.setItem('site_version', SITE_VERSION);
            localStorage.setItem('author_books', JSON.stringify(defaultBooks));
            return defaultBooks;
        }

        const stored = localStorage.getItem('author_books');
        if (!stored || stored.includes("data:image")) {
            localStorage.setItem('author_books', JSON.stringify(defaultBooks));
            return defaultBooks;
        }

        return JSON.parse(stored);
    } catch (error) {
        // If security barriers block local cookies, fall back to transient memory
        if (!memoryFallbackCache) {
            console.warn("Storage restricted. Fallback activated safely.");
            memoryFallbackCache = JSON.parse(JSON.stringify(defaultBooks));
        }
        return memoryFallbackCache;
    }
}

function saveBooks(books) {
    try {
        localStorage.setItem('author_books', JSON.stringify(books));
    } catch (error) {
        // Keeps user operations live even if device disk writes are locked down
        memoryFallbackCache = books;
    }
    renderBooks();
}

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
                    <button class="btn-admin-action" onclick="moveBook(${book.masterIndex}, 1)" ${downDisabled}>▼ Move Down</button>
                    <button class="btn-admin-action btn-admin-edit" onclick="openBookModal(${book.masterIndex})">Edit Parameters</button>
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

    if (otherSection) {
        otherSection.style.display = otherBooks.length > 0 ? 'block' : 'none';
    }
    const panelControl = document.getElementById('add-book-btn-container');
    if (panelControl) {
        panelControl.style.display = isLoggedIn ? 'flex' : 'none';
    }
}

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

function openExportModal() {
    const currentBooks = getBooks();
    const sanitizedBooks = currentBooks.map((book, idx) => {
        let accurateFilename = book.coverUrl;
        if (!accurateFilename || accurateFilename.trim() === "" || accurateFilename.startsWith("data:image")) {
            accurateFilename = "cover" + (idx + 1) + ".jpg";
        }
        return {
            title: book.title,
            meta: book.meta,
            category: book.category || "griffin",
            coverUrl: accurateFilename,
            amazonUrl: book.amazonUrl || "",
            goodreadsUrl: book.goodreadsUrl || "",
            synopsis: book.synopsis
        };
    });

    const exportTextarea = document.getElementById('export-textarea');
    if (exportTextarea) {
        exportTextarea.value = JSON.stringify(sanitizedBooks, null, 4);
        document.getElementById('export-modal').style.display = 'flex';
        document.getElementById('copy-btn').innerText = "Copy to Clipboard";
    }
}

async function copyExportedCode() {
    const textToCopy = document.getElementById('export-textarea').value;
    const copyBtn = document.getElementById('copy-btn');
    try {
        await navigator.clipboard.writeText(textToCopy);
        copyBtn.innerText = "Code Copied";
    } catch (err) {
        const textArea = document.getElementById('export-textarea');
        if (textArea) {
            textArea.select();
            document.execCommand('copy');
            copyBtn.innerText = "Code Copied";
        }
    }
}

function clearSystemMemory() {
    if (confirm("Reset layout system and clear browser memories? This restores your default settings.")) {
        try {
            localStorage.removeItem('author_books');
            localStorage.removeItem('site_version');
        } catch(e) {}
        location.reload();
    }
}

async function handleContactSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const comment = document.getElementById('contact-comment').value;
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    
    submitBtn.innerText = "TRANSMITTING...";
    submitBtn.disabled = true;

    try {
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                access_key: "PASTE_YOUR_WEB3FORMS_KEY_HERE",
                name: name,
                email: email,
                message: comment,
                subject: `New Reader Message from ${name}`
            })
        });

        const result = await response.json();
        
        if (result.success) {
            alert("Message sent successfully! It has been routed securely to your inbox.");
            document.getElementById('contact-form').reset();
        } else {
            alert("Submission error: " + result.message);
        }
    } catch (error) {
        alert("Connection error. The network background handshake timed out.");
    } finally {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
    }
}

function handleAdminNavClick() {
    if (isLoggedIn) {
        if(confirm("Terminate encrypted admin console session?")) {
            handleLogout();
        }
    } else {
        document.getElementById('login-modal').style.display = 'flex';
    }
}

function openBookModal(index) {
    editingIndex = (typeof index === 'number') ? index : null;
    
    const modal = document.getElementById('book-modal');
    const form = document.getElementById('book-form');
    if (!modal) return;
    
    if (editingIndex !== null) {
        const book = getBooks()[editingIndex];
        document.getElementById('modal-form-title').innerText = "Modify Book Entry";
        document.getElementById('modal-submit-btn').innerText = "Commit Changes";
        document.getElementById('file-hint').innerText = "Select a file or leave clear to preserve settings.";
        
        document.getElementById('book-title').value = book.title;
        document.getElementById('book-meta').value = book.meta;
        document.getElementById('book-category').value = book.category || "griffin";
        document.getElementById('book-amazon').value = book.amazonUrl || "";
        document.getElementById('book-goodreads').value = book.goodreadsUrl || "";
        document.getElementById('book-synopsis-input').value = book.synopsis;
    } else {
        document.getElementById('modal-form-title').innerText = "Create System Entry";
        document.getElementById('modal-submit-btn').innerText = "Publish Entry";
        document.getElementById('file-hint').innerText = "Select file matching your target cover folder asset.";
        if (form) form.reset();
    }
    modal.style.display = 'flex';
}

function closeModal(modalId) {
    const target = document.getElementById(modalId);
    if (target) target.style.display = 'none';
    if(modalId === 'login-modal') {
        document.getElementById('login-error').style.display = 'none';
        const loginForm = document.getElementById('login-form');
        if (loginForm) loginForm.reset();
    }
}

function handleLogin(event) {
    event.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const errorMsg = document.getElementById('login-error');

    if (user === 'admin123' && pass === 'admin123') {
        isLoggedIn = true;
        if (errorMsg) errorMsg.style.display = 'none';
        closeModal('login-modal');
        document.getElementById('admin-nav-link').innerText = "Terminal (Logged In)";
        renderBooks();
    } else {
        if (errorMsg) errorMsg.style.display = 'block';
    }
}

function handleLogout() {
    isLoggedIn = false;
    document.getElementById('admin-nav-link').innerText = "Admin Panel";
    renderBooks();
}

function handleBookFormSubmit(event) {
    event.preventDefault();
    const title = document.getElementById('book-title').value;
    const meta = document.getElementById('book-meta').value;
    const category = document.getElementById('book-category').value;
    const fileInput = document.getElementById('book-cover-file');
    const amazonUrl = document.getElementById('book-amazon').value;
    const goodreadsUrl = document.getElementById('book-goodreads').value;
    const synopsis = document.getElementById('book-synopsis-input').value;
    const books = getBooks();

    const finalizeSave = (coverFilename) => {
        const bookData = { title, meta, category, coverUrl: coverFilename, amazonUrl, goodreadsUrl, synopsis };
        if (editingIndex !== null) {
            books[editingIndex] = bookData;
        } else {
            books.push(bookData);
        }
        saveBooks(books);
        closeModal('book-modal');
        const bookForm = document.getElementById('book-form');
        if (bookForm) bookForm.reset();
    };

    if (fileInput && fileInput.files && fileInput.files[0]) {
        finalizeSave(fileInput.files[0].name); 
    } else {
        const fallbackCover = (editingIndex !== null) ? books[editingIndex].coverUrl : "";
        finalizeSave(fallbackCover);
    }
}

function deleteBook(masterIndex) {
    const books = getBooks();
    if (confirm("Purge entry payload data for \"" + books[masterIndex].title + "\"?")) {
        books.splice(masterIndex, 1);
        saveBooks(books);
    }
}

window.onload = function() {
    renderBooks();
};
