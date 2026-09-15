/* HUGO OS services and applications. Classic script; no build step. */
'use strict';
window.HugoOS = (() => {
  const KEY = 'hugo-os.settings.v1';
  const defaults = {version:1,theme:'dark',accent:'forest',wallpaper:'forest',fit:'cover',shortcuts:true,skipIntro:false,reduceMotion:false,hour12:false,seconds:false,restoreWindows:false,pinned:['welcome','projects','resume']};
  const wallpapers = {forest:"url('assets/desktop-wallpaper.png')",dusk:'linear-gradient(135deg,#161c35 0%,#4d385d 52%,#b17d72 100%)',ocean:'radial-gradient(ellipse at 80% 20%,#456a77,transparent 55%),linear-gradient(140deg,#081e29,#213d49)',graphite:'linear-gradient(145deg,#111315 20%,#3d4247 65%,#171a1d)'};
  const accents = {forest:['#c3dc9b','#38541e'],blue:['#a6ceff','#1d4f87'],rose:['#f1b6c6','#84324c']};
  let settings = {...defaults,pinned:[...defaults.pinned]}, settingsSaved = true;
  function validateSettings(value) {
    if(!value || value.version!==1)throw Error('Unsupported settings file.');
    const result={...defaults,pinned:[...defaults.pinned]};
    for(const [key,values] of Object.entries({theme:['dark','light','system'],accent:Object.keys(accents),wallpaper:[...Object.keys(wallpapers),'custom'],fit:['cover','contain','auto']})){
      if(value[key]!==undefined){if(!values.includes(value[key]))throw Error(`Invalid ${key}.`);result[key]=value[key];}
    }
    for(const key of ['shortcuts','skipIntro','reduceMotion','hour12','seconds','restoreWindows'])if(value[key]!==undefined){if(typeof value[key]!=='boolean')throw Error(`Invalid ${key}.`);result[key]=value[key];}
    if(value.pinned!==undefined){const known=['welcome','about','experience','projects','terminal','skills','resume','contact','browser','files','settings'],legacy=[...known,'architecture','database'];if(!Array.isArray(value.pinned)||value.pinned.length>13||value.pinned.some(id=>!legacy.includes(id)))throw Error('Invalid pinned apps.');result.pinned=[...new Set(value.pinned)].filter(id=>known.includes(id));}
    return result;
  }
  try {const saved=localStorage.getItem(KEY);if(saved)settings=validateSettings(JSON.parse(saved));}catch{settingsSaved=false;}
  const seed = () => ({'/':{type:'dir'},'/projects':{type:'dir'},'/notes':{type:'dir'},'/README.txt':{type:'file',text:'Welcome to your Hugo OS workspace.\nUse Files or Terminal to create and edit text files.\nFiles stay in this browser. Export anything you want to keep.\n\nTry: ls, cd projects, cat hugo-os.md, theme light\n'},'/projects/hugo-os.md':{type:'file',text:'# HUGO OS\n\nA native HTML, CSS and JavaScript desktop.\n\nBrowser opens web pages. Files and Terminal share this workspace.\nSettings controls wallpaper, appearance, the clock and your dock.\n'},'/notes/ideas.txt':{type:'file',text:'Ideas for my next project\n'}});
  let entries=seed(), bookmarks=[], db=null, storageMode='loading', customURL='', cwd='/', queue=Promise.resolve();
  function emit(type){window.dispatchEvent(new CustomEvent(`hugo:${type}`));}
  function transaction(key,value,write=false){return new Promise((resolve,reject)=>{
    const tx=db.transaction('data',write?'readwrite':'readonly'),store=tx.objectStore('data');
    const req=write?store.put(value,key):store.get(key);let result;
    req.onsuccess=()=>{result=req.result;};tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error||Error('Storage failed.'));tx.onabort=()=>reject(tx.error||Error('Storage interrupted.'));
  });}
  const ready = new Promise(resolve=>{
    if(!window.indexedDB){storageMode='session';resolve();return;}
    let settled=false;const finish=()=>{if(!settled){settled=true;clearTimeout(timer);resolve();}};
    const timer=setTimeout(()=>{storageMode='session';finish();},3000);
    const request=indexedDB.open('hugo-os',1);
    request.onupgradeneeded=()=>request.result.createObjectStore('data');
    request.onerror=request.onblocked=()=>{storageMode='session';finish();};
    request.onsuccess=async()=>{
      if(settled){request.result.close();return;}
      db=request.result;
      try {
        const [saved,links,wallpaper]=await Promise.all([transaction('files'),transaction('bookmarks'),transaction('wallpaper')]);
        if(settled){db.close();db=null;return;}
        if(saved&&saved['/']?.type==='dir')entries=saved;
        if(Array.isArray(links))bookmarks=links.filter(url=>{try{return normalizeURL(url)===url;}catch{return false;}}).slice(0,50);
        if(wallpaper instanceof Blob)customURL=URL.createObjectURL(wallpaper);
        storageMode='saved';db.onversionchange=()=>{db.close();db=null;storageMode='session';emit('storage');};
      }catch{db.close();db=null;storageMode='session';}
      finish();
    };
  }).then(()=>{emit('storage');emit('files');});
  async function persist(key,value){await ready;if(!db)return false;try{await transaction(key,value,true);return true;}catch{throw Error('Could not save. Browser storage may be full or unavailable. Export your files and try again.');}}
  function pathOf(path='.',base=cwd){
    if(typeof path!=='string'||/[\x00-\x1f]/.test(path)||path.length>512)throw Error('Invalid path.');
    const bits=(path.startsWith('/')?path:`${base}/${path}`).split('/'),out=[];
    for(const bit of bits){if(!bit||bit==='.')continue;if(bit==='..')out.pop();else out.push(bit);}
    return '/'+out.join('/');
  }
  const parent=path=>path.slice(0,path.lastIndexOf('/'))||'/';
  const basename=path=>path.split('/').pop();
  function get(path){const p=pathOf(path);if(!Object.hasOwn(entries,p))throw Error(`Not found: ${p}`);return entries[p];}
  function list(path=cwd){const p=pathOf(path);if(get(p).type!=='dir')throw Error(`Not a folder: ${p}`);return Object.keys(entries).filter(key=>key!=='/'&&parent(key)===p).sort((a,b)=>entries[a].type.localeCompare(entries[b].type)||a.localeCompare(b));}
  function mutate(operation){const job=queue.then(async()=>{await ready;const next=structuredClone(entries);operation(next);await persist('files',next);entries=next;emit('files');return storageMode==='saved'?'Saved in this browser.':'Session only — export to keep your work.';});queue=job.catch(()=>{});return job;}
  function write(path,text,{createOnly=false}={}){const p=pathOf(path);if(text.length>1024*1024)throw Error('Text files are limited to 1 MB.');return mutate(next=>{if(next[parent(p)]?.type!=='dir')throw Error('Parent folder does not exist.');if(next[p]?.type==='dir')throw Error('Cannot write over a folder.');if(createOnly&&next[p])throw Error('A file with that name already exists.');next[p]={type:'file',text};});}
  function mkdir(path){const p=pathOf(path);return mutate(next=>{if(next[p])throw Error('Path already exists.');if(next[parent(p)]?.type!=='dir')throw Error('Parent folder does not exist.');next[p]={type:'dir'};});}
  function normalizeURL(raw){const text=raw.trim();if(!text)throw Error('Enter a website address.');if(/^[a-z][a-z\d+.-]*:/i.test(text)&&!/^https?:/i.test(text))throw Error('Only HTTP and HTTPS websites are supported.');const url=new URL(/^https?:\/\//i.test(text)?text:`https://${text}`);if(!['https:','http:'].includes(url.protocol)||url.username||url.password)throw Error('Use a public HTTP or HTTPS address without credentials.');return url.href;}
  function tokenize(raw){const tokens=[];let word='',quote='',started=false,escaped=false;
    for(const ch of raw){if(escaped){word+=ch;escaped=false;started=true;}else if(ch==='\\'&&quote!=="'"){escaped=true;started=true;}else if(quote){if(ch===quote)quote='';else word+=ch;}else if(ch==='"'||ch==="'"){quote=ch;started=true;}else if(/\s/.test(ch)){if(started){tokens.push(word);word='';started=false;}}else{word+=ch;started=true;}}
    if(quote||escaped)throw Error('Finish the quoted text or escaped character.');if(started)tokens.push(word);return tokens;
  }
  function download(name,content,type='text/plain;charset=utf-8'){const url=URL.createObjectURL(content instanceof Blob?content:new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);}
  function saveSettings(patch){settings=validateSettings({...settings,...patch});try{localStorage.setItem(KEY,JSON.stringify(settings));settingsSaved=true;}catch{settingsSaved=false;}applySettings();emit('settings');return settingsSaved?'Settings saved.':'Applied for this session. Browser settings storage is unavailable.';}
  function applySettings(){
    const light=settings.theme==='light'||(settings.theme==='system'&&window.matchMedia('(prefers-color-scheme: light)').matches);
    document.documentElement.dataset.theme=light?'light':'dark';document.documentElement.dataset.motion=settings.reduceMotion?'reduced':'full';
    document.documentElement.style.setProperty('--accent',accents[settings.accent][light?1:0]);
    const wall=document.querySelector('.os-wallpaper');if(wall){wall.style.backgroundImage=settings.wallpaper==='custom'&&customURL?`url("${customURL}")`:wallpapers[settings.wallpaper]||wallpapers.forest;wall.style.backgroundSize=settings.fit;}
    const shortcuts=document.querySelector('.desktop-shortcuts');if(shortcuts)shortcuts.hidden=!settings.shortcuts;
    if(typeof PINNED!=='undefined'){PINNED.splice(0,PINNED.length,...settings.pinned);syncDesktop();updateClock();}
  }
  let filesPath='/', selectedFile='', dirty=false, busy=false, shellBusy=false, browserHistory=[''],browserIndex=0;
  const button=(text,action,extra='')=>`<button class="os-button" data-os="${action}" ${extra}>${text}</button>`;
  const notice=()=>storageMode==='saved'?'Saved in this browser':storageMode==='loading'?'Opening your workspace…':'Session only · export files to keep them';
  function renderFiles(){return `<div class="utility-app files-app"><div class="utility-heading"><span class="eyebrow">YOUR WORKSPACE</span><h2>Files</h2><p class="utility-description">A small place for notes and ideas.</p></div><div class="utility-toolbar">${button('↑ Up','files-up','aria-label="Parent folder"')}<code id="files-path">/</code><span id="files-storage" class="utility-muted"></span></div><div class="files-columns"><div><form id="file-create" class="create-file"><label for="file-name">New name</label><input id="file-name" required maxlength="100" placeholder="idea.txt"><div class="utility-toolbar"><button class="os-button" name="kind" value="file">New file</button><button class="os-button" name="kind" value="dir">New folder</button></div></form><label class="os-button upload-label">Import text<input id="file-import" type="file" accept="text/*,.md,.json,.csv,.js,.css,.html" hidden></label><nav id="workspace-files" aria-label="Workspace files"></nav></div><form id="file-editor"><label id="editor-title" for="file-text">Select a text file</label><textarea id="file-text" spellcheck="false" placeholder="Choose a file to start writing." disabled></textarea><div class="utility-toolbar"><button id="file-save" class="os-button primary" disabled>Save changes</button>${button('Download','file-download','id="file-download" disabled')}<span id="editor-status" role="status"></span></div></form></div><p id="files-message" class="utility-message" role="status"></p></div>`;}
  function refreshFiles(){const nav=document.querySelector('#workspace-files');if(!nav)return;
    document.querySelector('#files-path').textContent=filesPath;document.querySelector('#files-storage').textContent=notice();
    nav.innerHTML=list(filesPath).map(path=>`<button class="workspace-entry" data-path="${escapeHTML(path)}" aria-pressed="${selectedFile===path}">${icon(entries[path].type==='dir'?'folder':'file')}<span>${escapeHTML(basename(path))}</span><small>${entries[path].type==='dir'?'Folder':'Text'}</small></button>`).join('')||'<p class="utility-muted">This folder is empty.</p>';
    if(selectedFile&&!dirty){document.querySelector('#file-text').value=get(selectedFile).text;}
  }
  function openFile(path){const entry=get(path);if(entry.type==='dir'){filesPath=path;refreshFiles();return;}
    if(dirty){if(selectedFile!==path)message('files','Save your changes before opening another file.');return;}
    selectedFile=path;document.querySelector('#editor-title').textContent=path;const editor=document.querySelector('#file-text');editor.disabled=false;editor.value=entry.text;document.querySelector('#file-save').disabled=false;document.querySelector('#file-download').disabled=false;document.querySelector('#editor-status').textContent='';dirty=false;refreshFiles();editor.focus();
  }
  function message(app,text){const el=document.querySelector(`#${app}-message`);if(el)el.textContent=text;}
  function settingSelect(key,label,options){return `<label class="setting-row"><span>${label}</span><select data-setting="${key}">${options.map(([value,text])=>`<option value="${value}" ${settings[key]===value?'selected':''}>${text}</option>`).join('')}</select></label>`;}
  function settingToggle(key,label){return `<label class="setting-row"><span>${label}</span><input type="checkbox" data-setting="${key}" ${settings[key]?'checked':''}></label>`;}
  function renderSettings(){return `<div class="utility-app settings-app"><div class="utility-heading"><span class="eyebrow">MAKE YOURSELF AT HOME</span><h2>Settings</h2><p class="utility-description">Your workspace, your way. Changes apply immediately.</p></div><section class="settings-section"><h3>Wallpaper</h3><div class="wallpaper-options">${Object.keys(wallpapers).map(id=>`<button class="wallpaper-option" data-wallpaper="${id}" aria-pressed="${settings.wallpaper===id}"><span class="wallpaper-swatch wallpaper-${id}"></span>${id[0].toUpperCase()+id.slice(1)}</button>`).join('')}</div><div class="utility-toolbar"><label class="os-button upload-label">Choose image<input id="wallpaper-upload" type="file" accept="image/png,image/jpeg,image/webp" hidden></label>${button('Use saved image','wallpaper-custom',customURL?'':'disabled')}<span class="utility-muted">PNG, JPEG or WebP · up to 5 MB</span></div>${settingSelect('fit','Image fit',[['cover','Fill screen'],['contain','Fit image'],['auto','Original size']])}</section><section class="settings-section"><h3>Appearance</h3>${settingSelect('theme','Theme',[['dark','Dark'],['light','Light'],['system','Follow system']])}${settingSelect('accent','Accent color',[['forest','Forest'],['blue','Blue'],['rose','Rose']])}${settingToggle('shortcuts','Show desktop shortcuts')}${settingToggle('reduceMotion','Reduce desktop animation')}</section><section class="settings-section"><h3>Startup & clock</h3>${settingToggle('skipIntro','Skip intro next time')}${settingToggle('restoreWindows','Remember window positions')}${settingToggle('hour12','12-hour clock')}${settingToggle('seconds','Show seconds')}</section><section class="settings-section"><h3>Pinned apps</h3><div class="pin-options">${Object.entries(APP_META).filter(([id])=>id!=='welcome').map(([id,[label]])=>`<label><input type="checkbox" data-pin="${id}" ${settings.pinned.includes(id)?'checked':''}>${label}</label>`).join('')}</div></section><section class="settings-section"><h3>Your data</h3><p class="utility-muted">${notice()}. Settings exports contain preferences; download files separately. Custom images stay in this browser.</p><div class="utility-toolbar">${button('Export settings','settings-export')}<label class="os-button upload-label">Import settings<input id="settings-import" type="file" accept="application/json,.json" hidden></label><details class="reset-settings"><summary>Restore defaults</summary><p>Reset appearance and preferences. Your files and saved image are kept.</p>${button('Restore default settings','settings-reset')}</details></div></section><p id="settings-message" class="utility-message" role="status">${settingsSaved?'Preferences saved automatically.':'Preferences are available for this session only.'}</p></div>`;}
  function renderBrowser(){return `<div class="browser-app"><form id="browser-form" class="browser-toolbar"><button type="button" data-os="browser-back" aria-label="Previous submitted address" title="Previous submitted address">←</button><button type="button" data-os="browser-next" aria-label="Next submitted address" title="Next submitted address">→</button><button type="button" data-os="browser-reload" aria-label="Reload page">↻</button><button type="button" data-os="browser-home" aria-label="Browser home">${icon('home')}</button><label class="sr-only" for="browser-address">Website address</label><input id="browser-address" placeholder="Enter a website address" autocomplete="off" spellcheck="false" inputmode="url"><button class="os-button" type="submit">Go</button></form><div class="browser-actions">${button('Bookmark','browser-bookmark')}<a id="browser-external" class="os-button" target="_blank" rel="noopener noreferrer" hidden>Open in new tab ↗</a><span class="utility-muted">History tracks addresses entered here.</span></div><p id="browser-message" class="utility-message" role="status"></p><div id="browser-home" class="browser-home"><span class="eyebrow">A WINDOW TO THE WEB</span><h2>Where to next?</h2><p>Open a website above, or explore your workspace.</p><div class="browser-quicklinks">${button('Workspace guide','browser-guide')}${button('OpenStreetMap','browser-map')}</div><h3>Bookmarks</h3><div id="browser-bookmarks"></div></div><div id="browser-page" class="browser-page" hidden><p class="embed-note">Some websites block embedding or sign-in here. Use “Open in new tab” if the page is blank or unavailable.</p><iframe id="browser-frame" title="Website content" sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-downloads" referrerpolicy="no-referrer"></iframe></div></div>`;}
  function syncBrowser(){const address=document.querySelector('#browser-address');if(!address)return;const url=browserHistory[browserIndex];address.value=url;
    document.querySelector('[data-os="browser-back"]').disabled=browserIndex===0;document.querySelector('[data-os="browser-next"]').disabled=browserIndex===browserHistory.length-1;
    document.querySelector('[data-os="browser-bookmark"]').disabled=!/^https?:/.test(url);document.querySelector('[data-os="browser-reload"]').disabled=!url;
    const ext=document.querySelector('#browser-external');ext.hidden=!/^https?:/.test(url);if(!ext.hidden)ext.href=url;else ext.removeAttribute('href');
    document.querySelector('#browser-home').hidden=!!url;document.querySelector('#browser-page').hidden=!url;document.querySelector('.embed-note').hidden=!/^https?:/.test(url);
    document.querySelector('#browser-bookmarks').innerHTML=bookmarks.length?bookmarks.map(url=>`<div class="bookmark-row"><button data-bookmark="${escapeHTML(url)}">${icon('globe')}<span>${escapeHTML(url)}</span></button><button data-remove-bookmark="${escapeHTML(url)}" aria-label="Remove bookmark ${escapeHTML(url)}">×</button></div>`).join(''):'<p class="utility-muted">Save a website with the Bookmark button.</p>';
  }
  function navigateBrowser(raw,push=true){const url=raw===''?'':raw==='hugo://guide'?raw:normalizeURL(raw);openApp('browser');if(push){browserHistory=browserHistory.slice(0,browserIndex+1);browserHistory.push(url);browserIndex++;}syncBrowser();const frame=document.querySelector('#browser-frame');
    frame.setAttribute('sandbox',url==='hugo://guide'?'allow-popups allow-popups-to-escape-sandbox':'allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-downloads');
    frame.removeAttribute('srcdoc');frame.removeAttribute('src');
    if(url==='hugo://guide'){frame.srcdoc='<!doctype html><html lang="en"><meta name="viewport" content="width=device-width"><title>Hugo OS guide</title><style>body{font:17px/1.8 system-ui;padding:32px;max-width:650px;margin:auto;background:#f4f5ef;color:#23302a}h1{font-size:36px}a{color:#38541e}code{background:#e3e8db;padding:3px}</style><h1>Welcome to Hugo OS</h1><p>This is a real embedded page. You can select text, scroll, and follow links.</p><h2>Your workspace</h2><p>Use Files to write a note, or open Terminal and try <code>ls</code>, <code>cat README.txt</code> and <code>theme light</code>.</p><p>Your files and settings stay in this browser. Download your notes to keep a separate copy.</p><a href="https://developer.mozilla.org/" target="_blank" rel="noopener noreferrer">Explore web documentation ↗</a></html>';message('browser','Workspace guide');}
    else if(url){frame.src=url;message('browser','Address opened. Embedded availability depends on the website.');}else message('browser','');
  }
  function refreshSettings(){if(!windowContent('settings'))return;const focused=document.activeElement;let selector=null;for(const key of ['setting','pin','wallpaper'])if(focused?.dataset[key])selector=`[data-${key}="${focused.dataset[key]}"]`;renderApp(selector,'settings');}
  async function guard(app,fn){if(busy){message(app,'Please wait for the current save.');return;}busy=true;try{await fn();}catch(error){message(app,error.message);}finally{busy=false;}}
  async function chooseWallpaper(file){if(!file||!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>5*1024*1024)throw Error('Choose a PNG, JPEG or WebP image smaller than 5 MB.');
    const url=URL.createObjectURL(file);try{await new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>image.width*image.height>32000000?reject(Error('Image is too large. Choose one under 32 megapixels.')):resolve();image.onerror=()=>reject(Error('This image could not be opened.'));image.src=url;});await persist('wallpaper',file);}catch(error){URL.revokeObjectURL(url);throw error;}
    if(customURL)URL.revokeObjectURL(customURL);customURL=url;saveSettings({wallpaper:'custom'});message('settings',storageMode==='saved'?'Custom wallpaper saved.':'Image applied for this session only.');
  }
  const shellHelp='Hugo Shell — commands operate this browser workspace.\n\n  ls [path]                  List files\n  pwd / cd [path]             Show / change folder\n  cat <file>                 Read text\n  mkdir <path>               Create a folder\n  touch <file>               Create an empty file\n  write <file> "text"         Save text (replaces contents)\n  open <app | file | URL>    Open an app, file or website\n  download <file>            Export a text file\n  theme dark|light|system    Change appearance\n  wallpaper forest|dusk|ocean|graphite\n  settings / files / browser Open workspace apps\n  date / echo / history / clear\n\nPortfolio: whoami, about, experience, projects, skills, resume, contact\nTab completes commands and paths. Use quotes around paths with spaces.\nThis is a browser workspace shell; bash, npm and host OS commands are not available.';
  const commands=['help','ls','pwd','cd','cat','mkdir','touch','write','open','download','theme','wallpaper','settings','files','browser','date','echo','history','clear','whoami','about','experience','projects','skills','resume','contact'];
  function execute(raw){
    if(!raw.trim())return;if(!windows.has('terminal'))openApp('terminal');if(shellBusy){terminalHistory.push({type:'output',text:'A command is still running. Try again when it finishes.'});renderApp(null,'terminal');return;}
    let args;try{args=tokenize(raw);}catch(error){terminalHistory.push({type:'command',text:`visitor@hugo:${cwd}$ ${raw}`},{type:'output',text:error.message});renderApp('#terminal-command','terminal');return;}
    const cmd=args.shift()?.toLowerCase();
    if(!['help','ls','pwd','cd','cat','mkdir','touch','write','open','download','theme','wallpaper','settings','files','browser','date','echo','history'].includes(cmd))return executePortfolioCommand(raw);
    commandHistory.push(raw);historyIndex=commandHistory.length;terminalHistory.push({type:'command',text:`visitor@hugo:${cwd}$ ${raw}`});
    if(cmd==='help'){terminalHistory.push({type:'output',text:shellHelp});renderApp('#terminal-command','terminal');return;}
    shellBusy=true;
    return (async()=>{let destination='',text='';try{await ready;const requireArgs=(min,max=min)=>{if(args.length<min||args.length>max)throw Error(`Invalid arguments for ${cmd}. Type help for usage.`);};
      switch(cmd){
        case 'pwd':requireArgs(0);text=cwd;break;
        case 'ls':requireArgs(0,1);text=list(args[0]||cwd).map(p=>basename(p)+(entries[p].type==='dir'?'/':'')).join('\n')||'(empty folder)';break;
        case 'cd':requireArgs(0,1);{const p=pathOf(args[0]||'/');if(get(p).type!=='dir')throw Error('Not a folder.');cwd=p;text=cwd;}break;
        case 'cat':requireArgs(1);if(get(args[0]).type!=='file')throw Error('Not a text file.');text=get(args[0]).text;break;
        case 'mkdir':requireArgs(1);text=await mkdir(args[0]);break;
        case 'touch':requireArgs(1);text=await write(args[0],'',{createOnly:true});break;
        case 'write':requireArgs(2);if(dirty&&pathOf(args[0])===selectedFile)throw Error('This file has unsaved changes in Files. Save them first.');text=await write(args[0],args[1]);break;
        case 'download':requireArgs(1);if(get(args[0]).type!=='file')throw Error('Not a text file.');download(basename(pathOf(args[0])),get(args[0]).text);text='Download requested.';break;
        case 'theme':requireArgs(1);text=saveSettings({theme:args[0]});break;
        case 'wallpaper':requireArgs(1);if(!Object.hasOwn(wallpapers,args[0]))throw Error('Choose forest, dusk, ocean or graphite.');text=saveSettings({wallpaper:args[0]});break;
        case 'open':requireArgs(1);if(Object.hasOwn(APP_META,args[0].toLowerCase()))destination=args[0].toLowerCase();else if(Object.hasOwn(entries,pathOf(args[0]))){destination='files';openApp('files');openFile(pathOf(args[0]));}else{navigateBrowser(args[0]);destination='browser';}text=`Opening ${args[0]}…`;break;
        case 'settings':case 'files':case 'browser':requireArgs(0);destination=cmd;text=`Opening ${cmd}…`;break;
        case 'date':requireArgs(0);text=new Date().toLocaleString();break;
        case 'echo':text=args.join(' ');break;
        case 'history':requireArgs(0);text=commandHistory.map((line,i)=>`${i+1}  ${line}`).join('\n');break;
      }
    }catch(error){text=`Error: ${error.message}`;}finally{shellBusy=false;}
    terminalHistory.push({type:'output',text});if(terminalHistory.length>400)terminalHistory=terminalHistory.slice(-400);renderApp(null,'terminal');windowContent('terminal').scrollTop=windowContent('terminal').scrollHeight;if(destination)openApp(destination);else if(activeApp==='terminal')document.querySelector('#terminal-command')?.focus({preventScroll:true});})();
  }
  function complete(input){const raw=input.value;const tokens=raw.trimStart().split(/\s+/),first=tokens.length===1;const partial=first?tokens[0]:tokens.at(-1);let options=[];
    if(first)options=commands.filter(c=>c.startsWith(partial));else if(tokens[0]==='theme')options=['dark','light','system'].filter(x=>x.startsWith(partial));else if(tokens[0]==='wallpaper')options=Object.keys(wallpapers).filter(x=>x.startsWith(partial));else{const slash=partial.lastIndexOf('/'),prefix=slash<0?'':partial.slice(0,slash+1);try{options=list(prefix||cwd).map(p=>prefix+basename(p)+(entries[p].type==='dir'?'/':'')).filter(p=>p.startsWith(partial));}catch{}if(tokens[0]==='open'&&!prefix)options.push(...Object.keys(APP_META).filter(id=>id.startsWith(partial)));}
    if(options.length===1){const value=options[0],quoted=/\s/.test(value)?JSON.stringify(value):value;input.value=raw.slice(0,raw.length-partial.length)+quoted+(value.endsWith('/')?'':' ');}else if(options.length>1){terminalHistory.push({type:'output',text:options.join('  ')});renderApp('#terminal-command','terminal');document.querySelector('#terminal-command').value=raw;}
  }
  function init(){
    Object.assign(APP_META,{browser:['Browser','globe'],files:['Files','folder'],settings:['Settings','settings']});ICONS.settings='<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="15" cy="17" r="3"/>';
    Object.assign(renderers,{browser:renderBrowser,files:renderFiles,settings:renderSettings});
    applySettings();ready.then(()=>{applySettings();refreshSettings();refreshFiles();syncBrowser();});
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change',applySettings);
    window.addEventListener('hugo:settings',refreshSettings);window.addEventListener('hugo:files',refreshFiles);
    document.addEventListener('input',event=>{if(event.target.id==='file-text'){dirty=true;document.querySelector('#editor-status').textContent='Unsaved changes';}});
    document.addEventListener('keydown',event=>{if(event.target.id==='terminal-command'&&event.key==='Tab'&&!event.shiftKey){event.preventDefault();complete(event.target);}if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='s'&&event.target.closest('.app-files')){event.preventDefault();document.querySelector('#file-editor').requestSubmit();}});
    window.addEventListener('beforeunload',event=>{saveLayout();if(dirty){event.preventDefault();event.returnValue='';}});window.addEventListener('pagehide',saveLayout);
    document.addEventListener('contextmenu',event=>{if(event.target.closest('#workspace')&&!event.target.closest('.os-window')){event.preventDefault();openApp('settings');}});
    document.addEventListener('change',event=>{const el=event.target;
      if(el.dataset.setting){const text=saveSettings({[el.dataset.setting]:el.type==='checkbox'?el.checked:el.value});message('settings',text);}
      if(el.dataset.pin){saveSettings({pinned:el.checked?[...settings.pinned,el.dataset.pin]:settings.pinned.filter(id=>id!==el.dataset.pin)});}
      if(el.id==='wallpaper-upload'&&el.files[0])guard('settings',()=>chooseWallpaper(el.files[0]));
      if(el.id==='settings-import'&&el.files[0])guard('settings',async()=>{if(el.files[0].size>50000)throw Error('Settings file is too large.');const imported=validateSettings(JSON.parse(await el.files[0].text()));if(imported.wallpaper==='custom'&&!customURL)imported.wallpaper='forest';message('settings',saveSettings(imported));});
      if(el.id==='file-import'&&el.files[0])guard('files',async()=>{const file=el.files[0];if(file.size>1024*1024)throw Error('Choose a text file smaller than 1 MB.');const text=await file.text();if(text.includes('\0'))throw Error('Choose a plain text file.');message('files',await write(pathOf(file.name,filesPath),text,{createOnly:true}));el.value='';});
    });
    document.addEventListener('submit',event=>{
      if(event.target.id==='browser-form'){event.preventDefault();try{navigateBrowser(document.querySelector('#browser-address').value);}catch(error){message('browser',error.message);}}
      if(event.target.id==='file-create'){event.preventDefault();guard('files',async()=>{const input=document.querySelector('#file-name'),name=input.value.trim();if(!name||name==='.'||name==='..'||name.includes('/'))throw Error('Enter a single file or folder name.');const path=pathOf(name,filesPath),kind=event.submitter?.value||'file';message('files',await (kind==='dir'?mkdir(path):write(path,'',{createOnly:true})));input.value='';if(kind==='file')openFile(path);});}
      if(event.target.id==='file-editor'){event.preventDefault();if(!selectedFile)return;guard('files',async()=>{const savedPath=selectedFile,text=document.querySelector('#file-text').value;const result=await write(savedPath,text);dirty=document.querySelector('#file-text').value!==text;document.querySelector('#editor-status').textContent=dirty?'Newer edits not yet saved':result;message('files','');});}
    });
    document.addEventListener('click',event=>{const el=event.target.closest('button');if(!el)return;
      if(el.dataset.path){try{openFile(el.dataset.path);}catch(error){message('files',error.message);}return;}
      if(el.dataset.wallpaper){message('settings',saveSettings({wallpaper:el.dataset.wallpaper}));return;}
      if(el.dataset.bookmark){navigateBrowser(el.dataset.bookmark);return;}
      if(el.dataset.removeBookmark){guard('browser',async()=>{const next=bookmarks.filter(url=>url!==el.dataset.removeBookmark);await persist('bookmarks',next);bookmarks=next;syncBrowser();});return;}
      const action=el.dataset.os;if(!action)return;
      try{switch(action){
        case 'files-up':filesPath=parent(filesPath);refreshFiles();break;
        case 'file-download':download(basename(selectedFile),document.querySelector('#file-text').value);break;
        case 'settings-export':download('hugo-os-settings.json',JSON.stringify(settings,null,2),'application/json');break;
        case 'settings-reset':message('settings',saveSettings({...defaults,pinned:[...defaults.pinned]}));break;
        case 'wallpaper-custom':if(customURL)saveSettings({wallpaper:'custom'});break;
        case 'browser-home':navigateBrowser('');break;
        case 'browser-guide':navigateBrowser('hugo://guide');break;
        case 'browser-map':navigateBrowser('https://www.openstreetmap.org/export/embed.html?bbox=121.49%2C25.02%2C121.59%2C25.08&layer=mapnik');break;
        case 'browser-back':if(browserIndex>0){browserIndex--;navigateBrowser(browserHistory[browserIndex],false);}break;
        case 'browser-next':if(browserIndex<browserHistory.length-1){browserIndex++;navigateBrowser(browserHistory[browserIndex],false);}break;
        case 'browser-reload':navigateBrowser(browserHistory[browserIndex],false);break;
        case 'browser-bookmark':guard('browser',async()=>{const url=browserHistory[browserIndex];if(!/^https?:/.test(url))return;if(bookmarks.includes(url)){message('browser','Already bookmarked.');return;}if(bookmarks.length>=50)throw Error('Remove a bookmark before adding another (50 maximum).');const next=[...bookmarks,url];await persist('bookmarks',next);bookmarks=next;syncBrowser();message('browser',storageMode==='saved'?'Bookmark saved.':'Bookmark added for this session.');});break;
      }}catch(error){message(action.startsWith('browser')?'browser':'files',error.message);}
    });
  }
  function mounted(id){if(id==='files')refreshFiles();if(id==='browser')syncBrowser();}
  function saveLayout(){if(!settings.restoreWindows)return;const layout={};for(const [id,s] of windows)layout[id]={x:s.x,y:s.y,width:s.width,height:s.height,maximized:s.maximized};try{localStorage.setItem('hugo-os.layout.v1',JSON.stringify(layout));}catch{}}
  function restoreLayout(id,state){if(!settings.restoreWindows)return;try{const layout=JSON.parse(localStorage.getItem('hugo-os.layout.v1')||'{}')[id];if(!layout)return;for(const key of ['x','y','width','height'])if(!Number.isFinite(layout[key]))return;state.x=layout.x;state.y=layout.y;state.width=Math.max(360,Math.min(2400,layout.width));state.height=Math.max(260,Math.min(1800,layout.height));state.maximized=layout.maximized===true;state.element.classList.toggle('is-maximized',state.maximized);state.element.querySelector('.maximize-control').setAttribute('aria-label',`${state.maximized?'Restore':'Maximize'} ${APP_META[id][0]}`);}catch{}}
  return {init,ready,get settings(){return settings;},get cwd(){return cwd;},execute,mounted,restoreLayout,saveLayout,saveSettings,normalizeURL,tokenize,pathOf,list,get,write,mkdir,get storageMode(){return storageMode;}};
})();
