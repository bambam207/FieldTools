// container.js

document.addEventListener('DOMContentLoaded', () => {
  // 1) Inject six rows
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

  // 2) Wire up reactive listeners on every relevant control
  const recalc = () => calculateBalance();
  // weight/unit/size/first‑pos inputs + all row inputs
  const controls = [
    ...document.querySelectorAll('#weight-unit, #length-unit, #container-size, #first-pos'),
    ...document.querySelectorAll('.weight'),
    ...document.querySelectorAll('.width'),
  ];
  controls.forEach(el => el.addEventListener('input', recalc));
  
  // 3) Do an initial calculation
  calculateBalance();
});

function calculateBalance() {
  // --- Read & convert inputs ---
  const wUnit   = document.getElementById('weight-unit').value;
  const lUnit   = document.getElementById('length-unit').value;
  const rawSize = parseFloat(document.getElementById('container-size').value) || 0;

  let L = rawSize;                      // base in feet
  if (lUnit === 'm') L *= 0.3048;       // convert to meters if needed

  const marginFt = 8/12;                // 8" in feet
  let m = marginFt;
  if (lUnit === 'm') m *= 0.3048;

  const center = L/2;
  const usable = L - 2*m;

  // Gather weights & widths
  const weights = [...document.querySelectorAll('.weight')]
    .map(i => parseFloat(i.value) || 0);
  const widths  = [...document.querySelectorAll('.width')]
    .map(i => parseFloat(i.value) || 0);

  const totalW     = weights.reduce((s,w) => s + w, 0);
  const totalWidth = widths.reduce((s,w) => s + w, 0);

  // Over‑length warning
  let warn = '';
  if (totalWidth > usable) {
    warn = `⚠️ Total width (${totalWidth.toFixed(2)}) exceeds usable (${usable.toFixed(2)})`;
  }

  // Prepare positions array
  const positions = Array(weights.length).fill(null);

  // --- Anchor Object #1 ---
  const firstRaw = parseFloat(document.getElementById('first-pos').value);
  const half0    = widths[0] / 2;
  const min0     = m + half0;
  const max0     = L - m - half0;
  let p0 = isNaN(firstRaw)
    ? min0
    : Math.min(Math.max(firstRaw, min0), max0);
  if (!isNaN(firstRaw) && p0 !== firstRaw) {
    warn += (warn ? ' ' : '') + `⚠️ Obj 1 clamped into 8″ margin`;
  }
  positions[0] = p0;

  // Running torque about center from Object 1 onward
  let torqueSum = weights[0] * (p0 - center);

  // --- Sequential torque‑balance for objects 2…6 ---
  for (let i = 1; i < weights.length; i++) {
    const Wi = weights[i], wi = widths[i];
    if (Wi <= 0 || wi <= 0) continue;

    // Solve Wi*(pi-center) + torqueSum = 0  ⇒  di = −torqueSum/Wi
    const di = -torqueSum / Wi;
    let pi = center + di;

    // Clamp into 8″ margin
    const half = wi/2;
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

  // --- Render outputs ---
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