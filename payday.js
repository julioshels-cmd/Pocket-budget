(function(root){
'use strict';
const cents=n=>Math.round(Number(n)*100),BUFFER=10000;
function role(t,state){const text=`${t.merchant||''} ${t.description||''}`.toLowerCase(),cat=t.category||'',override=state?.cashflowAdjustments?.[t.id];
 if(override==='ignore')return 'excluded';
 if(override==='deduction'&&t.amount<0)return 'otherDeduction';
 if(override==='credit'&&t.amount>0)return 'otherCredit';
 if(t.amount>0){if(cat==='Salary'||/\b(salary|payroll|wages)\b/.test(text))return 'salary';if(Object.hasOwn(state?.budgets||{},cat))return null;return 'unresolved'}
 if(!(t.amount<0))return null;
 if(cat==='Sink Transfer'||/\bsink\b/.test(text))return 'sink';
 if(cat==='Mortgage'||/\bhome\s+offset\b/.test(text))return 'mortgage';
 if(cat==='Bills / Set'||(/\bset\b/.test(text)&&(/\b(transfer|top up|to set)\b/.test(text)||/internal/i.test(cat))))return 'set';
 if(cat==='Personal Allowance'||cat==='Credit Card Payment'||/\b(personal allowance|discretionary)\b/.test(text))return 'personal';
 if(/^(internal transfer|transfer\s*\/\s*internal)$/i.test(cat))return 'unresolved';
 return null;
}
function parts(t,state){if(!Number.isFinite(t.amount)||!t.amount||role(t,state)||!Object.keys(state.budgets).length)return [];const amount=Math.abs(cents(t.amount)),sign=t.amount<0?1:-1,out=[];let used=0;for(const p of Array.isArray(t.splits)?t.splits:[]){const n=Math.max(0,Math.min(amount-used,cents(p.amount)||0));used+=n;if(n)out.push({category:Object.hasOwn(state.budgets,p.category)?p.category:'Review',amount:sign*n/100})}if(used<amount)out.push({category:Object.hasOwn(state.budgets,t.category)?t.category:'Review',amount:sign*(amount-used)/100});return out}
function spending(state,start,end){const sums=Object.fromEntries(Object.keys(state.budgets).map(c=>[c,0]));let review=0;for(const t of state.transactions){if(t.date<start||t.date>end)continue;for(const p of parts(t,state)){if(p.category==='Review')review+=cents(p.amount);else sums[p.category]+=cents(p.amount)}}return {sums:Object.fromEntries(Object.entries(sums).map(([c,n])=>[c,n/100])),review:review/100,spent:(Object.values(sums).reduce((a,b)=>a+b,0)+review)/100}}
function calculate(state,start,end){const rows=state.transactions.filter(t=>t.date>=start&&t.date<=end&&Number.isFinite(t.amount)).map(t=>({...t,role:role(t,state)})).filter(t=>t.role);const sum=r=>rows.filter(t=>t.role===r).reduce((n,t)=>n+Math.abs(cents(t.amount)),0);const income=sum('salary'),mortgage=sum('mortgage'),set=sum('set'),personal=sum('personal'),sink=sum('sink'),otherDeduction=sum('otherDeduction'),otherCredit=sum('otherCredit'),unresolved=rows.filter(t=>t.role==='unresolved'),carry=cents(state.carryForwards?.[start]||0);const missing=[];if(!income)missing.push('Salary deposit');if(!mortgage)missing.push('Mortgage transfer');if(!set)missing.push('Set transfer');if(rows.filter(t=>t.role==='personal').length<2)missing.push('Two personal allowance transfers');if(unresolved.length)missing.push(`${unresolved.length} other cash movement(s) to review`);const fingerprint=JSON.stringify({rows:rows.map(t=>[t.id,t.date,t.role,cents(t.amount)]).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))),carry});const confirmed=state.paydayChecks?.[start]===fingerprint;const raw=income+otherCredit+carry-mortgage-set-personal-sink-otherDeduction-BUFFER;return {income,mortgage,set,personal,sink,otherDeduction,otherCredit,carry,buffer:BUFFER,cap:Math.max(0,raw),shortfall:Math.max(0,-raw),unresolved,missing,fingerprint,confirmed,ready:!missing.length&&confirmed,rows};}
const api={calculate,role,parts,spending,BUFFER};if(typeof module!=='undefined')module.exports=api;else root.PocketPayday=api;
})(typeof globalThis!=='undefined'?globalThis:this);
