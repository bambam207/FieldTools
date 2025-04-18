// container.js
document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.querySelector('#objects-table tbody');
  for (let i = 1; i <= 6; i++) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i}</td>
      <td><input type="number" class="weight" min="0" step="any" placeholder="0"/></td>
      <td><input type="number" class="width"  min="0" step="any" placeholder="0"/></td>
    `;
    tbody.appendChild(tr);
  }
  document.getElementById('calc-btn')
          .addEventListener('click', calculateBalance);
});

function calculateBalance() {
  // 1) Units and size
  const wUnit = document.getElementById('weight-unit').value;
  const lUnit = document.getElementById('length-unit').value;
  const size  = parseFloat(document.getElementById('container-size').value) || 0;

  // 2) Container length & margin
  let containerLen = size;
  if (lUnit === 'm') containerLen *= 0.3048;
  let margin = 8 / 12;
  if (lUnit === 'm') margin *= 0.3048;
  const center = containerLen / 2, usable = containerLen - 2 * margin;

  // 3) Inputs
  const weights = [...document.querySelectorAll('.weight')].map(i=>parseFloat(i.value)||0);
  const widths  = [...document.querySelectorAll('.width') ].map(i=>parseFloat(i.value)||0);
  const totalW     = weights.reduce((sum,w)=>sum+w,0);
  const totalWidth = widths.reduce((sum,w)=>sum+w,0);

  // 4) Warning
  let warn = '';
  if (totalWidth > usable) {
    warn = `⚠️ Total width (${totalWidth.toFixed(2)}) exceeds usable (${usable.toFixed(2)})`;
  }

  // 5) First‑pos override
  const firstRaw = parseFloat(document.getElementById('first-pos').value);
  let positions = Array(weights.length).fill(null);
  let cursor = margin;

  if (!isNaN(firstRaw)) {
    const half0 = widths[0]/2;
    const min0 = margin + half0, max0 = containerLen - margin - half0;
    let p0 = Math.min(Math.max(firstRaw, min0), max0);
    console.log('User first-pos:', firstRaw, 'clamped to', p0);
    if (p0 !== firstRaw) warn += (warn?' ':'')+`⚠️ Obj 1 clamped`;
    positions[0] = p0;
    cursor = p0 + half0;
  } else {
    positions[0] = cursor + widths[0]/2;
    console.log('Default Obj1 position:', positions[0]);
    cursor += widths[0];
  }

  // Pack rest
  for (let i = 1; i < widths.length; i++) {
    positions[i] = cursor + widths[i]/2;
    console.log(`Obj${i+1} default pos:`, positions[i]);
    cursor += widths[i];
  }

  // 6) Compute CG shift
  const cgInit = positions.reduce((s,p,i)=>s + p*weights[i],0)/(totalW||1);
  const shift  = center - cgInit;
  console.log('CG init:', cgInit, 'shift:', shift);
  positions = positions.map(p=>p===null?null:p+shift);

  // 7) Clamp margins
  let clampedAny = false;
  positions = positions.map((p,i)=>{
    if (p===null) return null;
    const half=widths[i]/2, minP=margin+half, maxP=containerLen-margin-half;
    const cp = Math.min(Math.max(p,minP),maxP);
    if (cp!==p) { clampedAny=true; console.log(`Obj${i+1} clamped from ${p} to ${cp}`); }
    return cp;
  });
  if (clampedAny) warn += (warn?' ':'')+`⚠️ Some CGs were clamped`;

  // 8) Render + debug
  console.log('Final positions:', positions);
  document.getElementById('total-weight').textContent = `${totalW.toFixed(2)} ${wUnit}`;
  document.getElementById('container-length-display').textContent = `${containerLen.toFixed(2)}`;
  document.getElementById('len-unit-label').textContent = lUnit;
  document.getElementById('warning').textContent = warn;

  const list = document.getElementById('positions-list');
  list.innerHTML = '';
  positions.forEach((p,i)=>{
    if (p!==null && weights[i]>0 && widths[i]>0) {
      const li = document.createElement('li');
      li.textContent = `Obj ${i+1}: CG at ${p.toFixed(2)} ${lUnit} from left`;
      list.appendChild(li);
    }
  });
}