// container.js

document.addEventListener('DOMContentLoaded', () => {
  // Inject six rows into the table
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

  // Wire up the Calculate button
  document.getElementById('calc-btn')
          .addEventListener('click', calculateBalance);
});

function calculateBalance() {
  // 1) Read units and container size
  const wUnit = document.getElementById('weight-unit').value;
  const lUnit = document.getElementById('length-unit').value;
  const size  = parseFloat(document.getElementById('container-size').value) || 0;

  // 2) Convert container length & margin into chosen units
  let containerLen = size;       // base in ft
  if (lUnit === 'm') containerLen *= 0.3048;
  let margin = 8/12;             // 8" in ft
  if (lUnit === 'm') margin *= 0.3048;

  const center = containerLen / 2;
  const usable = containerLen - 2 * margin;

  // 3) Gather weights and widths
  const weights = [...document.querySelectorAll('.weight')]
                    .map(i => parseFloat(i.value) || 0);
  const widths  = [...document.querySelectorAll('.width')]
                    .map(i => parseFloat(i.value) || 0);

  const totalW     = weights.reduce((sum, w) => sum + w, 0);
  const totalWidth = widths.reduce((sum, w) => sum + w, 0);

  // 4) Warn if combined width exceeds usable span
  let warn = '';
  if (totalWidth > usable) {
    warn = `⚠️ Total width (${totalWidth.toFixed(2)}) exceeds usable (${usable.toFixed(2)})`;
  }

  // 5) Read optional first object position
  const firstRaw = parseFloat(document.getElementById('first-pos').value);
  let positions = Array(weights.length).fill(null);

  // 6) Pack objects in input order, honoring first-pos if provided
  let cursor = margin;
  if (!isNaN(firstRaw)) {
    // Clamp user‑entered first object CG into margin
    const half0 = widths[0] / 2;
    const min0  = margin + half0;
    const max0  = containerLen - margin - half0;
    let p0 = Math.min(Math.max(firstRaw, min0), max0);
    if (p0 !== firstRaw) {
      warn += (warn ? ' ' : '') + `⚠️ Obj 1 clamped into 8″ margin`;
    }
    positions[0] = p0;
    cursor = p0 + half0;
  } else {
    // Push first object as far left as possible
    positions[0] = cursor + widths[0] / 2;
    cursor += widths[0];
  }

  // Pack the rest sequentially
  for (let i = 1; i < widths.length; i++) {
    positions[i] = cursor + widths[i] / 2;
    cursor += widths[i];
  }

  // 7) Compute group CG and shift all so CG = center
  const cgInit = positions.reduce((sum, p, i) =>
                  sum + (p * weights[i] || 0), 0) / (totalW || 1);
  const shift = center - cgInit;
  positions = positions.map(p => p === null ? null : p + shift);

  // 8) Clamp each CG into the 8″ no‑go margins
  let clampedAny = false;
  positions = positions.map((p, i) => {
    if (p === null) return null;
    const half = widths[i] / 2;
    const minP = margin + half;
    const maxP = containerLen - margin - half;
    const cp   = Math.min(Math.max(p, minP), maxP);
    if (cp !== p) clampedAny = true;
    return cp;
  });
  if (clampedAny) {
    warn += (warn ? ' ' : '') + `⚠️ Some CGs were clamped into 8″ margin`;
  }

  // 9) Render results
  document.getElementById('total-weight').textContent =
    `${totalW.toFixed(2)} ${wUnit}`;
  document.getElementById('container-length-display').textContent =
    `${containerLen.toFixed(2)}`;
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