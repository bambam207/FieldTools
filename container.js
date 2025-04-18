document.addEventListener('DOMContentLoaded', () => {
  initContainerTool();
});// container.js

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
  // 1. Read units and container size
  const wUnit = document.getElementById('weight-unit').value;
  const lUnit = document.getElementById('length-unit').value;
  const size  = parseFloat(document.getElementById('container-size').value) || 0;

  // 2. Convert container length & margin to chosen units
  let containerLen = size;
  if (lUnit === 'm') containerLen *= 0.3048;
  let margin = 8/12;
  if (lUnit === 'm') margin *= 0.3048;

  // 3. Gather weights and widths
  const weights = [...document.querySelectorAll('.weight')]
                    .map(i => parseFloat(i.value) || 0);
  const widths  = [...document.querySelectorAll('.width') ]
                    .map(i => parseFloat(i.value) || 0);

  const totalW     = weights.reduce((sum, w) => sum + w, 0);
  const totalWidth = widths.reduce((sum, w) => sum + w, 0);
  const center     = containerLen / 2;
  const usable     = containerLen - 2 * margin;

  // 4. Warn if objects exceed usable span
  let warn = '';
  if (totalWidth > usable) {
    warn = `⚠️ Total width (${totalWidth.toFixed(2)}) exceeds usable (${usable.toFixed(2)})`;
  }

  // 5. Pack sequentially from the left margin, in input order
  let cursor = margin;
  let positions = widths.map(w => {
    const p = cursor + w / 2;
    cursor += w;
    return p;
  });

  // 6. Compute initial group CG and shift all positions so CG = center
  const cgInit = positions.reduce((sum, p, i) => sum + p * weights[i], 0)
               / (totalW || 1);
  const shift = center - cgInit;
  positions = positions.map(p => p + shift);

  // 7. Clamp each CG into the 8" no‑go margin
  let clamped = false;
  positions = positions.map((p, i) => {
    const half = widths[i] / 2;
    const minP = margin + half;
    const maxP = containerLen - margin - half;
    const cp   = Math.min(Math.max(p, minP), maxP);
    if (cp !== p) clamped = true;
    return cp;
  });
  if (clamped) {
    warn += (warn ? ' ' : '') + `⚠️ Some CGs were clamped into the 8″ margin`;
  }

  // 8. Update the UI
  document.getElementById('total-weight').textContent =
    `${totalW.toFixed(2)} ${wUnit}`;
  document.getElementById('container-length-display').textContent =
    `${containerLen.toFixed(2)}`;
  document.getElementById('len-unit-label').textContent = lUnit;
  document.getElementById('warning').textContent = warn;

  const list = document.getElementById('positions-list');
  list.innerHTML = '';
  positions.forEach((p, i) => {
    if (weights[i] > 0 && widths[i] > 0) {
      const li = document.createElement('li');
      li.textContent = `Obj ${i+1}: CG at ${p.toFixed(2)} ${lUnit} from left`;
      list.appendChild(li);
    }
  });
}

function initContainerTool() {
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
}

function calculateBalance() {
  // … [all your math logic from before] …

  // AFTER computing finalPos[] and warning:

  // 7) Update UI
  document.getElementById('total-weight').textContent =
    `${totalW.toFixed(2)} ${wUnit}`;
  document.getElementById('container-length-display').textContent =
    `${containerLen.toFixed(2)}`;
  document.getElementById('len-unit-label').textContent = lUnit;
  document.getElementById('warning').textContent = warning;

  // 8) ONLY list active items (w>0 && width>0)
  const posList = document.getElementById('positions-list');
  posList.innerHTML = '';
  finalPos.forEach((p,i) => {
    if (weights[i] > 0 && widths[i] > 0) {
      const li = document.createElement('li');
      li.textContent = `Obj ${i+1}: CG at ${p.toFixed(2)} ${lUnit} from left`;
      posList.appendChild(li);
    }
  });
}