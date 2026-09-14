/* DOM integration coverage for the actual shipped application. No layout engine.
   Run: NODE_PATH=<directory containing jsdom> node tests/desktop.cjs */
const {JSDOM,VirtualConsole}=require('jsdom');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const errors=[];
const virtualConsole=new VirtualConsole();virtualConsole.on('jsdomError',e=>errors.push(e));
const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://portfolio.test/#welcome',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole});
const w=dom.window,d=w.document;
const motion={matches:false,listeners:[],addEventListener(_,fn){this.listeners.push(fn);}};
w.matchMedia=()=>motion;w.scrollTo=()=>{};
w.HTMLElement.prototype.scrollIntoView=function(){};
w.HTMLElement.prototype.setPointerCapture=function(){};
Object.defineProperty(w,'innerWidth',{value:1440,writable:true});Object.defineProperty(w,'innerHeight',{value:900,writable:true});
Object.defineProperties(d.querySelector('#window-layer'),{clientWidth:{get:()=>w.innerWidth},clientHeight:{get:()=>w.innerHeight-140}});
w.structuredClone=structuredClone;
w.eval(['os.js','app.js'].map(file=>fs.readFileSync(path.join(root,file),'utf8')).join('\n'));
const $=selector=>{const el=d.querySelector(selector);assert(el,`Missing ${selector}`);return el;};
const click=selector=>$(selector).click();
const pane=id=>$(`[data-window="${id}"]`);
const visible=()=>[...d.querySelectorAll('[data-window]')].filter(el=>!el.hidden).map(el=>el.dataset.window);
const key=(el,key,extra={})=>el.dispatchEvent(new w.KeyboardEvent('keydown',{key,bubbles:true,...extra}));
const submit=value=>{const input=$('#terminal-command');input.value=value;$('#terminal-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));};
const hashChanged=()=>new Promise(resolve=>w.addEventListener('hashchange',resolve,{once:true}));
(async()=>{
 assert.deepEqual(visible(),['welcome']);assert.equal(d.querySelector('dialog'),null,'Desktop apps must not share a modal');
 click('.welcome-actions [data-app="projects"]');
 click('[data-select-project="2"]');click('[data-open-project="2"]');
 const projects=pane('projects'),content=projects.querySelector('.app-content');content.scrollTop=183;
 assert.match(content.textContent,/Real-time game platform/);
 click('[data-dock-app="architecture"]');click('[data-select-node="mysql"]');
 click('[data-dock-app="terminal"]');
 const terminal=pane('terminal');$('#terminal-command').value='unfinished draft';
 assert.equal(visible().length,4,'Welcome, projects, architecture and terminal coexist');
 click('[data-window="terminal"] [data-window-action="minimize"]');assert(terminal.hidden);
 click('[data-dock-app="terminal"]');assert.equal($('#terminal-command').value,'unfinished draft');
 assert.equal(projects.querySelector('.app-content'),content,'Opening other apps preserves project DOM');assert.equal(content.scrollTop,183);
 submit('projects');assert(!terminal.hidden,'Terminal remains on desktop after navigation');assert.match(terminal.textContent,/Opening projects/);assert.equal(content.scrollTop,183);
 click('[data-dock-app="terminal"]');submit('<img src=x onerror=alert(1)>');assert.equal(terminal.querySelector('img'),null,'Terminal input stays text');
 assert.match(terminal.textContent,/Command not found/);
 key($('#terminal-command'),'ArrowUp');assert.match($('#terminal-command').value,/<img/);
 submit('clear');assert(!terminal.textContent.includes('Command not found'));
 click('[data-window="terminal"] [data-window-action="close"]');assert(terminal.hidden);
 click('[data-dock-app="terminal"]');assert.equal(d.querySelectorAll('[data-window="terminal"]').length,1,'Singleton reopen');
 const termInput=$('#terminal-command');termInput.value='draft after close';
 click('[data-window="terminal"] [data-window-action="maximize"]');assert(terminal.classList.contains('is-maximized'));
 click('[data-window="terminal"] [data-window-action="maximize"]');assert(!terminal.classList.contains('is-maximized'));
 const bar=terminal.querySelector('.os-titlebar');
 bar.dispatchEvent(new w.MouseEvent('pointerdown',{bubbles:true,button:0,clientX:500,clientY:200}));
 terminal.dispatchEvent(new w.MouseEvent('pointermove',{bubbles:true,clientX:-9000,clientY:-9000}));
 terminal.dispatchEvent(new w.MouseEvent('pointerup',{bubbles:true}));
 assert.equal(terminal.style.left,'12px');assert.equal(terminal.style.top,'12px');
 click('[data-window="terminal"] [data-window-action="right"]');assert(parseFloat(terminal.style.left)>700);
 key(terminal.querySelector('.window-resize'),'ArrowLeft');assert(parseFloat(terminal.style.width)<702);
 click('[data-action="home"]');assert.equal(visible().length,0);
 click('[data-action="home"]');assert.equal(visible().length,4);assert.equal($('#terminal-command').value,'draft after close');
 click('#launcher-toggle');assert(!$('#launcher').hidden);key(d.activeElement,'Escape');assert($('#launcher').hidden);assert.equal(d.activeElement,$('#launcher-toggle'));
 for(const id of ['about','experience','database','skills','resume','contact']){
   click('#launcher-toggle');click(`#app-nav [data-app="${id}"]`);assert(!pane(id).hidden);assert(pane(id).querySelector('.app-content').textContent.length>30);
 }
 click('[data-window="contact"] [data-window-action="close"]');assert(!visible().includes('contact'));
 click('[data-dock-app="projects"]');click('[data-project-back]');click('[data-project-filter="portfolio"]');
 assert.equal(d.querySelectorAll('.file-row').length,1);assert.match($('.file-preview').textContent,/HUGO OS/);
 click('[data-project-filter="backend"]');assert.equal(d.querySelectorAll('.file-row').length,4);
 const ids=[...d.querySelectorAll('[id]')].map(el=>el.id);assert.equal(new Set(ids).size,ids.length,'No duplicate IDs across open apps');
 // Narrow mode changes visibility, never discards app state.
 w.innerWidth=375;w.innerHeight=667;w.dispatchEvent(new w.Event('resize'));assert.deepEqual(visible(),['projects']);
 click('[data-dock-app="terminal"]');assert.deepEqual(visible(),['terminal']);assert.equal($('#terminal-command').value,'draft after close');
 click('[data-window="terminal"] .mobile-back');assert.equal(visible().length,0);click('[data-dock-app="projects"]');assert.deepEqual(visible(),['projects']);
 w.innerWidth=1440;w.innerHeight=900;w.dispatchEvent(new w.Event('resize'));assert(visible().length>1);
 // Explicit app navigation is reversible with browser history.
 click('[data-dock-app="architecture"]');click('[data-dock-app="resume"]');
 let changed=hashChanged();w.history.back();await changed;assert.equal(w.location.hash,'#architecture');assert.equal($('#active-app-label').textContent,'Architecture');
 key(d.body,'k',{ctrlKey:true});assert.equal($('#active-app-label').textContent,'Terminal');
 key($('#terminal-command'),'Escape');assert(pane('terminal').hidden);
 // Replaying hides the whole shell and retains application DOM for return.
 const before=content;click('#launcher-toggle');click('#replay-intro');assert($('#desktop').inert);motion.matches=true;motion.listeners.forEach(fn=>fn());assert(!$('#desktop').inert);assert.equal(pane('projects').querySelector('.app-content'),before);
 assert.deepEqual(errors,[]);
 console.log('PASS: real DOM startup, all apps, concurrent windows, state/draft preservation, commands, escaping, focus, drag bounds, tiling, resizing, launcher, mobile switching, history and intro replay.');
 dom.window.close();
})().catch(error=>{console.error(error);dom.window.close();process.exitCode=1;});
