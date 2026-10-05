// app.js
let appData = {};
const STORAGE_KEY = 'griffin_universe_bible_data';
let currentSection = 'dashboard';

// --- DEFAULT SAMPLE DATA (Fallback for file:// protocol) ---
const DEFAULT_DATA = {
  characters: [
    { id: "char_1", name: "Robby Dorset", nickname: "Rob", birthYear: 1941, deathYear: "", status: "Alive", description: "A resilient man with a complex past.", personalityTraits: "Brave, Stubborn, Loyal", physicalDescription: "Tall, greying hair, sharp eyes.", occupation: "Former Soldier", firstAppearance: "Book 1", notes: "Central to the early timeline.", arc: "From lost soldier to family patriarch.", coreFear: "Abandonment", coreDesire: "Peace", relationships: "rel_1", families: "Griffin Family", locations: "loc_1", tags: "protagonist, veteran" },
    { id: "char_2", name: "Elspeth Potter", nickname: "Elle", birthYear: 1945, deathYear: "", status: "Alive", description: "Intelligent and fiercely independent.", personalityTraits: "Smart, Independent, Compassionate", physicalDescription: "Dark hair, warm smile.", occupation: "Teacher", firstAppearance: "Book 1", notes: "Meets Robby in 1963.", arc: "Finds her voice in a restrictive society.", coreFear: "Conformity", coreDesire: "Freedom", relationships: "rel_1", families: "Griffin Family", locations: "loc_2", tags: "protagonist, educator" },
    { id: "char_3", name: "Adam Griffin", nickname: "Adam", birthYear: 1970, deathYear: "", status: "Alive", description: "The modern protagonist uncovering family secrets.", personalityTraits: "Curious, Analytical, Anxious", physicalDescription: "Average height, wears glasses.", occupation: "Journalist", firstAppearance: "Book 1", notes: "Grandson of Adam's Father.", arc: "Uncovering the truth about his lineage.", coreFear: "Betrayal", coreDesire: "Truth", relationships: "rel_2", families: "Griffin Family", locations: "loc_3", tags: "protagonist, investigator" },
    { id: "char_4", name: "Finn Williams", nickname: "Finn", birthYear: 1968, deathYear: "", status: "Alive", description: "Charming but dangerous.", personalityTraits: "Manipulative, Charismatic, Ruthless", physicalDescription: "Well-dressed, sharp features.", occupation: "Businessman", firstAppearance: "Book 2", notes: "Antagonist with hidden motives.", arc: "Downfall due to hubris.", coreFear: "Irrelevance", coreDesire: "Power", relationships: "rel_2", families: "", locations: "loc_3", tags: "antagonist, criminal" }
  ],
  books: [
    { id: "book_1", title: "The First Echo", chronologyOrder: 1, publicationOrder: 1, summary: "The beginning of the Griffin saga.", themes: "Family, Secrets, War", characters: "char_1, char_2, char_3", timelineEvents: "event_1, event_2, event_3, event_4", locations: "loc_1, loc_2", notes: "Establish the core mystery." }
  ],
  timeline: [
    { id: "event_1", year: 1941, title: "Robby Dorset born", description: "Born during the early years of the war.", characters: "char_1", families: "Griffin Family", books: "book_1", tags: "birth" },
    { id: "event_2", year: 1945, title: "Griffin grandfather returns from war", description: "The end of the war brings him home.", characters: "", families: "Griffin Family", books: "book_1", tags: "war, return" },
    { id: "event_3", year: 1957, title: "Adam's father born", description: "The next generation begins.", characters: "", families: "Griffin Family", books: "book_1", tags: "birth" },
    { id: "event_4", year: 1963, title: "Robby meets Elspeth Potter", description: "A fateful encounter that changes everything.", characters: "char_1, char_2", families: "Griffin Family", books: "book_1", tags: "romance, meeting" }
  ],
  locations: [
    { id: "loc_1", name: "Maltese Tony's Cafe", type: "Cafe", description: "A bustling local cafe with great coffee.", associatedCharacters: "char_1", firstAppearance: "Book 1", notes: "Key meeting spot." },
    { id: "loc_2", name: "Covent Garden Apartment", type: "Residence", description: "Elspeth's cozy London apartment.", associatedCharacters: "char_2", firstAppearance: "Book 1", notes: "Where many secrets are discussed." },
    { id: "loc_3", name: "Blackwater Hall", type: "Estate", description: "A sprawling, eerie country estate.", associatedCharacters: "char_3, char_4", firstAppearance: "Book 2", notes: "Site of the Crypto Mystery Weekend." }
  ],
  families: [
    { id: "fam_1", name: "Griffin Family (Blood Relatives)", description: "The central family of the saga.", tree: '{"name":"Elspeth Potter","children":[{"name":"Adam\'s Father","children":[{"name":"Adam Griffin","children":[]}]}]}' }
  ],
  organisations: [
    { id: "org_1", name: "The Syndicate", type: "Criminal", description: "A shadowy organization.", members: "char_4", notes: "Operates in the background." }
  ],
  relationships: [
    { id: "rel_1", characterA: "Robby Dorset", characterB: "Elspeth Potter", type: "Marriage", startYear: 1965, endYear: "", notes: "A strong, enduring partnership." },
    { id: "rel_2", characterA: "Adam Griffin", characterB: "Finn Williams", type: "Rivalry", startYear: 2005, endYear: "", notes: "Adam investigates Finn's activities." }
  ],
  themes: [
    { id: "theme_1", name: "Legacy of War", description: "How past conflicts shape present generations.", relatedBooks: "book_1", relatedCharacters: "char_1" }
  ],
  mysteries: [
    { id: "mys_1", name: "Crypto Mystery Weekend", book: "Book 2", victim: "Unknown", culprit: "Finn Williams", motive: "Financial gain and cover-up", clues: "Encrypted drive, Missing funds, Altered ledger", resolution: "Finn triggered terrorist device remotely to destroy evidence.", notes: "Needs more foreshadowing in Book 1." }
  ],
  secrets: [
    { id: "sec_1", secret: "Finn triggered terrorist device remotely", knownBy: "Finn Williams", revealedTo: "Adam Griffin", book: "Book 2", notes: "Major plot twist at the climax." }
  ],
  historicalEvents: [
    { id: "hist_1", year: 1945, name: "End of World War II", description: "Global conflict ends, shaping the modern world.", impactOnUniverse: "Characters return home, setting the stage for the family saga." }
  ],
  futureIdeas: [
    { id: "idea_1", title: "Young Robby series", status: "Possible", notes: "1963. Meets Elspeth Potter. Swinging Sixties. Political scandal." }
  ],
  scratchpad: "Remember to check the timeline consistency for the 1963 meeting.\nAlso, flesh out Maltese Tony's backstory."
};

