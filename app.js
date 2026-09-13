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
let sceneCleanup = null, introRun = 0, phase = 'intro';
let openingFrame = 0, opening = null, studio = null;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const dialog = $('#app-dialog');
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
function renderProjects(){const p=PROJECTS[selectedProject];return title('03 / SYSTEM ARCHIVE','Problems worth solving.','Explore the decisions underneath the interface: the problem, the tradeoffs, and the path to a reliable system.')+`<div class="archive-controls"><span class="mono">${String(selectedProject+1).padStart(2,'0')} / 05 SYSTEMS</span><button class="round-button" data-archive-step="-1" aria-label="Previous project" ${selectedProject===0?'disabled':''}>←</button><button class="round-button" data-archive-step="1" aria-label="Next project" ${selectedProject===4?'disabled':''}>→</button></div><div class="archive-scroll" aria-label="Project selector">${PROJECTS.map((project,i)=>`<button class="archive-card ${i===selectedProject?'active':''}" aria-pressed="${i===selectedProject}" data-select-project="${i}"><span class="mono">${String(i+1).padStart(2,'0')} <span aria-hidden="true">↗</span></span><strong>${project.short}</strong><span class="tiny-label">${i===4?'THIS PORTFOLIO':'CONCEPT CASE STUDY'}</span></button>`).join('')}</div><article class="project-detail"><span class="detail-label">${selectedProject===4?'IMPLEMENTED PROJECT':'REFERENCE DESIGN / NOT A VERIFIED CLIENT PROJECT'}</span><h3>${p.title}</h3>${tags(p.stack)}<div class="case-grid">${[['Problem',p.problem],['Architecture',p.architecture],['Role',p.role],['Challenges',p.challenges],['Solution',p.solution],['Result',p.result]].map(([label,value])=>`<div><span class="detail-label">${label.toUpperCase()}</span><p>${value}</p></div>`).join('')}</div></article>`;}
function renderArchitecture(){const node=NODES[selectedNode];return title('04 / SYSTEM DESIGN','Every connection has a purpose.','A reference backend architecture. Select a component to inspect its responsibility and tradeoffs.')+`<div class="architecture-full"><div class="architecture-chain" aria-label="Architecture components">${Object.entries(NODES).map(([id,n],i)=>`${i?'<span aria-hidden="true">↓</span>':''}<button data-select-node="${id}" class="${id===selectedNode?'active':''}" aria-pressed="${id===selectedNode}">${icon(n.icon)} ${n.label}</button>`).join('')}</div><article class="architecture-note"><span class="eyebrow">COMPONENT ${node.number} / 06</span><h3>${node.label}</h3><p>${node.description}</p>${tags(node.tags)}<p class="content-note">This is a conceptual map, not a literal request sequence. Services read and write MySQL; the outbox publishes to RabbitMQ; workers consume jobs and write results. Redis is an optional cache.</p></article></div>`;}
function renderDatabase(){const topic=DB_TOPICS[selectedTopic];return title('05 / DATABASE CONSOLE','Correctness comes first.','Inside MySQL: data models, query plans, concurrency, and the decisions that make a database dependable.')+`<div class="db-layout"><nav class="db-nav" aria-label="Database topics">${Object.keys(DB_TOPICS).map(key=>`<button data-topic="${key}" class="${key===selectedTopic?'active':''}" aria-pressed="${key===selectedTopic}">${key}</button>`).join('')}</nav><article class="db-detail"><span class="detail-label">MYSQL / ${selectedTopic.toUpperCase()}</span><h3>${topic.title}</h3><p>${topic.text}</p><pre><code>${escapeHTML(topic.code)}</code></pre><span class="tiny-label muted">REFERENCE SQL · READ-ONLY EXAMPLES</span>${selectedTopic==='Index'?'<table class="schema-table"><caption class="detail-label">TRANSACTIONS / EXAMPLE SCHEMA</caption><thead><tr><th>COLUMN</th><th>TYPE</th><th>KEY</th></tr></thead><tbody><tr><td>id</td><td>BIGINT</td><td>PRIMARY</td></tr><tr><td>user_id</td><td>BIGINT</td><td>INDEX</td></tr><tr><td>status</td><td>VARCHAR(20)</td><td>INDEX</td></tr><tr><td>created_at</td><td>DATETIME</td><td>INDEX</td></tr></tbody></table>':''}</article></div>`;}
function renderSkills(){return title('07 / TECHNOLOGY MAP','The tools follow the problem.','A connected toolkit for building software and leading engineering teams. No arbitrary scores — just areas of practice.')+`<div class="skills-map">${SKILLS.map(([name,items,description],i)=>`<section class="skill-cluster"><span class="detail-label">${name}<span>${String(i+1).padStart(2,'0')}</span></span>${tags(items)}<p>${description}</p></section>`).join('')}</div>`;}
function renderTerminal(){return `<div class="full-terminal"><div class="terminal-output" role="log" aria-label="Terminal output"><p>HUGO OS [Version 1.0.0]<br>Portfolio shell. No real commands are executed.<br>Type “help” to explore. ↑ / ↓ for command history.</p>${terminalHistory.map(line=>`<p class="${line.type==='command'?'command-echo':''}">${escapeHTML(line.text)}</p>`).join('')}</div><form id="terminal-form" class="terminal-input-line"><label for="terminal-command" class="prompt-user">visitor@hugo<span class="muted">:~$</span></label><input id="terminal-command" aria-label="Terminal command" autocomplete="off" autocapitalize="off" spellcheck="false"><button aria-label="Run terminal command">${icon('arrow')}</button></form><div class="terminal-completions">${['help','whoami','skills','projects','architecture','contact','clear'].map(cmd=>`<button data-command="${cmd}">${cmd}</button>`).join('')}</div></div>`;}
function renderResume(){return title('08 / RESUME.PDF','The human-readable version.','A concise profile summary, available to preview here and download as a PDF.')+`<div class="resume-actions"><a class="primary-button" href="assets/hugo-profile-summary.pdf" download="Hugo-Profile-Summary.pdf">DOWNLOAD SUMMARY PDF ${icon('download')}</a><a href="assets/hugo-profile-summary.pdf" target="_blank" rel="noopener">Open PDF preview ↗</a></div><article class="resume-paper"><span class="eyebrow">PROFILE SUMMARY / DRAFT</span><h3>HUGO</h3><p>Backend Engineer / Engineering Manager</p><h4>PROFILE</h4><p>Software engineer and engineering manager with a focus on backend systems, Golang, databases, and team leadership.</p><div class="resume-metrics">10+ years in software development<br>8+ years with Golang<br>5+ years in team management</div><h4>CORE TECHNOLOGIES</h4><p>Golang · MySQL · MongoDB · Redis · RabbitMQ · Docker · Kubernetes · GCP · REST · gRPC</p><h4>ENGINEERING & LEADERSHIP</h4><p>System Design · Performance · Concurrency · Distributed Systems · Team Management · Technical Planning · Code Review · Project Planning · Cross-team Communication</p><h4>EXPERIENCE & CONTACT</h4><p>Company names, employment dates, verified project outcomes, education, and contact details have not yet been supplied.</p></article><p class="content-note">This downloadable summary includes only supplied profile details. Replace it with your complete résumé when it is ready.</p>`;}
function safeUrl(url){try{const parsed=new URL(url);return ['https:','http:'].includes(parsed.protocol)?parsed.href:'';}catch{return '';}}
function renderContact(){return title('09 / OPEN A CONNECTION','Let’s build something reliable.','For engineering conversations, technical leadership, and systems that deserve thoughtful design.')+`<div class="contact-links">${[['Email',PROFILE.email,'mail'],['GitHub',PROFILE.github,'globe'],['LinkedIn',PROFILE.linkedin,'network']].map(([label,value,ico])=>{const link=label==='Email'&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)?'mailto:'+encodeURIComponent(value):safeUrl(value);return link?`<a href="${escapeHTML(link)}" ${label!=='Email'?'target="_blank" rel="noopener noreferrer"':''}><span class="contact-label">${label}</span><span class="contact-value">${escapeHTML(value)}</span>${icon('arrow')}</a>`:`<div><span class="contact-label">${label}</span><span class="contact-value">Contact details coming soon</span>${icon(ico)}</div>`;}).join('')}</div><p class="content-note">Hugo’s public contact links haven’t been supplied yet. No placeholder addresses or unrelated profiles are linked.</p>`;}
const renderers={about:renderAbout,experience:renderExperience,projects:renderProjects,architecture:renderArchitecture,database:renderDatabase,terminal:renderTerminal,skills:renderSkills,resume:renderResume,contact:renderContact};
function renderApp(focusSelector){$('#app-content').innerHTML=renderers[activeApp]();hydrateIcons($('#app-content'));if(focusSelector) $('#app-content').querySelector(focusSelector)?.focus({preventScroll:true});}
function openApp(id,options={}){
  if(!Object.hasOwn(renderers,id))return;
  if(phase!=='desktop')enterDesktop();
  const wasOpen=dialog.open;
  activeApp=id;
  const app=APPS.find(a=>a[0]===id)||['contact','CONTACT','mail','exe'];
  $('#dialog-app-name').innerHTML=icon(app[2])+`${app[1]}.${app[3]}`;
  $('#app-path').textContent=`hugo / applications / ${id}`;
  renderApp();
  document.querySelectorAll('.app-nav button').forEach(b=>b.classList.toggle('active',b.dataset.app===id));
  if(!wasOpen){dialog.style.transform='';dialog.classList.remove('maximized');dialog.showModal();}
  $('#app-content').scrollTop=0;
  if(options.hash!==false && location.hash!==`#${id}`) history.replaceState(null,'',`#${id}`);
  if(id==='terminal'){requestAnimationFrame(()=>{$('#terminal-command')?.focus();$('#terminal-command')?.scrollIntoView({block:'nearest'});});}
}
function closeApp(){if(dialog.open)dialog.close();activeApp='';document.querySelectorAll('.app-nav button').forEach(b=>b.classList.remove('active'));if(location.hash)history.replaceState(null,'',location.pathname+location.search);}
function executeCommand(raw){const input=raw.trim();if(!input)return;const cmd=input.toLowerCase();commandHistory.push(input);historyIndex=commandHistory.length;if(cmd==='clear'){terminalHistory=[];if(activeApp!=='terminal')openApp('terminal');else renderApp('#terminal-command');return;}
 terminalHistory.push({type:'command',text:`visitor@hugo:~$ ${input}`});
 const output={help:'Available commands:\n  whoami        The engineer behind the system\n  about         Open profile\n  experience    Open the system timeline\n  projects      Explore the system archive\n  skills        Show the technology map\n  architecture  Inspect the system design\n  database      Open the database console\n  resume        Preview the profile summary\n  contact       Open contact details\n  clear         Clear the terminal\n\nTip: Ctrl/⌘ + K opens this terminal. Esc closes a window.',whoami:`${PROFILE.name}\n${PROFILE.role}`,skills:SKILLS.map(([name,items])=>`${name}\n  ${items.join(' · ')}`).join('\n\n'),experience:'10+ Years Software Engineering\n8+ Years Golang\n5+ Years Team Management\n\nOpening the illustrative system timeline…',contact:PROFILE.email?`Contact: ${PROFILE.email}`:'Contact information has not yet been supplied.\nOpening the contact panel…'};
 const navigation={about:'about',experience:'experience',projects:'projects',architecture:'architecture',database:'database',resume:'resume',contact:'contact'};
 const destination=Object.hasOwn(navigation,cmd)?navigation[cmd]:null;
 terminalHistory.push({type:'output',text:Object.hasOwn(output,cmd)?output[cmd]:(destination?`Opening ${cmd}…`:`Command not found: ${input}\nType “help” for available commands.`)});
 if(destination)openApp(destination);else if(activeApp==='terminal')renderApp('#terminal-command');else openApp('terminal');
 $('#terminal-command')?.scrollIntoView({block:'nearest'});
}
function loadClassic(src){return new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=()=>reject(new Error(`Unable to load ${src}`));document.head.appendChild(script);});}
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
  $('#intro-progress').style.width=Math.min(100,time/OPENING.desktop*100)+'%';
  const copyFade=Math.max(0,Math.min(1,(cameraTime-2.2)/.7));
  $('#intro-copy').style.opacity=String(1-copyFade);
  $('#intro-copy').style.transform=`translateY(${-15*copyFade}px)`;
  $('#cinematic').style.setProperty('--chrome-opacity',String(1-Math.max(0,Math.min(1,(cameraTime-7.3)/1))));
  const cue=time>=OPENING.ready?'Scroll to desktop':!studio?'Scroll to boot':time<3?'Scroll to enter':time<7.3?'Move closer':time<OPENING.arrival?'Keep scrolling':'Scroll to boot';
  $('#scroll-cue strong').textContent=cue;
  $('#scroll-cue').setAttribute('aria-label',cue);
  $('#boot').dataset.cameraElapsed=cameraTime.toFixed(3);
  $('#scene-caption').textContent=time<2.6?'01 / EXPLORE THE WORKSPACE':time<4?'02 / DISPLAY WAKING':'03 / BOOTING THE WORKSPACE';
  if(time>=OPENING.desktop){enterDesktop();return;}
  openingFrame=requestAnimationFrame(tickOpening);
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
  closeApp();stopOpening();opening=null;bootFitKey='';introRun++;const run=introRun;phase='intro';
  document.body.classList.add('intro-active');window.scrollTo(0,0);
  $('#desktop').inert=true;$('#desktop').setAttribute('aria-hidden','true');$('#desktop').classList.remove('entering');
  $('#boot').classList.add('hidden');$('#boot').style.transform='none';$('#boot').dataset.presentation='off';
  $('#boot-log').classList.remove('hidden');$('#boot-log').style.visibility='hidden';
  $('#boot-ready').classList.add('hidden');$('#boot-lines').replaceChildren();
  $('#intro-controls').classList.remove('hidden');$('#intro-scroll').classList.add('hidden');$('#scroll-cue').classList.add('hidden');
  $('#cinematic').style.setProperty('--chrome-opacity','1');
  $('#intro-copy').style.opacity='1';$('#intro-copy').style.transform='none';
  $('#scroll-cue strong').textContent='Scroll to enter';
  $('#cinematic').classList.remove('hidden','screen-focus');$('#intro-copy').classList.remove('fade');
  $('#scene-host').replaceChildren();$('#scene-host').style.filter='none';$('#intro-progress').style.width='0%';
  const simple=(navigator.deviceMemory&&navigator.deviceMemory<=2)||navigator.connection?.saveData;
  if(reducedMotion.matches){beginClock({instant:true});return;}
  if(simple){beginClock({simple:true});return;}
  try{
    if(!window.THREE)await loadClassic('assets/vendor/three.min.js');
    if(run!==introRun||phase!=='intro')return;
    if(!window.createWorkspaceScene)await loadClassic('scene.js?v=20260913-7');
    if(run!==introRun||phase!=='intro')return;
    studio=window.createWorkspaceScene($('#scene-host'),{arrival:OPENING.arrival,onFailure(){
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
    if(studio?.dispose){sceneCleanup=()=>studio?.dispose();beginClock();}
    else{studio=null;beginClock({simple:true});}
  }catch(error){
    if(run!==introRun||phase==='desktop')return;
    console.info('Using lightweight startup:',error.message);beginClock({simple:true});
  }
}
function enterDesktop(){
  document.body.classList.remove('intro-active');phase='desktop';introRun++;
  stopOpening();opening=null;
  $('#scene-host').replaceChildren();$('#cinematic').classList.add('hidden');$('#boot').classList.add('hidden');
  $('#intro-scroll').classList.add('hidden');$('#intro-controls').classList.add('hidden');
  $('#desktop').inert=false;$('#desktop').removeAttribute('aria-hidden');$('#desktop').classList.add('entering');
  $('#workspace').focus({preventScroll:true});window.scrollTo(0,0);
}
$('#app-nav').innerHTML=APPS.map(([id,label,ico,extension],i)=>`<button data-app="${id}" aria-label="Open ${label}" title="${label}.${extension}">${icon(ico)}<span class="nav-label">${label}<span class="extension">.${extension}</span></span><span class="nav-num">${String(i+1).padStart(2,'0')}</span></button>`).join('');
hydrateIcons();
function updateClock(){$('#clock').textContent=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Taipei',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date());}
updateClock();setInterval(updateClock,30000);
document.addEventListener('click',event=>{const button=event.target.closest('button,a');if(!button)return;
 if(button.dataset.app){openApp(button.dataset.app);return;}
 if(button.dataset.project!==undefined){selectedProject=Number(button.dataset.project);openApp('projects');return;}
 if(button.dataset.node){selectedNode=button.dataset.node;openApp('architecture');return;}
 if(button.dataset.selectNode){selectedNode=button.dataset.selectNode;renderApp(`[data-select-node="${selectedNode}"]`);return;}
 if(button.dataset.topic){selectedTopic=button.dataset.topic;renderApp(`[data-topic="${selectedTopic}"]`);return;}
 if(button.dataset.year){selectedYear=button.dataset.year;renderApp(`[data-year="${selectedYear}"]`);return;}
 if(button.dataset.selectProject!==undefined || button.dataset.archiveStep){selectedProject=button.dataset.selectProject!==undefined?Number(button.dataset.selectProject):Math.max(0,Math.min(4,selectedProject+Number(button.dataset.archiveStep)));const scroll=$('#app-content').scrollTop;renderApp(`[data-select-project="${selectedProject}"]`);$('#app-content').scrollTop=scroll;$('.archive-card.active')?.scrollIntoView({block:'nearest',inline:'nearest',behavior:reducedMotion.matches?'instant':'smooth'});return;}
 if(button.dataset.command){executeCommand(button.dataset.command);return;}
 if(button.dataset.social){const url=safeUrl(PROFILE[button.dataset.social]);if(url)window.open(url,'_blank','noopener,noreferrer');else{openApp('contact');toast(`${button.dataset.social==='github'?'GitHub':'LinkedIn'} profile hasn’t been added yet.`);}return;}
 if(button.dataset.action==='home'){closeApp();$('#workspace').focus();window.scrollTo({top:0,behavior:reducedMotion.matches?'instant':'smooth'});}
});
document.addEventListener('submit',event=>{if(event.target.id==='quick-terminal'||event.target.id==='terminal-form'){event.preventDefault();const input=event.target.querySelector('input');executeCommand(input.value);input.value='';}});
document.addEventListener('keydown',event=>{
 if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();openApp('terminal');}
 if(event.target.id==='terminal-command' && ['ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();historyIndex=Math.max(0,Math.min(commandHistory.length,historyIndex+(event.key==='ArrowUp'?-1:1)));event.target.value=commandHistory[historyIndex]||'';}
 if(event.target.matches('[data-year]')&&['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();const years=Object.keys(YEARS);let index=years.indexOf(selectedYear);index=event.key==='Home'?0:event.key==='End'?years.length-1:(index+(event.key==='ArrowRight'?1:-1)+years.length)%years.length;selectedYear=years[index];renderApp(`[data-year="${selectedYear}"]`);}
});
$('#skip-intro').addEventListener('click',enterDesktop);
$('#scroll-cue').addEventListener('click',()=>{
  const scroller=$('#intro-scroll');
  scroller.scrollBy({top:scroller.clientHeight*.35,behavior:'instant'});
  scroller.focus({preventScroll:true});
});
$('#replay-intro').addEventListener('click',startIntro);
$('#close-window').addEventListener('click',closeApp);
$('#minimize-window').addEventListener('click',()=>{const name=activeApp;closeApp();toast(`${name.toUpperCase()} minimized. Reopen it from Explorer.`);});
$('#maximize-window').addEventListener('click',()=>{dialog.classList.toggle('maximized');$('#maximize-window').setAttribute('aria-label',dialog.classList.contains('maximized')?'Restore window':'Maximize window');});
dialog.addEventListener('cancel',event=>{event.preventDefault();closeApp();});
// Desktop dragging: bounded, pointer-based, with maximize and close available to keyboard users.
let drag=null;
$('#dialog-titlebar').addEventListener('pointerdown',event=>{if(event.target.closest('button')||window.innerWidth<800||dialog.classList.contains('maximized'))return;const bounds=dialog.getBoundingClientRect();drag={x:event.clientX,y:event.clientY,left:bounds.left,top:bounds.top,dx:Number(dialog.dataset.dx||0),dy:Number(dialog.dataset.dy||0),width:bounds.width,height:bounds.height};event.currentTarget.setPointerCapture(event.pointerId);});
$('#dialog-titlebar').addEventListener('pointermove',event=>{if(!drag)return;const deltaX=Math.max(-drag.left+8,Math.min(innerWidth-drag.left-drag.width-8,event.clientX-drag.x));const deltaY=Math.max(-drag.top+8,Math.min(innerHeight-drag.top-drag.height-8,event.clientY-drag.y));dialog.dataset.dx=drag.dx+deltaX;dialog.dataset.dy=drag.dy+deltaY;dialog.style.transform=`translate(${dialog.dataset.dx}px,${dialog.dataset.dy}px)`;});
$('#dialog-titlebar').addEventListener('pointerup',()=>{drag=null;});
$('#dialog-titlebar').addEventListener('lostpointercapture',()=>{drag=null;});
dialog.addEventListener('close',()=>{dialog.dataset.dx='0';dialog.dataset.dy='0';});
window.addEventListener('resize',()=>{
  if(opening?.interactive){
    const scroller=$('#intro-scroll');
    // Orientation changes resize the scroll track. Preserve its percentage so
    // rotating a phone cannot jump forward or accidentally finish the intro.
    scroller.scrollTop=opening.progress*(scroller.scrollHeight-scroller.clientHeight);
  }
  if(dialog.open){dialog.style.transform='';dialog.dataset.dx='0';dialog.dataset.dy='0';}
});
window.addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(Object.hasOwn(renderers,id))openApp(id,{hash:false});else closeApp();});
reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches&&phase!=='desktop')enterDesktop();});
$('.skip-link').addEventListener('click',event=>{event.preventDefault();enterDesktop();});
const initialApp=location.hash.slice(1);
if(Object.hasOwn(renderers,initialApp)){enterDesktop();openApp(initialApp,{hash:false});}else startIntro();
