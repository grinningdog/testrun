/* The Griffin Universe Bible - plain JavaScript application.
   Everything lives in one JSON-shaped state object and is persisted to localStorage. */

const STORAGE_KEY = "griffin-universe-bible-v1";
const navItems = [
  ["dashboard","▦","Dashboard"],["characters","♙","Characters"],["books","▤","Books"],
  ["timeline","⌁","Timeline"],["locations","⌂","Locations"],["families","♧","Families"],
  ["organisations","◎","Organisations"],["relationships","↔","Relationships"],
  ["themes","◇","Themes"],["mysteries","?","Mysteries"],["secrets","◆","Secrets"],
  ["historicalEvents","◷","Historical Events"],["futureIdeas","✦","Future Ideas"],["scratchpad","✎","Scratchpad"]
];

let db = loadData();
let currentSection = location.hash.slice(1) || "dashboard";
let globalQuery = "";
let filters = {book:"",character:"",location:"",decade:"",tag:""};

const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arr = v => Array.isArray(v) ? v : [];
const byId = (collection,id) => arr(db[collection]).find(x=>x.id===id);
const nameOf = (collection,id) => byId(collection,id)?.name || byId(collection,id)?.title || id || "";
const uid = p => p + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2,7);

function defaultData(){ return {
  meta:{title:"The Griffin Universe Bible",version:"1.0",updatedAt:new Date().toISOString()},
  characters:[],books:[],timeline:[],locations:[],families:[],organisations:[],relationships:[],
  themes:[],mysteries:[],secrets:[],historicalEvents:[],futureIdeas:[],scratchpad:""
};}
function loadData(){
  try{ const saved=localStorage.getItem(STORAGE_KEY); if(saved) return {...defaultData(),...JSON.parse(saved)}; }catch(e){}
  return defaultData();
}
function saveData(){
  db.meta = db.meta || {};
  db.meta.updatedAt = new Date().toISOString();
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(db)); $("saveStatus").textContent="Saved "+new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});}
  catch(e){$("saveStatus").textContent="Storage unavailable";}
}
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove("show"),2200)}
function navigate(section){currentSection=section;location.hash=section;render()}
function renderNav(){
  $("nav").innerHTML=navItems.map(([id,icon,label])=>`<button class="nav-item ${currentSection===id?"active":""}" data-nav="${id}"><span class="nav-icon">${icon}</span>${label}</button>`).join("");
  document.querySelectorAll("[data-nav]").forEach(b=>b.onclick=()=>navigate(b.dataset.nav));
}
function render(){
  renderNav();
  const renderer = renderers[currentSection] || renderers.dashboard;
  $("content").innerHTML=renderer();
  bindDynamic();
}
function bindDynamic(){
  document.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>openEditor(b.dataset.edit,b.dataset.id));
  document.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>deleteEntry(b.dataset.delete,b.dataset.id));
  document.querySelectorAll("[data-link-char]").forEach(b=>b.onclick=()=>openCharacter(b.dataset.linkChar));
  document.querySelectorAll("[data-nav-section]").forEach(b=>b.onclick=()=>navigate(b.dataset.navSection));
  const qs=$("globalSearch"); qs.value=globalQuery;
  document.querySelectorAll("[data-filter]").forEach(x=>x.onchange=()=>{filters[x.dataset.filter]=x.value;render()});
}
function openCharacter(id){ navigate("characters"); setTimeout(()=>openEditor("characters",id),0); }

function pageHead(kicker,title,desc="",action=""){
  return `<div class="page-head"><div><div class="eyebrow">${esc(kicker)}</div><h1>${esc(title)}</h1>${desc?`<div class="muted">${esc(desc)}</div>`:""}</div>${action}</div>`;
}
function button(label,action,cls="primary-button"){return `<button class="${cls}" ${action}>${esc(label)}</button>`}
function card(title,body,extra=""){return `<div class="card"><h3>${esc(title)}</h3>${body}${extra}</div>`}

