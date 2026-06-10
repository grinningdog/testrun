
// =========================================================================
// 🚨 VERSION CONTROL HIGHLIGHT:
// Stepped up version identifier to v3.1 to configure dual-form modules.
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
    }
];

// --- INITIAL DATA (Replace this block with your existing books/characters array) ---
const SITE_VERSION = "3.4"; 

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Render content
    renderBooks();
    renderCharacters();

    // 2. Set Footer Year
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
    console.log("System Initialized: " + SITE_VERSION);
});

// --- CORE FUNCTIONS ---
function renderBooks() {
    // Your existing render logic here
}

function renderCharacters() {
    // Your existing render logic here
}

function handleAdminNavClick() {
    document.getElementById('login-modal').style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

function handleLogin(event) {
    event.preventDefault();
    // Your existing login logic here
}
