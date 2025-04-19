// container.js

document.addEventListener('DOMContentLoaded', () => {
  // build 6 rows
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
  // 1) Read units & size
  const wUnit   = document.getElementById('weight-unit').value;
  const lUnit   = document.getElementById('length-unit').value;
  const rawSize = parseFloat(document.getElementById('container-size').value) || 0;

  // 2) Convert container length & margin
  let L = rawSize; if (lUnit === 'm') L *= 0.3048;
  const marginFt = 8/12; let m = marginFt;
  if (lUnit === 'm') m *= 0.3048;
  const center = L/2;
  const usable = L - 2*m;

  // 3) Read weights & widths
  const weights = [...document.querySelectorAll('.weight')]
                    .map(i => parseFloat(i.value) || 0);
  const widths  = [...document.querySelectorAll('.width')]
                    .map(i => parseFloat(i.value) || 0);

  // 4) Totals & warn if over‑length
  const totalW     = weights.reduce((s,w) => s + w, 0);
  const totalWidth = widths.reduce((s,w) => s + w, 0);
  let warn = '';
  if (totalWidth > usable) {
    warn = `⚠️ Total width (${totalWidth.toFixed(2)}) exceeds usable (${usable.toFixed(2)})`;
  }

  // 5) Prepare positions
  const positions = Array(weights.length).fill(null);

  // 6) Anchor object 1
  const firstRaw = parseFloat(document.getElementById('first-pos').value);
  const half0    = widths[0] / 2;
  const min0     = m + half0;
  const max0     = L - m - half0;
  let p0 = isNaN(firstRaw)
    ? min0
    : Math.min(Math.max(firstRaw, min0), max0);
  if (!isNaN(firstRaw) && p0 !== firstRaw) {
    warn += (warn ? ' ' : '') + `⚠️ Obj 1 clamped to ${p0.toFixed(2)}`;
  }
  positions[0] = p0;

  // 7) Running torque about center
  let torqueSum = weights[0] * (p0 - center);

  // 8) Sequential torque‑balance for objects 2…6
  for (let i = 1; i < weights.length; i++) {
    const Wi = weights[i], wi = widths[i];
    if (Wi <= 0 || wi <= 0) continue;

    // solve Wi*(pi - center) + torqueSum = 0
    const di = -torqueSum / Wi;
    let pi = center + di;

    // clamp into 8" margins
    const half = wi / 2;
    const minP = m + half;
    const maxP = L - m - half;
    if (pi < minP || pi > maxP) {
      const old = pi;
      pi = Math.min(Math.max(pi, minP), maxP);
      warn += (warn ? ' ' : '') +
        `⚠️ Obj ${i+1} clamped from ${old.toFixed(2)} to ${pi.toFixed(2)}`;
    }

    positions[i] = pi;
    torqueSum += Wi * (pi - center);
  }

  // 9) Render everything
  document.getElementById('total-weight').textContent =
    `${totalW.toFixed(2)} ${wUnit}`;
  document.getElementById('container-length-display').textContent =
    `${L.toFixed(2)}`;
  document.getElementById('len-unit-label').textContent = lUnit;
  document.getElementById('warning').textContent = warn;

  const list = document.getElementById('positions-list');
  list.innerHTML = '';
  positions.forEach((p, i) => {
    if (p !== null && weights[i] > 0 && widths[i] > 0) {
      const li = document.createElement('li');
      li.textContent = `Obj ${i+1}: CG at ${p.toFixed(2)} ${lUnit} from left`;
      list.appendChild(li);
    }
  });
}