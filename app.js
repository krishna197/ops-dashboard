
const M=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
let NAV=[],GR={},LOW=/$^/,CFG=null,ERR='';
const $=s=>document.querySelector(s),cur=new Date().getMonth();
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const num=v=>{v=parseFloat(v);return isNaN(v)?null:v};
const fmt=v=>v==null?'–':(Math.abs(v)>=1000?Math.round(v).toLocaleString():+v.toFixed(2));
let D=null,mo=-1,tab=(location.hash||'#ov').slice(1),sel={},srt={},fp='',fs='';

/* data from the Python server */
function lastMonth(){let l=-1;D.g.ov.rows.forEach(r=>r[1].forEach((v,i)=>{if(v!=null)l=Math.max(l,M.indexOf(D.g.ov.cols[i]))}));D.sd.forEach(r=>{if(r[4]!=null)l=Math.max(l,M.indexOf(r[0]))});if(l<0)D.g.db.rows.forEach(r=>r[1].forEach((v,i)=>{if(v!=null)l=Math.max(l,M.indexOf(D.g.db.cols[i]))}));return l}
function toast(t){const e=$('#toast');e.textContent=t;e.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>e.style.display='none',3000)}
function buildCfg(){
 document.title=CFG.title;$('#logo').textContent='▣ '+CFG.title;
 if(!buildCfg.done){document.documentElement.dataset.theme=CFG.theme;buildCfg.done=1}
 LOW=new RegExp(CFG.lower,'i');GR={};const S=new Map([['Explore',[['ov','Overview','▦']]]]);
 CFG.groups.forEach(g=>{GR[g.id]={re:new RegExp(g.match,'i'),x:g.charts.map(c=>({t:c.t,s:c.s,c:c.c,r:c.r.map(x=>new RegExp(x,'i'))}))};
  if(!S.has(g.section))S.set(g.section,[]);S.get(g.section).push([g.id,g.title,g.icon])});
 const add=(s,i)=>{if(!S.has(s))S.set(s,[]);S.get(s).push(i)};add('People & process',['std','Standardization','✔']);add('Breakdown',['vt','Verticals','▤']);NAV=[...S]}
let ver=null;
async function pull(force){
 try{const j=await(await fetch('/api/data',{cache:'no-store'})).json();$('#live').className='dot on';
  if(j.version===ver&&!force)return;ver=j.version;CFG=j.cfg;buildCfg();
  if(j.error){D=null;ERR=j.error}else{D={...j.data,file:j.file,at:j.updated,warn:j.warnings};ERR=''}
  render();if(!pull.t)pull.t=setInterval(pull,Math.max(5,CFG.refresh)*1000)
 }catch(e){$('#live').className='dot'}}

/* helpers */
const ser=(g,r)=>M.map(m=>{const i=g.cols.indexOf(m);return i<0?null:r[1][i]});
const ovr=re=>D.g.ov.rows.find(r=>re.test(r[0]));
const badge=(l,c,p)=>{if(c==null||!p)return'';const d=(c-p)/Math.abs(p)*100;if(Math.abs(d)<.05)return'<span class="bg">no change</span>';const up=d>0,g=LOW.test(l)?!up:up;return`<span class="bg ${g?'g':'b'}">${up?'↗':'↘'} ${Math.abs(d).toFixed(1)}% vs ${M[mo-1]}</span>`};
const stat=(n,v,p)=>`<div class="card st"><div class="top"><span class="big">${fmt(v)}</span>${badge(n,v,p)}</div><p class="mu">${esc(n)} · ${M[mo]}</p></div>`;
const lg=S=>`<div class="lg">${S.map(s=>`<span><s style="background:${s.c}"></s>${esc(s.n)}</span>`).join('')}</div>`;
const emp='<div class="empty">No data yet</div>';
const rank=I=>I.map(i=>`<div class="rk" style="--w:${Math.max(0,Math.min(100,i.w))}%;--c:${i.c||'var(--tx)'}"><span>${esc(i.n)}</span><b>${i.t}</b></div>`).join('')||emp;
const spark=v=>{const n=v.filter(x=>x!=null);if(n.length<2)return'<i class="sp"></i>';const lo=Math.min(...n),r=(Math.max(...n)-lo)||1;
 return`<svg viewBox="0 0 60 22" class="sp"><polyline points="${v.map((x,i)=>x==null?'':`${(i*60/11).toFixed(1)},${(20-(x-lo)/r*18).toFixed(1)}`).filter(Boolean).join(' ')}"/></svg>`};
const xl=(i,hi)=>`<text x="${10+(i+.5)*680/12}" y="242" class="xl ${i===hi?'on':''} ${i===cur?'cu':''}" text-anchor="middle">${M[i]}</text>`;
const gl=[0,.5,1].map(t=>`<line x1="10" x2="690" y1="${14+t*206}" y2="${14+t*206}" class="gl"/>`).join('');