function dashboard(){
  const recent = allEntries().sort((a,b)=>String(b.updatedAt||"").localeCompare(String(a.updatedAt||""))).slice(0,6);
  const upcoming = db.futureIdeas.filter(x=>["possible","planned","active"].includes(x.status)).slice(0,5);
  const unresolved = db.secrets.filter(x=>arr(x.revealedTo).length===0).slice(0,5);
  return pageHead("Series Bible","The Griffin Universe Bible","Private writer's reference — everything in one place.",
    button("Add character",'onclick="openEditor(\'characters\')"')) +
  `<div class="grid grid-4">
    ${stat("Characters",db.characters.length,"characters")}
    ${stat("Books",db.books.length,"books")}
    ${stat("Timeline events",db.timeline.length,"timeline")}
    ${stat("Locations",db.locations.length,"locations")}
  </div>
  <div class="grid grid-2" style="margin-top:14px">
    ${card("Recently updated", listMini(recent))}
    ${card("Upcoming plot threads", listIdeas(upcoming))}
    ${card("Unresolved secrets", listSecrets(unresolved))}
    ${card("Universe at a glance", `<p class="muted">Use the sidebar to move between canon, chronology, genealogy and future ideas. Global search is always available above.</p><div class="chips">${["Canon","Characters","Timeline","Mysteries","Future ideas"].map(x=>`<span class="chip">${x}</span>`).join("")}</div>`)}
  </div>`;
}
function stat(label,n,target){return `<button class="card stat" data-nav-section="${target}" style="text-align:left"><div class="stat-label">${esc(label)}</div><div class="stat-value">${n}</div></button>`}
function listMini(items){return items.length?`<div class="entry-list">${items.map(x=>`<div class="entry"><div class="entry-main"><div class="entry-title">${esc(x.title||x.name)}</div><div class="muted">${esc(x.type||"Entry")}</div></div></div>`).join("")}</div>`:`<div class="empty">Nothing updated yet.</div>`}
function listIdeas(items){return items.length?`<div class="entry-list">${items.map(x=>`<div class="entry"><div><div class="entry-title">${esc(x.title)}</div><span class="chip">${esc(x.status)}</span><p class="muted">${esc(x.notes||x.description)}</p></div></div>`).join("")}</div>`:`<div class="empty">No active plot threads.</div>`}
function listSecrets(items){return items.length?`<div class="entry-list">${items.map(x=>`<div class="entry"><div><div class="entry-title">${esc(x.secret)}</div><div class="muted">Known by: ${esc(arr(x.knownBy).map(id=>nameOf("characters",id)).join(", ")||"Nobody yet")}</div></div></div>`).join("")}</div>`:`<div class="empty">No unresolved secrets.</div>`}

function standardSection(collection,title,desc,fields,opts={}){
  let items=arr(db[collection]);
  if(globalQuery) items=items.filter(x=>JSON.stringify(x).toLowerCase().includes(globalQuery.toLowerCase()));
  if(filters.tag) items=items.filter(x=>JSON.stringify(x.tags||[]).toLowerCase().includes(filters.tag.toLowerCase()));
  if(filters.book) items=items.filter(x=>JSON.stringify(x).toLowerCase().includes(filters.book.toLowerCase()));
  const entries=items.map(x=>renderEntry(collection,x,fields)).join("");
  return pageHead("Universe",title,desc,button("Add "+(opts.singular||title.replace(/s$/,"")),'onclick="openEditor(\''+collection+'\')"'))+
    filterBar(collection)+`<div class="entry-list">${entries||`<div class="empty">No entries match the current search and filters.</div>`}</div>`;
}
function filterBar(collection){
  const tags=[...new Set(db.characters.flatMap(x=>arr(x.tags)).concat(db.futureIdeas.flatMap(x=>arr(x.tags))))].filter(Boolean).sort();
  return `<div class="toolbar">
    <select data-filter="book"><option value="">All books</option>${db.books.map(x=>`<option value="${esc(x.title)}" ${filters.book===x.title?"selected":""}>${esc(x.title)}</option>`).join("")}</select>
    <select data-filter="character"><option value="">All characters</option>${db.characters.map(x=>`<option value="${esc(x.id)}" ${filters.character===x.id?"selected":""}>${esc(x.name)}</option>`).join("")}</select>
    <select data-filter="location"><option value="">All locations</option>${db.locations.map(x=>`<option value="${esc(x.id)}" ${filters.location===x.id?"selected":""}>${esc(x.name)}</option>`).join("")}</select>
    <select data-filter="decade"><option value="">All decades</option>${decades().map(x=>`<option value="${x}" ${filters.decade===x?"selected":""}>${x}s</option>`).join("")}</select>
    <select data-filter="tag"><option value="">All tags</option>${tags.map(x=>`<option value="${esc(x)}" ${filters.tag===x?"selected":""}>${esc(x)}</option>`).join("")}</select>
  </div>`;
}
function decades(){const years=[];db.timeline.forEach(x=>{const y=parseInt(x.year);if(y)years.push(Math.floor(y/10)*10)});return [...new Set(years)].sort((a,b)=>a-b)}

function renderEntry(collection,x,fields){
  let subtitle=fields.map(f=>fieldDisplay(f,x)).filter(Boolean).join(" · ");
  let body=fields.slice(0,2).map(f=>fieldBody(f,x)).join("");
  return `<div class="entry"><div class="entry-main"><div class="entry-title">${esc(x.name||x.title||x.secret||x.year||"Untitled")}</div><div class="muted">${subtitle}</div>${body}</div>
    <div class="entry-actions"><button class="small-button" data-edit="${collection}" data-id="${esc(x.id||"")}">Edit</button>${x.id?`<button class="small-button" data-delete="${collection}" data-id="${esc(x.id)}">Delete</button>`:""}</div></div>`;
}
function fieldDisplay(f,x){
  const v=x[f.key]; if(!v || (Array.isArray(v)&&!v.length))return "";
  if(Array.isArray(v)) return `${f.label}: ${v.length}`;
  return `${f.label}: ${String(v).slice(0,70)}`;
}
function fieldBody(f,x){
  const v=x[f.key]; if(!v)return "";
  if(f.key==="description"||f.key==="summary"||f.key==="notes")return `<p class="muted">${esc(String(v).slice(0,180))}${String(v).length>180?"…":""}</p>`;
  return "";
}