// --- SCHEMAS FOR DYNAMIC FORMS ---
const schemas = {
  characters: { title: "Character", fields: ["name", "nickname", "birthYear", "deathYear", "status", "description", "personalityTraits", "physicalDescription", "occupation", "firstAppearance", "notes", "arc", "coreFear", "coreDesire", "relationships", "families", "locations", "tags"] },
  books: { title: "Book", fields: ["title", "chronologyOrder", "publicationOrder", "summary", "themes", "characters", "timelineEvents", "locations", "notes"] },
  timeline: { title: "Timeline Event", fields: ["year", "title", "description", "characters", "families", "books", "tags"] },
  locations: { title: "Location", fields: ["name", "type", "description", "associatedCharacters", "firstAppearance", "notes"] },
  families: { title: "Family", fields: ["name", "description", "tree"] },
  organisations: { title: "Organisation", fields: ["name", "type", "description", "members", "notes"] },
  relationships: { title: "Relationship", fields: ["characterA", "characterB", "type", "startYear", "endYear", "notes"] },
  themes: { title: "Theme", fields: ["name", "description", "relatedBooks", "relatedCharacters"] },
  mysteries: { title: "Mystery", fields: ["name", "book", "victim", "culprit", "motive", "clues", "resolution", "notes"] },
  secrets: { title: "Secret", fields: ["secret", "knownBy", "revealedTo", "book", "notes"] },
  historicalEvents: { title: "Historical Event", fields: ["year", "name", "description", "impactOnUniverse"] },
  futureIdeas: { title: "Future Idea", fields: ["title", "status", "notes"] }
};

