import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

const modelRoot=path.resolve('assets/models');
const manifest=JSON.parse(fs.readFileSync(path.join(modelRoot,'source-checksums.json'),'utf8'));
if(manifest.algorithm!=='sha256')throw new Error(`Unsupported checksum algorithm: ${manifest.algorithm}`);
const sourceRoot=path.join(modelRoot,manifest.root);
const actual={};

function walk(directory){
  for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
    if(entry.name==='.DS_Store')continue;
    const file=path.join(directory,entry.name);
    if(entry.isDirectory())walk(file);
    else actual[path.relative(sourceRoot,file).split(path.sep).join('/')]=createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  }
}
walk(sourceRoot);

const expected=manifest.sources;
const missing=Object.keys(expected).filter(file=>!actual[file]);
const extra=Object.keys(actual).filter(file=>!expected[file]);
const mismatched=Object.keys(expected).filter(file=>actual[file]&&actual[file]!==expected[file]);
if(missing.length||extra.length||mismatched.length){
  console.error(JSON.stringify({missing,extra,mismatched},null,2));
  process.exitCode=1;
}else console.log(`PASS: ${Object.keys(expected).length} model source files match ${manifest.algorithm} checksums.`);
