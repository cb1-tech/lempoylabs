import test from 'node:test';
import assert from 'node:assert/strict';
import {invoiceHTML,invoicePresentation,label} from '../invoice-template.js';
import {totals} from '../domain.js';

function invoice(taxMode='exclusive'){
 return {number:'QA-1',date:'2026-09-18',due:'2026-10-02',periodStart:'2026-09-01',periodEnd:'2026-09-30',language:'bi',currency:'JPY',
 ...totals([{description:'制作 / Design',qty:1,unit:'式',price:11000,taxRate:10}],'JPY',taxMode),
 snapshot:{profile:{displayName:'Saved issuer',issuer:'Saved legal name',taxMode,qualified:false},client:{name:'Saved client'},banks:[{bankName:'Saved bank',type:'普通',number:'1234567',holder:'Saved holder'}]}};
}
test('print presentation preserves exclusive and inclusive saved financial amounts',()=>{
 for(const mode of ['exclusive','inclusive']){const i=invoice(mode),before=JSON.stringify(i),v=invoicePresentation(i);invoiceHTML(i);assert.equal(JSON.stringify(i),before);assert.deepEqual(v.totals,[['subtotal',i.subtotal],['shipping',0],['discount',0],['tax',i.tax],['total',i.total]]);assert.equal(v.rows[0][0],i.periodStart);assert.ok(invoiceHTML(i).includes('Saved bank'));}
});
test('optional invoice fields are escaped and old snapshots remain renderable',()=>{
 const i=invoice();assert.ok(invoiceHTML(i).includes('Saved issuer'));i.subject='<img onerror="alert(1)">';i.items[0].date='2026-09-10';i.snapshot.profile.postalCode='100-0001';assert.equal(invoicePresentation(i).rows[0][0],'2026-09-10');const html=invoiceHTML(i);assert.ok(!html.includes('<img onerror'));assert.ok(html.includes('100-0001'));assert.ok(html.includes('Notes')===false);
});
test('language and registration status follow the invoice snapshot',()=>{
 const i=invoice();assert.equal(label(i,'title'),'請求書 / INVOICE');i.language='ja';assert.equal(label(i,'title'),'請求書');i.language='en';assert.equal(label(i,'title'),'INVOICE');i.snapshot.profile.registration='T1234567890123';assert.ok(!invoiceHTML(i).includes('T1234567890123'));i.snapshot.profile.qualified=true;assert.ok(invoiceHTML(i).includes('T1234567890123'));assert.ok(!invoiceHTML(i).includes('Not a qualified invoice'));
});