// --- INITIALIZATION ---
function init() {
  loadData();
  setupEventListeners();
  navigateTo('dashboard');
  
  // Check for saved theme
  if (localStorage.getItem('griffin_theme') === 'light') {
    document.body.classList.add('light-mode');
  }
}

function loadData() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    appData = JSON.parse(stored);
  } else {
    appData = JSON.parse(JSON.stringify(DEFAULT_DATA));
    saveData();
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

// --- NAVIGATION & RENDERING ---
function navigateTo(section) {
  currentSection = section;
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.section === section);
  });
  
  // Close sidebar on mobile after navigation
  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.remove('open');
  }
  
  renderSection(section);
}

function renderSection(section) {
  const content = document.getElementById('content');
  content.innerHTML = '';

  if (section === 'dashboard') renderDashboard(content);
  else if (section === 'timeline') renderTimeline(content);
  else if (section === 'families') renderFamilies(content);
  else if (section === 'scratchpad') renderScratchpad(content);
  else renderGenericList(content, section);
}

function renderDashboard(container) {
  const charCount = appData.characters?.length || 0;
  const bookCount = appData.books?.length || 0;
  const timelineCount = appData.timeline?.length || 0;
  const locCount = appData.locations?.length || 0;
  const unresolved = (appData.mysteries || []).filter(m => !m.resolution).length;

  container.innerHTML = `
    <div class="section-header"><h2>Dashboard</h2></div>
    <div class="dashboard-grid">
      <div class="stat-card"><h3>${charCount}</h3><p>Characters</p></div>
      <div class="stat-card"><h3>${bookCount}</h3><p>Books</p></div>
      <div class="stat-card"><h3>${timelineCount}</h3><p>Timeline Events</p></div>
      <div class="stat-card"><h3>${locCount}</h3><p>Locations</p></div>
    </div>
    <div class="dashboard-section">
      <h3>Unresolved Mysteries</h3>
      <ul>${(appData.mysteries || []).filter(m => !m.resolution).map(m => `<li>${m.name} <span class="badge" onclick="handleBadgeClick('${m.name}')">View</span></li>`).join('') || '<li>None</li>'}</ul>
    </div>
    <div class="dashboard-section">
      <h3>Recently Added Characters</h3>
      <ul>${(appData.characters || []).slice(-5).reverse().map(c => `<li><strong>${c.name}</strong> <span class="badge" onclick="handleBadgeClick('${c.name}')">View</span></li>`).join('') || '<li>None</li>'}</ul>
    </div>
  `;
}

