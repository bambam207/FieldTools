// container.js

document.addEventListener('DOMContentLoaded', () => {
  // 1) Inject 6 rows into the objects table
  const tbody = document.querySelector('#objects-table tbody');
  tbody.innerHTML = '';
  for (let i = 1; i <= 6; i++) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i}</td>
      <td><input type="number" class="weight" min="0" step="any" placeholder="0"/></td>
      <td><input type="number" class="width"  min="0" step="any" placeholder="0"/></td>
    `;
    tbody.appendChild(tr);
  }

  // 2) Wire up Calculate button
  document.getElementById('calc-btn')
          .addEventListener('click', calculateBalance);

  // initial run
  calculateBalance();
});

function calculateBalance() {
  // --- Read & convert container size + margin ---
  const lUnit   = document.getElementById('length-unit').value;    // 'ft' or 'm'
  const rawSize = parseFloat(document.getElementById('container-size').value) || 0;
  let L = rawSize;
  if (lUnit === 'm') L *= 0.3048;
  const margin = lUnit === 'm' ? (8/12)*0.3048 : (8/12);
  const center = L / 2;
  const usable = L - 2 * margin;

  // --- Read weights & widths ---
  const weights = [...document.querySelectorAll('.weight')]
    .map(i => parseFloat(i.value) || 0);
  const widths  = [...document.querySelectorAll('.width')]
    .map(i => parseFloat(i.value) || 0);

  const totalW     = weights.reduce((s,w) => s + w, 0);
  const totalWidth = widths.reduce((s,w) => s + w, 0);

  // --- Warning on over‑length ---
  let warn = '';
  if (totalWidth > usable) {
    warn = `⚠️ Total width (${totalWidth.toFixed(2)}) exceeds usable (${usable.toFixed(2)})`;
  }

  // --- Prepare positions array ---
  const positions = Array(weights.length).fill(null);

  // --- Anchor Object #1 ---
  const firstRaw = parseFloat(document.getElementById('first-pos').value);
  const half0    = widths[0] / 2;
  const min0     = margin + half0;
  const max0     = L - margin - half0;
  let p0 = isNaN(firstRaw)
    ? min0
    : Math.min(Math.max(firstRaw, min0), max0);
  if (!isNaN(firstRaw) && p0 !== firstRaw) {
    warn += (warn ? ' ' : '') + `⚠️ Obj 1 clamped to ${p0.toFixed(2)}`;
  }
  positions[0] = p0;

  // --- Running torque about center ---
  let torqueSum = weights[0] * (p0 - center);

  // --- Sequential torque‑balance for Objects 2…6 ---
  for (let i = 1; i < weights.length; i++) {
    const Wi = weights[i], wi = widths[i];
    if (Wi <= 0 || wi <= 0) continue;

    // solve Wi*(pi - center) + torqueSum = 0  ⇒  di = −torqueSum / Wi
    const di = -torqueSum / Wi;
    let pi = center + di;

    // clamp into the 8" margins
    const half = wi / 2;
    const minP = margin + half;
    const maxP = L - margin - half;
    if (pi < minP || pi > maxP) {
      const old = pi;
      pi = Math.min(Math.max(pi, minP), maxP);
      warn += (warn ? ' ' : '') +
        `⚠️ Obj ${i+1} clamped from ${old.toFixed(2)} to ${pi.toFixed(2)}`;
    }

    positions[i] = pi;
    torqueSum += Wi * (pi - center);
  }

  // --- Render outputs ---
  document.getElementById('total-weight').textContent =
    `${totalW.toFixed(2)} ${document.getElementById('weight-unit').value}`;
  document.getElementById('container-length-display').textContent =
    `${L.toFixed(2)}`;
  document.getElementById('len-unit-label').textContent =
    document.getElementById('length-unit').value;
  document.getElementById('warning').textContent = warn;

  const list = document.getElementById('positions-list');
  list.innerHTML = '';
  positions.forEach((p,i) => {
    if (p !== null && weights[i] > 0 && widths[i] > 0) {
      const li = document.createElement('li');
      li.textContent = `Obj ${i+1}: CG at ${p.toFixed(2)} ${document.getElementById('length-unit').value}`;
      list.appendChild(li);
    }
  });
}