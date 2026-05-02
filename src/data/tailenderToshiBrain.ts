// Tailender Toshi Brain v3 - Offline helper for Tailender Tracks
import brain from './tailender_toshi_brain_v3.json';

export const TAILENDER_TOSHI_BRAIN = brain;

type ToshiSearchOptions = { stage?: string; limit?: number; easyEnglish?: boolean };

const STOP_WORDS = new Set(['a','an','the','and','or','but','if','then','to','of','in','on','for','with','by','is','are','am','be','been','do','does','did','what','how','why','when','where','who','should','can','could','would','i','we','you','me','my','our','your','it','this','that','there','here','about','help','please']);
const SYNONYMS: Record<string, string[]> = {
  language:['dialect','mother tongue','heart language','speech variety'],
  dialect:['language','accent','speech variety','village speech'],
  record:['recording','capture','audio','session'],
  recording:['record','capture','audio','session'],
  noise:['hum','buzz','wind','echo','background','traffic','fan','generator'],
  clipping:['distortion','distorted','red','peaking','too loud'],
  quiet:['low','soft','gain'],
  permission:['rights','copyright','allowed','consent'],
  consent:['permission','allowed','voice release','speaker'],
  submit:['submission','handoff','upload','package','studio'],
  share:['distribution','distribute','listeners','sd card','bluetooth','qr','whatsapp'],
  file:['files','filename','naming','folder','package'],
  program:['tracklist','tracks','final','package'],
  helper:['language helper','speaker','translator','checker']
};

function normalize(text: any): string {
  return String(text || '').toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9\s-]/g,' ').replace(/\s+/g,' ').trim();
}
function tokenize(query: string): string[] {
  const base = normalize(query).split(' ').filter(w => w && !STOP_WORDS.has(w));
  const expanded = new Set(base);
  for (const word of base) for (const s of SYNONYMS[word] || []) for (const sw of normalize(s).split(' ')) if (sw && !STOP_WORDS.has(sw)) expanded.add(sw);
  return [...expanded];
}
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const tmp: number[][] = [];
  for (let i=0;i<=a.length;i++) tmp[i]=[i];
  for (let j=0;j<=b.length;j++) tmp[0][j]=j;
  for (let i=1;i<=a.length;i++) for (let j=1;j<=b.length;j++) tmp[i][j]=Math.min(tmp[i-1][j]+1,tmp[i][j-1]+1,tmp[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
  return tmp[a.length][b.length];
}
function itemText(item:any): string {
  return normalize([item.question,item.answer,item.easyEnglish,item.stage,item.category,item.intent,item.title,item.goal,item.trigger,item.term,item.meaning,...(item.steps||[]),...(item.tags||[])].filter(Boolean).join(' '));
}
function scoreItem(words:string[], item:any, stage?:string): number {
  const haystack=itemText(item), hWords=haystack.split(' ').filter(w=>w.length>2), question=normalize(item.question||item.title||item.term||''), tags=(item.tags||[]).map(normalize);
  let score=0;
  for (const word of words) {
    if (haystack.includes(word)) score += 2;
    if (question.includes(word)) score += 8;
    if (tags.some((t:string)=>t.includes(word))) score += 6;
    if (word.length>4) for (const hw of hWords) if (Math.abs(hw.length-word.length)<=2) { const d=levenshtein(word,hw); if (d<=1 || (word.length>7 && d<=2)) { score += 1.2; break; } }
  }
  const joined=words.join(' ');
  if (joined.includes('room tone') && haystack.includes('room tone')) score += 20;
  if (joined.includes('heart language') && haystack.includes('heart language')) score += 20;
  if (joined.includes('submit package') && haystack.includes('package')) score += 12;
  if (joined.includes('share offline') && haystack.includes('offline')) score += 12;
  if (stage && normalize(stage)!=='all' && normalize(item.stage)===normalize(stage)) score += 12;
  if (item.type==='troubleshooting_flow' && words.some(w=>['fix','problem','wrong','bad','failed','noise','clipping','distorted'].includes(w))) score += 6;
  return score;
}
export function getTailenderToshiCategories(): string[] {
  return ['All', ...brain.workflow, 'Forms','Teamwork','Training','Troubleshooting','Audio Quality','Offline','Toshi Help','Glossary'];
}
export function searchTailenderToshi(query:string, options:ToshiSearchOptions={}) {
  const q=normalize(query); if (!q) return [];
  const words=tokenize(q);
  const allItems=[...((brain as any).items||[]),...((brain as any).trainingCards||[]),...((brain as any).troubleshootingFlows||[]),...((brain as any).glossary||[])];
  return allItems.map((item:any)=>({...item,score:scoreItem(words,item,options.stage)})).filter((item:any)=>item.score>0).sort((a:any,b:any)=>b.score-a.score).slice(0,options.limit||8);
}
function formatItemAnswer(item:any, easyEnglish=false): string {
  if (easyEnglish && item.easyEnglish) return item.easyEnglish;
  if (item.type==='training_card') return `${item.goal}\n\nSteps:\n${(item.steps||[]).map((s:string,i:number)=>`${i+1}. ${s}`).join('\n')}\n\nPractice:\n${item.practiceTask || 'Try this with a real or sample project.'}`;
  if (item.type==='troubleshooting_flow') return `${item.trigger}\n\nTry this:\n${(item.steps||[]).map((s:string,i:number)=>`${i+1}. ${s}`).join('\n')}\n\nStop when:\n${item.stopWhen || 'The problem is solved or safely handed off.'}`;
  if (item.type==='glossary') return item.meaning || item.easyEnglish || '';
  return item.answer || item.easyEnglish || 'I found a related item, but it needs a better answer.';
}
export function askTailenderToshi(query:string, options:ToshiSearchOptions={}) {
  const results=searchTailenderToshi(query,{...options,limit:options.limit||8});
  if (!results.length) return {found:false,answer:'I do not have that answer saved offline yet. Mark this question for a trainer or reviewer, and add the answer to Tailender Toshi later.',easyEnglish:'I do not know yet. Save this question and ask a trainer.',suggestions:['Ask a trainer','Add this as a new Q&A','Check the project notes'],related:[]};
  const best:any=results[0];
  return {found:true,id:best.id,type:best.type,stage:best.stage,category:best.category||best.title||best.term,question:best.question||best.title||best.term,answer:formatItemAnswer(best,!!options.easyEnglish),easyEnglish:best.easyEnglish||formatItemAnswer(best,true),actions:best.actions||[],caution:best.caution||'',related:results.slice(1,5).map((r:any)=>({id:r.id,type:r.type,stage:r.stage,label:r.question||r.title||r.term}))};
}
export function getToshiBrainStats() { return (brain as any).counts; }
export function getSuggestedToshiQuestions(stage='All'): string[] {
  const stageNorm=normalize(stage);
  const pool=((brain as any).items||[]).filter((x:any)=>stageNorm==='all'||normalize(x.stage)===stageNorm).slice(0,12).map((x:any)=>x.question);
  return pool.length ? pool : ['How do I know this is the right heart language?','What is room tone?','What do I do if the audio clips?','What goes in a submission package?','How can we share without internet?'];
}
