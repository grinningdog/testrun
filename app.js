// =========================================================================
// 🚨 VERSION CONTROL HIGHLIGHT:
// Stepped up version identifier to ensure clean reload cycles.
// =========================================================================
const SITE_VERSION = "2.4"; 

const defaultBooks = [
    {
        "title": "Blood Relatives",
        "meta": "An Inspector Griffin Mystery",
        "coverUrl": "Blood Relatives.jpg",
        "amazonUrl": "",
        "goodreadsUrl": "",
        "synopsis": "A near-miss with a speeding van at Waterloo Station is just the opening move in a deadly new game for Adam Griffin. Reunited with his old school friend, Finn Williams—now an elite white-hat hacker—Adam thinks his biggest challenge is navigating a sudden romance and managing his grandmother's massive literary estate.\n\nBut when a high-profile stabbing at the London School of Economics strikes a terrifyingly familiar chord, the investigation takes a deeply personal turn. Hidden behind a web of cyber-scams, stolen identities, and black-market weapons is a ghost from Adam's past: a woman he had never met, driven by a lifetime of bitter envy and a desperate hunger for his fortune.\n\nIn this 21st-century mystery, Adam and Finn must use every ounce of financial logic and hacking prowess to track a killer who is rapidly unravelling—before her final, desperate strike hits home."
    },
    {
        "title": "The Crypto Mystery Weekend",
        "meta": "An Inspector Griffin Mystery",
        "coverUrl": "A Crypto Mystery Weekend3.jpg",
        "amazonUrl": "",
        "goodreadsUrl": "",
        "synopsis": "An exclusive Murder Mystery weekend at a luxury Oxfordshire estate turns deadly when a real body is found bludgeoned in the garden.\n\nFor independently wealthy Adam Griffin and his partner Finn, a top-tier ethical hacker, the investigation quickly morphs from a cozy whodunit into a high-stakes cyber chase.\n\nAt the centre of it all? A fastidiously arrogant guest, a manipulative psychic medium and a hidden USB drive holding a secret. A secret worth killing for.\n\nTo catch a killer who has played everyone for a fool, they must follow the money—before the digital trail goes cold forever."
    },
    {
        "title": "The Choirboy Killer",
        "meta": "An Inspector Griffin Mystery",
        "coverUrl": "the choirboy killer.jpg",
        "amazonUrl": "",
        "goodreadsUrl": "",
        "synopsis": "COMING SOON!\n\nAn exciting new adventure with a tangled web of murder,  MI5 agents, Mexican Cartels and Big Pharma.\n\nWill a former child movie star escape them all and will Adam and Finn find the serial killer?"
    }
];

let isLoggedIn = false;
let editingIndex = null; 

/* --- XSS TEXT SANITIZER FILTER --- */
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

/* --- UPGRADED VERSION-CONTROLLED DOMAIN ENGINE --- */
function getBooks() {
    try {
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
        localStorage.setItem('author_books', JSON.stringify(defaultBooks));
        return defaultBooks;
    }
}

function saveBooks(books) {
    localStorage.setItem('author_books', JSON.stringify(books));
    renderBooks();
}

