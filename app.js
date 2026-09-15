/* HUGO OS — native, offline-first JavaScript. Edit profile here. */
'use strict';
const PROFILE = {
  name: 'Hugo',
  role: 'Backend Engineer / Engineering Manager',
  email: '', // Your public contact email
  github: '', // e.g. https://github.com/your-username
  linkedin: '', // e.g. https://www.linkedin.com/in/your-username/
};
const ICONS = {
  user:'<path d="M20 21v-2a6 6 0 0 0-6-6h-4a6 6 0 0 0-6 6v2"/><circle cx="12" cy="5" r="4"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  folder:'<path d="M3 7V5a2 2 0 0 1 2-2h5l3 4h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/>',
  network:'<rect x="9" y="2" width="6" height="5" rx="1"/><rect x="2" y="17" width="6" height="5" rx="1"/><rect x="16" y="17" width="6" height="5" rx="1"/><path d="M12 7v6M5 17v-4h14v4"/>',
  database:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
  terminal:'<rect x="2" y="3" width="20" height="18" rx="2"/><path d="m6 8 4 4-4 4m7 0h4"/>',
  layers:'<path d="m12 3 10 5-10 5L2 8l10-5Zm-10 9 10 5 10-5M2 16l10 5 10-5"/>',
  file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 0v6h6M8 13h8m-8 4h6"/>',
  mail:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 6 10 7L22 6"/>',
  expand:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
  arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
  home:'<path d="m3 10 9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z"/>',
  cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4"/><rect x="10" y="10" width="4" height="4"/>',
  globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  wifi:'<path d="M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0m-11 4a6 6 0 0 1 8 0"/><circle cx="12" cy="20" r=".7"/>',
  replay:'<path d="M3 10a9 9 0 1 1 1 7M3 3v7h7"/>',
  close:'<path d="m6 6 12 12M6 18 18 6"/>',
  minus:'<path d="M5 12h14"/>',
  download:'<path d="M12 3v12m-5-5 5 5 5-5M3 16v5h18v-5"/>',
};
const icon = name => `<svg class="icon" aria-hidden="true" viewBox="0 0 24 24">${ICONS[name] || ICONS.file}</svg>`;
const $ = selector => document.querySelector(selector);
const escapeHTML = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const APPS = [
  ['about','ABOUT','user','exe'],['experience','EXPERIENCE','clock','exe'],['projects','PROJECTS','folder','exe'],
  ['architecture','ARCHITECTURE','network','exe'],['database','DATABASE','database','exe'],['terminal','TERMINAL','terminal','exe'],
  ['skills','SKILLS','layers','exe'],['resume','RESUME','file','pdf'],
];
const PROJECTS = [
  {title:'High-concurrency transaction system',short:'Concurrent transactions',stack:['Golang','MySQL','Redis','RabbitMQ'],problem:'A burst of simultaneous requests can oversell inventory, duplicate orders, or leave partial writes.',architecture:'Stateless Go APIs validate requests. MySQL owns durable transaction state; Redis accelerates reads. A transactional outbox feeds asynchronous workers through RabbitMQ.',role:'Reference scope: backend architecture, transaction boundaries, load-test planning, and review of concurrency risks.',challenges:'Coordinating retries, hot inventory rows, and message delivery without confusing “at least once” with “exactly once.”',solution:'Use idempotency keys, conditional inventory updates inside a transaction, a transactional outbox, and idempotent consumers. Apply bounded concurrency and backpressure.',result:'Design goal: one committed effect per accepted idempotency key and no negative stock. Validate with concurrent replay, fault injection, and reconciliation; production metrics are not yet supplied.'},
  {title:'Payment orchestration system',short:'Payment orchestration',stack:['Golang','MySQL','RabbitMQ','REST'],problem:'Provider timeouts and duplicate callbacks make it difficult to tell whether a payment succeeded.',architecture:'A payment API writes a durable state machine. Provider adapters normalize events, and reconciliation workers compare local records with provider settlements.',role:'Reference scope: API contracts, provider integration design, and reliability review.',challenges:'Out-of-order webhooks, ambiguous timeouts, partial refunds, and differences between payment providers.',solution:'Verify webhook signatures, deduplicate event IDs, enforce permitted state transitions, and reconcile unsettled records. Keep a durable audit trail.',result:'Design goal: recoverable payment state and traceable transitions. Settlement accuracy, failure rates, and measured outcomes await real project data.'},
  {title:'Real-time game platform',short:'Game platform',stack:['Golang','Redis','gRPC','Kubernetes'],problem:'Live sessions need predictable latency while players connect, disconnect, and move between instances.',architecture:'A gateway routes connections to session owners. Go services handle gameplay coordination, Redis tracks ephemeral presence, and durable events flow to storage.',role:'Reference scope: service boundaries, session ownership, and team delivery planning.',challenges:'Reconnection, stale ownership, hot rooms, backpressure, and safe rolling deployments.',solution:'Assign explicit session ownership, use leases and fencing tokens where necessary, bound queues, and drain connections during rollout.',result:'Design goal: bounded message delay and safe session recovery. Load-test and availability results should be added from an actual implementation.'},
  {title:'Event-driven data platform',short:'Data platform',stack:['Golang','RabbitMQ','MySQL','GCP'],problem:'Operational events arrive late, twice, or out of order, making reporting unreliable.',architecture:'Event collectors send validated records to a durable queue. Versioned workers transform data into queryable stores with lineage and checkpoints.',role:'Reference scope: ingestion contracts, data correctness, and operational tooling.',challenges:'Schema evolution, duplicate events, replay safety, dead letters, and uneven traffic.',solution:'Version schemas, track processed event IDs, isolate poison messages, and support checkpointed replay with explicit retention policies.',result:'Design goal: reproducible processing and visible data freshness. Real throughput, latency, and operational results are pending.'},
  {title:'HUGO OS — the personal workspace',short:'HUGO OS',stack:['JavaScript','HTML','CSS','Three.js'],problem:'A traditional résumé offers little room to explore how an engineer thinks through systems.',architecture:'A static HTML desktop, native JavaScript application windows, and a lazily loaded Three.js opening. Every asset is shipped locally.',role:'Portfolio concept and interaction design based on Hugo’s brief.',challenges:'Preserving offline file access, keyboard navigation, and mobile usability while offering a cinematic desktop experience.',solution:'Use classic local scripts instead of module imports or API calls. Unload the 3D scene after the opening and offer a reduced-motion path.',result:'Implemented in this portfolio: a directly openable static website, interactive terminal navigation, architecture exploration, and a GitHub Pages deployment workflow.'},
];
const SKILLS = [
  ['BACKEND',['Golang','REST','gRPC','Microservices'],'Clear contracts. Deliberate service boundaries.'],
  ['DATABASE',['MySQL','MongoDB','Redis'],'Model for correctness. Optimize with evidence.'],
  ['MESSAGE',['RabbitMQ','Event-driven design'],'Retries, delivery semantics, and backpressure.'],
  ['INFRASTRUCTURE',['Docker','Kubernetes','GCP'],'Repeatable environments and observable services.'],
  ['ENGINEERING',['System Design','Performance','Concurrency','Distributed Systems'],'Reason about failure before it happens.'],
  ['MANAGEMENT',['Team Management','Technical Planning','Code Review','Project Planning','Cross-team Communication'],'Turn shared direction into dependable delivery.'],
];
const NODES = {
  client:{label:'Client',icon:'globe',number:'01',description:'The user-facing entry point. Send a stable request ID and idempotency key for retriable writes. Treat network errors as uncertain outcomes.',tags:['HTTPS','Request identity']},
  gateway:{label:'API Gateway',icon:'network',number:'02',description:'Authenticate requests, apply rate limits, and route traffic. Carry deadlines and trace context downstream. Keep business rules in the services that own them.',tags:['Auth','Rate limits','Routing']},
  services:{label:'Golang Services',icon:'cpu',number:'03',description:'Small, explicit service boundaries around business capabilities. Context deadlines, bounded goroutines, and well-defined transaction ownership make failures easier to contain.',tags:['Go','gRPC','Domain logic']},
  redis:{label:'Redis / RabbitMQ',icon:'layers',number:'04',description:'Redis handles ephemeral state and cached reads; RabbitMQ carries asynchronous work. Cache misses fall back to the source of truth. Consumers acknowledge only after durable processing.',tags:['Cache-aside','Backpressure','Idempotency']},
  mysql:{label:'MySQL',icon:'database',number:'05',description:'The durable source of truth for transactional state. Use short transactions, deliberate indexes, and an outbox for reliable publication. Make isolation and locking choices explicit.',tags:['Transactions','Indexes','Outbox']},
  worker:{label:'Worker',icon:'terminal',number:'06',description:'Workers consume queued jobs, update durable state, and acknowledge successful processing. Bound retries, quarantine poison messages, and keep handlers safe to replay.',tags:['Retries','Dead-letter queue','Observability']},
};
const DB_TOPICS = {
  'Index':{title:'Design for the query.',text:'Composite indexes follow access patterns. Equality predicates come before a range when appropriate. Verify the chosen index and actual row counts rather than assuming a faster query.',code:'EXPLAIN ANALYZE\nSELECT id, amount, created_at\nFROM transactions\nWHERE user_id = 42\n  AND status = \'completed\'\nORDER BY created_at DESC\nLIMIT 20;\n\nCREATE INDEX idx_user_status_created\nON transactions (user_id, status, created_at);'},
  'Transaction':{title:'Make the boundary explicit.',text:'Commit related state changes atomically. Keep the transaction short, check affected rows, and roll back when a precondition fails. External network calls belong outside the database transaction.',code:'START TRANSACTION;\n\nUPDATE inventory\nSET available = available - 1\nWHERE sku = \'GO-001\' AND available > 0;\n\n-- Application: if affected rows != 1, ROLLBACK.\n-- Otherwise insert the order and outbox event.\nCOMMIT;'},
  'MVCC':{title:'Readers see a consistent view.',text:'InnoDB combines multi-version reads with locking. Under REPEATABLE READ, consistent reads normally use the snapshot established by the first such read. Locking reads use current data and behave differently.',code:'SET TRANSACTION ISOLATION LEVEL\n  REPEATABLE READ;\nSTART TRANSACTION;\n\n-- Consistent snapshot read\nSELECT balance FROM accounts WHERE id = 42;\n\n-- Current, locking read\nSELECT balance FROM accounts\nWHERE id = 42 FOR UPDATE;\nCOMMIT;'},
  'Lock':{title:'Coordinate without contention.',text:'Acquire locks in a consistent order, keep transactions short, and retry deadlocks with a bounded policy. A missing suitable index can widen the scanned and locked range.',code:'START TRANSACTION;\nSELECT id, balance FROM accounts\nWHERE id IN (12, 42)\nORDER BY id FOR UPDATE;\n\n-- Validate balance, then update both accounts.\n-- Retry the whole transaction on a deadlock.\nCOMMIT;'},
  'Query Optimization':{title:'Measure before changing.',text:'Use execution plans, real timing, and query patterns. Watch rows scanned, repeated lookups, sorting, and the difference between estimated and actual cardinality.',code:'EXPLAIN ANALYZE\nSELECT id, created_at FROM transactions\nWHERE user_id = 42\n  AND created_at < \'2026-01-01\'\nORDER BY created_at DESC\nLIMIT 50;\n\n-- Compare plans on representative data.\n-- Prefer keyset pagination for deep pages.'},
  'Partition':{title:'Manage data by its lifecycle.',text:'Partitioning can simplify retention and reduce scans when partition pruning applies. It does not replace indexing. In MySQL, partition columns must be included in every unique key.',code:'CREATE TABLE event_log (\n  id BIGINT NOT NULL,\n  created_at DATE NOT NULL,\n  payload JSON,\n  PRIMARY KEY (id, created_at)\n) PARTITION BY RANGE COLUMNS(created_at) (\n  PARTITION p2025 VALUES LESS THAN (\'2026-01-01\'),\n  PARTITION pmax VALUES LESS THAN (MAXVALUE)\n);'},
  'Replication':{title:'Plan for lag, not just failure.',text:'Replicas can serve suitable read workloads, but asynchronous replication can return stale results. Route read-after-write traffic to the primary or use a deliberate consistency mechanism.',code:'-- On a replica: inspect replication health\nSHOW REPLICA STATUS;\n\n-- Application routing policy\n-- Write          -> primary\n-- Read-after-write -> primary\n-- Stale-tolerant reads -> healthy replicas\n\n-- Failover requires fencing the old primary.'},
};
let activeApp = '', selectedProject = 0, selectedYear = '2026', selectedNode = 'services', selectedTopic = 'Index';
let terminalHistory = [], commandHistory = [], historyIndex = 0, toastTimer;
let sceneCleanup = null, sceneLoadController = null, introRun = 0, phase = 'intro';
let openingFrame = 0, opening = null, studio = null;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function hydrateIcons(root=document){root.querySelectorAll('[data-icon]').forEach(el=>{el.innerHTML=icon(el.dataset.icon);});}
function tags(items){return `<div class="tags">${items.map(item=>`<span>${escapeHTML(item)}</span>`).join('')}</div>`;}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),4000);}
function title(kicker,heading,body=''){return `<span class="eyebrow">${kicker}</span><h2>${heading}</h2>${body?`<p class="app-intro">${body}</p>`:''}`;}
function renderAbout(){return title('01 / THE PERSON BEHIND THE CODE','Good systems. Great teams.','I’m Hugo, a Backend Engineer and Engineering Manager. My work lives at the intersection of reliable systems and the people who build them.')+`<div class="stats"><div><strong>10<span>+</span></strong><span>Years building software</span></div><div><strong>8<span>+</span></strong><span>Years with Golang</span></div><div><strong>5<span>+</span></strong><span>Years leading teams</span></div></div><div class="about-detail-grid"><div><span class="detail-label">01 / ENGINEERING</span><h3>Make complexity manageable.</h3><p>Designing backend services, understanding database behavior, and thinking through concurrency, performance, and failure modes.</p></div><div><span class="detail-label">02 / LEADERSHIP</span><h3>Build the team behind the system.</h3><p>Technical planning, thoughtful code review, and cross-team communication that connect engineering decisions to shared goals.</p></div></div><button class="text-button" data-app="experience">Explore the engineering journey <span>↗</span></button>`;}
const YEARS = {
  '2016':['Software engineering','Foundations & problem solving',['Software design and maintainable code','Building and debugging backend applications']],
  '2018':['Backend engineering','Going deeper with Go',['Golang, APIs, and concurrent programs','Database modeling and query behavior']],
  '2021':['Engineering leadership','Systems are built by people',['Technical planning and code review','Team development and cross-team alignment']],
  '2024':['Systems & scale','Designing for reliability',['Distributed systems and performance','Observability and operational readiness']],
  '2026':['Engineering Manager / Backend Engineer','Connecting architecture and execution',['Reliable backend systems','Technical direction and effective teams']],
};
function renderExperience(){const item=YEARS[selectedYear];return title('02 / SYSTEM TIMELINE','Experience, over time.','Explore the progression from writing software to leading the teams that deliver it.')+`<p class="content-note">Illustrative timeline — company names, role dates, and accomplishments are awaiting Hugo’s actual résumé. The experience totals are supplied; these year-by-year mappings are placeholders.</p><div class="timeline-tabs" role="tablist" aria-label="Experience years">${Object.keys(YEARS).map(year=>`<button role="tab" aria-selected="${year===selectedYear}" class="${year===selectedYear?'active':''}" data-year="${year}">${year}</button>`).join('')}</div><section class="timeline-detail" role="tabpanel"><span class="timeline-year">${selectedYear} / ${item[1]}</span><h3>${item[0]}</h3><ul>${item[2].map(line=>`<li>${line}</li>`).join('')}</ul><span class="sample-label">COMPANY & VERIFIED OUTCOMES TO BE ADDED</span></section>`;}
let projectFilter='all', projectDetail=false;
function renderProjects(){
  const p=PROJECTS[selectedProject];
  if(projectDetail)return `<div class="file-toolbar"><button data-project-back>${icon('folder')} All projects</button><span class="mono">hugo / projects / ${escapeHTML(p.short)}</span></div><article class="project-detail"><span class="detail-label">${selectedProject===4?'IMPLEMENTED PORTFOLIO':'CONCEPT STUDY · REFERENCE DESIGN'}</span><h2>${p.title}</h2>${tags(p.stack)}<div class="case-grid">${[['Problem',p.problem],['Architecture',p.architecture],['Role',p.role],['Challenges',p.challenges],['Solution',p.solution],['Result',p.result]].map(([label,value])=>`<div><h3 class="detail-label">${label}</h3><p>${value}</p></div>`).join('')}</div><button class="os-button" data-app="architecture">${icon('network')} Explore reference architecture</button></article>`;
  const rows=PROJECTS.map((project,i)=>({project,i})).filter(({i})=>projectFilter==='all'||(projectFilter==='backend'?i<4:i===4));
  return `<div class="file-toolbar"><span>${icon('folder')}</span><span class="mono">hugo <span class="muted">/</span> projects</span><span class="file-count">${rows.length} items</span></div><div class="file-manager"><nav class="file-sidebar" aria-label="Project categories">${[['all','folder','All projects'],['backend','cpu','Backend'],['portfolio','globe','Portfolio']].map(([id,ico,label])=>`<button data-project-filter="${id}" aria-pressed="${projectFilter===id}">${icon(ico)}${label}</button>`).join('')}</nav><div class="file-main"><div class="file-list" aria-label="Projects"><div class="file-columns" aria-hidden="true"><span>Name</span><span>Type</span></div>${rows.map(({project,i})=>`<button class="file-row" data-select-project="${i}" aria-pressed="${selectedProject===i}">${icon('folder')}<span>${project.short}</span><small>${i===4?'Portfolio':'Concept study'}</small></button>`).join('')}</div><section class="file-preview" aria-label="Selected project preview"><span class="preview-folder">${icon('folder')}</span><div><span class="detail-label">${selectedProject===4?'PORTFOLIO':'CONCEPT STUDY'}</span><h2>${p.short}</h2>${tags(p.stack)}<p>${p.problem}</p><button class="os-button primary" data-open-project="${selectedProject}">Open case study ${icon('arrow')}</button></div></section></div></div>`;
}
function renderArchitecture(){
 const node=NODES[selectedNode];
 const nodeButton=id=>`<button data-select-node="${id}" class="${id===selectedNode?'active':''}" aria-pressed="${id===selectedNode}">${icon(NODES[id].icon)}<span>${NODES[id].label}</span></button>`;
 return `<div class="architecture-toolbar"><span class="eyebrow">REFERENCE ARCHITECTURE</span><span>Backend systems</span></div><div class="architecture-canvas" aria-label="Interactive reference architecture">${nodeButton('client')}<span class="graph-link" aria-hidden="true"></span>${nodeButton('gateway')}<span class="graph-link" aria-hidden="true"></span>${nodeButton('services')}<div class="graph-branches" aria-hidden="true"></div><div class="graph-pair">${nodeButton('mysql')}${nodeButton('redis')}</div><div class="graph-worker"><span class="graph-link" aria-hidden="true"></span>${nodeButton('worker')}</div></div><article class="architecture-inspector"><span class="detail-label">COMPONENT ${node.number} / 06</span><h2>${node.label}</h2><p>${node.description}</p>${tags(node.tags)}<p class="content-note">Reference design: services read and write MySQL; an outbox publishes to RabbitMQ. Workers consume jobs and write results. Redis is an optional cache. Connections show responsibilities, not a literal request sequence.</p></article>`;
}
function renderDatabase(){const topic=DB_TOPICS[selectedTopic];return title('05 / DATABASE CONSOLE','Correctness comes first.','Inside MySQL: data models, query plans, concurrency, and the decisions that make a database dependable.')+`<div class="db-layout"><nav class="db-nav" aria-label="Database topics">${Object.keys(DB_TOPICS).map(key=>`<button data-topic="${key}" class="${key===selectedTopic?'active':''}" aria-pressed="${key===selectedTopic}">${key}</button>`).join('')}</nav><article class="db-detail"><span class="detail-label">MYSQL / ${selectedTopic.toUpperCase()}</span><h3>${topic.title}</h3><p>${topic.text}</p><pre><code>${escapeHTML(topic.code)}</code></pre><span class="tiny-label muted">REFERENCE SQL · READ-ONLY EXAMPLES</span>${selectedTopic==='Index'?'<table class="schema-table"><caption class="detail-label">TRANSACTIONS / EXAMPLE SCHEMA</caption><thead><tr><th>COLUMN</th><th>TYPE</th><th>KEY</th></tr></thead><tbody><tr><td>id</td><td>BIGINT</td><td>PRIMARY</td></tr><tr><td>user_id</td><td>BIGINT</td><td>INDEX</td></tr><tr><td>status</td><td>VARCHAR(20)</td><td>INDEX</td></tr><tr><td>created_at</td><td>DATETIME</td><td>INDEX</td></tr></tbody></table>':''}</article></div>`;}
function renderSkills(){return title('07 / TECHNOLOGY MAP','The tools follow the problem.','A connected toolkit for building software and leading engineering teams. No arbitrary scores — just areas of practice.')+`<div class="skills-map">${SKILLS.map(([name,items,description],i)=>`<section class="skill-cluster"><span class="detail-label">${name}<span>${String(i+1).padStart(2,'0')}</span></span>${tags(items)}<p>${description}</p></section>`).join('')}</div>`;}
function renderTerminal(){return `<div class="full-terminal"><div class="terminal-output" role="log" aria-label="Terminal output"><p>HUGO OS [Version 1.0.0]<br>Hugo Shell · files, apps and desktop settings.<br>Type “help” to explore. Tab to complete · ↑ / ↓ for history.</p>${terminalHistory.map(line=>`<p class="${line.type==='command'?'command-echo':''}">${escapeHTML(line.text)}</p>`).join('')}</div><form id="terminal-form" class="terminal-input-line"><label for="terminal-command" class="prompt-user">visitor@hugo<span class="muted">:${escapeHTML(window.HugoOS?.cwd||'/')}$</span></label><input id="terminal-command" aria-label="Terminal command" autocomplete="off" autocapitalize="off" spellcheck="false"><button aria-label="Run terminal command">${icon('arrow')}</button></form><div class="terminal-completions">${['help','whoami','skills','projects','architecture','contact','clear'].map(cmd=>`<button data-command="${cmd}">${cmd}</button>`).join('')}</div></div>`;}
function renderResume(){return title('08 / RESUME.PDF','The human-readable version.','A concise profile summary, available to preview here and download as a PDF.')+`<div class="resume-actions"><a class="primary-button" href="assets/hugo-profile-summary.pdf" download="Hugo-Profile-Summary.pdf">DOWNLOAD SUMMARY PDF ${icon('download')}</a><a href="assets/hugo-profile-summary.pdf" target="_blank" rel="noopener">Open PDF preview ↗</a></div><article class="resume-paper"><span class="eyebrow">PROFILE SUMMARY / DRAFT</span><h3>HUGO</h3><p>Backend Engineer / Engineering Manager</p><h4>PROFILE</h4><p>Software engineer and engineering manager with a focus on backend systems, Golang, databases, and team leadership.</p><div class="resume-metrics">10+ years in software development<br>8+ years with Golang<br>5+ years in team management</div><h4>CORE TECHNOLOGIES</h4><p>Golang · MySQL · MongoDB · Redis · RabbitMQ · Docker · Kubernetes · GCP · REST · gRPC</p><h4>ENGINEERING & LEADERSHIP</h4><p>System Design · Performance · Concurrency · Distributed Systems · Team Management · Technical Planning · Code Review · Project Planning · Cross-team Communication</p><h4>EXPERIENCE & CONTACT</h4><p>Company names, employment dates, verified project outcomes, education, and contact details have not yet been supplied.</p></article><p class="content-note">This downloadable summary includes only supplied profile details. Replace it with your complete résumé when it is ready.</p>`;}
function safeUrl(url){try{const parsed=new URL(url);return ['https:','http:'].includes(parsed.protocol)?parsed.href:'';}catch{return '';}}
function renderContact(){return title('09 / OPEN A CONNECTION','Let’s build something reliable.','For engineering conversations, technical leadership, and systems that deserve thoughtful design.')+`<div class="contact-links">${[['Email',PROFILE.email,'mail'],['GitHub',PROFILE.github,'globe'],['LinkedIn',PROFILE.linkedin,'network']].map(([label,value,ico])=>{const link=label==='Email'&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)?'mailto:'+encodeURIComponent(value):safeUrl(value);return link?`<a href="${escapeHTML(link)}" ${label!=='Email'?'target="_blank" rel="noopener noreferrer"':''}><span class="contact-label">${label}</span><span class="contact-value">${escapeHTML(value)}</span>${icon('arrow')}</a>`:`<div><span class="contact-label">${label}</span><span class="contact-value">Contact details coming soon</span>${icon(ico)}</div>`;}).join('')}</div><p class="content-note">Hugo’s public contact links haven’t been supplied yet. No placeholder addresses or unrelated profiles are linked.</p>`;}
const renderers={about:renderAbout,experience:renderExperience,projects:renderProjects,architecture:renderArchitecture,database:renderDatabase,terminal:renderTerminal,skills:renderSkills,resume:renderResume,contact:renderContact};
const windows=new Map();
const APP_META={welcome:['Welcome','home'],about:['About Hugo','user'],experience:['Experience','clock'],projects:['Projects','folder'],architecture:['Architecture','network'],database:['Database','database'],terminal:['Terminal','terminal'],skills:['Skills','layers'],resume:['Resume.pdf','file'],contact:['Contact','mail']};
const PINNED=['projects','architecture','terminal','resume'];
let windowOrder=0,desktopStarted=false,desktopStash=[];
function renderWelcome(){return `<div class="welcome-copy"><span class="eyebrow">A LITTLE ABOUT ME</span><h1>Hi, I’m Hugo<span>.</span></h1><p class="welcome-role">Backend Engineer<br>Engineering Manager</p><div class="welcome-stats"><span><strong>10+</strong>Years in software</span><span><strong>8+</strong>Years with Golang</span><span><strong>5+</strong>Years leading teams</span></div><div class="welcome-actions"><button class="os-button primary" data-app="projects">${icon('folder')} Explore projects</button><button class="os-button" data-app="resume">${icon('file')} View resume</button></div><div class="welcome-foot"><span>Make yourself at home.</span><button data-app="about">About me ${icon('arrow')}</button></div></div>`;}
renderers.welcome=renderWelcome;
function windowContent(id=activeApp){return windows.get(id)?.element.querySelector('.app-content');}
function renderApp(focusSelector,id=activeApp){
  const content=windowContent(id);if(!content)return;
  const scroll=content.scrollTop;
  const draft=id==='terminal'?content.querySelector('input')?.value:undefined;
  if((id==='browser'||id==='files')&&content.firstElementChild)return;
  content.innerHTML=renderers[id]();hydrateIcons(content);content.scrollTop=scroll;window.HugoOS?.mounted(id);
  if(draft!==undefined&&id==='terminal')content.querySelector('input').value=draft;
  if(focusSelector)content.querySelector(focusSelector)?.focus({preventScroll:true});
}
function navigateApp(id,replace=false){
  const hash=id&&id!=='welcome'?`#${id}`:'';
  if(location.hash!==hash)history[replace?'replaceState':'pushState'](null,'',location.pathname+location.search+hash);
}
function syncDesktop(){
  const compact=window.innerWidth<1100;
  for(const [id,state] of windows){
    const visible=!state.closed&&!state.minimized&&(!compact||id===activeApp);
    state.element.hidden=!visible;state.element.inert=!visible;
    state.element.classList.toggle('is-active',id===activeApp);
  }
  $('#active-app-label').textContent=APP_META[activeApp]?.[0]||'Desktop';
  const ids=[...PINNED,...[...windows.keys()].filter(id=>!PINNED.includes(id)&&!windows.get(id).closed)];
  const dock=$('#dock-apps');
  for(const button of dock.querySelectorAll('[data-dock-app]'))if(!ids.includes(button.dataset.dockApp))button.remove();
  for(const id of ids){
    let button=dock.querySelector(`[data-dock-app="${id}"]`);
    if(!button){button=document.createElement('button');button.dataset.dockApp=id;button.innerHTML=`${icon(APP_META[id][1])}<span class="dock-label">${APP_META[id][0]}</span><i aria-hidden="true"></i>`;dock.appendChild(button);}
    const state=windows.get(id),running=state&&!state.closed;
    button.classList.toggle('running',!!running);button.classList.toggle('current',activeApp===id);button.classList.toggle('minimized',!!state?.minimized);
    button.setAttribute('aria-pressed',String(activeApp===id));button.setAttribute('aria-label',`${APP_META[id][0]}${running?(state.minimized?' — minimized':' — running'):''}`);button.title=button.getAttribute('aria-label');
  }
}
function focusApp(id,{keyboard=false}={}){
  const state=windows.get(id);if(!state||state.closed||state.minimized)return;
  if(activeApp!==id){activeApp=id;state.order=++windowOrder;state.element.style.zIndex=state.order;}
  syncDesktop();
  if(keyboard){const target=state.lastFocus?.isConnected&&!state.lastFocus.closest('[hidden]')?state.lastFocus:state.element;target.focus({preventScroll:true});}
}
function fitWindow(state){
  const area=$('#window-layer'),aw=area.clientWidth,ah=area.clientHeight;
  if(window.innerWidth<1100)return;
  state.width=Math.min(state.width,Math.max(280,aw-24));state.height=Math.min(state.height,Math.max(200,ah-24));
  state.x=Math.max(12,Math.min(state.x,aw-state.width-12));state.y=Math.max(12,Math.min(state.y,ah-state.height-12));
  Object.assign(state.element.style,{left:`${state.x}px`,top:`${state.y}px`,width:`${state.width}px`,height:`${state.height}px`});
}
function createAppWindow(id){
  const index=windows.size,area=$('#window-layer');
  const element=document.createElement('section');element.className=`os-window app-${id}`;element.dataset.window=id;element.tabIndex=-1;element.setAttribute('role','region');element.setAttribute('aria-labelledby',`window-title-${id}`);
  element.innerHTML=`<header class="os-titlebar"><button class="mobile-back" data-window-action="minimize" aria-label="Back to desktop">${icon('arrow')}</button><span id="window-title-${id}" class="os-window-title">${icon(APP_META[id][1])}${APP_META[id][0]}</span><div class="os-window-controls"><details class="window-arrangement"><summary aria-label="Arrange window" title="Arrange window">···</summary><div><button data-window-action="left">Tile left</button><button data-window-action="right">Tile right</button><button data-window-action="center">Center window</button></div></details><button data-window-action="minimize" aria-label="Minimize ${APP_META[id][0]}" title="Minimize">${icon('minus')}</button><button class="maximize-control" data-window-action="maximize" aria-label="Maximize ${APP_META[id][0]}" title="Maximize">${icon('expand')}</button><button data-window-action="close" aria-label="Close ${APP_META[id][0]}" title="Close">${icon('close')}</button></div></header><div class="app-content"></div><footer class="os-window-status"><span>hugo / ${id==='welcome'?'desktop':id}</span><span>${id==='terminal'?'⌘ / Ctrl K':id==='projects'?'5 projects':'HUGO OS'}</span></footer><button class="window-resize" data-window-action="resize" aria-label="Resize ${APP_META[id][0]}" title="Drag to resize; arrow keys to adjust">⌟</button>`;
  const width=id==='welcome'?560:id==='terminal'?660:id==='architecture'?600:850;
  const height=id==='welcome'?510:id==='terminal'?410:640;
  const state={element,width,height,x:id==='welcome'?Math.max(145,area.clientWidth*.15):140+(index%4)*36,y:id==='welcome'?Math.max(30,(area.clientHeight-height)*.42):28+(index%4)*30,closed:false,minimized:false,maximized:false,order:0,lastFocus:null};
  windows.set(id,state);area.appendChild(element);window.HugoOS?.restoreLayout(id,state);fitWindow(state);renderApp(null,id);
  element.addEventListener('pointerdown',()=>focusApp(id));
  element.addEventListener('focusin',event=>{state.lastFocus=event.target;focusApp(id);});
  const titlebar=element.querySelector('.os-titlebar');
  titlebar.addEventListener('dblclick',event=>{if(!event.target.closest('button,details'))arrangeWindow(id,'maximize');});
  let drag=null;
  element.addEventListener('pointerdown',event=>{
    const resizing=event.target.closest('.window-resize');
    if(event.button!==0||window.innerWidth<1100||state.maximized||(!resizing&&(!event.target.closest('.os-titlebar')||event.target.closest('button,details'))))return;
    drag={x:event.clientX,y:event.clientY,left:state.x,top:state.y,width:state.width,height:state.height,resizing:!!resizing};element.setPointerCapture(event.pointerId);element.classList.add('is-dragging');event.preventDefault();
  });
  element.addEventListener('pointermove',event=>{if(!drag)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;if(drag.resizing){state.width=Math.max(360,drag.width+dx);state.height=Math.max(260,drag.height+dy);}else{state.x=drag.left+dx;state.y=drag.top+dy;}fitWindow(state);});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])element.addEventListener(type,()=>{drag=null;element.classList.remove('is-dragging');});
  return state;
}
function openApp(id,options={}){
  if(!Object.hasOwn(renderers,id))return;
  if(phase!=='desktop')enterDesktop();
  let state=windows.get(id)||createAppWindow(id);state.closed=false;state.minimized=false;
  setLauncher(false);focusApp(id,{keyboard:true});
  if(options.hash!==false)navigateApp(id);
  if(id==='terminal')windowContent(id).querySelector('input')?.focus({preventScroll:true});
}
function nextWindow(){return [...windows.entries()].filter(([,s])=>!s.closed&&!s.minimized).sort((a,b)=>b[1].order-a[1].order)[0]?.[0]||'';}
function hideApp(id,closed=false){
  const state=windows.get(id);if(!state)return;
  state.closed=closed;state.minimized=!closed;
  if(activeApp===id)activeApp='';
  const next=window.innerWidth<1100?'':nextWindow();if(next)focusApp(next,{keyboard:true});else{$('#workspace').focus({preventScroll:true});syncDesktop();}
  navigateApp(activeApp,true);
  if(!next)($('#dock-apps').querySelector(`[data-dock-app="${id}"]`)||$('#launcher-toggle')).focus({preventScroll:true});
}
function closeApp(){hideApp(activeApp,true);}
function showDesktop(){
  setLauncher(false);
  const visible=[...windows.keys()].filter(id=>!windows.get(id).closed&&!windows.get(id).minimized);
  if(visible.length){desktopStash=visible;for(const id of visible)windows.get(id).minimized=true;activeApp='';}
  else if(desktopStash.length){for(const id of desktopStash){const state=windows.get(id);if(state&&!state.closed)state.minimized=false;}const next=nextWindow();if(next)focusApp(next);desktopStash=[];}
  syncDesktop();navigateApp(activeApp);$('#workspace').focus({preventScroll:true});
}
function arrangeWindow(id,action){
  const state=windows.get(id);if(!state)return;
  state.element.querySelector('details').open=false;
  if(action==='close'||action==='minimize'){hideApp(id,action==='close');return;}
  if(action==='resize')return;
  if(action==='maximize')state.maximized=!state.maximized;
  else{state.maximized=false;const area=$('#window-layer');if(action==='left'||action==='right'){state.width=(area.clientWidth-36)/2;state.height=area.clientHeight-24;state.x=action==='left'?12:24+state.width;state.y=12;}else{state.x=(area.clientWidth-state.width)/2;state.y=(area.clientHeight-state.height)/2;}fitWindow(state);}
  state.element.classList.toggle('is-maximized',state.maximized);
  state.element.querySelector('.maximize-control').setAttribute('aria-label',`${state.maximized?'Restore':'Maximize'} ${APP_META[id][0]}`);
}
function setLauncher(open){$('#launcher').hidden=!open;$('#launcher-toggle').setAttribute('aria-expanded',String(open));if(open)$('#launcher').querySelector('[data-app]')?.focus();}
window.layoutDesktop=()=>{for(const state of windows.values())fitWindow(state);syncDesktop();};
window.onDesktopReady=()=>{
  if(!desktopStarted){desktopStarted=true;if(!Object.hasOwn(renderers,location.hash.slice(1)))openApp('welcome',{hash:false});}
  window.layoutDesktop();
};
window.onDesktopSuspend=()=>setLauncher(false);
// The visual viewport shrinks when a touch keyboard is shown.
function syncViewportHeight(){
  const viewport=window.visualViewport;
  if(viewport&&viewport.scale===1)$('#desktop').style.setProperty('--os-height',`${viewport.height}px`);
  else $('#desktop').style.removeProperty('--os-height');
}
window.visualViewport?.addEventListener('resize',syncViewportHeight);
syncViewportHeight();
function executeCommand(raw){return window.HugoOS?HugoOS.execute(raw):executePortfolioCommand(raw);}
function executePortfolioCommand(raw){const input=raw.trim();if(!input)return;const cmd=input.toLowerCase();commandHistory.push(input);historyIndex=commandHistory.length;if(cmd==='clear'){terminalHistory=[];openApp('terminal');renderApp('#terminal-command','terminal');return;}
 terminalHistory.push({type:'command',text:`visitor@hugo:${window.HugoOS?.cwd||'/'}$ ${input}`});
 const output={help:'Available commands:\n  whoami        The engineer behind the system\n  about         Open profile\n  experience    Open the system timeline\n  projects      Explore the system archive\n  skills        Show the technology map\n  architecture  Inspect the system design\n  database      Open the database console\n  resume        Preview the profile summary\n  contact       Open contact details\n  clear         Clear the terminal\n\nTip: Ctrl/⌘ + K opens this terminal. Esc closes a window.',whoami:`${PROFILE.name}\n${PROFILE.role}`,skills:SKILLS.map(([name,items])=>`${name}\n  ${items.join(' · ')}`).join('\n\n'),experience:'10+ Years Software Engineering\n8+ Years Golang\n5+ Years Team Management\n\nOpening the illustrative system timeline…',contact:PROFILE.email?`Contact: ${PROFILE.email}`:'Contact information has not yet been supplied.\nOpening the contact panel…'};
 const navigation={about:'about',experience:'experience',projects:'projects',architecture:'architecture',database:'database',resume:'resume',contact:'contact'};
 const destination=Object.hasOwn(navigation,cmd)?navigation[cmd]:null;
 terminalHistory.push({type:'output',text:Object.hasOwn(output,cmd)?output[cmd]:(destination?`Opening ${cmd}…`:`Command not found: ${input}\nType “help” for available commands.`)});
 if(!windows.has('terminal'))openApp('terminal');
 renderApp(null,'terminal');
 const outputArea=windowContent('terminal');outputArea.scrollTop=outputArea.scrollHeight;
 if(destination)openApp(destination);else{openApp('terminal');$('#terminal-command')?.focus({preventScroll:true});}
}
function loadClassic(src){return new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=()=>reject(new Error(`Unable to load ${src}`));document.head.appendChild(script);});}
async function loadRoomManifest(signal){
  if(window.location?.protocol==='file:'){
    if(window.WorkspaceModelData?.version!==6)await loadClassic('assets/models/room-scene.js?v=20260915-tv-original-90-1');
    if(window.WorkspaceModelData?.version!==6)throw new Error('Offline room bundle is incompatible');
    return window.WorkspaceModelData;
  }
  const response=await fetch('assets/models/room-scene.json?v=20260915-tv-original-90-1',{signal});
  if(!response.ok)throw new Error(`Room manifest failed (${response.status})`);
  const data=await response.json();
  if(data?.version!==6)throw new Error('Room manifest is incompatible');
  return data;
}
function showSceneLoading(label='Preparing 3D workspace…',percent=0){
  const status=$('#scene-loading');
  status.hidden=false;$('#scene-loading-label').textContent=label;
  $('#scene-loading-progress').style.width=`${Math.max(0,Math.min(100,percent))}%`;
  $('#cinematic').setAttribute('aria-busy','true');
}
function hideSceneLoading(){
  $('#scene-loading').hidden=true;$('#cinematic').removeAttribute('aria-busy');
}
// One scroll position, one DOM surface — from the dark room to HUGO OS.
const OPENING = Object.freeze({
  reducedMotionRate: 4,
  power: 2.6, screen: 3.65, bios: 4.0, arrival: 10.4,
  clear: 13.15, ready: 13.35, desktop: 14.8,
  lines: [
    [4.5, 'Initializing hardware...'], [5.2, 'Loading kernel...'],
    [6.1, 'Starting network...'], [7.0, 'Connecting database...'],
    [8.0, 'Starting backend services...'], [9.0, 'Starting portfolio service...'],
    [10.7, 'Loading modules...'], [11.5, 'Mounting project archive...'],
    [12.4, 'System ready.'],
  ],
});
function stopOpening(){
  cancelAnimationFrame(openingFrame);openingFrame=0;
  sceneLoadController?.abort();sceneLoadController=null;hideSceneLoading();
  sceneCleanup?.();sceneCleanup=null;studio=null;
}
function renderBoot(time){
  const surface=$('#boot');
  const count=OPENING.lines.filter(([at])=>time>=at).length;
  const nextState=time>=OPENING.ready?'ready':time>=OPENING.clear?'clear':time>=OPENING.bios?'booting':'power';
  // Keep each row once created, including when scrolling backward or crossing
  // the monitor boundary. Visibility is a pure function of scroll progress.
  while($('#boot-lines').children.length<count){
    const i=$('#boot-lines').children.length,p=document.createElement('p');
    p.innerHTML='<span>[ OK ]</span>'+OPENING.lines[i][1];$('#boot-lines').append(p);
  }
  Array.from($('#boot-lines').children).forEach((row,i)=>row.classList.toggle('hidden',i>=count));
  $('#boot-log').style.visibility=time>=OPENING.bios&&time<OPENING.clear?'visible':'hidden';
  $('#boot-log').classList.toggle('hidden',time>=OPENING.ready);
  $('#boot-ready').classList.toggle('hidden',time<OPENING.ready);
  const percent=Math.round(Math.max(0,Math.min(1,(time-OPENING.bios)/(12.4-OPENING.bios)))*100);
  $('#boot-progress').style.width=percent+'%';$('#boot-percent').textContent=String(percent).padStart(2,'0')+'%';
  $('.bios-progress').setAttribute('aria-valuenow',String(percent));
  $('#boot-task').textContent=count?OPENING.lines[count-1][1].replace('...','').toUpperCase():'POWER ON SELF TEST';
  surface.dataset.bootState=nextState;surface.dataset.elapsed=time.toFixed(3);
}
let bootFitKey='';
function fitBootSurface(){
  const surface=$('#boot'),inner=$('.boot-inner');
  if(surface.classList.contains('hidden'))return;
  const key=`${window.innerWidth}:${window.innerHeight}:${surface.dataset.bootState}`;
  if(key===bootFitKey)return;
  // Layout is fixed for this viewport. Only the 3D camera scales it during
  // the approach; measuring every projected frame would add a second zoom.
  const scale=Math.min(1,Math.max(1,window.innerHeight-64)/Math.max(1,inner.offsetHeight));
  inner.style.transform=`scale(${scale})`;
  bootFitKey=key;
}
function projectBoot(projection){
  $('#boot').style.transform=projection.transform;
  $('#boot').dataset.presentation='monitor';
}
function releaseMonitor(){
  // Lightweight and reduced-motion fallbacks reuse the same boot surface.
  // Normal scroll-driven handoffs retain the scene for reverse scrolling.
  $('#boot').style.transform='none';$('#boot').dataset.presentation='fullscreen';
  fitBootSurface();
  $('#cinematic').classList.add('hidden');
  const scrollFocused=document.activeElement===$('#intro-scroll')||document.activeElement===$('#scroll-cue');
  $('#intro-scroll').classList.add('hidden');$('#scroll-cue').classList.add('hidden');
  if(scrollFocused)$('#skip-intro').focus({preventScroll:true});
  sceneCleanup?.();sceneCleanup=null;studio=null;
  $('#scene-host').replaceChildren();phase='boot';
}
function enableIntroScroll(){
  $('#intro-scroll').classList.remove('hidden');
  $('#scroll-cue').classList.remove('hidden');
  $('#intro-scroll').focus({preventScroll:true});
}
function tickOpening(timestamp){
  if(!opening||phase==='desktop')return;
  if(document.hidden){opening.last=0;openingFrame=requestAnimationFrame(tickOpening);return;}
  const dt=opening.last?Math.min((timestamp-opening.last)/1000,.1):0;
  opening.last=timestamp;
  if(opening.interactive){
    const scroller=$('#intro-scroll');
    const distance=Math.max(1,scroller.scrollHeight-scroller.clientHeight);
    const progress=distance-scroller.scrollTop<=1?1:Math.max(0,Math.min(1,scroller.scrollTop/distance));
    opening.progress=progress;
    // No elapsed-time advance, speed cap, catch-up or automatic reveal.
    // Every frame is determined directly by the current native scroll offset.
    opening.time=opening.start+progress*(OPENING.desktop-opening.start);
  }else opening.time+=dt*opening.speed;
  const time=opening.time;
  const cameraTime=Math.min(time,OPENING.arrival);
  $('#boot').classList.toggle('hidden',time<OPENING.screen);
  renderBoot(time);
  fitBootSurface();
  if(dt>.058&&++opening.slowFrames>32)studio?.reduceQuality();
  if(studio){
    if(time<OPENING.arrival){
      // Restore layout before reading scene dimensions on a fullscreen rewind.
      $('#cinematic').classList.remove('hidden');
      const projection=studio.render(cameraTime,time);
      $('#scene-host').classList.add('scene-loaded');
      if(projection)projectBoot(projection);
      phase='intro';
    }else{
      // Keep the scene available for reverse scrolling. The identity projection
      // and the fullscreen HTML surface are the same screen at this boundary.
      $('#boot').style.transform='none';$('#boot').dataset.presentation='fullscreen';
      $('#cinematic').classList.add('hidden');phase='boot';
    }
    // Optical background softness: the composited monitor remains perfectly sharp.
    $('#scene-host').style.filter=`blur(${(Math.max(0,Math.min(1,(cameraTime-4)/5))*1.25).toFixed(2)}px)`;
  }
  const copyFade=Math.max(0,Math.min(1,(cameraTime-2.2)/.7));
  $('#intro-copy').style.opacity=String(1-copyFade);
  $('#intro-copy').style.transform=`translateY(${-15*copyFade}px)`;
  const cueFade=Math.max(0,Math.min(1,(cameraTime-1.2)/.8));
  $('#scroll-cue').style.opacity=String((1-cueFade)*.82);
  $('#boot').dataset.cameraElapsed=cameraTime.toFixed(3);
  if(time>=OPENING.desktop){enterDesktop();return;}
  openingFrame=requestAnimationFrame(tickOpening);
}
let isAutoPlaying=false;
function autoEnterDesktop(){
  if(!opening||phase==='desktop'){enterDesktop();return;}
  if(isAutoPlaying){enterDesktop();return;}
  isAutoPlaying=true;
  opening.interactive=false;
  opening.speed=8.5;
  $('#scroll-cue').classList.add('hidden');
  const skipBtn=$('#skip-intro');
  if(skipBtn)skipBtn.innerHTML='Entering... <span aria-hidden="true">→</span>';
}
function beginClock({simple=false,instant=false}={}){
  // Fallbacks enter the SAME timeline at the screen stage, never a second boot.
  const start=instant?OPENING.ready:simple?OPENING.bios:0;
  opening={time:start,start,progress:0,interactive:!instant,last:0,speed:OPENING.reducedMotionRate,slowFrames:0};
  if(simple||instant){releaseMonitor();$('#boot').classList.remove('hidden');}
  if(!instant){
    enableIntroScroll();$('#intro-scroll').scrollTop=0;
  }
  openingFrame=requestAnimationFrame(tickOpening);
}
async function startIntro(){
  isAutoPlaying=false;
  window.onDesktopSuspend?.();stopOpening();opening=null;bootFitKey='';introRun++;const run=introRun;phase='intro';
  document.body.classList.add('intro-active');window.scrollTo(0,0);
  $('#desktop').inert=true;$('#desktop').setAttribute('aria-hidden','true');$('#desktop').classList.remove('entering');
  $('#boot').classList.add('hidden');$('#boot').style.transform='none';$('#boot').dataset.presentation='off';
  $('#boot-log').classList.remove('hidden');$('#boot-log').style.visibility='hidden';
  $('#boot-ready').classList.add('hidden');$('#boot-lines').replaceChildren();
  $('#intro-controls').classList.remove('hidden');$('#intro-scroll').classList.add('hidden');$('#scroll-cue').classList.add('hidden');
  $('#scroll-cue').style.opacity='.82';
  $('#skip-intro').innerHTML='Skip intro <span aria-hidden="true">↗</span>';
  $('#intro-copy').style.opacity='1';$('#intro-copy').style.transform='none';
  $('#cinematic').classList.remove('hidden','screen-focus');$('#intro-copy').classList.remove('fade');
  $('#scene-host').classList.remove('scene-loaded');$('#scene-host').replaceChildren();$('#scene-host').style.filter='none';
  const simple=(navigator.deviceMemory&&navigator.deviceMemory<=2)||navigator.connection?.saveData;
  if(reducedMotion.matches||window.HugoOS?.settings.reduceMotion){beginClock({instant:true});return;}
  if(simple){beginClock({simple:true});return;}
  try{
    showSceneLoading();
    if(!window.THREE)await loadClassic('assets/vendor/three.min.js');
    if(run!==introRun||phase!=='intro')return;
    // HTTP uses cacheable binary assets; file:// uses a self-contained bundle
    // because browsers block fetches for sibling local files.
    sceneLoadController=new AbortController();
    window.WorkspaceModelData=await loadRoomManifest(sceneLoadController.signal);
    if(run!==introRun||phase!=='intro')return;
    if(!window.createWorkspaceScene)await loadClassic('scene.js?v=20260915-tv-no-laptop-1');
    if(run!==introRun||phase!=='intro')return;
    const createdScene=await window.createWorkspaceScene($('#scene-host'),{arrival:OPENING.arrival,signal:sceneLoadController.signal,onProgress({stage,loaded,total}){
      if(run!==introRun||phase!=='intro')return;
      const percent=stage==='geometry'&&total?5+loaded/total*75:stage==='textures'&&total?80+loaded/total*20:stage==='ready'?100:5;
      const label=stage==='textures'?`Decoding textures ${loaded}/${total}…`:stage==='ready'?'3D workspace ready':`Loading 3D workspace ${Math.round(percent)}%…`;
      showSceneLoading(label,percent);
    },onFailure(){
      if(run!==introRun||phase==='desktop')return;
      // Preserve already-displayed progress if the graphics context is lost.
      const time=Math.max(opening?.time||0,OPENING.bios);
      releaseMonitor();
      if(opening){
        opening.start=OPENING.bios;opening.time=time;
        opening.progress=(time-OPENING.bios)/(OPENING.desktop-OPENING.bios);
        enableIntroScroll();
        const scroller=$('#intro-scroll');
        scroller.scrollTop=opening.progress*(scroller.scrollHeight-scroller.clientHeight);
      }
    }});
    if(run!==introRun||phase!=='intro'){createdScene?.dispose?.();return;}
    sceneLoadController=null;hideSceneLoading();
    studio=createdScene;
    if(studio?.dispose){sceneCleanup=()=>studio?.dispose();beginClock();}
    else{studio=null;beginClock({simple:true});}
  }catch(error){
    if(run!==introRun||phase==='desktop')return;
    sceneLoadController=null;hideSceneLoading();
    console.info('Using lightweight startup:',error.message);beginClock({simple:true});
  }
}
function enterDesktop(){
  isAutoPlaying=false;
  document.body.classList.remove('intro-active');phase='desktop';introRun++;
  stopOpening();opening=null;
  $('#scene-host').replaceChildren();$('#cinematic').classList.add('hidden');$('#boot').classList.add('hidden');
  $('#intro-scroll').classList.add('hidden');$('#intro-controls').classList.add('hidden');
  $('#desktop').inert=false;$('#desktop').removeAttribute('aria-hidden');$('#desktop').classList.add('entering');
  $('#workspace').focus({preventScroll:true});window.scrollTo(0,0);
  window.onDesktopReady?.();
}
window.HugoOS?.init();
$('#app-nav').innerHTML=Object.entries(APP_META).filter(([id])=>id!=='welcome').map(([id,[label,ico]])=>`<button data-app="${id}">${icon(ico)}<span>${label}</span></button>`).join('');
hydrateIcons();syncDesktop();
function updateClock(){$('#clock').textContent=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Taipei',hour:'2-digit',minute:'2-digit',hour12:window.HugoOS?.settings.hour12||false,...(window.HugoOS?.settings.seconds?{second:'2-digit'}:{})}).format(new Date());}
updateClock();setInterval(updateClock,1000);
document.addEventListener('click',event=>{
 const button=event.target.closest('button,a');
 if(!event.target.closest('#launcher,#launcher-toggle'))setLauncher(false);
 if(!button)return;
 const owner=button.closest('[data-window]')?.dataset.window;
 if(owner)focusApp(owner);
 if(button.dataset.windowAction){arrangeWindow(owner,button.dataset.windowAction);return;}
 if(button.dataset.dockApp){const id=button.dataset.dockApp;activeApp===id?hideApp(id):openApp(id);return;}
 if(button.dataset.app){openApp(button.dataset.app);return;}
 if(button.dataset.action==='home'){showDesktop();return;}
 if(button.dataset.action==='launcher'){setLauncher($('#launcher').hidden);return;}
 if(button.dataset.action==='launcher-close'){setLauncher(false);$('#launcher-toggle').focus();return;}
 if(button.dataset.projectFilter){projectFilter=button.dataset.projectFilter;const valid=projectFilter==='all'||(projectFilter==='backend'?selectedProject<4:selectedProject===4);if(!valid)selectedProject=projectFilter==='portfolio'?4:0;renderApp(`[data-project-filter="${projectFilter}"]`,'projects');return;}
 if(button.dataset.selectProject!==undefined){selectedProject=Number(button.dataset.selectProject);renderApp(`[data-select-project="${selectedProject}"]`,'projects');return;}
 if(button.dataset.openProject!==undefined){selectedProject=Number(button.dataset.openProject);projectDetail=true;renderApp('[data-project-back]','projects');windowContent('projects').scrollTop=0;return;}
 if(button.hasAttribute('data-project-back')){projectDetail=false;renderApp(`[data-select-project="${selectedProject}"]`,'projects');return;}
 if(button.dataset.selectNode){selectedNode=button.dataset.selectNode;renderApp(`[data-select-node="${selectedNode}"]`,'architecture');return;}
 if(button.dataset.topic){selectedTopic=button.dataset.topic;renderApp(`[data-topic="${selectedTopic}"]`,'database');return;}
 if(button.dataset.year){selectedYear=button.dataset.year;renderApp(`[data-year="${selectedYear}"]`,'experience');return;}
 if(button.dataset.command){executeCommand(button.dataset.command);return;}
 if(button.dataset.social){const url=safeUrl(PROFILE[button.dataset.social]);if(url)window.open(url,'_blank','noopener,noreferrer');else openApp('contact');}
});
document.addEventListener('submit',event=>{if(event.target.id==='terminal-form'){event.preventDefault();const input=event.target.querySelector('input'),value=input.value;input.value='';executeCommand(value);}});
document.addEventListener('keydown',event=>{
 if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();openApp('terminal');}
 if(event.key==='Escape'&&phase==='desktop'){
   if(!$('#launcher').hidden){setLauncher(false);$('#launcher-toggle').focus();}
   else{const menu=windows.get(activeApp)?.element.querySelector('details[open]');if(menu){menu.open=false;menu.querySelector('summary').focus();}else closeApp();}event.preventDefault();
 }
 if(event.target.id==='terminal-command' && ['ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();historyIndex=Math.max(0,Math.min(commandHistory.length,historyIndex+(event.key==='ArrowUp'?-1:1)));event.target.value=commandHistory[historyIndex]||'';}
 if(event.target.matches('[data-year]')&&['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();const years=Object.keys(YEARS);let index=years.indexOf(selectedYear);index=event.key==='Home'?0:event.key==='End'?years.length-1:(index+(event.key==='ArrowRight'?1:-1)+years.length)%years.length;selectedYear=years[index];renderApp(`[data-year="${selectedYear}"]`,'experience');}
 if(event.target.matches('.window-resize')&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();const state=windows.get(event.target.closest('[data-window]').dataset.window);state.width=Math.max(360,state.width+(event.key==='ArrowRight'?24:event.key==='ArrowLeft'?-24:0));state.height=Math.max(260,state.height+(event.key==='ArrowDown'?24:event.key==='ArrowUp'?-24:0));fitWindow(state);}
});
$('#skip-intro').addEventListener('click',autoEnterDesktop);
$('#replay-intro').addEventListener('click',startIntro);
window.addEventListener('resize',()=>{
  if(opening?.interactive){
    const scroller=$('#intro-scroll');
    scroller.scrollTop=opening.progress*(scroller.scrollHeight-scroller.clientHeight);
  }
  window.layoutDesktop?.();
});
window.addEventListener('hashchange',()=>{
 const id=location.hash.slice(1);
 if(Object.hasOwn(renderers,id))openApp(id,{hash:false});
 else{for(const state of windows.values())if(!state.closed)state.minimized=true;activeApp='';syncDesktop();$('#workspace').focus({preventScroll:true});}
});
reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches&&phase!=='desktop')enterDesktop();});
$('.skip-link').addEventListener('click',event=>{event.preventDefault();enterDesktop();});
const initialApp=location.hash.slice(1);
if(Object.hasOwn(renderers,initialApp)){enterDesktop();openApp(initialApp,{hash:false});}else if(window.HugoOS?.settings.skipIntro)enterDesktop();else startIntro();