/* charts (SVG) */
function area(v,hi){const n=v.filter(x=>x!=null);if(!n.length)return emp;
 const xs=i=>10+(i+.5)*680/12;let lo=Math.min(...n),up=Math.max(...n);if(lo===up){lo-=1;up+=1}const pd=(up-lo)*.15;lo-=pd;up+=pd;
 const ys=x=>14+(1-(x-lo)/(up-lo))*206,sg=[];let s=[];v.forEach((x,i)=>{if(x==null){s.length&&sg.push(s);s=[]}else s.push([xs(i),ys(x),i,x])});s.length&&sg.push(s);
 const P=s=>s.map(q=>q[0].toFixed(1)+','+q[1].toFixed(1)).join('L');
 return`<svg viewBox="0 0 700 250" class="ch">${gl}${sg.map(s=>`<path d="M${s[0][0]},220L${P(s)}L${s.at(-1)[0]},220Z" class="af"/><path d="M${P(s)}" class="ln"/>`).join('')}
 ${sg.flat().map(q=>`<circle cx="${q[0]}" cy="${q[1]}" r="${q[2]===hi?6:3.5}" class="pt ${q[2]===hi?'on':''}" data-m="${q[2]}"><title>${M[q[2]]}: ${fmt(q[3])}</title></circle>`).join('')}${M.map((_,i)=>xl(i,hi)).join('')}</svg>`}
function bars(S,st,hi){const mx=Math.max(0,...M.map((_,i)=>st?S.reduce((a,s)=>a+(s.v[i]||0),0):Math.max(0,...S.map(s=>s.v[i]||0))));if(!mx)return emp;
 const gw=680/12,k=st?1:S.length,bw=gw*.72/k;let o=`<svg viewBox="0 0 700 250" class="ch">${gl}`;
 M.forEach((m,i)=>{const x0=10+i*gw+gw*.14;let acc=0;S.forEach((s,j)=>{const v=s.v[i];if(v==null)return;const h=v/mx*206,y=st?220-acc-h:220-h;if(st)acc+=h;
  o+=`<rect x="${(st?x0:x0+j*bw).toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(h,1).toFixed(1)}" rx="3" fill="${s.c}" opacity="${i===hi?1:.6}" data-m="${i}"><title>${m} · ${s.n}: ${fmt(v)}</title></rect>`});o+=xl(i,hi)});
 return o+'</svg>'+lg(S)}
function donut(P){const t=P.reduce((a,p)=>a+p.v,0);if(!t)return emp;let off=0;const C=2*Math.PI*52;
 return`<div class="dn"><svg viewBox="0 0 140 140" width="150">${P.map(p=>{const d=p.v/t*C,e=`<circle cx="70" cy="70" r="52" fill="none" stroke="${p.c}" stroke-width="16" stroke-dasharray="${d} ${C-d}" stroke-dashoffset="${-off}" transform="rotate(-90 70 70)"><title>${p.n}: ${p.v}</title></circle>`;off+=d;return e}).join('')}<text x="70" y="77" text-anchor="middle" class="dnt">${t}</text></svg>
 ${lg(P.map(p=>({n:`${p.n}: ${p.v}`,c:p.c})))}</div>`}
function tbl(g,hi,monthly,key){if(!g.rows.length)return emp;let rows=g.rows.slice(),s=srt[key];
 if(s)rows.sort((a,b)=>s.c<0?s.d*a[0].localeCompare(b[0]):s.d*((a[1][s.c]??-1e18)-(b[1][s.c]??-1e18)));
 return`<div class="wrap"><table><tr><th data-c="-1" data-k="${key}">Metric</th>${g.cols.map((c,i)=>`<th data-c="${i}" data-k="${key}" class="${monthly&&i===hi?'hi':''}">${esc(c)}${s&&s.c===i?(s.d>0?' ↑':' ↓'):''}</th>`).join('')}</tr>
 ${rows.map(r=>`<tr><td>${esc(r[0])}</td>${r[1].map((v,i)=>`<td class="${monthly&&i===hi?'hi':''}">${fmt(v)}</td>`).join('')}</tr>`).join('')}</table></div>`}