const fields = {
 characters:[{key:"occupation",label:"Occupation"},{key:"firstAppearance",label:"First appearance"},{key:"description",label:"Description"},{key:"tags",label:"Tags"}],
 books:[{key:"chronologyOrder",label:"Chronology"},{key:"publicationOrder",label:"Publication"},{key:"summary",label:"Summary"},{key:"themes",label:"Themes"}],
 locations:[{key:"type",label:"Type"},{key:"firstAppearance",label:"First appearance"},{key:"description",label:"Description"}],
 organisations:[{key:"type",label:"Type"},{key:"description",label:"Description"}],
 themes:[{key:"description",label:"Description"},{key:"books",label:"Books"}],
 mysteries:[{key:"book",label:"Book"},{key:"victim",label:"Victim"},{key:"culprit",label:"Culprit"},{key:"notes",label:"Notes"}],
 secrets:[{key:"book",label:"Book"},{key:"knownBy",label:"Known by"},{key:"revealedTo",label:"Revealed to"}],
 historicalEvents:[{key:"year",label:"Year"},{key:"description",label:"Description"}],
 futureIdeas:[{key:"status",label:"Status"},{key:"description",label:"Description"},{key:"tags",label:"Tags"}]
};
const renderers = {
 dashboard,
 characters:()=>standardSection("characters","Characters","People, arcs, motivations and connections.",fields.characters,{singular:"character"}),
 books:()=>standardSection("books","Books","The Inspector Griffin Mysteries and future volumes.",fields.books,{singular:"book"}),
 locations:()=>standardSection("locations","Locations","Recurring places, homes and settings.",fields.locations,{singular:"location"}),
 organisations:()=>standardSection("organisations","Organisations","Institutions, agencies, companies and groups.",fields.organisations,{singular:"organisation"}),
 themes:()=>standardSection("themes","Themes","Recurring ideas and motifs.",fields.themes,{singular:"theme"}),
 mysteries:()=>standardSection("mysteries","Mysteries","Case structure, clues and resolutions.",fields.mysteries,{singular:"mystery"}),
 secrets:()=>standardSection("secrets","Secrets","Track who knows what, and when.",fields.secrets,{singular:"secret"}),
 historicalEvents:()=>standardSection("historicalEvents","Historical Events","Real-world events that shape the universe.",fields.historicalEvents,{singular:"event"}),
 futureIdeas:()=>standardSection("futureIdeas","Future Ideas","Non-canon material — deliberately kept separate.",fields.futureIdeas,{singular:"idea"}),
 timeline:renderTimeline,
 families:renderFamilies,
 relationships:renderRelationships,
 scratchpad:renderScratchpad
};

function renderTimeline(){
 let items=[...db.timeline].sort((a,b)=>(parseInt(a.year)||99999)-(parseInt(b.year)||99999));
 if(filters.character)items=items.filter(x=>arr(x.characters).includes(filters.character));
 if(filters.book)items=items.filter(x=>x.book===filters.book||nameOf("books",x.book)===filters.book);
 if(filters.decade)items=items.filter(x=>String(x.year).startsWith(filters.decade.slice(0,-1)));
 const view=localStorage.getItem("griffin-timeline-view")||"visual";
 return pageHead("Chronology","Timeline","The master chronological spine of the universe.",
   `${button("Add event",'onclick="openEditor(\'timeline\')"')} <button class="secondary-button" onclick="toggleTimelineView()">${view==="visual"?"List view":"Visual timeline"}</button>`) +
   filterBar("timeline") + (view==="visual"?`<div class="card"><div class="timeline">${items.map(x=>`<div class="timeline-item"><div class="timeline-dot"></div><div class="year">${esc(x.year||"Undated")}</div><h3>${esc(x.title)}</h3><p>${esc(x.description)}</p><div class="chips">${arr(x.characters).map(id=>`<span class="chip">${esc(nameOf("characters",id))}</span>`).join("")}${x.book?`<span class="chip">${esc(nameOf("books",x.book)||x.book)}</span>`:""}</div><div style="margin-top:8px"><button class="small-button" data-edit="timeline" data-id="${esc(x.id)}">Edit</button></div></div>`).join("")||`<div class="empty">No timeline events.</div>`}</div></div>`:
   `<div class="entry-list">${items.map(x=>renderEntry("timeline",x,[{key:"year",label:"Year"},{key:"description",label:"Description"}])).join("")}</div>`);
}
function toggleTimelineView(){const v=localStorage.getItem("griffin-timeline-view")||"visual";localStorage.setItem("griffin-timeline-view",v==="visual"?"list":"visual");render()}

function renderRelationships(){
 return pageHead("Connections","Relationships","A dedicated view of character-to-character connections.",button("Add relationship",'onclick="openEditor(\'relationships\')"'))+
 `<div class="grid grid-2">${db.relationships.map(x=>`<div class="card"><div class="entry-title">${esc(nameOf("characters",x.characterA))} <span class="muted">↔</span> ${esc(nameOf("characters",x.characterB))}</div><p><span class="chip">${esc(x.type)}</span> ${x.startYear?esc(x.startYear):""}${x.endYear?"–"+esc(x.endYear):""}</p><p class="muted">${esc(x.notes)}</p><button class="small-button" data-edit="relationships" data-id="${esc(x.id)}">Edit</button> <button class="small-button" data-delete="relationships" data-id="${esc(x.id)}">Delete</button></div>`).join("")||`<div class="empty">No relationships yet.</div>`}</div>`;
}