function renderBooks() {
    const books = getBooks();
    const griffinContainer = document.getElementById('books-container');
    const otherContainer = document.getElementById('other-works-container');
    const otherSection = document.getElementById('other-works-section');
    
    griffinContainer.innerHTML = '';
    otherContainer.innerHTML = '';
    
    let otherWorksCount = 0;

    books.forEach((book, index) => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';

        let coverHTML = `<div class="placeholder-text">Cover Art<br>Classification Pending</div>`;
        if(book.coverUrl && book.coverUrl.trim() !== "" && !book.coverUrl.startsWith("data:image")) {
            coverHTML = `<img src="${escapeHTML(book.coverUrl)}" alt="${escapeHTML(book.title)} Cover">`;
        }

        let purchasePathwaysHTML = '';
        if(book.amazonUrl && book.amazonUrl.trim() !== '') {
            purchasePathwaysHTML += `<a href="${escapeHTML(book.amazonUrl)}" target="_blank" class="btn-link-accent">🛒 Buy on Amazon</a>`;
        }
        if(book.goodreadsUrl && book.goodreadsUrl.trim() !== '') {
            purchasePathwaysHTML += `<a href="${escapeHTML(book.goodreadsUrl)}" target="_blank" class="btn-link-subtle">📖 Goodreads</a>`;
        }

        const upDisabled = index === 0 ? 'style="opacity: 0.2; cursor: not-allowed;" disabled' : '';
        const downDisabled = index === books.length - 1 ? 'style="opacity: 0.2; cursor: not-allowed;" disabled' : '';

        bookCard.innerHTML = `
            <div class="book-cover">
                ${coverHTML}
            </div>
            <div class="book-details">
                <h3>${escapeHTML(book.title)}</h3>
                <div class="book-meta">${escapeHTML(book.meta)}</div>
                <p class="book-synopsis">${escapeHTML(book.synopsis)}</p>
                
                ${purchasePathwaysHTML ? `<div class="book-links">${purchasePathwaysHTML}</div>` : ''}
                
                <div class="admin-actions" style="display: ${isLoggedIn ? 'flex' : 'none'}">
                    <button class="btn-sm" onclick="moveBook(${index}, -1)" ${upDisabled}>▲ Move Up</button>
                    <button class="btn-sm" onclick="moveBook(${index}, 1)" ${downDisabled}>▼ Move Down</button>
                    <button class="btn-sm" onclick="openBookModal(${index})" style="border-color: var(--accent-color)">Edit Parameters</button>
                    <button class="btn-sm btn-danger" onclick="deleteBook(${index})">Delete</button>
                </div>
            </div>
        `;
        
        if (book.category === 'other') {
            otherContainer.appendChild(bookCard);
            otherWorksCount++;
        } else {
            griffinContainer.appendChild(bookCard);
        }
    });

    if (otherWorksCount > 0) {
        otherSection.style.display = 'block';
    } else {
        otherSection.style.display = 'none';
    }

    document.getElementById('add-book-btn-container').style.display = isLoggedIn ? 'flex' : 'none';
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
    exportTextarea.value = JSON.stringify(sanitizedBooks, null, 4);
    document.getElementById('export-modal').style.display = 'flex';
    document.getElementById('copy-btn').innerText = "Copy to Clipboard";
}

async function copyExportedCode() {
    const textToCopy = document.getElementById('export-textarea').value;
    const copyBtn = document.getElementById('copy-btn');
    try {
        await navigator.clipboard.writeText(textToCopy);
        copyBtn.innerText = "✔ Code Copied!";
    } catch (err) {
        const textArea = document.getElementById('export-textarea');
        textArea.select();
        document.execCommand('copy');
        copyBtn.innerText = "✔ Code Copied!";
    }
}

function clearSystemMemory() {
    if (confirm("Reset layout system and clear browser memories? This restores your default settings.")) {
        localStorage.removeItem('author_books');
        localStorage.removeItem('site_version');
        location.reload();
    }
}

function handleContactSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const comment = document.getElementById('contact-comment').value;
    
    const emailRecipient = "bob@westwight.net";
    const subject = encodeURIComponent("Inquiry for Robert Chester from " + name);
    const body = encodeURIComponent("Name: " + name + "\nEmail: " + email + "\n\nMessage Payload:\n" + comment);
    
    window.location.href = "mailto:" + emailRecipient + "?subject=" + subject + "&body=" + body;
    document.getElementById('contact-form').reset();
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
        form.reset();
    }
    modal.style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    if(modalId === 'login-modal') {
        document.getElementById('login-error').style.display = 'none';
        document.getElementById('login-form').reset();
    }
}

function handleLogin(event) {
    event.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const errorMsg = document.getElementById('login-error');

    if (user === 'admin123' && pass === 'admin123') {
        isLoggedIn = true;
        errorMsg.style.display = 'none';
        closeModal('login-modal');
        document.getElementById('admin-nav-link').innerText = "Terminal (Logged In)";
        renderBooks();
    } else {
        errorMsg.style.display = 'block';
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
        document.getElementById('book-form').reset();
    };

    if (fileInput.files && fileInput.files[0]) {
        finalizeSave(fileInput.files[0].name); 
    } else {
        const fallbackCover = (editingIndex !== null) ? books[editingIndex].coverUrl : "";
        finalizeSave(fallbackCover);
    }
}

function moveBook(index, direction) {
    const books = getBooks();
    const targetIndex = index + direction;
    if (targetIndex >= 0 && targetIndex < books.length) {
        [books[index], books[targetIndex]] = [books[targetIndex], books[index]];
        saveBooks(books);
    }
}

function deleteBook(index) {
    const books = getBooks();
    if (confirm("Purge entry payload data for \"" + books[index].title + "\"?")) {
        books.splice(index, 1);
        saveBooks(books);
    }
}

window.onload = function() {
    renderBooks();
};