/* pages */
function pgOv(){const A=M.map(m=>D.sd.find(r=>r[0]===m)||[]),tot=A.map(r=>r[4]??null),pv=mo?tot[mo-1]:null,H=[['Total Score',tot[mo],pv]];
 CFG.headline.map(x=>new RegExp(x,'i')).forEach(re=>{const r=ovr(re);if(r){const v=ser(D.g.ov,r);H.push([r[0],v[mo],mo?v[mo-1]:null])}});
 const rag=[[/red/i,'#ef4444'],[/amber/i,'#f59e0b'],[/green/i,'#22c55e']].map(([re,c])=>{const r=ovr(re),v=r?ser(D.g.ov,r)[mo]:null;return r&&{n:r[0].replace('DB Health - ',''),v,c}}).filter(Boolean),mx=Math.max(...rag.map(x=>x.v||0),1);
 return`<div class="g4">${H.map(h=>stat(...h)).join('')}</div>
 <div class="g2"><div class="card"><div class="top"><div><h3>Total score trend</h3><p class="mu">Overall standardization score by month</p></div>${badge('Total',tot[mo],pv)}</div>${area(tot,mo)}</div>
 <div class="card"><h3>Database health</h3><p class="mu">RAG status · ${M[mo]}</p>${rank(rag.map(x=>({n:x.n,w:x.v/mx*100,t:fmt(x.v),c:x.c})))}</div></div>
 <div class="card"><h3>Month by month</h3><p class="mu">All headline metrics · selected month is highlighted</p>${tbl(D.g.ov,D.g.ov.cols.indexOf(M[mo]),1,'ov')}</div>`}
function pgGrp(k){const g=GR[k],R=D.g.ov.rows.filter(r=>g.re.test(r[0]));if(!R.length)return'<div class="card empty">No matching metrics found in “1. Overall”.</div>';
 const i=Math.min(sel[k]||0,R.length-1),r=R[i],v=ser(D.g.ov,r);
 const ex=(g.x||[]).map(x=>{const S=x.r.map((re,j)=>{const q=ovr(re);return q&&{n:q[0],c:x.c[j],v:ser(D.g.ov,q)}}).filter(Boolean);return S.length?`<div class="card"><h3>${x.t}</h3><p class="mu">Month by month</p>${bars(S,x.s,mo)}</div>`:''}).join('');
 return`<div class="g2"><div class="card"><div class="top"><div><div class="big">${fmt(v[mo])}</div><p class="mu">${esc(r[0])} · ${M[mo]}</p></div>${badge(r[0],v[mo],mo?v[mo-1]:null)}</div>${area(v,mo)}</div>
 <div class="card"><h3>Metrics</h3><p class="mu">Select one to chart</p>${R.map((x,j)=>{const s=ser(D.g.ov,x);return`<button class="ml ${j===i?'on':''}" data-i="${j}"><span>${esc(x[0])}</span>${spark(s)}<b>${fmt(s[mo])}</b></button>`}).join('')}</div></div>${ex?`<div class="ge">${ex}</div>`:''}`}
function pgStd(){const A=M.map(m=>D.sd.find(r=>r[0]===m)||[]),tot=A.map(r=>r[4]??null),nm=['Database Set-up','Out of System Tool','Validation'],C=['#3b82f6','#f97316','#22c55e'];
 const rows=D.kp.filter(r=>r[0]===M[mo]),ps=[...new Set(rows.map(r=>r[1]))],cnt=(a,k)=>a.filter(r=>r[6]===k).length;
 const pr=ps.map(p=>{const a=rows.filter(r=>r[1]===p),y=cnt(a,'Y'),n=cnt(a,'N'),q=y+n?y/(y+n)*100:0;return{n:p,w:q,t:y+n?Math.round(q)+'%':'–',c:q>=CFG.good?'#22c55e':q>=CFG.warn?'#f59e0b':'#ef4444'}});
 const f=rows.filter(r=>(!fp||r[1]===fp)&&(!fs||r[6]===fs));
 return`<div class="g2"><div class="card"><div class="top"><div><div class="big">${fmt(tot[mo])}</div><p class="mu">Total score · ${M[mo]}</p></div>${badge('Total',tot[mo],mo?tot[mo-1]:null)}</div>${area(tot,mo)}</div>
 <div class="card"><h3>Compliance by process</h3><p class="mu">% of applicable KPIs met · ${M[mo]}</p>${rank(pr)}</div></div>
 <div class="g2"><div class="card"><h3>Score by area</h3><p class="mu">Database set-up, out-of-system tool, validation</p>${bars(nm.map((n,j)=>({n,c:C[j],v:A.map(r=>r[j+1]??null)})),0,mo)}</div>
 <div class="card"><h3>KPI status</h3><p class="mu">${M[mo]} · ${rows.length} KPIs</p>${donut([{n:'Compliant',v:cnt(rows,'Y'),c:'#22c55e'},{n:'Non-compliant',v:cnt(rows,'N'),c:'#ef4444'},{n:'N/A',v:cnt(rows,'NA'),c:'#71717a'}])}</div></div>
 <div class="card"><div class="top"><div><h3>KPI detail</h3><p class="mu">${f.length} shown</p></div><div style="display:flex;gap:8px;flex-wrap:wrap"><select id="fp"><option value="">All processes</option>${ps.map(p=>`<option ${p===fp?'selected':''}>${esc(p)}</option>`).join('')}</select>
 <select id="fs"><option value="">All status</option>${[['Y','Compliant'],['N','Non-compliant'],['NA','N/A']].map(([k,n])=>`<option value="${k}" ${k===fs?'selected':''}>${n}</option>`).join('')}</select></div></div>
 ${f.length?`<div class="wrap"><table><tr><th class="l">Process</th><th class="l">KPI</th><th>Actual</th><th>Target</th><th>Status</th></tr>${f.slice(0,400).map(r=>`<tr><td class="l">${esc(r[1])}</td><td class="l" style="white-space:normal">${esc(r[3])}</td><td>${esc(r[4]??'–')}</td><td>${esc(r[5]??'–')}</td><td><span class="tg ${r[6]}">${r[6]}</span></td></tr>`).join('')}</table></div>`:emp}</div>`}