function renderFamilies(){
 return pageHead("Genealogy","Families","Visual family trees with multiple branches.",button("Add family",'onclick="openEditor(\'families\')"'))+
 `<div class="grid grid-2">${db.families.map(f=>`<div class="card"><h2>${esc(f.name)}</h2><p class="muted">${esc(f.description)}</p><div class="family-tree">${familyTree(f)}</div><button class="small-button" data-edit="families" data-id="${esc(f.id)}">Edit</button></div>`).join("")||`<div class="empty">No families yet.</div>`}</div>`;
}
function familyTree(f){
 const roots=arr(f.members).filter(m=>!m.parentId);
 if(!roots.length)return `<div class="muted">Add family members and parent links to build the tree.</div>`;
 function node(member){const ch=arr(f.members).filter(m=>m.parentId===member.characterId);return `<li><div class="person-node">${esc(nameOf("characters",member.characterId))}</div>${ch.length?`<ul>${ch.map(node).join("")}</ul>`:""}</li>`}
 return `<div class="tree"><ul>${roots.map(node).join("")}</ul></div>`;
}

function renderScratchpad(){
 return pageHead("Notes","Scratchpad","Private loose notes — not automatically treated as canon.",
   button("Save scratchpad",'onclick="saveScratchpad()"'))+
 `<div class="card"><textarea id="scratchpadInput" style="width:100%;min-height:55vh;background:transparent;color:var(--text);border:0;outline:0;resize:vertical;font:15px/1.65 Georgia,serif">${esc(db.scratchpad||"")}</textarea></div>`;
}
function saveScratchpad(){db.scratchpad=$("scratchpadInput").value;saveData();toast("Scratchpad saved")}

