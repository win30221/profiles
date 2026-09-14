/* Run with NODE_PATH pointing to jsdom and fake-indexeddb (test-only). */
const {JSDOM,VirtualConsole}=require('jsdom');
const {IDBFactory,IDBObjectStore}=require('fake-indexeddb');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..'),source=['os.js','app.js'].map(file=>fs.readFileSync(path.join(root,file),'utf8')).join('\n');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const db=new IDBFactory(),doms=[];
const pause=()=>new Promise(resolve=>setTimeout(resolve,10));
function boot({idb=db,saved,blockedSettings=false,url='https://workspace.test/#terminal'}={}){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',error=>errors.push(error));
 const dom=new JSDOM(html,{url,runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});doms.push(dom);
 const w=dom.window,d=w.document;
 w.matchMedia=()=>({matches:false,addEventListener(){}});w.scrollTo=()=>{};w.HTMLElement.prototype.setPointerCapture=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};
 w.structuredClone=structuredClone;w.indexedDB=idb;w.URL.createObjectURL=()=> 'blob:https://workspace.test/test';w.URL.revokeObjectURL=()=>{};
 w.HTMLAnchorElement.prototype.click=function(){w.lastDownload={name:this.download,url:this.href};};
 Object.defineProperty(w,'innerWidth',{value:1440,writable:true});Object.defineProperty(w,'innerHeight',{value:900,writable:true});
 Object.defineProperties(d.querySelector('#window-layer'),{clientWidth:{get:()=>w.innerWidth},clientHeight:{get:()=>w.innerHeight-140}});
 if(saved)w.localStorage.setItem('hugo-os.settings.v1',saved);
 if(blockedSettings)Object.defineProperty(w,'localStorage',{get(){throw Error('Disabled');}});
 w.eval(source);
 const $=selector=>{const el=d.querySelector(selector);assert(el,selector);return el;};
 const click=selector=>$(selector).click();
 const input=(selector,text)=>{$(selector).value=text;$(selector).dispatchEvent(new w.Event('input',{bubbles:true}));};
 return {w,d,$,click,input,errors,os:w.HugoOS,async command(text){await w.HugoOS.execute(text);}};
}
(async()=>{
 const a=boot();await a.os.ready;assert.equal(a.os.storageMode,'saved');
 assert.deepEqual(Array.from(a.os.tokenize('write "notes/Case File.txt" "Hello 世界"')),['write','notes/Case File.txt','Hello 世界']);
 assert.throws(()=>a.os.tokenize('write x "unfinished'),/Finish/);
 for(const url of ['javascript:alert(1)','data:text/html,x','file:///etc/passwd','https://user:pass@example.com'])assert.throws(()=>a.os.normalizeURL(url));
 assert.equal(a.os.normalizeURL('example.com'),'https://example.com/');
 assert.equal(a.os.pathOf('../../notes','/projects'),'/notes');
 await a.command('mkdir "notes/My Folder"');await a.command('write "notes/My Folder/Case.txt" "Hello 世界 <img src=x onerror=alert(1)>"');
 await a.command('cat "notes/My Folder/Case.txt"');assert.match(a.$('.terminal-output').textContent,/Hello 世界/);assert.equal(a.$('.terminal-output').querySelector('img'),null);
 await a.command('cd "notes/My Folder"');await a.command('pwd');assert.match(a.$('.prompt-user').textContent,/My Folder/);
 await a.command('cat Case.txt');assert.match(a.$('.terminal-output').textContent,/Hello 世界/);
 await a.command('write /missing/file.txt nope');assert.match(a.$('.terminal-output').textContent,/Parent folder/);
 await a.command('touch Case.txt');assert.match(a.$('.terminal-output').textContent,/already exists/);assert.match(a.os.get('Case.txt').text,/Hello/);
 await a.command('open Case.txt');assert.equal(a.$('#file-text').value,a.os.get('Case.txt').text);
 a.input('#file-text','Unsaved draft');await a.command('write Case.txt "other value"');assert.match(a.$('.terminal-output').textContent,/unsaved changes/);assert.equal(a.$('#file-text').value,'Unsaved draft');
 const editor=a.$('#file-text');a.click('[data-window="files"] [data-window-action="close"]');await a.command('files');assert.equal(a.$('#file-text'),editor);assert.equal(editor.value,'Unsaved draft');
 a.$('#file-editor').dispatchEvent(new a.w.Event('submit',{bubbles:true,cancelable:true}));await pause();await pause();assert.equal(a.os.get('Case.txt').text,'Unsaved draft');
 await a.command('write Case.txt "Synchronized"');assert.equal(editor.value,'Synchronized');
 await a.command('download Case.txt');assert.equal(a.w.lastDownload.name,'Case.txt');
 await a.command('theme light');await a.command('wallpaper ocean');assert.equal(a.d.documentElement.dataset.theme,'light');assert.match(a.$('.os-wallpaper').style.backgroundImage,/radial-gradient/);
 await a.command('theme invalid');assert.equal(a.os.settings.theme,'light');
 await a.command('settings');a.$('[data-setting="seconds"]').checked=true;a.$('[data-setting="seconds"]').dispatchEvent(new a.w.Event('change',{bubbles:true}));assert.match(a.$('#clock').textContent,/\d\d:\d\d:\d\d/);
 a.os.saveSettings({pinned:['files','browser'],shortcuts:false,skipIntro:true,restoreWindows:true});assert(a.$('.desktop-shortcuts').hidden);a.os.saveLayout();
 const saved=a.w.localStorage.getItem('hugo-os.settings.v1');
 await a.command('open https://example.com');const frame=a.$('#browser-frame');assert.equal(frame.src,'https://example.com/');assert(!frame.sandbox?.contains('allow-top-navigation'));assert.equal(a.$('#browser-external').rel,'noopener noreferrer');
 a.click('[data-window="browser"] [data-window-action="minimize"]');await a.command('browser');assert.equal(a.$('#browser-frame'),frame);assert.equal(frame.src,'https://example.com/');
 a.click('[data-os="browser-bookmark"]');await pause();await pause();
 a.click('[data-os="browser-home"]');assert(a.$('#browser-page').hidden);a.click('[data-os="browser-back"]');assert.equal(frame.src,'https://example.com/');a.click('[data-os="browser-home"]');a.click('[data-os="browser-guide"]');assert.match(frame.srcdoc,/Welcome to Hugo OS/);
 const b=boot({saved,url:'https://workspace.test/#files'});await b.os.ready;
 assert.equal(b.os.get('/notes/My Folder/Case.txt').text,'Synchronized');assert.equal(b.d.documentElement.dataset.theme,'light');assert.equal(b.os.settings.wallpaper,'ocean');assert.equal(b.os.settings.skipIntro,true);
 b.click('.system-settings');assert.equal(b.$('[data-setting="seconds"]').checked,true);
 await b.os.execute('browser');b.click('[data-os="browser-home"]');assert.match(b.$('#browser-bookmarks').textContent,/example.com/);
 // A failed write must leave committed data untouched and give an actionable error.
 const put=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(){throw Error('Quota exceeded');};
 await a.command('write Case.txt "must not commit"');assert.equal(a.os.get('Case.txt').text,'Synchronized');assert.match(a.$('.terminal-output').textContent,/Could not save/);IDBObjectStore.prototype.put=put;
 // No IndexedDB / disabled localStorage remain usable and explicitly session-only.
 const c=boot({idb:null,blockedSettings:true});await c.os.ready;assert.equal(c.os.storageMode,'session');await c.command('write notes/session.txt "temporary"');assert.equal(c.os.get('/notes/session.txt').text,'temporary');assert.match(c.$('.terminal-output').textContent,/Session only/);
 await c.command('settings');assert.match(c.$('#settings-message').textContent,/session/);c.os.saveSettings({theme:'light'});assert.equal(c.d.documentElement.dataset.theme,'light');
 // Narrow mode retains the exact browser iframe and editor DOM.
 a.w.innerWidth=375;a.w.innerHeight=667;a.w.dispatchEvent(new a.w.Event('resize'));await a.command('files');assert.equal(a.$('#file-text'),editor);await a.command('browser');assert.equal(a.$('#browser-frame'),frame);
 // Completion and legacy portfolio commands remain available.
 await a.command('open terminal');a.input('#terminal-command','wallp');a.$('#terminal-command').dispatchEvent(new a.w.KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true}));assert.equal(a.$('#terminal-command').value,'wallpaper ');
 await a.command('whoami');assert.match(a.$('.terminal-output').textContent,/Backend Engineer/);
 for(const fixture of [a,b,c])assert.deepEqual(fixture.errors,[]);
 console.log('PASS: IndexedDB reload persistence, quoted/case-sensitive paths, file/editor sync, drafts, storage failure atomicity, session fallback, URL validation, iframe preservation, bookmarks, settings, mobile switching, downloads and completion.');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{for(const dom of doms)dom.window.close();});
