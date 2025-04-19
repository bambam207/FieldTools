// container.js

document.addEventListener('DOMContentLoaded', () => {
  // inject six rows
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
  // 1) read units & container size
  const wUnit = document.getElementById('weight-unit').value;
  const lUnit = document.getElementById('length-unit').value;
  const rawSize = parseFloat(document.getElementById('container-size').value) || 0;

  // 2) convert length & margin
  let L = rawSize; if (lUnit==='m') L *= 0.3048;
  const marginFt = 8/12; // ft
  let m = marginFt; if (lUnit==='m') m *= 0.3048;
  const center = L/2;
  const usable = L - 2*m;

  // 3) gather inputs
  const weights = [...document.querySelectorAll('.weight')].map(i=>parseFloat(i.value)||0);
  const widths  = [...document.querySelectorAll('.width')]. map(i=>parseFloat(i.value)||0);

  // 4) totals & over-length warning
  const totalW     = weights.reduce((s,w)=>s+w,0);
  const totalWidth = widths.reduce((s,w)=>s+w,0);
  let warn = '';
  if (totalWidth > usable) {
    warn = `⚠️ Total width (${totalWidth.toFixed(2)}) exceeds usable (${usable.toFixed(2)})`;
  }

  // 5) prepare positions
  const positions = Array(weights.length).fill(null);

  // 6) anchor object 1
  const firstRaw = parseFloat(document.getElementById('first-pos').value);
  const half0 = widths[0]/2;
  const min0 = m + half0, max0 = L - m - half0;
  let p0 = isNaN(firstRaw) ? min0 : Math.min(Math.max(firstRaw, min0), max0);
  if (!isNaN(firstRaw) && p0!==firstRaw) {
    warn += (warn?' ':'')+`⚠️ Obj 1 clamped into 8″ margin`;
  }
  positions[0] = p0;

  // 7) pack objects 2…n edge‑to‑edge off the fixed p0
  let cursor = p0 + half0;
  for (let i = 1; i < positions.length; i++) {
    if (weights[i]>0 && widths[i]>0) {
      positions[i] = cursor + widths[i]/2;
      cursor += widths[i];
    }
  }

  // 8) compute CG_init
  const cgInit = positions.reduce((sum,p,i) => sum + (p||0)*weights[i], 0) / (totalW||1);
  const shift  = center - cgInit;

  // 9) shift only objects 2…n
  for (let i = 1; i < positions.length; i++) {
    if (positions[i] !== null) positions[i] += shift;
  }

  // 10) clamp objects 2…n into margins
  let clampedAny = false;
  for (let i = 1; i < positions.length; i++) {
    const p = positions[i];
    if (p === null) continue;
    const half = widths[i]/2;
    const minP = m + half, maxP = L - m - half;
    if (p < minP || p > maxP) {
      const old = p;
      positions[i] = Math.min(Math.max(p, minP), maxP);
      clampedAny = true;
      warn += (warn?' ':'')+`⚠️ Obj ${i+1} clamped from ${old.toFixed(2)} to ${positions[i].toFixed(2)}`;
    }
  }
  if (clampedAny) {
    warn += (warn?' ':'')+`⚠️ Some CGs were clamped into the 8″ margin`;
  }

  // 11) render results
  document.getElementById('total-weight').textContent =
    `${totalW.toFixed(2)} ${wUnit}`;
  document.getElementById('container-length-display').textContent =
    `${L.toFixed(2)}`;
  document.getElementById('len-unit-label').textContent = lUnit;
  document.getElementById('warning').textContent = warn;

  const list = document.getElementById('positions-list');
  list.innerHTML = '';
  positions.forEach((p,i) => {
    if (p !== null && weights[i]>0 && widths[i]>0) {
      const li = document.createElement('li');
      li.textContent = `Obj ${i+1}: CG at ${p.toFixed(2)} ${lUnit} from left`;
      list.appendChild(li);
    }
  });
}