function allEntries(){
 const groups=[["Character","characters"],["Book","books"],["Timeline","timeline"],["Location","locations"],["Family","families"],["Organisation","organisations"],["Relationship","relationships"],["Theme","themes"],["Mystery","mysteries"],["Secret","secrets"],["Historical event","historicalEvents"],["Future idea","futureIdeas"]];
 return groups.flatMap(([type,key])=>arr(db[key]).map(x=>({...x,type,title:x.name||x.title||x.secret||x.year||"Untitled"})));
}
function searchAll(q){
 q=q.trim().toLowerCase(); if(!q)return [];
 return allEntries().filter(x=>JSON.stringify(x).toLowerCase().includes(q)).slice(0,50);
}
function renderSearchResults(results){
 $("content").innerHTML=pageHead("Search","Search results",`${results.length} result${results.length===1?"":"s"} for “${globalQuery}”`)+
 `<div class="entry-list">${results.map(x=>`<div class="entry"><div><div class="entry-title">${esc(x.title)}</div><div class="muted">${esc(x.type)}</div><p class="muted">${esc(snippet(JSON.stringify(x).replace(/[{}[\]"]/g," "),globalQuery))}</p></div></div>`).join("")||`<div class="empty">No matches.</div>`}</div>`;
}
function snippet(text,q){const i=text.toLowerCase().indexOf(q.toLowerCase());return i<0?text.slice(0,180):"…"+text.slice(Math.max(0,i-65),i+120)+"…"}

function openEditor(collection,id){
 const existing=id?byId(collection,id):null;
 const x=existing||newObject(collection);
 $("modalTitle").textContent=(existing?"Edit ":"Add ")+labelFor(collection);
 $("modalBody").innerHTML=formFor(collection,x);
 $("modal").classList.remove("hidden");
 $("modalBody").querySelector("form").onsubmit=e=>{e.preventDefault();saveForm(collection,id);};
}
function labelFor(c){return ({futureIdeas:"future idea",historicalEvents:"historical event",timeline:"timeline event"}[c]||c.slice(0,-1)||c)}
function newObject(c){
 const base={id:uid(c.slice(0,4))};
 if(c==="characters")return {...base,name:"",nickname:"",birthYear:"",deathYear:"",status:"alive",description:"",personalityTraits:[],physicalDescription:"",occupation:"",firstAppearance:"",notes:"",arc:"",coreFear:"",coreDesire:"",relationships:[],families:[],locations:[],tags:[]};
 if(c==="books")return {...base,title:"",chronologyOrder:"",publicationOrder:"",summary:"",themes:[],characters:[],timelineEvents:[],locations:[],notes:""};
 if(c==="timeline")return {...base,year:"",title:"",description:"",characters:[],families:[],book:"",location:"",tags:[]};
 if(c==="locations")return {...base,name:"",type:"",description:"",associatedCharacters:[],firstAppearance:"",notes:""};
 if(c==="families")return {...base,name:"",description:"",members:[],notes:""};
 if(c==="relationships")return {...base,characterA:"",characterB:"",type:"",startYear:"",endYear:"",notes:""};
 if(c==="mysteries")return {...base,name:"",book:"",victim:"",culprit:"",motive:"",clues:[],resolution:"",notes:""};
 if(c==="secrets")return {...base,secret:"",knownBy:[],revealedTo:[],book:"",notes:""};
 if(c==="futureIdeas")return {...base,title:"",status:"idea",description:"",notes:"",tags:[]};
 if(c==="organisations")return {...base,name:"",type:"",description:"",notes:"",tags:[]};
 if(c==="themes")return {...base,name:"",description:"",books:[]};
 if(c==="historicalEvents")return {...base,year:"",title:"",description:"",notes:"",tags:[]};
 return base;
}
function formFor(c,x){
 const inp=(key,label,val=x[key]||"",type="text")=>`<div class="field"><label>${esc(label)}</label><input name="${key}" type="${type}" value="${esc(Array.isArray(val)?val.join(", "):val)}"></div>`;
 const ta=(key,label,val=x[key]||"")=>`<div class="field full"><label>${esc(label)}</label><textarea name="${key}">${esc(val)}</textarea></div>`;
 const select=(key,label,opts,val)=>`<div class="field"><label>${esc(label)}</label><select name="${key}">${opts.map(o=>`<option value="${esc(o)}" ${o===val?"selected":""}>${esc(o)}</option>`).join("")}</select></div>`;
 const multi=(key,label,collection,val=[])=>`<div class="field full"><label>${esc(label)} — comma-separated names</label><input name="${key}" value="${esc(arr(val).map(id=>nameOf(collection,id)||id).join(", "))}" data-multi="${collection}"></div>`;
 let body="";
 if(c==="characters") body=inp("name","Name")+inp("nickname","Nickname")+inp("birthYear","Birth year")+inp("deathYear","Death year")+select("status","Status",["alive","deceased","unknown"],x.status)+inp("occupation","Occupation")+inp("firstAppearance","First appearance")+ta("description","Description")+ta("physicalDescription","Physical description")+ta("personalityTraits","Personality traits (comma-separated)",arr(x.personalityTraits).join(", "))+ta("arc","Arc")+inp("coreFear","Core fear")+inp("coreDesire","Core desire")+multi("relationships","Relationships","relationships",x.relationships)+ta("families","Families (comma-separated)",arr(x.families).join(", "))+ta("locations","Locations (comma-separated)",arr(x.locations).join(", "))+ta("tags","Tags (comma-separated)",arr(x.tags).join(", "))+ta("notes","Notes");
 else if(c==="books") body=inp("title","Title")+inp("chronologyOrder","Chronology order")+inp("publicationOrder","Publication order")+ta("summary","Summary")+ta("themes","Themes (comma-separated)",arr(x.themes).join(", "))+multi("characters","Characters","characters",x.characters)+ta("timelineEvents","Timeline event IDs (comma-separated)",arr(x.timelineEvents).join(", "))+ta("locations","Locations (comma-separated)",arr(x.locations).join(", "))+ta("notes","Notes");
 else if(c==="timeline") body=inp("year","Year")+inp("title","Title")+ta("description","Description")+multi("characters","Characters","characters",x.characters)+ta("families","Families (comma-separated)",arr(x.families).join(", "))+inp("book","Book ID / title",x.book)+inp("location","Location ID / name",x.location)+ta("tags","Tags (comma-separated)",arr(x.tags).join(", "));
 else if(c==="locations") body=inp("name","Name")+inp("type","Type")+ta("description","Description")+multi("associatedCharacters","Associated characters","characters",x.associatedCharacters)+inp("firstAppearance","First appearance")+ta("notes","Notes");
 else if(c==="families") body=inp("name","Family name")+ta("description","Description")+ta("members","Members as JSON: [{\"characterId\":\"...\",\"parentId\":\"\"}]",JSON.stringify(x.members||[],null,2))+ta("notes","Notes");
 else if(c==="relationships") body=multi("characterA","Character A","characters",x.characterA?[x.characterA]:[])+multi("characterB","Character B","characters",x.characterB?[x.characterB]:[])+inp("type","Type")+inp("startYear","Start year")+inp("endYear","End year")+ta("notes","Notes");
 else if(c==="mysteries") body=inp("name","Mystery name")+inp("book","Book")+inp("victim","Victim")+inp("culprit","Culprit")+inp("motive","Motive")+ta("clues","Clues (comma-separated)",arr(x.clues).join(", "))+ta("resolution","Resolution")+ta("notes","Notes");
 else if(c==="secrets") body=ta("secret","Secret")+multi("knownBy","Known by","characters",x.knownBy)+multi("revealedTo","Revealed to","characters",x.revealedTo)+inp("book","Book")+ta("notes","Notes");
 else if(c==="futureIdeas") body=inp("title","Title")+select("status","Status",["idea","possible","planned","active","abandoned"],x.status)+ta("description","Description")+ta("notes","Notes")+ta("tags","Tags (comma-separated)",arr(x.tags).join(", "));
 else if(c==="organisations") body=inp("name","Name")+inp("type","Type")+ta("description","Description")+ta("notes","Notes")+ta("tags","Tags (comma-separated)",arr(x.tags).join(", "));
 else if(c==="themes") body=inp("name","Name")+ta("description","Description")+ta("books","Books (comma-separated)",arr(x.books).join(", "));
 else if(c==="historicalEvents") body=inp("year","Year")+inp("title","Title")+ta("description","Description")+ta("notes","Notes")+ta("tags","Tags (comma-separated)",arr(x.tags).join(", "));
 return `<form><div class="form-grid">${body}</div><div class="modal-foot"><button type="button" class="secondary-button" data-close-modal>Cancel</button><button class="primary-button">Save</button></div></form>`;
}
function parseList(v){return String(v||"").split(",").map(s=>s.trim()).filter(Boolean)}
function resolveNames(list,collection){
 return parseList(list).map(v=>byId(collection,v)?.id || arr(db[collection]).find(x=>(x.name||x.title)?.toLowerCase()===v.toLowerCase())?.id || v);
}
function saveForm(c,id){
 const form=$("modalBody").querySelector("form"), fd=new FormData(form), old=id?byId(c,id):newObject(c), x={...old};
 for(const [k,v] of fd.entries())x[k]=v;
 ["personalityTraits","families","locations","tags","themes","timelineEvents","clues","books"].forEach(k=>{if(k in x && ["characters","timeline","locations","mysteries","secrets","futureIdeas"].includes(c) || ["themes"].includes(c)) x[k]=parseList(x[k])});
 if(c==="characters"){x.relationships=resolveNames(fd.get("relationships"),"relationships");x.personalityTraits=parseList(fd.get("personalityTraits"));x.tags=parseList(fd.get("tags"))}
 if(c==="books"){x.characters=resolveNames(fd.get("characters"),"characters");x.themes=parseList(fd.get("themes"));x.timelineEvents=parseList(fd.get("timelineEvents"));x.locations=parseList(fd.get("locations"))}
 if(c==="timeline"){x.characters=resolveNames(fd.get("characters"),"characters");x.tags=parseList(fd.get("tags"))}
 if(c==="locations")x.associatedCharacters=resolveNames(fd.get("associatedCharacters"),"characters");
 if(c==="relationships"){x.characterA=resolveNames(fd.get("characterA"),"characters")[0]||"";x.characterB=resolveNames(fd.get("characterB"),"characters")[0]||""}
 if(c==="secrets"){x.knownBy=resolveNames(fd.get("knownBy"),"characters");x.revealedTo=resolveNames(fd.get("revealedTo"),"characters")}
 if(c==="families"){try{x.members=JSON.parse(fd.get("members")||"[]")}catch(e){toast("Family members JSON is invalid");return}}
 if(!x.id)x.id=uid(c.slice(0,4));
 const list=arr(db[c]), idx=list.findIndex(y=>y.id===x.id);
 if(idx>=0)list[idx]=x;else list.push(x);
 db[c]=list; saveData(); closeModal(); render(); toast("Saved");
}
function deleteEntry(c,id){if(!confirm("Delete this entry? This cannot be undone unless you have a backup."))return;db[c]=arr(db[c]).filter(x=>x.id!==id);saveData();render();toast("Deleted")}
function closeModal(){$("modal").classList.add("hidden")}

function exportJSON(filename="Universe Bible.json"){
 const blob=new Blob([JSON.stringify(db,null,2)],{type:"application/json"});
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);
 toast("Backup downloaded");
}
function importJSON(file){
 const reader=new FileReader();reader.onload=()=>{try{const incoming=JSON.parse(reader.result);if(!incoming||typeof incoming!=="object")throw Error();db={...defaultData(),...incoming};saveData();render();toast("Universe imported")}catch(e){alert("That file is not valid Griffin Universe JSON.")}};reader.readAsText(file);
}
function reportHTML(){
 const sections=[];
 const esc2=esc;
 sections.push(`<h1>The Griffin Universe Bible</h1><p>Read-only report generated ${new Date().toLocaleString()}</p>`);
 [["Characters","characters"],["Books","books"],["Timeline","timeline"],["Locations","locations"],["Families","families"],["Organisations","organisations"],["Relationships","relationships"],["Themes","themes"],["Mysteries","mysteries"],["Secrets","secrets"],["Historical Events","historicalEvents"],["Future Ideas","futureIdeas"]].forEach(([title,key])=>{
   sections.push(`<section><h2>${esc2(title)}</h2>${arr(db[key]).map(x=>`<div class="card"><h3>${esc2(x.name||x.title||x.secret||x.year||"Untitled")}</h3><p>${esc2(x.description||x.summary||x.notes||"")}</p></div>`).join("")||"<p>No entries.</p>"}</section>`);
 });
 return `<!doctype html><html><head><meta charset="utf-8"><title>Griffin Universe Bible — Read-only Report</title><style>body{font:14px Arial;color:#222;max-width:1000px;margin:40px auto}h1,h2,h3{font-family:Georgia}section{break-inside:avoid;margin-bottom:25px}.card{border:1px solid #bbb;padding:12px;margin:8px 0}</style></head><body class="report">${sections.join("")}</body></html>`;
}
function downloadText(filename,text,type){
 const blob=new Blob([text],{type}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);
}
function makeReport(){downloadText("Griffin Universe Bible — Read-only Report.html",reportHTML(),"text/html");toast("Report generated")}
function printView(){
 const old=document.title;document.title="The Griffin Universe Bible — Printable";window.print();document.title=old;
}

$("themeToggle").onclick=()=>{document.body.classList.toggle("light");localStorage.setItem("griffin-theme",document.body.classList.contains("light")?"light":"dark");$("themeToggle").innerHTML=document.body.classList.contains("light")?"☾ <span>Dark mode</span>":"☼ <span>Light mode</span>"}
$("sidebarToggle").onclick=()=>$("sidebar").classList.toggle("open");
$("backupButton").onclick=()=>exportJSON();
$("importButton").onclick=()=>$("importFile").click();
$("importFile").onchange=e=>{if(e.target.files[0])importJSON(e.target.files[0]);e.target.value=""};
$("reportButton").onclick=makeReport;
$("printButton").onclick=printView;
document.querySelectorAll("[data-close-modal]").forEach(x=>x.onclick=closeModal);
$("modal").addEventListener("click",e=>{if(e.target.dataset.closeModal!==undefined)closeModal()});
$("globalSearch").oninput=e=>{globalQuery=e.target.value; if(globalQuery.trim())renderSearchResults(searchAll(globalQuery));else render()}
document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();$("globalSearch").focus()}if(e.key==="Escape")closeModal()});
window.addEventListener("hashchange",()=>{currentSection=location.hash.slice(1)||"dashboard";render()});

if(localStorage.getItem("griffin-theme")==="light"){$("themeToggle").click()}
if(!localStorage.getItem(STORAGE_KEY)){
  /* First run: load the bundled sample data only once. */
  const sample = {"meta":{"title":"The Griffin Universe Bible","version":"1.0","updatedAt":"2026-10-05T00:00:00.000Z"},"characters":[{"id":"char-robby-dorset","name":"Robby Dorset","nickname":"Robby","birthYear":"1941","deathYear":"","status":"alive","description":"Charming, irresistible and worldly young aristocrat from the Dorset family.","personalityTraits":["irresistible","charming","clever","adventurous"],"physicalDescription":"Elegant, charismatic and effortlessly stylish.","occupation":"Aristocrat / future investigator","firstAppearance":"The Portofino Papers","notes":"Origin-story character for a possible Swinging Sixties strand.","arc":"Young Robby's early adventures and his first meeting with Elspeth Potter.","coreFear":"Losing the people he loves and the freedom he treasures.","coreDesire":"Adventure, independence and meaningful relationships.","relationships":["rel-robby-elspeth"],"families":["Dorset"],"locations":["Robby's Apartment"],"tags":["Dorset","1960s","origin-story","future-idea"]},{"id":"char-elspeth-potter","name":"Elspeth Potter","nickname":"","birthYear":"","deathYear":"","status":"deceased","description":"A formidable and influential literary woman who becomes important to Robby and the Griffin family story.","personalityTraits":["formidable","intelligent","creative"],"physicalDescription":"","occupation":"Author / literary figure","firstAppearance":"The Portofino Papers","notes":"Adam's famous grandmother; the literary estate later managed by Adam is central to the series.","arc":"Her legacy shapes Adam's life and the mysteries surrounding the literary estate.","coreFear":"","coreDesire":"","relationships":["rel-robby-elspeth"],"families":["Potter","Griffin"],"locations":[],"tags":["Potter","Griffin","literary-estate"]},{"id":"char-adam-griffin","name":"Adam Griffin","nickname":"","birthYear":"","deathYear":"","status":"alive","description":"A wealthy young man who manages his famous grandmother's literary estate and becomes one half of the central partnership.","personalityTraits":["loyal","cultured","observant","determined"],"physicalDescription":"","occupation":"Literary estate manager","firstAppearance":"Blood Relatives","notes":"One of the principal protagonists of The Inspector Griffin Mysteries.","arc":"Learning how much of his family's history is hidden beneath the respectable surface.","coreFear":"Failing the people who depend on him.","coreDesire":"Protecting Finn and preserving the family legacy on his own terms.","relationships":["rel-adam-finn"],"families":["Griffin"],"locations":["Covent Garden Apartment"],"tags":["protagonist","Griffin","estate"]},{"id":"char-finn-williams","name":"Finn Williams","nickname":"","birthYear":"","deathYear":"","status":"alive","description":"Adam's partner and a world-class white-hat hacker with a former MI5 background.","personalityTraits":["brilliant","witty","protective","resourceful"],"physicalDescription":"","occupation":"White-hat hacker / former MI5","firstAppearance":"Blood Relatives","notes":"The other principal protagonist of The Inspector Griffin Mysteries.","arc":"Balancing his extraordinary technical abilities and past with a quieter life alongside Adam.","coreFear":"Being unable to protect Adam when it matters.","coreDesire":"A secure life with Adam without surrendering who he is.","relationships":["rel-adam-finn"],"families":[],"locations":["Covent Garden Apartment"],"tags":["protagonist","hacker","former-MI5"]}],"books":[{"id":"book-blood-relatives","title":"Blood Relatives","chronologyOrder":"1","publicationOrder":"1","summary":"The first Inspector Griffin mystery, introducing Adam Griffin and Finn Williams.","themes":["family","inheritance","secrets"],"characters":["char-adam-griffin","char-finn-williams"],"timelineEvents":["event-blood-relatives"],"locations":["Covent Garden Apartment"],"notes":"Book 1 of The Inspector Griffin Mysteries."},{"id":"book-crypto-mystery-weekend","title":"The Crypto Mystery Weekend","chronologyOrder":"2","publicationOrder":"2","summary":"A country-house mystery involving a flash drive containing access to a cryptocurrency fortune.","themes":["cryptocurrency","country-house-mystery","technology"],"characters":["char-adam-griffin","char-finn-williams"],"timelineEvents":[],"locations":["Blackwater Hall"],"notes":"Previously referred to by an earlier working title; canonical title is The Crypto Mystery Weekend."}],"timeline":[{"id":"event-robby-born","year":"1941","title":"Robby Dorset born","description":"Robby Dorset is born.","characters":["char-robby-dorset"],"families":["Dorset"],"book":"","location":"","tags":["birth","Dorset"]},{"id":"event-grandfather-war","year":"1945","title":"Griffin grandfather returns from war","description":"The Griffin grandfather returns from the Second World War.","characters":[],"families":["Griffin"],"book":"","location":"","tags":["war","Griffin"]},{"id":"event-adam-father-born","year":"1957","title":"Adam's father born","description":"Adam Griffin's father is born.","characters":[],"families":["Griffin"],"book":"","location":"","tags":["birth","Griffin"]},{"id":"event-robby-elspeth","year":"1963","title":"Robby meets Elspeth Potter","description":"Robby meets Elspeth Potter during the Swinging Sixties.","characters":["char-robby-dorset","char-elspeth-potter"],"families":["Dorset","Potter","Griffin"],"book":"book-portofino-papers","location":"","tags":["1960s","meeting","origin-story"]},{"id":"event-blood-relatives","year":"","title":"Blood Relatives begins","description":"The opening novel of The Inspector Griffin Mysteries introduces Adam and Finn.","characters":["char-adam-griffin","char-finn-williams"],"families":["Griffin"],"book":"book-blood-relatives","location":"Covent Garden Apartment","tags":["book-1"]}],"locations":[{"id":"loc-maltese-tonys-cafe","name":"Maltese Tony's Cafe","type":"cafe","description":"A recurring London meeting place.","associatedCharacters":[],"firstAppearance":"","notes":""},{"id":"loc-covent-garden-apartment","name":"Covent Garden Apartment","type":"home","description":"Adam and Finn's London base.","associatedCharacters":["char-adam-griffin","char-finn-williams"],"firstAppearance":"Blood Relatives","notes":""},{"id":"loc-robbys-apartment","name":"Robby's Apartment","type":"home","description":"Robby's apartment during his younger years.","associatedCharacters":["char-robby-dorset"],"firstAppearance":"The Portofino Papers","notes":""},{"id":"loc-blackwater-hall","name":"Blackwater Hall","type":"country house","description":"A grand country-house hotel setting associated with The Crypto Mystery Weekend.","associatedCharacters":["char-adam-griffin","char-finn-williams"],"firstAppearance":"The Crypto Mystery Weekend","notes":"Inspired by the grand country-house-hotel tradition."}],"families":[{"id":"family-griffin","name":"Griffin Family","description":"Adam Griffin's family line.","members":[{"characterId":"char-adam-griffin","parentId":"","spouseId":""}],"notes":"Expand as genealogy develops."},{"id":"family-dorset","name":"Dorset Family","description":"Robby Dorset's aristocratic family.","members":[{"characterId":"char-robby-dorset","parentId":"","spouseId":""}],"notes":""},{"id":"family-potter","name":"Potter Family","description":"Elspeth Potter's family line and literary legacy.","members":[{"characterId":"char-elspeth-potter","parentId":"","spouseId":""}],"notes":""}],"organisations":[],"relationships":[{"id":"rel-adam-finn","characterA":"char-adam-griffin","characterB":"char-finn-williams","type":"Committed relationship","startYear":"","endYear":"","notes":"Central romantic partnership of the series."},{"id":"rel-robby-elspeth","characterA":"char-robby-dorset","characterB":"char-elspeth-potter","type":"Mentor / friendship","startYear":"1963","endYear":"","notes":"Robby meets Elspeth in 1963."}],"themes":[{"id":"theme-family","name":"Family","description":"Family history, inheritance and hidden loyalties.","books":["book-blood-relatives"]},{"id":"theme-secrets","name":"Secrets","description":"Information hidden between generations and partners.","books":[]}],"mysteries":[{"id":"mystery-blood-relatives","name":"Blood Relatives","book":"Blood Relatives","victim":"","culprit":"","motive":"","clues":[],"resolution":"","notes":"Populate as the manuscript develops."}],"secrets":[{"id":"secret-finn-device","secret":"Finn triggered a terrorist device remotely","knownBy":["char-finn-williams"],"revealedTo":["char-adam-griffin"],"book":"","notes":"Example secret entry."}],"historicalEvents":[],"futureIdeas":[{"id":"idea-young-robby","title":"Young Robby series","status":"possible","description":"A possible origin-story strand set in the Swinging Sixties.","notes":"1963. Meets Elspeth Potter. Swinging Sixties. Political scandal.","tags":["Robby","1960s","origin-story"]}],"scratchpad":"Private notes go here..."};
  db=sample; saveData();
}
render();