function pgVt(){const g=D.g.vt,pk=re=>g.rows.find(r=>re.test(r[0])),mk=(r,c)=>{if(!r)return emp;const mx=Math.max(...r[1].map(x=>x||0),1);return rank(g.cols.map((n,i)=>({n,w:(r[1][i]||0)/mx*100,t:fmt(r[1][i]),c})))};
 return`<div class="ge"><div class="card"><h3>Clients by vertical</h3><p class="mu">Ranked by count</p>${mk(pk(/^clients$/i),'#3b82f6')}</div><div class="card"><h3>Databases by vertical</h3><p class="mu">Ranked by count</p>${mk(pk(/^database/i),'#22c55e')}</div></div>
 <div class="card"><h3>All vertical metrics</h3><p class="mu">Click a column to sort</p>${tbl(g,-1,0,'vt')}</div>
 <div class="card"><h3>Database overview by month</h3><p class="mu">Clients and databases per vertical</p>${tbl(D.g.db,D.g.db.cols.indexOf(M[mo]),1,'db')}</div>`}

function render(){
 if(!CFG){$('#body').innerHTML='<div class="card empty">Connecting to the dashboard server…</div>';return}
 if(!NAV.some(s=>s[1].some(i=>i[0]===tab)))tab='ov';
 $('#nav').innerHTML=NAV.map(([h,it])=>`<div class="nh">${h}</div>`+it.map(([k,n,ic])=>`<button class="ni ${k===tab?'on':''}" data-t="${k}"><span>${ic}</span>${esc(n)}</button>`).join('')).join('');
 $('#ttl').textContent=NAV.flatMap(x=>x[1]).find(x=>x[0]===tab)[1];
 const b=$('#body');
 if(!D){$('#meta').textContent='No data';b.innerHTML=`<div class="card empty"><b>Can’t show data yet</b><br>${esc(ERR)}</div>`;return}
 if(mo<0)mo=Math.max(lastMonth(),0);
 $('#ms').innerHTML=M.map((m,i)=>`<option value="${i}" ${i===mo?'selected':''}>${m}${i===cur?' · current':''}</option>`).join('');
 $('#meta').innerHTML=`${esc(D.file)}<br>Updated ${new Date(D.at).toLocaleString([],{dateStyle:'medium',timeStyle:'short'})}${D.warn&&D.warn.length?`<br><span style="color:var(--wa)">⚠ ${esc(D.warn.join('; '))}</span>`:''}`;
 b.innerHTML=tab==='ov'?pgOv():tab==='std'?pgStd():tab==='vt'?pgVt():pgGrp(tab);
}
document.addEventListener('click',e=>{const t=e.target.closest('[data-t],[data-m],[data-i],th[data-c]');if(!t)return;
 if(t.dataset.t){tab=t.dataset.t;history.replaceState(null,'','#'+tab)}else if(t.dataset.m)mo=+t.dataset.m;else if(t.dataset.i)sel[tab]=+t.dataset.i;
 else{const c=+t.dataset.c,k=t.dataset.k,s=srt[k];srt[k]=s&&s.c===c?{c,d:-s.d}:{c,d:-1}}
 render()});
document.addEventListener('change',e=>{const i=e.target.id;if(i==='fp')fp=e.target.value;else if(i==='fs')fs=e.target.value;else if(i==='ms')mo=+e.target.value;else return;render()});
$('#up').onclick=()=>{pull(true);toast('Refreshed')};
$('#th').onclick=()=>{const h=document.documentElement;h.dataset.theme=h.dataset.theme==='dark'?'light':'dark'};
render();pull(true);