function renderGenericList(container, section) {
  const schema = schemas[section];
  const items = appData[section] || [];
  const idField = section === 'futureIdeas' ? 'title' : (section === 'secrets' ? 'secret' : 'name');
  
  let html = `
    <div class="section-header">
      <h2>${schema.title}s</h2>
      <button class="btn-primary no-print" onclick="openForm('${section}')">Add New</button>
    </div>
    <div class="card-grid">
  `;

  items.forEach(item => {
    const title = item[idField] || item.title || 'Untitled';
    const desc = item.description || item.summary || item.notes || '';
    html += `
      <div class="card">
        <h3>${title}</h3>
        <p>${desc.substring(0, 100)}${desc.length > 100 ? '...' : ''}</p>
        <div style="margin-top: 15px;" class="no-print">
          <button class="btn-small" onclick="openForm('${section}', '${item.id}')">Edit</button>
          <button class="btn-small btn-danger" onclick="deleteItem('${section}', '${item.id}')">Delete</button>
        </div>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
}

function renderTimeline(container) {
  let events = [...(appData.timeline || [])].sort((a, b) => a.year - b.year);
  
  container.innerHTML = `
    <div class="section-header">
      <h2>Timeline</h2>
      <button class="btn-primary no-print" onclick="openForm('timeline')">Add Event</button>
    </div>
    <div class="timeline-controls no-print">
      <input type="text" id="tl-filter" placeholder="Filter by character, family, or book..." oninput="filterTimeline()">
    </div>
    <div id="timeline-list" class="timeline-container">
      ${renderTimelineEvents(events)}
    </div>
  `;
}

function renderTimelineEvents(events) {
  if (events.length === 0) return '<p>No events found.</p>';
  return events.map(ev => `
    <div class="timeline-event">
      <div class="timeline-year">${ev.year}</div>
      <h4>${ev.title}</h4>
      <p>${ev.description}</p>
      <div style="margin-top: 10px;">
        ${ev.characters ? `<span class="badge" onclick="handleBadgeClick('${ev.characters}')">Chars: ${ev.characters}</span>` : ''}
        ${ev.books ? `<span class="badge" onclick="handleBadgeClick('${ev.books}')">Book: ${ev.books}</span>` : ''}
      </div>
    </div>
  `).join('');
}

function filterTimeline() {
  const query = document.getElementById('tl-filter').value.toLowerCase();
  const events = (appData.timeline || []).filter(ev => 
    JSON.stringify(ev).toLowerCase().includes(query)
  ).sort((a, b) => a.year - b.year);
  document.getElementById('timeline-list').innerHTML = renderTimelineEvents(events);
}

function renderFamilies(container) {
  const families = appData.families || [];
  let html = `<div class="section-header"><h2>Family Trees</h2></div>`;
  
  families.forEach(fam => {
    html += `<h3>${fam.name}</h3><p>${fam.description || ''}</p><div class="family-tree">`;
    try {
      const tree = typeof fam.tree === 'string' ? JSON.parse(fam.tree) : fam.tree;
      html += renderTreeNode(tree);
    } catch (e) {
      html += `<pre>${fam.tree}</pre>`;
    }
    html += `</div><hr style="margin: 30px 0; border-color: var(--border-color);">`;
  });
  container.innerHTML = html;
}

function renderTreeNode(node) {
  if (!node) return '';
  let html = `<ul><li><div class="tree-node" onclick="handleBadgeClick('${node.name}')">${node.name}</div>`;
  if (node.children && node.children.length > 0) {
    html += `<ul>${node.children.map(child => renderTreeNode(child)).join('')}</ul>`;
  }
  html += `</li></ul>`;
  return html;
}

function renderScratchpad(container) {
  container.innerHTML = `
    <div class="section-header"><h2>Scratchpad</h2></div>
    <div class="scratchpad-container">
      <textarea id="scratchpad-text" class="full-width-textarea" placeholder="Jot down your ideas here...">${appData.scratchpad || ''}</textarea>
      <button onclick="saveScratchpad()" class="btn-primary no-print" style="margin-top: 15px;">Save Scratchpad</button>
    </div>
  `;
}

function saveScratchpad() {
  appData.scratchpad = document.getElementById('scratchpad-text').value;
  saveData();
  showToast('Scratchpad saved!');
}

// --- FORMS & CRUD ---
function openForm(section, id = null) {
  const schema = schemas[section];
  const item = id ? (appData[section].find(i => i.id === id)) : {};
  const modal = document.getElementById('modal');
  const form = document.getElementById('entity-form');
  
  document.getElementById('modal-title').textContent = `${id ? 'Edit' : 'Add'} ${schema.title}`;
  
  let html = '';
  schema.fields.forEach(field => {
    const value = item[field] || '';
    const inputType = (field === 'notes' || field === 'description' || field === 'summary' || field === 'arc' || field === 'tree') ? 'textarea' : 
                      (field === 'status' || field === 'type') ? 'select' : 'text';
    
    html += `<div class="form-group"><label>${field.charAt(0).toUpperCase() + field.slice(1)}</label>`;
    
    if (inputType === 'textarea') {
      html += `<textarea name="${field}" ${field === 'tree' ? 'style="min-height:200px;"' : ''}>${value}</textarea>`;
    } else if (inputType === 'select') {
      const options = field === 'status' ? ['Alive', 'Deceased', 'Unknown', 'idea', 'possible', 'planned', 'active', 'abandoned'] :
                      field === 'type' ? ['Friendship', 'Marriage', 'Affair', 'Rivalry', 'Parent/Child', 'Mentor', 'Professional', 'Criminal', 'Residence', 'Estate', 'Cafe'] : [];
      html += `<select name="${field}"><option value="">Select...</option>${options.map(opt => `<option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>`).join('')}</select>`;
    } else {
      html += `<input type="${field.includes('Year') ? 'number' : 'text'}" name="${field}" value="${value}">`;
    }
    html += `</div>`;
  });
  
  html += `<button type="submit" class="btn-primary">Save</button>`;
  form.innerHTML = html;
  
  form.onsubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const newItem = { ...item };
    if (!id) newItem.id = 'id_' + Date.now();
    
    schema.fields.forEach(field => {
      newItem[field] = formData.get(field);
    });
    
    if (!id) appData[section].push(newItem);
    else {
      const index = appData[section].findIndex(i => i.id === id);
      if (index !== -1) appData[section][index] = newItem;
    }
    
    saveData();
    closeModal();
    navigateTo(section);
    showToast('Saved successfully!');
  };
  
  modal.style.display = 'block';
}

function deleteItem(section, id) {
  if (confirm('Are you sure you want to delete this entry?')) {
    appData[section] = appData[section].filter(i => i.id !== id);
    saveData();
    navigateTo(section);
    showToast('Deleted.');
  }
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

// --- SEARCH ---
function performSearch(query) {
  if (!query) return;
  const content = document.getElementById('content');
  const lowerQuery = query.toLowerCase();
  let results = [];

  for (const [section, items] of Object.entries(appData)) {
    if (section === 'scratchpad') {
      if (items.toLowerCase().includes(lowerQuery)) {
        results.push({ type: 'Scratchpad', title: 'Scratchpad', snippet: items });
      }
      continue;
    }
    if (Array.isArray(items)) {
      items.forEach(item => {
        const stringified = JSON.stringify(item).toLowerCase();
        if (stringified.includes(lowerQuery)) {
          const title = item.name || item.title || item.secret || 'Untitled';
          let snippet = '';
          for (const [key, value] of Object.entries(item)) {
            if (typeof value === 'string' && value.toLowerCase().includes(lowerQuery)) {
              snippet = value.substring(0, 150) + '...';
              break;
            }
          }
          results.push({ type: section, title: title, snippet: snippet || stringified.substring(0, 150) + '...' });
        }
      });
    }
  }

  let html = `<div class="section-header"><h2>Search Results for "${query}"</h2></div>`;
  if (results.length === 0) {
    html += `<p>No results found.</p>`;
  } else {
    results.forEach(res => {
      // Highlight snippet
      const regex = new RegExp(`(${query})`, 'gi');
      const highlightedSnippet = res.snippet.replace(regex, '<span class="snippet">$1</span>');
      
      html += `
        <div class="search-result">
          <div class="type">${res.type}</div>
          <h3>${res.title}</h3>
          <p>${highlightedSnippet}</p>
        </div>
      `;
    });
  }
  content.innerHTML = html;
}

function handleBadgeClick(query) {
  document.getElementById('search-input').value = query;
  performSearch(query);
}

// --- IMPORT / EXPORT / REPORT ---
function exportData() {
  const dataStr = JSON.stringify(appData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Griffin_Universe_Bible.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Exported successfully!');
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      appData = JSON.parse(e.target.result);
      saveData();
      navigateTo('dashboard');
      showToast