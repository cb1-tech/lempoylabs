import {money} from './domain.js';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const labels={title:['INVOICE','請求書'],number:['Invoice No.','請求書番号'],date:['Invoice Date','発行日'],due:['Due Date','支払期限'],bill:['Bill To','請求先'],issuer:['Issuer','発行者'],subject:['Subject','件名'],transaction:['Date','取引日'],description:['Description','品名・内容'],qty:['Qty','数量'],unit:['Unit','単位'],price:['Unit Price','単価'],amount:['Amount','金額'],subtotal:['Subtotal','小計'],shipping:['Shipping','送料'],discount:['Discount','値引き'],tax:['Tax','消費税'],total:['Total','合計'],payment:['Payment Details','お振込先'],options:['Payment Details','お振込先'],period:['Service period','対象期間'],note:['Notes','備考'],summary:['Invoice Amount','ご請求金額'],currency:['Currency','通貨'],registration:['Registration No.','登録番号'],notQualified:['Not a qualified invoice','適格請求書ではありません'],inclusive:['Unit prices include tax','単価は税込'],exclusive:['Unit prices exclude tax','単価は税抜'],continued:['Continued','続き']};
export const label=(i,k)=>i.language==='ja'?labels[k][1]:i.language==='en'?labels[k][0]:`${labels[k][1]} / ${labels[k][0]}`;
const addressLines=o=>[o.postalCode?`〒 ${o.postalCode}`:'',o.address].filter(Boolean);
export function bankLines(b){return [b.bankName?b.bankName+(b.bankCode?` (${b.bankCode})`:''):b.nickname,b.branch?b.branch+(b.branchCode?` (${b.branchCode})`:''):'',[b.type,b.number].filter(Boolean).join(' '),b.holder,b.swift?`SWIFT/BIC: ${b.swift}`:'',b.iban?`IBAN: ${b.iban}`:'',b.international,b.instructions].filter(Boolean)}
export function invoicePresentation(i){
 const p=i.snapshot.profile,c=i.snapshot.client;
 return {profile:p,client:c,banks:i.snapshot.banks||[],issuer:[p.displayName,p.issuer!==p.displayName?p.issuer:'',...addressLines(p),p.email,p.phone,p.website].filter(Boolean),recipient:[c.name,c.contact,...addressLines(c)].filter(Boolean),subject:i.subject||'',
  // These are presentation-only zero rows: the existing calculation has no adjustments.
  totals:[['subtotal',i.subtotal],['shipping',0],['discount',0],['tax',i.tax],['total',i.total]],
  registration:p.qualified&&/^T\d{13}$/.test(p.registration||'')?`${label(i,'registration')}: ${p.registration}`:!p.qualified?label(i,'notQualified'):'',
  rows:i.items.map(x=>[x.date||i.periodStart||i.date,x.description,String(x.qty),x.unit||'',money(x.price,i.currency),money(x.amount,i.currency)])};
}
const columns=['transaction','description','qty','unit','price','amount'];
const labelHTML=(i,k)=>i.language==='bi'?`${esc(labels[k][1])}<span class="inv-en">${esc(labels[k][0])}</span>`:esc(label(i,k));
export function invoiceHTML(i){const v=invoicePresentation(i),p=v.profile;return `<article class="invoice-paper" lang="${i.language==='en'?'en':'ja'}">
 <header class="inv-header"><div class="inv-brand">${p.logo?`<img src="${esc(p.logo)}" alt="${esc(p.displayName)}">`:''}<h2>${esc(p.displayName)}</h2></div><h1>${labelHTML(i,'title')}</h1></header>
 ${i.state==='Cancelled'?'<p class="inv-cancelled">取消 / CANCELLED</p>':''}
 <div class="inv-parties"><section><h3>${labelHTML(i,'bill')}</h3><p class="inv-recipient">${esc(v.recipient[0])}</p>${v.recipient.slice(1).map(x=>`<p>${esc(x)}</p>`).join('')}</section><section><dl class="inv-meta">${[['number',i.number||'PREVIEW'],['date',i.date],['due',i.due]].map(([k,value])=>`<div><dt>${labelHTML(i,k)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl><h3>${labelHTML(i,'issuer')}</h3>${v.issuer.filter(x=>x!==p.displayName).map(x=>`<p>${esc(x)}</p>`).join('')}</section></div>
 ${v.subject?`<p class="inv-subject"><strong>${esc(label(i,'subject'))}</strong><br>${esc(v.subject)}</p>`:''}
 <div class="inv-summary"><span>${labelHTML(i,'summary')}</span><strong>${esc(money(i.total,i.currency))}</strong></div>
 <p class="inv-context">${esc(label(i,'period'))}: ${esc(i.periodStart)} - ${esc(i.periodEnd)}<br>${esc(label(i,'currency'))}: ${esc(i.currency)} · ${esc(label(i,p.taxMode==='inclusive'?'inclusive':'exclusive'))}</p>
 <table class="inv-items"><colgroup>${[11,39,7,8,17,18].map(w=>`<col style="width:${w}%">`).join('')}</colgroup><thead><tr class="inv-print-reference"><th colspan="6">${esc(label(i,'title'))} · ${esc(i.number||'PREVIEW')}</th></tr><tr>${columns.map(k=>`<th>${labelHTML(i,k)}</th>`).join('')}</tr></thead><tbody>${v.rows.map(row=>`<tr>${row.map((cell,n)=>`<td class="${n===1?'inv-description':n>=4?'inv-money':''}">${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>
 <div class="inv-settlement"><section class="inv-totals"><table><tbody>${v.totals.map(([key,value])=>`<tr class="${key==='total'?'inv-grand-total':''}"><th>${esc(label(i,key))}</th><td>${esc(money(value,i.currency))}</td></tr>`).join('')}</tbody></table></section>
 <section class="inv-payment"><h3>${labelHTML(i,'payment')}</h3>${v.banks.map(b=>`<div class="inv-bank">${bankLines(b).map(x=>`<p>${esc(x)}</p>`).join('')}</div>`).join('')}</section></div>
 ${i.notes?`<section class="inv-notes"><h3>${labelHTML(i,'note')}</h3><p>${esc(i.notes)}</p></section>`:''}
 <footer class="inv-footer">${v.registration?`<p>${esc(v.registration)}</p>`:''}${p.footer?`<p>${esc(p.footer)}</p>`:''}</footer></article>`}

// PDF uses the same presentation values as print; it never recalculates invoice amounts.
export async function renderInvoicePDF(i,PDFLib,fontkit,fontBytes){
 const {PDFDocument,StandardFonts,rgb}=PDFLib,doc=await PDFDocument.create();doc.registerFontkit(fontkit);
 const jp=await doc.embedFont(fontBytes,{subset:false}),latin=await doc.embedFont(StandardFonts.Helvetica);
 const ink=rgb(.10,.17,.24),muted=rgb(.36,.42,.48),rule=rgb(.80,.84,.87),wash=rgb(.95,.97,.98);
 const left=45,right=550.28,width=right-left,bottom=55,top=793.89;
 let page,y;const v=invoicePresentation(i),p=v.profile;
 const fontFor=c=>/^[\x20-\x7e\u00a0-\u00ff]$/.test(c)?latin:jp;
 const clean=t=>String(t??'').replace(/\t/g,'    ').replace(/[\x00-\x08\x0b-\x1f]/g,'');
 const measure=(t,s)=>[...clean(t)].reduce((a,c)=>a+fontFor(c).widthOfTextAtSize(c,s),0);
 const draw=(t,x,baseline,size=9,color=ink)=>{for(const c of clean(t)){const f=fontFor(c);page.drawText(c,{x,y:baseline,size,font:f,color});x+=f.widthOfTextAtSize(c,size)}};
 const wrap=(text,w,size=9)=>clean(text).split('\n').flatMap(para=>{const result=[];let line='';for(const c of para){if(line&&measure(line+c,size)>w){const space=line.lastIndexOf(' ');if(space>line.length*.45){result.push(line.slice(0,space));line=line.slice(space+1)}else{result.push(line);line=''}}line+=c}result.push(line);return result});
 const line=(at=y)=>page.drawLine({start:{x:left,y:at},end:{x:right,y:at},thickness:.6,color:rule});
 const addPage=(continuation=true)=>{page=doc.addPage([595.28,841.89]);y=top;if(continuation){const text=`${label(i,'title')} · ${i.number||'PREVIEW'} · ${label(i,'continued')}`;for(const t of wrap(text,width,9)){draw(t,left,y,9,muted);y-=14}if(i.state==='Cancelled'){draw('取消 / CANCELLED',left,y,9);y-=14}line(y-3);y-=23}};
 const ensure=h=>{if(y-h<bottom)addPage()};
 const textBlock=(text,{size=9,w=width,x=left,gap=5,keep=false}={})=>{const lines=wrap(text,w,size),leading=size*1.55;if(keep&&lines.length*leading<650)ensure(lines.length*leading+gap);for(const t of lines){ensure(leading);draw(t,x,y,size);y-=leading}y-=gap};
 const section=(key)=>{ensure(45);line();y-=19;draw(label(i,key),left,y,10);y-=21};
 addPage(false);
 let logo;if(p.logo){const bytes=Uint8Array.from(atob(p.logo.split(',')[1]),c=>c.charCodeAt(0));logo=p.logo.startsWith('data:image/png')?await doc.embedPng(bytes):await doc.embedJpg(bytes);const scale=Math.min(110/logo.width,42/logo.height);page.drawImage(logo,{x:left,y:y-logo.height*scale,width:logo.width*scale,height:logo.height*scale});}
 const brand=wrap(p.displayName||p.issuer||'',310,17);let brandY=y-(logo?57:17);
 for(const text of brand){if(brandY<bottom+50){y=brandY;addPage();brandY=y}draw(text,left,brandY,17);brandY-=25}
 const titleSize=i.language==='bi'?21:23;
 draw(i.language==='en'?'INVOICE':'請求書',right-measure(i.language==='en'?'INVOICE':'請求書',titleSize),top-20,titleSize);
 if(i.language==='bi')draw('INVOICE',right-measure('INVOICE',10),top-41,10,muted);
 y=Math.min(brandY-6,top-54);line();y-=20;
 if(i.state==='Cancelled')textBlock('取消 / CANCELLED',{size:12});
 const recipient=[label(i,'bill'),...v.recipient];
 const issuer=[`${label(i,'number')}: ${i.number||'PREVIEW'}`,`${label(i,'date')}: ${i.date}`,`${label(i,'due')}: ${i.due}`,'',label(i,'issuer'),...v.issuer.filter(x=>x!==p.displayName)];
 const a=recipient.flatMap(t=>wrap(t,245,9)),b=issuer.flatMap(t=>wrap(t,235,9));
 for(let n=0;n<Math.max(a.length,b.length);n++){ensure(12);if(a[n])draw(a[n],left,y,9);if(b[n])draw(b[n],315,y,9);y-=12}y-=12;
 if(v.subject)textBlock(`${label(i,'subject')}: ${v.subject}`,{size:10,keep:true});
 ensure(76);page.drawRectangle({x:left,y:y-43,width,height:49,color:wash});draw(label(i,'summary'),left+12,y-15,10);
 const totalText=money(i.total,i.currency),totalSize=Math.min(23,230/Math.max(1,measure(totalText,1)));draw(totalText,right-12-measure(totalText,totalSize),y-22,totalSize);y-=60;
 textBlock(`${label(i,'period')}: ${i.periodStart} - ${i.periodEnd}\n${label(i,'currency')}: ${i.currency} · ${label(i,p.taxMode==='inclusive'?'inclusive':'exclusive')}`,{size:8,gap:13});
 const widths=[64,185,34,39,89,94.28],starts=[];widths.reduce((x,w,n)=>(starts[n]=x,x+w),left);
 const tableHead=()=>{ensure(53);page.drawRectangle({x:left,y:y-31,width,height:35,color:wash});columns.forEach((key,n)=>{const x=starts[n]+5;if(i.language==='bi'){draw(labels[key][1],x,y-9,8);draw(labels[key][0],x,y-22,7,muted)}else draw(label(i,key),x,y-15,8)});y-=43};
 tableHead();
 for(const row of v.rows){
  const sizes=row.map((cell,n)=>n===0?8:n>=4?Math.min(9,(widths[n]-10)/Math.max(1,measure(cell,1))):9);
  const cells=row.map((cell,n)=>wrap(cell,widths[n]-10,sizes[n]));let offset=0,count=Math.max(...cells.map(c=>c.length));
  // Normal rows stay together; an exceptionally long description continues with repeated headings.
  if(count*14+10<620&&y-count*14-10<bottom){addPage();tableHead()}
  while(offset<count){if(y-24<bottom){addPage();tableHead()}const take=Math.min(count-offset,Math.max(1,Math.floor((y-bottom-10)/14)));
   for(let n=0;n<6;n++)for(let k=0;k<take;k++){const t=cells[n][offset+k];if(t!==undefined)draw(t,n>=4?starts[n]+widths[n]-5-measure(t,sizes[n]):starts[n]+5,y-k*14,sizes[n])}
   y-=take*14;line(y+2);y-=15;offset+=take;if(offset<count){addPage();tableHead()}
  }
 }
 y-=12;
 const bankText=v.banks.map(b=>bankLines(b).join('\n')).join('\n\n'),bankRows=wrap(bankText,226,9),settlementHeight=Math.max(116,bankRows.length*14+35);
 const sideBySide=settlementHeight<540;
 const tailHeight=(i.notes?wrap(i.notes,width,9).length*13.95+52:0)+((v.registration||p.footer)?wrap([v.registration,p.footer].filter(Boolean).join('\n'),width,8).length*12.4+24:0);
 const finalHeight=settlementHeight+tailHeight+10;ensure(sideBySide&&finalHeight<650?finalHeight:sideBySide?settlementHeight:127);const settlementTop=y;
 for(const [key,value] of v.totals){if(key==='total'){page.drawRectangle({x:285,y:y-8,width:right-285,height:25,color:wash})}const size=key==='total'?11:9;draw(label(i,key),295,y,size);const t=money(value,i.currency),s=Math.min(size,103/Math.max(1,measure(t,1)));draw(t,right-5-measure(t,s),y,s);y-=22}
 if(sideBySide){draw(label(i,'payment'),left,settlementTop,10);bankRows.forEach((t,n)=>draw(t,left,settlementTop-24-n*14,9));y=settlementTop-settlementHeight-5}
 else {y-=10;for(let n=0;n<v.banks.length;n++){const bank=bankLines(v.banks[n]).join('\n'),height=wrap(bank,width,9).length*14+50;if(height<650)ensure(height);section('payment');textBlock(bank,{keep:true,gap:12})}}
 if(i.notes){section('note');textBlock(i.notes,{gap:10})}
 if(v.registration||p.footer){ensure(40);line();y-=19;textBlock([v.registration,p.footer].filter(Boolean).join('\n'),{size:8})}
 const pages=doc.getPages();pages.forEach((pg,n)=>{page=pg;draw(`${n+1} / ${pages.length}`,right-30,27,8,muted)});
 doc.setTitle(i.number||'Invoice');doc.setProducer('iSingil');return doc.save();
}
