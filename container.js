// container.js

document.addEventListener('DOMContentLoaded', () => {
  // 1) Inject six rows
  const tbody = document.querySelector('#objects-table tbody');
  tbody.innerHTML = '';
  for (let i = 1; i <= 6; i++) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i}</td>
      <td><input type="number" class="weight"   min="0" step="any" placeholder="0"/></td>
      <td><input type="number" class="width"    min="0" step="any" placeholder="0"/></td>
    `;
    tbody.appendChild(tr);
  }

  // 2) Recalculate on button click (or you can wire to 'input' events)
  document.getElementById('calc-btn')
          .addEventListener('click', calculateBalance);

  // initial draw
  calculateBalance();
});

function calculateBalance() {
  // --- 1) Container & margin ---
  const lUnit   = document.getElementById('length-unit').value;    // 'ft' or 'm'
  const rawSize = parseFloat(document.getElementById('container-size').value) || 0;
  let   L       = rawSize;
  if (lUnit === 'm') L *= 0.3048;
  const margin  = lUnit === 'm' ? (8/12) * 0.3048 : (8/12);
  const center  = L / 2;

  // --- 2) Read weights & widths ---
  const weights = Array.from(document.querySelectorAll('.weight'))
                       .map(el => parseFloat(el.value) || 0);
  const widths  = Array.from(document.querySelectorAll('.width'))
                       .map(el => parseFloat(el.value) || 0);

  // --- 3) Totals & warning ---
  const totalWidth = widths.reduce((a,b)=>a+b, 0);
  let warn = '';
  if (totalWidth > (L - 2*margin)) {
    warn = `⚠️ Total width (${totalWidth.toFixed(2)}) exceeds usable (${(L-2*margin).toFixed(2)})`;
  }

  // --- 4) Prepare positions array ---
  const positions = Array(weights.length).fill(null);

  // --- 5) Anchor Object #1 ---
  const firstRaw = parseFloat(document.getElementById('first-pos').value);
  const half0    = widths[0]/2;
  const min0     = margin + half0;
  const max0     = L - margin - half0;
  let p0 = isNaN(firstRaw)
    ? min0
    : Math.min(Math.max(firstRaw, min0), max0);
  if (!isNaN(firstRaw) && p0 !== firstRaw) {
    warn += (warn?' ':'') + `⚠️ Obj 1 clamped to ${p0.toFixed(2)}`;
  }
  positions[0] = p0;

  // --- 6) Running torque about container center ---
  //    τ = Σ Wj*(pj - center)
  let torque = weights[0] * (p0 - center);

  // --- 7) Sequential torque‐balance for objects 2…6 ---
  for (let i = 1; i < weights.length; i++) {
    const W = weights[i], w = widths[i];
    if (W <= 0 || w <= 0) continue;

    // solve W*(pi - center) + torque = 0  ⇒  di = -torque / W
    const di = -torque / W;
    let pi = center + di;

    // clamp into the 8" margins
    const half = w/2;
    const minP = margin + half;
    const maxP = L - margin - half;
    if (pi < minP || pi > maxP) {
      const old = pi;
      pi = Math.min(Math.max(pi, minP), maxP);
      warn += (warn?' ':'') + `⚠️ Obj ${i+1} clamped from ${old.toFixed(2)} to ${pi.toFixed(2)}`;
    }

    positions[i] = pi;
    torque += W * (pi - center);
  }

  // --- 8) Render ---
  document.getElementById('total-weight').textContent =
    `${weights.reduce((a,b)=>a+b,0).toFixed(2)} ` +
    document.getElementById('weight-unit').value;

  document.getElementById('container-length-display').textContent =
    `${L.toFixed(2)}`;
  document.getElementById('len-unit-label').textContent =
    document.getElementById('length-unit').value;

  document.getElementById('warning').textContent = warn;

  const list = document.getElementById('positions-list');
  list.innerHTML = '';
  positions.forEach((p,i) => {
    if (p !== null && weights[i]>0 && widths[i]>0) {
      const li = document.createElement('li');
      li.textContent = 
        `Obj ${i+1}: CG at ${p.toFixed(2)} ` +
        document.getElementById('length-unit').value +
        ` from left`;
      list.appendChild(li);
    }
  });
}