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
  document.getElementById('calc-btn').addEventListener('click', calculateBalance);
});

function calculateBalance() {
  // 1) Read units & container size
  const wUnit = document.getElementById('weight-unit').value;
  const lUnit = document.getElementById('length-unit').value;
  const rawSize = parseFloat(document.getElementById('container-size').value) || 0;

  // 2) Convert container length & margin
  let L = rawSize;                      // in ft
  if (lUnit === 'm') L *= 0.3048;
  const marginFt = 8/12;                // 8" in ft
  let m = marginFt;
  if (lUnit === 'm') m *= 0.3048;
  const center = L/2;
  const usable = L - 2*m;

  // 3) Gather weights & widths
  const weights = [...document.querySelectorAll('.weight')].map(i=>parseFloat(i.value)||0);
  const widths  = [...document.querySelectorAll('.width')]. map(i=>parseFloat(i.value)||0);

  // 4) Totals & warning
  const totalW     = weights.reduce((s,w)=>s+w,0);
  const totalWidth = widths.reduce((s,w)=>s+w,0);
  let warn = '';
  if (totalWidth > usable) {
    warn = `⚠️ Total width (${totalWidth.toFixed(2)}) exceeds usable (${usable.toFixed(2)})`;
  }

  // 5) Positions array
  const positions = Array(weights.length).fill(null);

  // 6) Place object #1
  const firstRaw = parseFloat(document.getElementById('first-pos').value);
  const half0 = widths[0]/2;
  const min0 = m + half0;
  const max0 = L - m - half0;
  let p0 = isNaN(firstRaw) ? min0 : Math.min(Math.max(firstRaw, min0), max0);
  if (!isNaN(firstRaw) && p0 !== firstRaw) {
    warn += (warn ? ' ' : '') + `⚠️ Obj 1 clamped into 8″ margin`;
  }
  positions[0] = p0;

  // 7) Pack‐shift‐clamp for all others
  // 7a) Pack: each next CG sits edge‐to‐edge from previous
  for (let i = 1; i < weights.length; i++) {
    const wPrev = widths[i-1], wCurr = widths[i];
    if (weights[i] > 0 && wCurr > 0) {
      positions[i] = positions[i-1] + (wPrev/2 + wCurr/2);
    }
  }

  // 7b) Shift: compute group CG, then shift all so CG = center
  const cgInit = positions.reduce((sum,p,i)=> sum + (p||0)*weights[i], 0) / (totalW||1);
  const shift  = center - cgInit;
  positions.forEach((_,i) => {
    if (positions[i] !== null) positions[i] += shift;
  });

  // 7c) Clamp: enforce 8" margins
  let clampedAny = false;
  positions.forEach((p,i) => {
    if (p === null) return;
    const half = widths[i]/2;
    const minP = m + half;
    const maxP = L - m - half;
    const cp = Math.min(Math.max(p, minP), maxP);
    if (cp !== p) {
      clampedAny = true;
      positions[i] = cp;
    }
  });
  if (clampedAny) {
    warn += (warn ? ' ' : '') + `⚠️ Some CGs were clamped into 8″ margin`;
  }

  // 8) Render results
  document.getElementById('total-weight').textContent =
    `${totalW.toFixed(2)} ${wUnit}`;
  document.getElementById('container-length-display').textContent =
    `${L.toFixed(2)}`;
  document.getElementById('len-unit-label').textContent = lUnit;
  document.getElementById('warning').textContent = warn;

  const list = document.getElementById('positions-list');
  list.innerHTML = '';
  positions.forEach((p,i) => {
    if (p !== null && weights[i] > 0 && widths[i] > 0) {
      const li = document.createElement('li');
      li.textContent = `Obj ${i+1}: CG at ${p.toFixed(2)} ${lUnit} from left`;
      list.appendChild(li);
    }
  });
}