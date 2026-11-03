(function(root){
'use strict';
const cents=n=>Math.round(Number(n)*100),BUFFER=10000;
function role(t){const text=`${t.merchant||''} ${t.description||''}`.toLowerCase(),cat=t.category||'';
 if(t.amount>0)return cat==='Salary'||/\b(salary|payroll|wages)\b/.test(text)?'salary':null;
 if(!(t.amount<0))return null;
 if(cat==='Sink Transfer'||/\bsink\b/.test(text))return 'sink';
 if(cat==='Mortgage'||/\b(mortgage|home loan)\b/.test(text))return 'mortgage';
 if(cat==='Bills / Set'||/\bset\b/.test(text))return 'set';
 if(cat==='Personal Allowance'||/\bpersonal allowance\b/.test(text))return 'personal';
 return null;
}
function calculate(state,start,end){const rows=state.transactions.filter(t=>t.date>=start&&t.date<=end&&Number.isFinite(t.amount)).map(t=>({...t,role:role(t)})).filter(t=>t.role);const sum=r=>rows.filter(t=>t.role===r).reduce((n,t)=>n+Math.abs(cents(t.amount)),0);const income=sum('salary'),mortgage=sum('mortgage'),set=sum('set'),personal=sum('personal'),sink=sum('sink');const missing=[];if(!income)missing.push('Salary deposit');if(!mortgage)missing.push('Mortgage transfer');if(!set)missing.push('Set transfer');if(rows.filter(t=>t.role==='personal').length<2)missing.push('Two personal allowance transfers');const fingerprint=JSON.stringify(rows.map(t=>[t.id,t.date,t.role,cents(t.amount)]).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))));const confirmed=state.paydayChecks?.[start]===fingerprint;return {income,mortgage,set,personal,sink,buffer:BUFFER,cap:Math.max(0,income-mortgage-set-personal-sink-BUFFER),shortfall:Math.max(0,mortgage+set+personal+sink+BUFFER-income),missing,fingerprint,confirmed,ready:!missing.length&&confirmed,rows};}
const api={calculate,role,BUFFER};if(typeof module!=='undefined')module.exports=api;else root.PocketPayday=api;
})(typeof globalThis!=='undefined'?globalThis:this);
